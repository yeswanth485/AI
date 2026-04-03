from dataclasses import dataclass
from typing import List
from models import OrderItem, Product, BoxInventory
from sqlalchemy.orm import Session


@dataclass
class PackedItem:
    product_id: int
    quantity: int
    position_x: float
    position_y: float
    position_z: float


@dataclass
class PackingResult:
    fits: bool
    efficiency_score: float
    packed_items: List[PackedItem]


def sort_items_by_volume(db: Session, items: List[OrderItem]) -> List[OrderItem]:
    def item_volume(item: OrderItem) -> float:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        return product.length_cm * product.width_cm * product.height_cm * item.quantity

    return sorted(items, key=item_volume, reverse=True)


def items_fit_in_box(
    db: Session, items: List[OrderItem], box: BoxInventory
) -> PackingResult:
    total_weight = 0.0
    total_volume = 0.0
    has_fragile = False
    packed_items = []

    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product is None:
            return PackingResult(fits=False, efficiency_score=0.0, packed_items=[])

        item_weight = product.weight_kg * item.quantity
        item_volume = (
            product.length_cm * product.width_cm * product.height_cm * item.quantity
        )

        total_weight += item_weight
        total_volume += item_volume

        if product.is_fragile:
            has_fragile = True

    box_volume = box.length_cm * box.width_cm * box.height_cm

    if total_volume > box_volume:
        return PackingResult(fits=False, efficiency_score=0.0, packed_items=[])

    if total_weight > box.max_weight_kg:
        return PackingResult(fits=False, efficiency_score=0.0, packed_items=[])

    if has_fragile and not box.supports_fragile:
        return PackingResult(fits=False, efficiency_score=0.0, packed_items=[])

    efficiency_score = total_volume / box_volume

    for item in items:
        packed_items.append(
            PackedItem(
                product_id=item.product_id,
                quantity=item.quantity,
                position_x=0.0,
                position_y=0.0,
                position_z=0.0,
            )
        )

    return PackingResult(
        fits=True, efficiency_score=efficiency_score, packed_items=packed_items
    )
