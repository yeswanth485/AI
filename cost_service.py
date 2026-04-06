from sqlalchemy.orm import Session
from models import BoxInventory, ShippingRate, Order, OrderItem, Product
from dataclasses import dataclass
from typing import cast


def calculate_dimensional_weight(
    length_cm: float, width_cm: float, height_cm: float
) -> float:
    return (length_cm * width_cm * height_cm) / 5000.0


def calculate_chargeable_weight(
    actual_weight_kg: float, dimensional_weight_kg: float
) -> float:
    return max(actual_weight_kg, dimensional_weight_kg)


def get_shipping_rate(db: Session, zone: str, chargeable_weight_kg: float) -> float:
    rate = (
        db.query(ShippingRate)
        .filter(
            ShippingRate.zone == zone,
            ShippingRate.weight_min_kg <= chargeable_weight_kg,
            ShippingRate.weight_max_kg > chargeable_weight_kg,
        )
        .first()
    )
    if rate is None:
        raise ValueError(
            f"No shipping rate found for zone '{zone}' at weight {chargeable_weight_kg}kg"
        )
    return float(rate.rate_per_kg)


def calculate_shipping_cost(
    db: Session, zone: str, chargeable_weight_kg: float
) -> float:
    rate_per_kg = get_shipping_rate(db, zone, chargeable_weight_kg)
    return rate_per_kg * chargeable_weight_kg


def calculate_baseline_cost(db: Session, order: Order, product_map: dict = None) -> float:
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    if not order_items:
        raise ValueError("No order items to calculate baseline")

    # Calculate total weight of all items
    total_weight = 0.0
    for item in order_items:
        product = product_map.get(item.product_id) if product_map else db.query(Product).filter(Product.id == item.product_id).first()
        if product is None:
            raise ValueError(f"Product {item.product_id} not found")
        total_weight += float(product.weight_kg) * item.quantity

    # Find boxes that can hold the total weight (naive packer approach)
    available_boxes = (
        db.query(BoxInventory)
        .filter(BoxInventory.quantity_available > 0)
        .filter(BoxInventory.max_weight_kg >= total_weight)
        .all()
    )
    
    if not available_boxes:
        # Fallback to largest box if none can hold by weight
        available_boxes = (
            db.query(BoxInventory)
            .filter(BoxInventory.quantity_available > 0)
            .all()
        )
        if not available_boxes:
            raise ValueError("No boxes available in inventory")

    # Sort boxes by volume (smallest to largest) and pick a reasonable middle option
    # This simulates a naive packer who doesn't do volume optimization
    boxes_by_volume = sorted(
        available_boxes,
        key=lambda b: b.length_cm * b.width_cm * b.height_cm
    )
    
    # Pick a box in the middle third - not the smallest (might not fit well) 
    # and not the largest (avoids lakhs-range costs)
    mid_index = len(boxes_by_volume) // 2
    baseline_box = boxes_by_volume[mid_index] if boxes_by_volume else boxes_by_volume[0]

    return calculate_optimized_cost(db, order, baseline_box, product_map)


def calculate_optimized_cost(db: Session, order: Order, box: BoxInventory, product_map: dict = None) -> float:
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    total_weight = 0.0
    total_volume = 0.0

    for item in order_items:
        product = product_map.get(item.product_id)
        if product is None:
            raise ValueError(f"Product {item.product_id} not found")
        total_weight += float(product.weight_kg) * item.quantity
        total_volume += (
            float(product.length_cm)
            * float(product.width_cm)
            * float(product.height_cm)
        ) * item.quantity

    dimensional_weight = calculate_dimensional_weight(
        float(box.length_cm), float(box.width_cm), float(box.height_cm)
    )
    chargeable_weight = calculate_chargeable_weight(total_weight, dimensional_weight)

    return calculate_shipping_cost(db, str(order.shipping_zone), chargeable_weight)


def calculate_profit(savings: float, margin_factor: float = 0.30) -> float:
    return round(savings * margin_factor, 2)
