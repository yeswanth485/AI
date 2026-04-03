from sqlalchemy.orm import Session
from models import CostLog, Order
from dataclasses import dataclass
from typing import Optional


@dataclass
class ValidationResult:
    valid: bool
    reason: str


def validate_result(
    db: Session,
    order: Order,
    box_id: Optional[int],
    actual_weight_kg: float,
    dimensional_weight_kg: float,
    chargeable_weight_kg: float,
    shipping_zone: str,
    rate_per_kg: float,
    computed_cost: float,
    cost_type: str,
) -> ValidationResult:
    if computed_cost <= 0:
        write_cost_log(
            db,
            order,
            box_id,
            actual_weight_kg,
            dimensional_weight_kg,
            chargeable_weight_kg,
            shipping_zone,
            rate_per_kg,
            computed_cost,
            cost_type,
            "REJECTED: optimized_cost <= 0",
        )
        return ValidationResult(valid=False, reason="optimized_cost must be > 0")

    if chargeable_weight_kg <= 0:
        write_cost_log(
            db,
            order,
            box_id,
            actual_weight_kg,
            dimensional_weight_kg,
            chargeable_weight_kg,
            shipping_zone,
            rate_per_kg,
            computed_cost,
            cost_type,
            "REJECTED: chargeable_weight <= 0",
        )
        return ValidationResult(valid=False, reason="chargeable_weight must be > 0")

    write_cost_log(
        db,
        order,
        box_id,
        actual_weight_kg,
        dimensional_weight_kg,
        chargeable_weight_kg,
        shipping_zone,
        rate_per_kg,
        computed_cost,
        cost_type,
        "PASSED",
    )
    return ValidationResult(valid=True, reason="Validation passed")


def write_cost_log(
    db: Session,
    order: Order,
    box_id: Optional[int],
    actual_weight_kg: float,
    dimensional_weight_kg: float,
    chargeable_weight_kg: float,
    shipping_zone: str,
    rate_per_kg: float,
    computed_cost: float,
    cost_type: str,
    status: str = "PASSED",
):
    log = CostLog(
        order_id=order.id,
        box_id=box_id,
        actual_weight_kg=actual_weight_kg,
        dimensional_weight_kg=dimensional_weight_kg,
        chargeable_weight_kg=chargeable_weight_kg,
        shipping_zone=shipping_zone,
        rate_per_kg=rate_per_kg,
        computed_cost=computed_cost,
        cost_type=cost_type,
    )
    db.add(log)
    db.commit()
