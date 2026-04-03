from typing import List
from packing_service import PackingResult


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
            lines.append(
                f"Place {item.product_name} (x{item.quantity}) at the base of the box."
            )
        elif item.layer == "middle":
            lines.append(
                f"Add {item.product_name} (x{item.quantity}) on top of the base layer."
            )
        elif item.layer == "top":
            lines.append(
                f"Carefully place {item.product_name} (x{item.quantity}) on top with padding. Handle with care."
            )

    if result.has_fragile:
        lines.append("Seal the box and label FRAGILE on all sides.")

    total_items = sum(item.quantity for item in result.packed_items)
    lines.append(f"Total items: {total_items}. Box: {box_name}.")

    instructions = " ".join(lines)

    return {"instructions": instructions, "item_order": item_order}
