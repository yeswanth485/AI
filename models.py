from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
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
    category = Column(String, nullable=True)
    length_cm = Column(Float, nullable=False)
    width_cm = Column(Float, nullable=False)
    height_cm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    is_fragile = Column(Boolean, default=False)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    channel_order_id = Column(String, nullable=True)
    channel = Column(String, nullable=True)
    customer_name = Column(String, nullable=True)
    customer_phone = Column(String, nullable=True)
    customer_city = Column(String, nullable=True)
    customer_state = Column(String, nullable=True)
    customer_pincode = Column(String, nullable=True)
    shipping_zone = Column(String, nullable=False)
    payment_type = Column(String, nullable=True)
    priority = Column(String, nullable=True)
    category = Column(String, nullable=True)
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
    item_order = Column(Text, nullable=True)
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
