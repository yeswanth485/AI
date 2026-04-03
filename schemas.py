from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class UserRegister(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    user_id: int
    shipping_zone: str
    items: List[OrderItemCreate]


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    length_cm: float
    width_cm: float
    height_cm: float
    weight_kg: float
    is_fragile: bool

    class Config:
        from_attributes = True


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    user_id: int
    shipping_zone: str
    status: str
    created_at: datetime
    updated_at: datetime
    items: Optional[List[OrderItemResponse]] = []

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    id: int
    user_id: int
    shipping_zone: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OptimizationResponse(BaseModel):
    order_id: int
    recommended_box: str
    baseline_cost: float
    optimized_cost: float
    savings: float
    efficiency_score: float
    decision_explanation: str


class BoxInventoryCreate(BaseModel):
    name: str
    length_cm: float
    width_cm: float
    height_cm: float
    max_weight_kg: float
    supports_fragile: bool = False
    quantity_available: int


class BoxInventoryUpdate(BaseModel):
    quantity_available: int


class BoxInventoryResponse(BaseModel):
    id: int
    name: str
    length_cm: float
    width_cm: float
    height_cm: float
    max_weight_kg: float
    supports_fragile: bool
    quantity_available: int

    class Config:
        from_attributes = True


class SavingsTrendPoint(BaseModel):
    date: str
    savings: float


class BoxUsagePoint(BaseModel):
    box_name: str
    count: int


class CostComparisonPoint(BaseModel):
    order_id: int
    baseline: float
    optimized: float


class AnalyticsSummary(BaseModel):
    total_orders: int
    total_savings: float
    avg_savings_per_order: float
    avg_efficiency: float
    savings_trend: List[SavingsTrendPoint]
    box_usage: List[BoxUsagePoint]
    cost_comparison: List[CostComparisonPoint]


class ValidationResponse(BaseModel):
    valid: bool
    reason: str
