from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import Order, OrderItem, User, Product, BoxInventory, PackagingPlan
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
)
from decision_service import optimize_packaging
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import os

SECRET_KEY = os.getenv("SECRET_KEY", "packai-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
        hashed_password=pwd_context.hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not pwd_context.verify(payload.password, user.hashed_password):
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

    background_tasks.add_task(optimize_packaging, db, int(order.id))

    return {"order_id": order.id, "status": "pending"}


@router.get("/orders", response_model=list[OrderListResponse])
def list_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    return orders


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    order_response = OrderResponse(
        id=order.id,
        user_id=order.user_id,
        shipping_zone=order.shipping_zone,
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


@router.post("/optimize-packaging/{order_id}", response_model=OptimizationResponse)
def optimize_packaging_endpoint(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")

    result = optimize_packaging(db, order_id)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


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

    savings_trend = []
    box_usage_map = {}
    cost_comparison = []

    for plan in plans:
        order = db.query(Order).filter(Order.id == plan.order_id).first()
        if order:
            date_str = (
                order.created_at.strftime("%Y-%m-%d") if order.created_at else "unknown"
            )
            savings_trend.append(SavingsTrendPoint(date=date_str, savings=plan.savings))
            cost_comparison.append(
                CostComparisonPoint(
                    order_id=plan.order_id,
                    baseline=plan.baseline_cost,
                    optimized=plan.optimized_cost,
                )
            )

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
        avg_savings_per_order=round(avg_savings, 2),
        avg_efficiency=round(avg_efficiency, 2),
        savings_trend=savings_trend,
        box_usage=box_usage,
        cost_comparison=cost_comparison,
    )
