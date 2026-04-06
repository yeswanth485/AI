from sqlalchemy.orm import Session
from models import (
    Order,
    OrderItem,
    BoxInventory,
    Product,
    PackagingPlan,
    PackagingPlanItem,
)
from cost_service import (
    calculate_baseline_cost,
    calculate_optimized_cost,
    calculate_dimensional_weight,
    calculate_chargeable_weight,
    get_shipping_rate,
    calculate_profit,
)
from packing_service import items_fit_in_box, sort_items_ffd, PackingResult
from pack_instruction_service import generate_instructions
from validation_service import validate_result
import json


def optimize_packaging(db: Session, order_id: int) -> dict:
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise ValueError(f"Order {order_id} not found")

    order_items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    if not order_items:
        setattr(order, "status", "failed")
        db.commit()
        return {"error": "Order has no items"}

    product_map = {p.id: p for p in db.query(Product).filter(
        Product.id.in_([item.product_id for item in order_items])
    ).all()}

    available_boxes = (
        db.query(BoxInventory).filter(BoxInventory.quantity_available > 0).all()
    )
    if not available_boxes:
        setattr(order, "status", "failed")
        db.commit()
        return {"error": "No boxes available in inventory"}

    candidates = []

    for box in available_boxes:
        packing_result = items_fit_in_box(db, order_items, box, product_map)
        if packing_result.fits:
            optimized_cost = calculate_optimized_cost(db, order, box, product_map)
            candidates.append(
                {
                    "box": box,
                    "optimized_cost": optimized_cost,
                    "efficiency_score": packing_result.efficiency_score,
                    "packed_items": packing_result.packed_items,
                    "has_fragile": packing_result.has_fragile,
                    "total_layers": packing_result.total_layers,
                }
            )

    baseline_cost = calculate_baseline_cost(db, order, product_map)

    filtered_candidates = [c for c in candidates if c["optimized_cost"] < baseline_cost]

    is_fallback = False

    if not filtered_candidates:
        total_weight = 0.0
        for item in order_items:
            product = product_map.get(item.product_id)
            if product is None:
                setattr(order, "status", "failed")
                db.commit()
                return {"error": f"Product {item.product_id} not found"}
            total_weight += product.weight_kg * item.quantity

        fitting_boxes = [
            b for b in available_boxes if float(b.max_weight_kg) >= total_weight
        ]
        if not fitting_boxes:
            setattr(order, "status", "failed")
            db.commit()
            return {"error": "No box can hold the total weight"}

        largest_box = max(
            fitting_boxes,
            key=lambda b: b.length_cm * b.width_cm * b.height_cm,
        )
        packing_result = items_fit_in_box(db, order_items, largest_box, product_map)
        optimized_cost = calculate_optimized_cost(db, order, largest_box, product_map)
        efficiency = packing_result.efficiency_score

        winner = {
            "box": largest_box,
            "optimized_cost": optimized_cost,
            "efficiency_score": efficiency,
            "packed_items": packing_result.packed_items,
            "has_fragile": packing_result.has_fragile,
            "total_layers": packing_result.total_layers,
        }
        is_fallback = True
        savings = max(0.0, baseline_cost - optimized_cost)
    else:
        filtered_candidates.sort(
            key=lambda c: (c["optimized_cost"], -c["efficiency_score"])
        )
        winner = filtered_candidates[0]
        savings = baseline_cost - winner["optimized_cost"]

    actual_weight_kg = 0.0
    for item in order_items:
        product = product_map.get(item.product_id)
        if product is None:
            setattr(order, "status", "failed")
            db.commit()
            return {"error": f"Product {item.product_id} not found"}
        actual_weight_kg += product.weight_kg * item.quantity

    box = winner["box"]
    dimensional_weight_kg = calculate_dimensional_weight(
        float(box.length_cm), float(box.width_cm), float(box.height_cm)
    )
    chargeable_weight_kg = calculate_chargeable_weight(
        actual_weight_kg, dimensional_weight_kg
    )

    shipping_rate = get_shipping_rate(
        db, str(order.shipping_zone), chargeable_weight_kg
    )

    baseline_validation = validate_result(
        db,
        order,
        box.id,
        actual_weight_kg,
        dimensional_weight_kg,
        chargeable_weight_kg,
        str(order.shipping_zone),
        shipping_rate,
        baseline_cost,
        "baseline",
    )

    optimized_validation = validate_result(
        db,
        order,
        box.id,
        actual_weight_kg,
        dimensional_weight_kg,
        chargeable_weight_kg,
        str(order.shipping_zone),
        shipping_rate,
        winner["optimized_cost"],
        "optimized",
    )

    if not optimized_validation.valid:
        if savings < 0:
            savings = 0.0
            winner["optimized_cost"] = baseline_cost
            setattr(order, "status", "no_savings")
        else:
            setattr(order, "status", "failed")
            db.commit()
            return {"error": f"Validation failed: {optimized_validation.reason}"}
    else:
        if savings <= 0:
            savings = 0.0
            setattr(order, "status", "no_savings")
        else:
            setattr(order, "status", "optimized")

    if is_fallback:
        decision_explanation = "DETERMINISTIC_FALLBACK"
    else:
        decision_explanation = (
            f"Selected {box.name}: lowest cost with {winner['efficiency_score']:.0%} volume efficiency. "
            f"Saved Rs.{savings:.2f} vs baseline."
        )

    profit = calculate_profit(savings)

    # Re-compute packing result for the winning box to get proper PackingResult
    winning_packing_result = items_fit_in_box(db, order_items, box)
    instructions_data = generate_instructions(winning_packing_result, box.name)

    plan = PackagingPlan(
        order_id=order.id,
        box_id=box.id,
        baseline_cost=baseline_cost,
        optimized_cost=winner["optimized_cost"],
        savings=savings,
        efficiency_score=winner["efficiency_score"],
        decision_explanation=decision_explanation,
        profit=profit,
        packing_instructions=instructions_data["instructions"],
        item_order=json.dumps(instructions_data["item_order"]),
    )
    db.add(plan)
    db.flush()

    for packed_item in winner["packed_items"]:
        plan_item = PackagingPlanItem(
            plan_id=plan.id,
            product_id=packed_item.product_id,
            quantity_packed=packed_item.quantity,
            position_x=packed_item.position_x,
            position_y=packed_item.position_y,
            position_z=packed_item.position_z,
        )
        db.add(plan_item)

    db.commit()
    db.refresh(plan)

    return {
        "order_id": order.id,
        "recommended_box": box.name,
        "baseline_cost": round(baseline_cost, 2),
        "optimized_cost": round(winner["optimized_cost"], 2),
        "savings": round(savings, 2),
        "efficiency_score": round(winner["efficiency_score"], 2),
        "decision_explanation": decision_explanation,
        "profit": round(profit, 2),
        "packing_instructions": instructions_data["instructions"],
        "item_order": instructions_data["item_order"],
        "packed_items": [
            {
                "product_id": pi.product_id,
                "product_name": pi.product_name,
                "quantity": pi.quantity,
                "is_fragile": pi.is_fragile,
                "position_x": pi.position_x,
                "position_y": pi.position_y,
                "position_z": pi.position_z,
                "layer": pi.layer,
                "length_cm": pi.length_cm,
                "width_cm": pi.width_cm,
                "height_cm": pi.height_cm,
            }
            for pi in winner["packed_items"]
        ],
    }
