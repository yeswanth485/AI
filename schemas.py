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
    channel_order_id: Optional[str] = None
    channel: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_city: Optional[str] = None
    customer_state: Optional[str] = None
    customer_pincode: Optional[str] = None
    shipping_zone: str
    payment_type: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    items: Optional[List[OrderItemResponse]] = []

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    id: int
    user_id: int
    channel_order_id: Optional[str] = None
    channel: Optional[str] = None
    customer_name: Optional[str] = None
    customer_city: Optional[str] = None
    customer_pincode: Optional[str] = None
    shipping_zone: str
    payment_type: Optional[str] = None
    priority: Optional[str] = None
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
    profit: float = 0.0
    packing_instructions: Optional[str] = None
    item_order: Optional[List[dict]] = None
    packed_items: Optional[List[dict]] = None


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


class ProfitTrendPoint(BaseModel):
    date: str
    profit: float


class AnalyticsSummary(BaseModel):
    total_orders: int
    total_savings: float
    today_savings: float = 0.0
    avg_savings_per_order: float
    avg_efficiency: float
    total_profit: float = 0.0
    profit_trend: List[ProfitTrendPoint] = []
    savings_trend: List[SavingsTrendPoint]
    box_usage: List[BoxUsagePoint]
    cost_comparison: List[CostComparisonPoint]


class ValidationResponse(BaseModel):
    valid: bool
    reason: str


class UploadResult(BaseModel):
    upload_id: int
    total_rows: int
    valid_rows: int
    failed_rows: int
    order_ids: List[int]
    errors: List[dict]


class PackInstructionResponse(BaseModel):
    order_id: int
    box_name: str
    instructions: str
    item_order: List[dict]


class OrderOptimizationSummary(BaseModel):
    order_id: int
    recommended_box: Optional[str] = None
    savings: float = 0.0
    has_fragile: bool = False
    efficiency_score: float = 0.0
