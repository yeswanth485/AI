from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    BackgroundTasks,
    UploadFile,
    File,
    Form,
)
from sqlalchemy.orm import Session
from database import get_db
from models import (
    Order,
    OrderItem,
    User,
    Product,
    BoxInventory,
    PackagingPlan,
    PackagingPlanItem,
    UploadBatch,
)
from schemas import (
    OrderCreate,
    OrderResponse,
    OrderListResponse,
    OptimizationResponse,
    UserRegister,
    UserLogin,
    AuthResponse,
    UserResponse,
    BoxInventoryCreate,
    BoxInventoryUpdate,
    BoxInventoryResponse,
    AnalyticsSummary,
    SavingsTrendPoint,
    BoxUsagePoint,
    CostComparisonPoint,
    ProfitTrendPoint,
    UploadResult,
    PackInstructionResponse,
    OrderOptimizationSummary,
)
from decision_service import optimize_packaging
from upload_service import (
    parse_upload_file,
    validate_upload_dataframe,
    ingest_upload_batch,
)
from pack_instruction_service import generate_instructions
from packing_service import items_fit_in_box, PackingResult
from database import SessionLocal
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import os
import json
import bcrypt

SECRET_KEY = os.getenv("SECRET_KEY", "packai-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080


def run_background_optimization(order_id: int):
    """Run optimization in background with its own DB session."""
    db = SessionLocal()
    try:
        optimize_packaging(db, order_id)
    except Exception as e:
        print(f"Background optimization failed for order {order_id}: {e}")
        try:
            order = db.query(Order).filter(Order.id == order_id).first()
            if order:
                setattr(order, "status", "failed")
                db.commit()
        except Exception:
            pass
    finally:
        db.close()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

router = APIRouter()


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str, db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/auth/register", response_model=UserResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(data={"sub": str(user.id)})
    return AuthResponse(
        token=token,
        user=UserResponse(id=user.id, name=user.name, email=user.email),
    )


@router.post("/orders", response_model=dict)
def create_order(
    order_data: OrderCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == order_data.user_id).first()
    if user is None:
        raise HTTPException(
            status_code=404, detail=f"User {order_data.user_id} not found"
        )

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product is None:
            raise HTTPException(
                status_code=404, detail=f"Product {item.product_id} not found"
            )

    order = Order(
        user_id=order_data.user_id,
        shipping_zone=order_data.shipping_zone,
        status="pending",
    )
    db.add(order)
    db.flush()

    for item in order_data.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)

    background_tasks.add_task(run_background_optimization, int(order.id))

    return {"order_id": order.id, "status": "pending"}


@router.get("/orders", response_model=list[OrderListResponse])
def list_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    return orders


@router.get("/orders/optimization-summary", response_model=list[OrderOptimizationSummary])
def get_orders_optimization_summary(db: Session = Depends(get_db)):
    """Bulk fetch optimization metadata for all orders — box, savings, fragile flag."""
    plans = db.query(PackagingPlan).all()
    result = []
    for plan in plans:
        box = db.query(BoxInventory).filter(BoxInventory.id == plan.box_id).first()
        order_items = db.query(OrderItem).filter(OrderItem.order_id == plan.order_id).all()
        has_fragile = False
        for oi in order_items:
            from models import Product
            product = db.query(Product).filter(Product.id == oi.product_id).first()
            if product and product.is_fragile:
                has_fragile = True
                break
        result.append(OrderOptimizationSummary(
            order_id=plan.order_id,
            recommended_box=box.name if box else None,
            savings=round(float(plan.savings), 2),
            has_fragile=has_fragile,
            efficiency_score=round(float(plan.efficiency_score), 2),
        ))
    return result


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    order_response = OrderResponse(
        id=order.id,
        user_id=order.user_id,
        channel_order_id=order.channel_order_id,
        channel=order.channel,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        customer_city=order.customer_city,
        customer_state=order.customer_state,
        customer_pincode=order.customer_pincode,
        shipping_zone=order.shipping_zone,
        payment_type=order.payment_type,
        priority=order.priority,
        category=order.category,
        status=order.status,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )
    order_items = []
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        product_response = None
        if product:
            product_response = {
                "id": product.id,
                "name": product.name,
                "sku": product.sku,
                "length_cm": product.length_cm,
                "width_cm": product.width_cm,
                "height_cm": product.height_cm,
                "weight_kg": product.weight_kg,
                "is_fragile": product.is_fragile,
            }
        order_items.append(
            {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "product": product_response,
            }
        )
    order_response.items = order_items
    return order_response


