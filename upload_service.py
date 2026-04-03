from sqlalchemy.orm import Session
from models import User, Product, Order, OrderItem, UploadBatch
from passlib.context import CryptContext
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _slugify(text: str) -> str:
    """Simple slugify without external dependency."""
    import re

    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text or "product"


def parse_upload_file(file_bytes: bytes, filename: str):
    """Parse CSV or Excel file into a pandas DataFrame."""
    import pandas as pd
    import io

    if filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(file_bytes))
    elif filename.endswith(".xlsx") or filename.endswith(".xls"):
        df = pd.read_excel(io.BytesIO(file_bytes))
    else:
        raise ValueError(
            "Unsupported file format. Only CSV and Excel files are allowed."
        )

    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].astype(str).str.strip()

    return df


def validate_upload_dataframe(df) -> tuple:
    """Validate the uploaded DataFrame. Returns (valid_df, errors)."""
    required_columns = [
        "product_name",
        "length",
        "width",
        "height",
        "weight",
        "quantity",
        "fragility",
    ]

    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")

    valid_rows = []
    errors = []

    for idx, row in df.iterrows():
        row_errors = []
        row_num = int(idx) + 1

        product_name = str(row.get("product_name", "")).strip()
        if not product_name:
            row_errors.append("Product name is required and cannot be empty")

        for dim in ["length", "width", "height", "weight"]:
            try:
                val = float(row[dim])
                if val <= 0:
                    row_errors.append(f"{dim.capitalize()} must be greater than 0")
            except (ValueError, TypeError):
                row_errors.append(f"{dim.capitalize()} must be a valid number")

        try:
            qty = int(float(row["quantity"]))
            if qty < 1:
                row_errors.append("Quantity must be at least 1")
        except (ValueError, TypeError):
            row_errors.append("Quantity must be a valid integer")

        fragility = str(row.get("fragility", "")).lower().strip()
        if fragility not in ["yes", "no"]:
            row_errors.append("Fragility must be 'yes' or 'no'")

        if row_errors:
            errors.append({"row": row_num, "error": "; ".join(row_errors)})
        else:
            valid_rows.append(
                {
                    "product_name": product_name,
                    "length": float(row["length"]),
                    "width": float(row["width"]),
                    "height": float(row["height"]),
                    "weight": float(row["weight"]),
                    "quantity": int(float(row["quantity"])),
                    "fragility": fragility == "yes",
                }
            )

    import pandas as pd

    valid_df = pd.DataFrame(valid_rows) if valid_rows else pd.DataFrame()
    return valid_df, errors


def ingest_upload_batch(
    db: Session, valid_df, user_id: int, shipping_zone: str
) -> list:
    """Ingest validated data into the database. Returns list of created order IDs."""
    order_ids = []

    for _, row in valid_df.iterrows():
        product = (
            db.query(Product).filter(Product.name.ilike(row["product_name"])).first()
        )

        if not product:
            base_slug = _slugify(row["product_name"])
            unique_suffix = str(uuid.uuid4())[:8]
            sku = f"{base_slug}-{unique_suffix}"

            while db.query(Product).filter(Product.sku == sku).first():
                unique_suffix = str(uuid.uuid4())[:8]
                sku = f"{base_slug}-{unique_suffix}"

            product = Product(
                name=row["product_name"],
                sku=sku,
                length_cm=row["length"],
                width_cm=row["width"],
                height_cm=row["height"],
                weight_kg=row["weight"],
                is_fragile=row["fragility"],
            )
            db.add(product)
            db.flush()

        order = Order(user_id=user_id, shipping_zone=shipping_zone, status="pending")
        db.add(order)
        db.flush()

        order_item = OrderItem(
            order_id=order.id, product_id=product.id, quantity=row["quantity"]
        )
        db.add(order_item)
        order_ids.append(order.id)

    return order_ids
