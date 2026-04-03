from database import SessionLocal, Base, engine
from models import User, Product, BoxInventory, ShippingRate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Drop all tables and recreate them to ensure schema matches models
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    if db.query(User).first() is None:
        print("Seeding database...")

        admin = User(
            name="Admin User",
            email="admin@packai.com",
            hashed_password=pwd_context.hash("admin123"),
        )
        db.add(admin)

        products = [
            Product(
                name="Laptop 15 inch",
                sku="LAP-001",
                length_cm=36.0,
                width_cm=25.0,
                height_cm=3.0,
                weight_kg=2.0,
                is_fragile=True,
            ),
            Product(
                name="Wireless Mouse",
                sku="MOU-001",
                length_cm=12.0,
                width_cm=7.0,
                height_cm=4.0,
                weight_kg=0.1,
                is_fragile=False,
            ),
            Product(
                name="Monitor 24 inch",
                sku="MON-001",
                length_cm=55.0,
                width_cm=35.0,
                height_cm=8.0,
                weight_kg=4.5,
                is_fragile=True,
            ),
            Product(
                name="Keyboard",
                sku="KEY-001",
                length_cm=45.0,
                width_cm=15.0,
                height_cm=3.0,
                weight_kg=0.8,
                is_fragile=False,
            ),
            Product(
                name="USB Cable",
                sku="USB-001",
                length_cm=15.0,
                width_cm=10.0,
                height_cm=2.0,
                weight_kg=0.05,
                is_fragile=False,
            ),
            Product(
                name="Headphones",
                sku="HPH-001",
                length_cm=20.0,
                width_cm=18.0,
                height_cm=10.0,
                weight_kg=0.3,
                is_fragile=True,
            ),
            Product(
                name="Webcam",
                sku="WEB-001",
                length_cm=10.0,
                width_cm=5.0,
                height_cm=5.0,
                weight_kg=0.15,
                is_fragile=True,
            ),
            Product(
                name="Power Bank",
                sku="PWR-001",
                length_cm=15.0,
                width_cm=7.0,
                height_cm=2.0,
                weight_kg=0.4,
                is_fragile=False,
            ),
        ]
        for p in products:
            db.add(p)

        boxes = [
            BoxInventory(
                name="Small Box",
                length_cm=30.0,
                width_cm=20.0,
                height_cm=15.0,
                max_weight_kg=5.0,
                supports_fragile=False,
                quantity_available=50,
            ),
            BoxInventory(
                name="Medium Box",
                length_cm=45.0,
                width_cm=35.0,
                height_cm=25.0,
                max_weight_kg=15.0,
                supports_fragile=True,
                quantity_available=30,
            ),
            BoxInventory(
                name="Large Box",
                length_cm=60.0,
                width_cm=45.0,
                height_cm=40.0,
                max_weight_kg=25.0,
                supports_fragile=True,
                quantity_available=20,
            ),
            BoxInventory(
                name="Extra Large Box",
                length_cm=80.0,
                width_cm=60.0,
                height_cm=50.0,
                max_weight_kg=40.0,
                supports_fragile=True,
                quantity_available=10,
            ),
            BoxInventory(
                name="Fragile Small",
                length_cm=25.0,
                width_cm=20.0,
                height_cm=15.0,
                max_weight_kg=3.0,
                supports_fragile=True,
                quantity_available=40,
            ),
        ]
        for b in boxes:
            db.add(b)

        shipping_rates = [
            ShippingRate(
                zone="Zone A", weight_min_kg=0, weight_max_kg=5, rate_per_kg=50.0
            ),
            ShippingRate(
                zone="Zone A", weight_min_kg=5, weight_max_kg=15, rate_per_kg=45.0
            ),
            ShippingRate(
                zone="Zone A", weight_min_kg=15, weight_max_kg=50, rate_per_kg=40.0
            ),
            ShippingRate(
                zone="Zone B", weight_min_kg=0, weight_max_kg=5, rate_per_kg=75.0
            ),
            ShippingRate(
                zone="Zone B", weight_min_kg=5, weight_max_kg=15, rate_per_kg=70.0
            ),
            ShippingRate(
                zone="Zone B", weight_min_kg=15, weight_max_kg=50, rate_per_kg=65.0
            ),
            ShippingRate(
                zone="Zone C", weight_min_kg=0, weight_max_kg=5, rate_per_kg=100.0
            ),
            ShippingRate(
                zone="Zone C", weight_min_kg=5, weight_max_kg=15, rate_per_kg=95.0
            ),
            ShippingRate(
                zone="Zone C", weight_min_kg=15, weight_max_kg=50, rate_per_kg=90.0
            ),
        ]
        for r in shipping_rates:
            db.add(r)

        db.commit()
        print("Database seeded successfully!")
        print(f"  Admin user: admin@packai.com / admin123")
        print(f"  Products: {len(products)}")
        print(f"  Box types: {len(boxes)}")
        print(f"  Shipping rates: {len(shipping_rates)}")
    else:
        print("Database already seeded, skipping.")
finally:
    db.close()