@router.get("/orders/{order_id}/optimization-status")
def get_order_optimization_status(order_id: int, db: Session = Depends(get_db)):
    """Get the current optimization status and result for an order."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")

    plan = db.query(PackagingPlan).filter(PackagingPlan.order_id == order_id).first()

    result = {
        "order_id": order.id,
        "status": order.status,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None,
    }

    if plan:
        box = db.query(BoxInventory).filter(BoxInventory.id == plan.box_id).first()
        plan_items = db.query(PackagingPlanItem).filter(PackagingPlanItem.plan_id == plan.id).all()

        packed_items_data = []
        for pi in plan_items:
            product = db.query(Product).filter(Product.id == pi.product_id).first()
            packed_items_data.append({
                "product_id": pi.product_id,
                "product_name": product.name if product else None,
                "quantity": pi.quantity_packed,
                "is_fragile": product.is_fragile if product else False,
                "position_x": pi.position_x,
                "position_y": pi.position_y,
                "position_z": pi.position_z,
                "layer": "bottom" if pi.position_y == 0 else ("top" if (product and product.is_fragile) else "middle"),
                "length_cm": product.length_cm if product else 0,
                "width_cm": product.width_cm if product else 0,
                "height_cm": product.height_cm if product else 0,
            })

        item_order_data = []
        if plan.item_order:
            try:
                item_order_data = json.loads(plan.item_order)
            except (json.JSONDecodeError, TypeError):
                item_order_data = []

        result.update({
            "recommended_box": box.name if box else None,
            "baseline_cost": round(float(plan.baseline_cost), 2),
            "optimized_cost": round(float(plan.optimized_cost), 2),
            "savings": round(float(plan.savings), 2),
            "efficiency_score": round(float(plan.efficiency_score), 2),
            "decision_explanation": plan.decision_explanation,
            "profit": round(float(getattr(plan, "profit", 0.0)), 2),
            "packing_instructions": plan.packing_instructions,
            "item_order": item_order_data,
            "packed_items": packed_items_data,
        })

    return result


@router.post("/optimize-packaging/{order_id}", response_model=OptimizationResponse)
def optimize_packaging_endpoint(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")

    result = optimize_packaging(db, order_id)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


@router.post("/upload-orders", response_model=UploadResult)
async def upload_orders(
    file: UploadFile = File(...),
    user_id: int = Form(...),
    shipping_zone: str = Form(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
):
    if not file.filename or not (
        file.filename.endswith(".csv") or file.filename.endswith(".xlsx")
    ):
        raise HTTPException(
            status_code=400, detail="Only CSV and Excel files are allowed"
        )

    file_bytes = await file.read()

    try:
        df = parse_upload_file(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    total_rows = len(df)

    try:
        valid_df, errors = validate_upload_dataframe(df)
    except ValueError as e:
        upload_batch = UploadBatch(
            filename=file.filename,
            total_rows=total_rows,
            valid_rows=0,
            failed_rows=total_rows,
            status="failed",
            error_summary=json.dumps([{"row": 0, "error": str(e)}]),
        )
        db.add(upload_batch)
        db.commit()
        return UploadResult(
            upload_id=upload_batch.id,
            total_rows=total_rows,
            valid_rows=0,
            failed_rows=total_rows,
            order_ids=[],
            errors=[{"row": 0, "error": str(e)}],
        )

    upload_batch = UploadBatch(
        filename=file.filename,
        total_rows=total_rows,
        valid_rows=len(valid_df),
        failed_rows=total_rows - len(valid_df),
        status="processing",
        error_summary=json.dumps(errors),
    )
    db.add(upload_batch)
    db.flush()

    try:
        order_ids = ingest_upload_batch(db, valid_df, user_id, shipping_zone)
        db.commit()

        for oid in order_ids:
            background_tasks.add_task(run_background_optimization, oid)

        upload_batch.status = "complete"
        db.commit()

        return UploadResult(
            upload_id=upload_batch.id,
            total_rows=total_rows,
            valid_rows=len(valid_df),
            failed_rows=total_rows - len(valid_df),
            order_ids=order_ids,
            errors=errors,
        )
    except Exception as e:
        upload_batch.status = "failed"
        upload_batch.error_summary = json.dumps([{"row": 0, "error": str(e)}])
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pack-instructions/{order_id}", response_model=PackInstructionResponse)
def get_pack_instructions(order_id: int, db: Session = Depends(get_db)):
    plan = db.query(PackagingPlan).filter(PackagingPlan.order_id == order_id).first()
    if plan is None:
        raise HTTPException(
            status_code=404, detail=f"No packaging plan found for order {order_id}"
        )

    box = db.query(BoxInventory).filter(BoxInventory.id == plan.box_id).first()
    if box is None:
        raise HTTPException(status_code=404, detail="Box not found")

    order_items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    packing_result = items_fit_in_box(db, order_items, box)

    instructions_data = generate_instructions(packing_result, box.name)

    return PackInstructionResponse(
        order_id=order_id,
        box_name=box.name,
        instructions=instructions_data["instructions"],
        item_order=instructions_data["item_order"],
    )


@router.get("/inventory", response_model=list[BoxInventoryResponse])
def list_inventory(db: Session = Depends(get_db)):
    boxes = db.query(BoxInventory).all()
    return boxes


@router.post("/inventory", response_model=BoxInventoryResponse)
def add_box(payload: BoxInventoryCreate, db: Session = Depends(get_db)):
    box = BoxInventory(
        name=payload.name,
        length_cm=payload.length_cm,
        width_cm=payload.width_cm,
        height_cm=payload.height_cm,
        max_weight_kg=payload.max_weight_kg,
        supports_fragile=payload.supports_fragile,
        quantity_available=payload.quantity_available,
    )
    db.add(box)
    db.commit()
    db.refresh(box)
    return box


@router.patch("/inventory/{box_id}", response_model=BoxInventoryResponse)
def update_box_quantity(
    box_id: int, payload: BoxInventoryUpdate, db: Session = Depends(get_db)
):
    box = db.query(BoxInventory).filter(BoxInventory.id == box_id).first()
    if box is None:
        raise HTTPException(status_code=404, detail=f"Box {box_id} not found")
    box.quantity_available = payload.quantity_available
    db.commit()
    db.refresh(box)
    return box


@router.get("/analytics", response_model=AnalyticsSummary)
def get_analytics(db: Session = Depends(get_db)):
    plans = db.query(PackagingPlan).all()

    total_orders = len(plans)
    total_savings = sum(p.savings for p in plans)
    avg_savings = total_savings / total_orders if total_orders > 0 else 0.0
    avg_efficiency = (
        sum(p.efficiency_score for p in plans) / total_orders
        if total_orders > 0
        else 0.0
    )
    total_profit = sum(getattr(p, "profit", 0.0) for p in plans)

    today = datetime.utcnow().date()
    today_savings = 0.0

    savings_trend = []
    profit_trend = []
    box_usage_map = {}
    cost_comparison = []

    for plan in plans:
        order = db.query(Order).filter(Order.id == plan.order_id).first()
        if order:
            date_str = (
                order.created_at.strftime("%Y-%m-%d") if order.created_at else "unknown"
            )
            savings_trend.append(SavingsTrendPoint(date=date_str, savings=plan.savings))
            profit_trend.append(
                ProfitTrendPoint(date=date_str, profit=getattr(plan, "profit", 0.0))
            )
            cost_comparison.append(
                CostComparisonPoint(
                    order_id=plan.order_id,
                    baseline=plan.baseline_cost,
                    optimized=plan.optimized_cost,
                )
            )
            if order.created_at and order.created_at.date() == today:
                today_savings += float(plan.savings)

        box = db.query(BoxInventory).filter(BoxInventory.id == plan.box_id).first()
        if box:
            box_usage_map[box.name] = box_usage_map.get(box.name, 0) + 1

    box_usage = [
        BoxUsagePoint(box_name=name, count=count)
        for name, count in box_usage_map.items()
    ]

    return AnalyticsSummary(
        total_orders=total_orders,
        total_savings=round(total_savings, 2),
        today_savings=round(today_savings, 2),
        avg_savings_per_order=round(avg_savings, 2),
        avg_efficiency=round(avg_efficiency, 2),
        total_profit=round(total_profit, 2),
        profit_trend=profit_trend,
        savings_trend=savings_trend,
        box_usage=box_usage,
        cost_comparison=cost_comparison,
    )
