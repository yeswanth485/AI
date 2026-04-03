import os

BASE = "D:/AI PACK"

# 1. requirements.txt
with open(f"{BASE}/requirements.txt", "w") as f:
    f.write("""fastapi==0.115.6
uvicorn==0.34.0
sqlalchemy==2.0.36
pydantic==2.10.3
python-dotenv==1.0.1
passlib[bcrypt]==1.7.4
PyJWT==2.10.1
psycopg2-binary==2.9.10
gunicorn==23.0.0
pandas==2.2.2
openpyxl==3.1.2
python-multipart==0.0.9
bcrypt==3.2.0
""")
print("1. requirements.txt written")

# 2. models.py
with open(f"{BASE}/models.py", "w") as f:
    f.write("""from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, nullable=False)
    length_cm = Column(Float, nullable=False)
    width_cm = Column(Float, nullable=False)
    height_cm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    is_fragile = Column(Boolean, default=False)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shipping_zone = Column(String, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)


class BoxInventory(Base):
    __tablename__ = "box_inventory"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    length_cm = Column(Float, nullable=False)
    width_cm = Column(Float, nullable=False)
    height_cm = Column(Float, nullable=False)
    max_weight_kg = Column(Float, nullable=False)
    supports_fragile = Column(Boolean, default=False)
    quantity_available = Column(Integer, nullable=False)


class ShippingRate(Base):
    __tablename__ = "shipping_rates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    zone = Column(String, nullable=False)
    weight_min_kg = Column(Float, nullable=False)
    weight_max_kg = Column(Float, nullable=False)
    rate_per_kg = Column(Float, nullable=False)


class PackagingPlan(Base):
    __tablename__ = "packaging_plans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    box_id = Column(Integer, ForeignKey("box_inventory.id"), nullable=False)
    baseline_cost = Column(Float, nullable=False)
    optimized_cost = Column(Float, nullable=False)
    savings = Column(Float, nullable=False)
    efficiency_score = Column(Float, nullable=False)
    decision_explanation = Column(String, nullable=False)
    profit = Column(Float, nullable=False, default=0.0)
    packing_instructions = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class PackagingPlanItem(Base):
    __tablename__ = "packaging_plan_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plan_id = Column(Integer, ForeignKey("packaging_plans.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity_packed = Column(Integer, nullable=False)
    position_x = Column(Float, nullable=True)
    position_y = Column(Float, nullable=True)
    position_z = Column(Float, nullable=True)


class CostLog(Base):
    __tablename__ = "cost_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    box_id = Column(Integer, ForeignKey("box_inventory.id"), nullable=True)
    actual_weight_kg = Column(Float, nullable=False)
    dimensional_weight_kg = Column(Float, nullable=False)
    chargeable_weight_kg = Column(Float, nullable=False)
    shipping_zone = Column(String, nullable=False)
    rate_per_kg = Column(Float, nullable=False)
    computed_cost = Column(Float, nullable=False)
    cost_type = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class UploadBatch(Base):
    __tablename__ = "upload_batches"

    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String, nullable=False)
    total_rows = Column(Integer, nullable=False)
    valid_rows = Column(Integer, nullable=False)
    failed_rows = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    error_summary = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
""")
print("2. models.py written")

