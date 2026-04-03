from dataclasses import dataclass
from typing import List
from models import OrderItem, Product, BoxInventory
from sqlalchemy.orm import Session


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


def sort_items_ffd(db: Session, items: List[OrderItem]) -> List[OrderItem]:
    """Sort items using First Fit Decreasing (FFD) by volume.
    Fragile items are placed last (on top).
    """

    def item_volume(item: OrderItem) -> float:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        return product.length_cm * product.width_cm * product.height_cm * item.quantity

    non_fragile = [
        i
        for i in items
        if not db.query(Product).filter(Product.id == i.product_id).first().is_fragile
    ]
    fragile = [
        i
        for i in items
        if db.query(Product).filter(Product.id == i.product_id).first().is_fragile
    ]

    non_fragile_sorted = sorted(non_fragile, key=item_volume, reverse=True)
    fragile_sorted = sorted(fragile, key=item_volume, reverse=True)

    return non_fragile_sorted + fragile_sorted


def assign_spatial_positions(
    db: Session, items: List[OrderItem], box: BoxInventory
) -> List[PackedItem]:
    """Assign real spatial positions using bottom-up layer stacking."""
    packed_items = []
    cursor_y = 0.0

    sorted_items = sort_items_ffd(db, items)

    for item in sorted_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product is None:
            continue

        item_height = product.height_cm

        if cursor_y == 0:
            layer = "bottom"
        elif product.is_fragile:
            layer = "top"
        else:
            layer = "middle"

        packed_item = PackedItem(
            product_id=item.product_id,
            product_name=product.name,
            quantity=item.quantity,
            is_fragile=product.is_fragile,
            position_x=0.0,
            position_y=cursor_y,
            position_z=0.0,
            layer=layer,
        )
        packed_items.append(packed_item)
        cursor_y += item_height * item.quantity

    return packed_items


def items_fit_in_box(
    db: Session, items: List[OrderItem], box: BoxInventory
) -> PackingResult:
    total_weight = 0.0
    total_volume = 0.0
    has_fragile = False
    total_stacked_height = 0.0

    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product is None:
            return PackingResult(
                fits=False,
                efficiency_score=0.0,
                packed_items=[],
                has_fragile=False,
                total_layers=0,
            )

        item_weight = product.weight_kg * item.quantity
        item_volume = (
            product.length_cm * product.width_cm * product.height_cm * item.quantity
        )

        total_weight += item_weight
        total_volume += item_volume
        total_stacked_height += product.height_cm * item.quantity

        if product.is_fragile:
            has_fragile = True

    box_volume = box.length_cm * box.width_cm * box.height_cm

    if total_volume > box_volume:
        return PackingResult(
            fits=False,
            efficiency_score=0.0,
            packed_items=[],
            has_fragile=has_fragile,
            total_layers=0,
        )

    if total_weight > box.max_weight_kg:
        return PackingResult(
            fits=False,
            efficiency_score=0.0,
            packed_items=[],
            has_fragile=has_fragile,
            total_layers=0,
        )

    if has_fragile and not box.supports_fragile:
        return PackingResult(
            fits=False,
            efficiency_score=0.0,
            packed_items=[],
            has_fragile=has_fragile,
            total_layers=0,
        )

    if total_stacked_height > box.height_cm:
        return PackingResult(
            fits=False,
            efficiency_score=0.0,
            packed_items=[],
            has_fragile=has_fragile,
            total_layers=0,
        )

    efficiency_score = total_volume / box_volume
    packed_items = assign_spatial_positions(db, items, box)

    layers = set(p.layer for p in packed_items)
    total_layers = len(layers) if layers else 0

    return PackingResult(
        fits=True,
        efficiency_score=efficiency_score,
        packed_items=packed_items,
        has_fragile=has_fragile,
        total_layers=total_layers,
    )
