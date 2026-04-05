from database import SessionLocal, Base, engine
from models import User, Product, BoxInventory, ShippingRate, Order, OrderItem, PackagingPlan, PackagingPlanItem, UploadBatch, CostLog
import bcrypt
import random
from datetime import datetime, timedelta

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def _detect_zone_from_pincode(pincode: str) -> str:
    if not pincode or len(str(pincode)) < 2:
        return "Zone C"
    first_two = str(pincode).strip()[:2]
    if first_two in ["79", "78", "19", "18", "74", "75"]:
        return "Zone D"
    if first_two in ["40", "41", "42", "11", "56", "50", "60", "70", "38", "39", "43", "44"]:
        return "Zone A"
    if first_two in ["45", "46", "47", "48", "51", "52", "53", "12", "13", "14", "15", "16", "20", "21", "22", "23", "24", "25", "26", "27", "28"]:
        return "Zone B"
    return "Zone C"

# Drop all tables and recreate them to ensure schema matches models
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
        )
        tables = [row[0] for row in result]
        for table in reversed(tables):
            conn.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE'))
        conn.commit()
except Exception as e:
    print(f"Warning: Could drop tables with CASCADE: {e}")
    Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    print("Seeding database with 100 realistic orders...")

    # Users
    users = [
        User(name="Admin User", email="admin@packai.com", hashed_password=hash_password("admin123")),
        User(name="Shiprocket Store", email="store@shiprocket.com", hashed_password=hash_password("store123")),
        User(name="Delhivery Hub", email="hub@delhivery.com", hashed_password=hash_password("hub123")),
    ]
    for u in users:
        db.add(u)
    db.flush()

    # Products - 25 realistic ecommerce products
    products_data = [
        ("Laptop 15 inch", "LAP-001", 36.0, 25.0, 3.0, 2.0, True),
        ("Wireless Mouse", "MOU-001", 12.0, 7.0, 4.0, 0.1, False),
        ("Monitor 24 inch", "MON-001", 55.0, 35.0, 8.0, 4.5, True),
        ("Mechanical Keyboard", "KEY-001", 45.0, 15.0, 3.0, 0.8, False),
        ("USB-C Cable", "USB-001", 15.0, 10.0, 2.0, 0.05, False),
        ("Gaming Headphones", "HPH-001", 20.0, 18.0, 10.0, 0.3, True),
        ("HD Webcam", "WEB-001", 10.0, 5.0, 5.0, 0.15, True),
        ("Power Bank 20000mAh", "PWR-001", 15.0, 7.0, 2.0, 0.4, False),
        ("Tablet 10 inch", "TAB-001", 25.0, 17.0, 1.0, 0.5, True),
        ("Smartphone", "PHN-001", 16.0, 8.0, 1.0, 0.2, True),
        ("Bluetooth Speaker", "SPK-001", 18.0, 8.0, 8.0, 0.6, False),
        ("Laptop Charger", "CHR-001", 12.0, 6.0, 3.0, 0.3, False),
        ("Mouse Pad XL", "PAD-001", 40.0, 30.0, 0.5, 0.2, False),
        ("HDMI Cable 2m", "HDM-001", 20.0, 12.0, 3.0, 0.1, False),
        ("External SSD 1TB", "SSD-001", 10.0, 6.0, 1.0, 0.05, True),
        ("Printer Ink Cartridge", "INK-001", 12.0, 5.0, 5.0, 0.15, False),
        ("Router WiFi 6", "RTR-001", 25.0, 20.0, 5.0, 0.5, False),
        ("Smart Watch", "WCH-001", 10.0, 10.0, 5.0, 0.1, True),
        ("Phone Case", "CAS-001", 16.0, 8.0, 2.0, 0.05, False),
        ("Screen Protector", "SCR-001", 16.0, 8.0, 0.5, 0.02, False),
        ("Desk Lamp LED", "LMP-001", 20.0, 15.0, 30.0, 0.8, True),
        ("Cable Organizer", "ORG-001", 15.0, 10.0, 5.0, 0.1, False),
        ("Laptop Stand", "STD-001", 25.0, 20.0, 3.0, 0.6, False),
        ("Wireless Charger Pad", "WCP-001", 10.0, 10.0, 1.5, 0.15, False),
        ("USB Hub 7-port", "HUB-001", 15.0, 5.0, 2.0, 0.1, False),
    ]

    products = []
    for name, sku, l, w, h, wt, frag in products_data:
        p = Product(name=name, sku=sku, length_cm=l, width_cm=w, height_cm=h, weight_kg=wt, is_fragile=frag)
        db.add(p)
        products.append(p)
    db.flush()

    # Box Inventory - 8 box types
    boxes_data = [
        ("Small Box", 30.0, 20.0, 15.0, 5.0, False, 50),
        ("Medium Box", 45.0, 35.0, 25.0, 15.0, True, 30),
        ("Large Box", 60.0, 45.0, 40.0, 25.0, True, 20),
        ("Extra Large Box", 80.0, 60.0, 50.0, 40.0, True, 10),
        ("Fragile Small", 25.0, 20.0, 15.0, 3.0, True, 40),
        ("Slim Box", 40.0, 30.0, 10.0, 8.0, True, 25),
        ("Cube Box", 35.0, 35.0, 35.0, 20.0, True, 15),
        ("Flat Box", 50.0, 35.0, 8.0, 10.0, False, 35),
    ]

    boxes = []
    for name, l, w, h, wt, frag, qty in boxes_data:
        b = BoxInventory(name=name, length_cm=l, width_cm=w, height_cm=h, max_weight_kg=wt, supports_fragile=frag, quantity_available=qty)
        db.add(b)
        boxes.append(b)
    db.flush()

    # Shipping Rates - 12 rates across 4 zones
    shipping_rates_data = [
        ("Zone A", 0, 5, 50.0),
        ("Zone A", 5, 15, 45.0),
        ("Zone A", 15, 50, 40.0),
        ("Zone B", 0, 5, 75.0),
        ("Zone B", 5, 15, 70.0),
        ("Zone B", 15, 50, 65.0),
        ("Zone C", 0, 5, 100.0),
        ("Zone C", 5, 15, 95.0),
        ("Zone C", 15, 50, 90.0),
        ("Zone D", 0, 5, 120.0),
        ("Zone D", 5, 15, 115.0),
        ("Zone D", 15, 50, 110.0),
    ]

    for zone, wmin, wmax, rate in shipping_rates_data:
        db.add(ShippingRate(zone=zone, weight_min_kg=wmin, weight_max_kg=wmax, rate_per_kg=rate))

    # Generate 100 realistic orders
    zones = ["Zone A", "Zone B", "Zone C", "Zone D"]
    zone_weights = [0.4, 0.3, 0.2, 0.1]  # 40% Zone A, 30% Zone B, 20% Zone C, 10% Zone D

    # Product combinations that make sense for real orders
    order_templates = [
        # Single item orders
        {"products": [0], "quantities": [1]},  # Just a laptop
        {"products": [2], "quantities": [1]},  # Just a monitor
        {"products": [8], "quantities": [1]},  # Just a tablet
        {"products": [9], "quantities": [1]},  # Just a phone
        {"products": [10], "quantities": [1]},  # Just a speaker

        # Small multi-item orders
        {"products": [0, 1], "quantities": [1, 1]},  # Laptop + Mouse
        {"products": [0, 3], "quantities": [1, 1]},  # Laptop + Keyboard
        {"products": [0, 1, 3], "quantities": [1, 1, 1]},  # Laptop + Mouse + Keyboard
        {"products": [9, 18, 19], "quantities": [1, 1, 2]},  # Phone + Case + Screen protector
        {"products": [5, 6], "quantities": [1, 1]},  # Headphones + Webcam

        # Medium orders
        {"products": [0, 1, 3, 11], "quantities": [1, 1, 1, 1]},  # Full laptop setup
        {"products": [2, 3, 1], "quantities": [1, 1, 1]},  # Monitor + Keyboard + Mouse
        {"products": [8, 9, 5], "quantities": [1, 1, 1]},  # Tablet + Phone + Headphones
        {"products": [0, 11, 22, 1], "quantities": [1, 1, 1, 1]},  # Laptop + Charger + Stand + Mouse
        {"products": [16, 13, 24], "quantities": [1, 2, 1]},  # Router + HDMI + USB Hub

        # Large orders
        {"products": [0, 2, 3, 1, 11], "quantities": [1, 1, 1, 1, 1]},  # Complete workstation
        {"products": [8, 9, 5, 10, 17], "quantities": [1, 1, 1, 1, 1]},  # Mobile tech bundle
        {"products": [0, 1, 3, 11, 22, 14], "quantities": [1, 1, 1, 1, 1, 1]},  # Ultimate laptop setup
        {"products": [20, 16, 13, 24, 12], "quantities": [1, 1, 2, 1, 1]},  # Office setup
        {"products": [0, 0, 1, 1, 3, 3], "quantities": [1, 1, 1, 1, 1, 1]},  # Dual laptop setup

        # Bulk orders
        {"products": [4, 13, 24], "quantities": [5, 3, 2]},  # Cables and accessories bulk
        {"products": [18, 19], "quantities": [10, 10]},  # Phone cases and screen protectors
        {"products": [15], "quantities": [5]},  # Ink cartridges bulk
        {"products": [14, 14, 14], "quantities": [1, 1, 1]},  # Multiple SSDs
        {"products": [7, 23], "quantities": [3, 3]},  # Power banks and charger pads

        # Mixed realistic orders
        {"products": [0, 5, 11], "quantities": [1, 1, 1]},  # Laptop + Headphones + Charger
        {"products": [2, 20, 12], "quantities": [1, 1, 1]},  # Monitor + Lamp + Mouse pad
        {"products": [9, 17, 18, 19, 23], "quantities": [1, 1, 1, 2, 1]},  # Phone accessories bundle
        {"products": [1, 3, 12, 21], "quantities": [2, 1, 1, 2]},  # Peripheral bundle
        {"products": [6, 5, 10, 24], "quantities": [1, 1, 1, 1]},  # Streaming setup
    ]

    # Generate orders over the last 14 days
    base_date = datetime.now()
    upload_batches = []

    # Create 5 upload batches to simulate 5 different CSV uploads
    batch_filenames = [
        "shiprocket_orders_2024_01.csv",
        "delhivery_export_jan.xlsx",
        "meesho_orders_batch3.csv",
        "amazon_fba_shipment.xlsx",
        "manual_orders_q1.csv",
    ]

    orders_per_batch = 20  # 5 batches × 20 orders = 100 orders

    for batch_idx in range(5):
        batch_date = base_date - timedelta(days=14 - (batch_idx * 2))
        batch = UploadBatch(
            filename=batch_filenames[batch_idx],
            total_rows=orders_per_batch,
            valid_rows=orders_per_batch,
            failed_rows=0,
            status="complete",
            error_summary="[]",
            created_at=batch_date,
        )
        db.add(batch)
        upload_batches.append(batch)

    db.flush()

    # Generate 100 orders
    random.seed(42)  # For reproducibility

    all_orders = []
    all_order_items = []

    # Realistic Indian customer data
    customers = [
        ("Rahul Sharma", "9876543210", "Mumbai", "Maharashtra", "400001"),
        ("Priya Patel", "9876543211", "Delhi", "Delhi", "110001"),
        ("Amit Kumar", "9876543212", "Bangalore", "Karnataka", "560001"),
        ("Sneha Reddy", "9876543213", "Chennai", "Tamil Nadu", "600001"),
        ("Vikram Singh", "9876543214", "Hyderabad", "Telangana", "500001"),
        ("Ananya Iyer", "9876543215", "Kolkata", "West Bengal", "700001"),
        ("Rohit Verma", "9876543216", "Pune", "Maharashtra", "411001"),
        ("Deepa Nair", "9876543217", "Jaipur", "Rajasthan", "302001"),
        ("Karthik Raj", "9876543218", "Ahmedabad", "Gujarat", "380001"),
        ("Meera Joshi", "9876543219", "Lucknow", "Uttar Pradesh", "226001"),
        ("Suresh Menon", "9876543220", "Kochi", "Kerala", "682001"),
        ("Lakshmi P", "9876543221", "Coimbatore", "Tamil Nadu", "641001"),
        ("Arjun Das", "9876543222", "Visakhapatnam", "Andhra Pradesh", "530001"),
        ("Pooja Gupta", "9876543223", "Chandigarh", "Chandigarh", "160001"),
        ("Nikhil Rao", "9876543224", "Indore", "Madhya Pradesh", "452001"),
        ("Ritu Sharma", "9876543225", "Nagpur", "Maharashtra", "440001"),
        ("Ganesh Pillai", "9876543226", "Thiruvananthapuram", "Kerala", "695001"),
        ("Divya Menon", "9876543227", "Mangalore", "Karnataka", "575001"),
        ("Aditya Singh", "9876543228", "Patna", "Bihar", "800001"),
        ("Kavitha R", "9876543229", "Mysore", "Karnataka", "570001"),
        ("Manoj Tiwari", "9876543230", "Bhopal", "Madhya Pradesh", "462001"),
        ("Swati Kulkarni", "9876543231", "Nashik", "Maharashtra", "422001"),
        ("Ravi Shankar", "9876543232", "Vijayawada", "Andhra Pradesh", "520001"),
        ("Anjali Desai", "9876543233", "Rajkot", "Gujarat", "360001"),
        ("Sanjay Kumar", "9876543234", "Kanpur", "Uttar Pradesh", "208001"),
    ]

    channels = ["Shopify", "Amazon", "Flipkart", "Meesho", "Delhivery"]
    payment_types = ["Prepaid", "COD", "Prepaid", "Prepaid", "Prepaid"]
    priorities = ["Standard", "Standard", "Express", "Standard", "Standard"]
    categories = ["Electronics", "Accessories", "Home & Office", "Smart Home", "Kitchen Appliances", "Lifestyle", "Fitness", "Sports", "Photography", "Office Supplies"]

    for i in range(100):
        batch_idx = i // orders_per_batch
        order_in_batch = i % orders_per_batch
        order_date = (base_date - timedelta(days=14 - (batch_idx * 2))) + timedelta(hours=order_in_batch * 2)

        user = users[i % len(users)]
        customer = customers[i % len(customers)]
        channel = channels[i % len(channels)]
        payment = payment_types[i % len(payment_types)]
        priority = priorities[i % len(priorities)]
        category = categories[i % len(categories)]

        zone = _detect_zone_from_pincode(customer[4])

        # Pick a random order template
        template = random.choice(order_templates)

        order = Order(
            user_id=user.id,
            channel_order_id=f"ORD-{channel[:3].upper()}-{10000 + i}",
            channel=channel,
            customer_name=customer[0],
            customer_phone=customer[1],
            customer_city=customer[2],
            customer_state=customer[3],
            customer_pincode=customer[4],
            shipping_zone=zone,
            payment_type=payment,
            priority=priority,
            category=category,
            status="pending",
            created_at=order_date,
            updated_at=order_date,
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        all_orders.append(order)

        # Add order items
        for prod_idx, qty in zip(template["products"], template["quantities"]):
            item = OrderItem(
                order_id=order.id,
                product_id=products[prod_idx].id,
                quantity=qty,
            )
            db.add(item)
            all_order_items.append(item)

        db.commit()

    # Now run optimization logic for each order and create packaging plans
    print("Running optimization for 100 orders...")

    for idx, order in enumerate(all_orders):
        order_items = [item for item in all_order_items if item.order_id == order.id]

        # Calculate total weight and volume
        total_weight = 0.0
        total_volume = 0.0
        has_fragile = False

        for item in order_items:
            product = next(p for p in products if p.id == item.product_id)
            total_weight += product.weight_kg * item.quantity
            total_volume += product.length_cm * product.width_cm * product.height_cm * item.quantity
            if product.is_fragile:
                has_fragile = True

        # Find fitting boxes
        fitting_boxes = []
        for box in boxes:
            box_volume = box.length_cm * box.width_cm * box.height_cm
            if (total_volume <= box_volume and
                total_weight <= box.max_weight_kg and
                (not has_fragile or box.supports_fragile)):
                fitting_boxes.append(box)

        if not fitting_boxes:
            # Fallback to largest box
            largest_box = max(boxes, key=lambda b: b.length_cm * b.width_cm * b.height_cm)
            fitting_boxes = [largest_box]

        # Calculate baseline cost (using largest fitting box)
        largest_fitting = max(fitting_boxes, key=lambda b: b.length_cm * b.width_cm * box.height_cm)
        baseline_box_volume = largest_fitting.length_cm * largest_fitting.width_cm * largest_fitting.height_cm

        # Dimensional weight calculation
        dim_weight_factor = 5000  # Standard divisor
        baseline_dim_weight = baseline_box_volume / dim_weight_factor
        baseline_chargeable = max(total_weight, baseline_dim_weight)

        # Get shipping rate
        zone_rate = None
        for rate_data in shipping_rates_data:
            if rate_data[0] == order.shipping_zone and rate_data[1] <= baseline_chargeable < rate_data[2]:
                zone_rate = rate_data[3]
                break
        if zone_rate is None:
            zone_rate = shipping_rates_data[-1][3]  # Default to highest rate

        baseline_cost = baseline_chargeable * zone_rate

        # Find optimal box (smallest fitting box)
        optimal_box = min(fitting_boxes, key=lambda b: b.length_cm * b.width_cm * b.height_cm)
        optimal_box_volume = optimal_box.length_cm * optimal_box.width_cm * optimal_box.height_cm
        optimal_dim_weight = optimal_box_volume / dim_weight_factor
        optimal_chargeable = max(total_weight, optimal_dim_weight)

        # Get rate for optimal box
        optimal_rate = None
        for rate_data in shipping_rates_data:
            if rate_data[0] == order.shipping_zone and rate_data[1] <= optimal_chargeable < rate_data[2]:
                optimal_rate = rate_data[3]
                break
        if optimal_rate is None:
            optimal_rate = shipping_rates_data[-1][3]

        optimized_cost = optimal_chargeable * optimal_rate

        # Calculate savings
        savings = max(0.0, baseline_cost - optimized_cost)
        efficiency_score = total_volume / optimal_box_volume if optimal_box_volume > 0 else 0

        # Determine status
        if savings > 0:
            order.status = "optimized"
            decision_explanation = f"Selected {optimal_box.name}: lowest cost with {efficiency_score:.0%} volume efficiency. Saved Rs.{savings:.2f} vs baseline."
        else:
            order.status = "no_savings"
            optimized_cost = baseline_cost
            savings = 0.0
            decision_explanation = f"No cost savings possible. Using {optimal_box.name} as best fit."

        # Calculate profit (15% of savings)
        profit = savings * 0.15

        # Update order timestamps
        order.updated_at = order.created_at + timedelta(minutes=random.randint(1, 30))

        # Create packaging plan
        plan = PackagingPlan(
            order_id=order.id,
            box_id=optimal_box.id,
            baseline_cost=round(baseline_cost, 2),
            optimized_cost=round(optimized_cost, 2),
            savings=round(savings, 2),
            efficiency_score=round(efficiency_score, 2),
            decision_explanation=decision_explanation,
            profit=round(profit, 2),
            packing_instructions=f"Place items in {optimal_box.name}. Stack from bottom to top by weight.",
        )
        db.add(plan)
        db.flush()

        # Create packaging plan items with positions
        cursor_y = 0.0
        for item in order_items:
            product = next(p for p in products if p.id == item.product_id)

            layer = "bottom" if cursor_y == 0 else ("top" if product.is_fragile else "middle")

            plan_item = PackagingPlanItem(
                plan_id=plan.id,
                product_id=product.id,
                quantity_packed=item.quantity,
                position_x=0.0,
                position_y=cursor_y,
                position_z=0.0,
            )
            db.add(plan_item)
            cursor_y += product.height_cm * item.quantity

        # Create cost logs
        db.add(CostLog(
            order_id=order.id,
            box_id=largest_fitting.id,
            actual_weight_kg=round(total_weight, 2),
            dimensional_weight_kg=round(baseline_dim_weight, 2),
            chargeable_weight_kg=round(baseline_chargeable, 2),
            shipping_zone=order.shipping_zone,
            rate_per_kg=zone_rate,
            computed_cost=round(baseline_cost, 2),
            cost_type="baseline",
            created_at=order.created_at,
        ))

        db.add(CostLog(
            order_id=order.id,
            box_id=optimal_box.id,
            actual_weight_kg=round(total_weight, 2),
            dimensional_weight_kg=round(optimal_dim_weight, 2),
            chargeable_weight_kg=round(optimal_chargeable, 2),
            shipping_zone=order.shipping_zone,
            rate_per_kg=optimal_rate,
            computed_cost=round(optimized_cost, 2),
            cost_type="optimized",
            created_at=order.created_at,
        ))

        if (idx + 1) % 20 == 0:
            print(f"  Optimized {idx + 1}/100 orders...")

    db.commit()

    # Print summary
    optimized_count = db.query(Order).filter(Order.status == "optimized").count()
    no_savings_count = db.query(Order).filter(Order.status == "no_savings").count()
    total_savings = db.query(PackagingPlan).all()
    total_saved = sum(p.savings for p in total_savings)
    total_profit = sum(p.profit for p in total_savings)
    avg_efficiency = sum(p.efficiency_score for p in total_savings) / len(total_savings) if total_savings else 0

    print("\n" + "="*60)
    print("Database seeded successfully!")
    print("="*60)
    print(f"  Users: {db.query(User).count()}")
    print(f"  Products: {db.query(Product).count()}")
    print(f"  Box types: {db.query(BoxInventory).count()}")
    print(f"  Shipping rates: {db.query(ShippingRate).count()}")
    print(f"  Orders: {db.query(Order).count()}")
    print(f"  Order items: {db.query(OrderItem).count()}")
    print(f"  Packaging plans: {db.query(PackagingPlan).count()}")
    print(f"  Packaging plan items: {db.query(PackagingPlanItem).count()}")
    print(f"  Cost logs: {db.query(CostLog).count()}")
    print(f"  Upload batches: {db.query(UploadBatch).count()}")
    print("="*60)
    print(f"  Orders optimized: {optimized_count}")
    print(f"  Orders no savings: {no_savings_count}")
    print(f"  Total savings: Rs.{total_saved:.2f}")
    print(f"  Total profit: Rs.{total_profit:.2f}")
    print(f"  Avg efficiency: {avg_efficiency:.0%}")
    print("="*60)
    print(f"  Login: admin@packai.com / admin123")

finally:
    db.close()