# 3. upload_service.py
with open(f"{BASE}/upload_service.py", "w") as f:
    f.write('''import pandas as pd
import json
from sqlalchemy.orm import Session
from models import Product, Order, OrderItem, UploadBatch
import uuid


def parse_upload_file(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """Parse CSV or Excel file into a pandas DataFrame."""
    if filename.endswith(".csv"):
        import io
        df = pd.read_csv(io.BytesIO(file_bytes))
    elif filename.endswith(".xlsx") or filename.endswith(".xls"):
        import io
        df = pd.read_excel(io.BytesIO(file_bytes))
    else:
        raise ValueError("Unsupported file format. Only CSV and Excel files are allowed.")

    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].astype(str).str.strip()

    return df


def validate_upload_dataframe(df: pd.DataFrame) -> tuple:
    """Validate the uploaded DataFrame. Returns (valid_df, errors)."""
    required_columns = ["product_name", "length", "width", "height", "weight", "quantity", "fragility"]

    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")

    valid_rows = []
    errors = []

    for idx, row in df.iterrows():
        row_errors = []
        row_num = int(idx) + 1

        product_name = str(row.get("product_name", "")).strip()
        if not product_name:
            row_errors.append("Product name is required and cannot be empty")

        for dim in ["length", "width", "height", "weight"]:
            try:
                val = float(row[dim])
                if val <= 0:
                    row_errors.append(f"{dim.capitalize()} must be greater than 0")
            except (ValueError, TypeError):
                row_errors.append(f"{dim.capitalize()} must be a valid number")

        try:
            qty = int(float(row["quantity"]))
            if qty < 1:
                row_errors.append("Quantity must be at least 1")
        except (ValueError, TypeError):
            row_errors.append("Quantity must be a valid integer")

        fragility = str(row.get("fragility", "")).lower().strip()
        if fragility not in ["yes", "no"]:
            row_errors.append("Fragility must be 'yes' or 'no'")

        if row_errors:
            errors.append({"row": row_num, "error": "; ".join(row_errors)})
        else:
            valid_rows.append({
                "product_name": product_name,
                "length": float(row["length"]),
                "width": float(row["width"]),
                "height": float(row["height"]),
                "weight": float(row["weight"]),
                "quantity": int(float(row["quantity"])),
                "fragility": fragility == "yes",
            })

    valid_df = pd.DataFrame(valid_rows) if valid_rows else pd.DataFrame()
    return valid_df, errors


def ingest_upload_batch(db: Session, valid_df: pd.DataFrame, user_id: int, shipping_zone: str) -> list:
    """Ingest validated data into the database. Returns list of created order IDs."""
    order_ids = []

    for _, row in valid_df.iterrows():
        product = db.query(Product).filter(Product.name.ilike(row["product_name"])).first()

        if not product:
            base_slug = "".join(c.lower() if c.isalnum() else "-" for c in row["product_name"]).strip("-")
            base_slug = base_slug or "product"
            unique_suffix = str(uuid.uuid4())[:8]
            sku = f"{base_slug}-{unique_suffix}"

            while db.query(Product).filter(Product.sku == sku).first():
                unique_suffix = str(uuid.uuid4())[:8]
                sku = f"{base_slug}-{unique_suffix}"

            product = Product(
                name=row["product_name"],
                sku=sku,
                length_cm=row["length"],
                width_cm=row["width"],
                height_cm=row["height"],
                weight_kg=row["weight"],
                is_fragile=row["fragility"],
            )
            db.add(product)
            db.flush()

        order = Order(user_id=user_id, shipping_zone=shipping_zone, status="pending")
        db.add(order)
        db.flush()

        order_item = OrderItem(order_id=order.id, product_id=product.id, quantity=row["quantity"])
        db.add(order_item)
        order_ids.append(order.id)

    return order_ids
''')
print("3. upload_service.py written")

# 4. pack_instruction_service.py
with open(f"{BASE}/pack_instruction_service.py", "w") as f:
    f.write('''from dataclasses import dataclass
from typing import List


@dataclass
class PackedItem:
    product_id: int
    product_name: str
    quantity: int
    is_fragile: bool
    position_x: float
    position_y: float
    position_z: float
    layer: str


@dataclass
class PackingResult:
    fits: bool
    efficiency_score: float
    packed_items: List[PackedItem]
    has_fragile: bool
    total_layers: int


def generate_instructions(result: PackingResult, box_name: str) -> dict:
    """Generate human-readable packing instructions from PackingResult."""
    lines = []
    lines.append(f"Place items in {box_name} as follows:")

    item_order = []

    for item in result.packed_items:
        item_entry = {
            "product_name": item.product_name,
            "quantity": item.quantity,
            "is_fragile": item.is_fragile,
            "layer": item.layer,
        }
        item_order.append(item_entry)

        if item.layer == "bottom":
            lines.append(f"Place {item.product_name} (x{item.quantity}) at the base of the box.")
        elif item.layer == "middle":
            lines.append(f"Add {item.product_name} (x{item.quantity}) on top of the base layer.")
        elif item.layer == "top":
            lines.append(f"Carefully place {item.product_name} (x{item.quantity}) on top with padding. Handle with care.")

    if result.has_fragile:
        lines.append("Seal the box and label FRAGILE on all sides.")

    total_items = sum(item.quantity for item in result.packed_items)
    lines.append(f"Total items: {total_items}. Box: {box_name}.")

    instructions = " ".join(lines)

    return {"instructions": instructions, "item_order": item_order}
''')
print("4. pack_instruction_service.py written")

# 5. cost_service.py (add calculate_profit)
with open(f"{BASE}/cost_service.py", "r") as f:
    existing = f.read()

with open(f"{BASE}/cost_service.py", "w") as f:
    f.write(existing)
    f.write('''

def calculate_profit(savings: float, margin_factor: float = 0.30) -> float:
    """
    Profit = savings * margin_factor.
    margin_factor represents the platform's operational cost recovery rate.
    Default 30% of savings is captured as profit.
    """
    return round(savings * margin_factor, 2)
''')
print("5. cost_service.py updated")

print("\nAll backend files written successfully!")
