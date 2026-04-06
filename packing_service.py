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
    length_cm: float = 0.0
    width_cm: float = 0.0
    height_cm: float = 0.0


@dataclass
class PackingResult:
    fits: bool
    efficiency_score: float
    packed_items: List[PackedItem]
    has_fragile: bool
    total_layers: int


def _build_product_map(db: Session, items: List[OrderItem]) -> dict:
    """Load all products for the given items into a dictionary to avoid N+1 queries."""
    product_ids = list(set(item.product_id for item in items))
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    return {p.id: p for p in products}


def sort_items_ffd(db: Session, items: List[OrderItem], product_map: dict = None) -> List[OrderItem]:
    """Sort items using First Fit Decreasing (FFD) by volume.
    Fragile items are placed last (on top).
    """
    if product_map is None:
        product_map = _build_product_map(db, items)

    def item_volume(item: OrderItem) -> float:
        product = product_map.get(item.product_id)
        if product is None:
            return 0.0
        return product.length_cm * product.width_cm * product.height_cm * item.quantity

    non_fragile = [
        i
        for i in items
        if not product_map.get(i.product_id, Product(is_fragile=False)).is_fragile
    ]
    fragile = [
        i
        for i in items
        if product_map.get(i.product_id, Product(is_fragile=False)).is_fragile
    ]

    non_fragile_sorted = sorted(non_fragile, key=item_volume, reverse=True)
    fragile_sorted = sorted(fragile, key=item_volume, reverse=True)

    return non_fragile_sorted + fragile_sorted


def assign_spatial_positions(
    db: Session, items: List[OrderItem], box: BoxInventory, product_map: dict = None
) -> List[PackedItem]:
    """Assign real spatial positions using shelf-based 3D bin packing.
    Items are placed along X axis first, then Z, then Y (layers).
    """
    if product_map is None:
        product_map = _build_product_map(db, items)

    packed_items = []
    sorted_items = sort_items_ffd(db, items, product_map)

    cursor_x = 0.0
    cursor_y = 0.0
    cursor_z = 0.0
    row_max_height = 0.0
    layer_max_z = 0.0

    box_length = float(box.length_cm)
    box_width = float(box.width_cm)
    box_height = float(box.height_cm)

    for item in sorted_items:
        product = product_map.get(item.product_id)
        if product is None:
            continue

        item_length = float(product.length_cm)
        item_width = float(product.width_cm)
        item_height = float(product.height_cm)
        qty = item.quantity

        for q in range(qty):
            if cursor_x + item_length > box_length:
                cursor_x = 0.0
                cursor_z += row_max_height
                row_max_height = 0.0

            if cursor_z + item_width > box_width:
                cursor_x = 0.0
                cursor_z = 0.0
                cursor_y += layer_max_z
                layer_max_z = 0.0

            current_height = cursor_y + item_height
            if current_height > box_height:
                break

            layer = "bottom"
            if cursor_y > 0:
                if product.is_fragile:
                    layer = "top"
                else:
                    layer = "middle"

            packed_item = PackedItem(
                product_id=item.product_id,
                product_name=product.name,
                quantity=1,
                is_fragile=product.is_fragile,
                position_x=round(cursor_x, 2),
                position_y=round(cursor_y, 2),
                position_z=round(cursor_z, 2),
                layer=layer,
                length_cm=item_length,
                width_cm=item_width,
                height_cm=item_height,
            )
            packed_items.append(packed_item)

            cursor_x += item_length
            row_max_height = max(row_max_height, item_width)
            layer_max_z = max(layer_max_z, item_width)

        cursor_x = 0.0
        cursor_z += row_max_height
        row_max_height = 0.0

        if cursor_z >= box_width:
            cursor_x = 0.0
            cursor_z = 0.0
            cursor_y += layer_max_z
            layer_max_z = 0.0

    return packed_items


def items_fit_in_box(
    db: Session, items: List[OrderItem], box: BoxInventory, product_map: dict = None
) -> PackingResult:
    if product_map is None:
        product_map = _build_product_map(db, items)
    product_map = _build_product_map(db, items)

    total_weight = 0.0
    total_volume = 0.0
    has_fragile = False
    total_stacked_height = 0.0

    for item in items:
        product = product_map.get(item.product_id)
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
    packed_items = assign_spatial_positions(db, items, box, product_map)

    layers = set(p.layer for p in packed_items)
    total_layers = len(layers) if layers else 0

    return PackingResult(
        fits=True,
        efficiency_score=efficiency_score,
        packed_items=packed_items,
        has_fragile=has_fragile,
        total_layers=total_layers,
    )
