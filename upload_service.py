from sqlalchemy.orm import Session
from models import User, Product, Order, OrderItem, UploadBatch
from passlib.context import CryptContext
import uuid
import re

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

COLUMN_ALIASES = {
    "order_id": [
        "order_id", "orderid", "order no", "order_no", "order number",
        "order id", "Order ID", "OrderId", "Order No.", "Waybill",
        "waybill", "Waybill No", "waybill_no", "Invoice No", "invoice_no",
        "invoice number", "Invoice Number", "Reference No", "reference_no",
    ],
    "product_name": [
        "product_name", "product name", "Product Name", "ProductName",
        "item_name", "item name", "Item Name", "ItemName",
        "product_title", "product title", "Product Title",
        "item_title", "item title", "Item Title",
        "product_desc", "product description", "Product Description",
        "item_desc", "item description", "Description",
        "asin", "ASIN", "SKU Name", "sku_name",
        "product", "Product", "Item", "item",
        "item_description", "Item Description",
    ],
    "sku": [
        "sku", "SKU", "product_sku", "product sku", "Product SKU",
        "item_sku", "item sku", "Item SKU", "Seller SKU",
        "seller_sku", "seller sku", "SellerSKU",
        "variant_sku", "variant sku", "Variant SKU",
    ],
    "length_cm": [
        "length", "Length", "length_cm", "length (cm)", "Length (cm)",
        "item_length", "item length", "Item Length",
        "product_length", "product length", "Product Length",
        "l_cm", "l (cm)", "L (cm)", "L", "l",
        "length_inches", "length (in)", "Length (in)",
        "length_mm", "length (mm)", "Length (mm)",
    ],
    "width_cm": [
        "width", "Width", "width_cm", "width (cm)", "Width (cm)",
        "breadth", "Breadth", "breadth_cm", "breadth (cm)", "Breadth (cm)",
        "item_width", "item width", "Item Width", "item_breadth",
        "product_width", "product width", "Product Width",
        "w_cm", "w (cm)", "W (cm)", "W", "w", "b_cm", "b (cm)", "B",
        "width_inches", "width (in)", "Width (in)",
        "width_mm", "width (mm)", "Width (mm)",
    ],
    "height_cm": [
        "height", "Height", "height_cm", "height (cm)", "Height (cm)",
        "item_height", "item height", "Item Height",
        "product_height", "product height", "Product Height",
        "h_cm", "h (cm)", "H (cm)", "H", "h",
        "depth", "Depth", "depth_cm", "depth (cm)", "Depth (cm)",
        "height_inches", "height (in)", "Height (in)",
        "height_mm", "height (mm)", "Height (mm)",
    ],
    "weight_kg": [
        "weight", "Weight", "weight_kg", "weight (kg)", "Weight (kg)",
        "item_weight", "item weight", "Item Weight",
        "product_weight", "product weight", "Product Weight",
        "actual_weight", "actual weight", "Actual Weight",
        "dead_wt_kg", "dead weight", "Dead Weight",
        "unit_wt", "unit weight", "Unit Weight", "unit_wt_kg",
        "wt_kg", "wt (kg)", "Wt (kg)",
        "weight_g", "weight (g)", "Weight (g)",
        "weight_lbs", "weight (lbs)", "Weight (lbs)",
        "volumetric_weight", "Volumetric Weight",
    ],
    "quantity": [
        "quantity", "Quantity", "qty", "Qty", "QTY",
        "units", "Units", "order_quantity", "order quantity",
        "order qty", "Order Qty", "order_units", "order units",
        "item_quantity", "item quantity", "Item Quantity",
        "product_quantity", "product quantity", "Product Quantity",
        "no_of_units", "no of units", "No of Units",
    ],
    "fragility": [
        "fragility", "Fragility", "fragile", "Fragile", "is_fragile",
        "is_fragile", "Is Fragile", "fragile_item", "fragile item",
        "Fragile Item", "handle_with_care", "handle with care",
        "Handle With Care", "fragile_flag", "fragile flag",
        "Fragile Flag", "fragile_status", "fragile status",
    ],
    "category": [
        "category", "Category", "product_category", "product category",
        "Product Category", "item_category", "item category",
        "Item Category", "product_type", "product type", "Product Type",
        "item_type", "item type", "Item Type", "type", "Type",
        "department", "Department", "classification", "Classification",
    ],
    "customer_name": [
        "customer_name", "customer name", "Customer Name", "CustomerName",
        "buyer_name", "buyer name", "Buyer Name", "buyer", "Buyer",
        "customer", "Customer", "name", "Name", "recipient_name",
        "recipient name", "Recipient Name", "ship_to_name", "ship to name",
        "Ship To Name", "consignee_name", "consignee name",
    ],
    "customer_phone": [
        "customer_phone", "customer phone", "Customer Phone",
        "phone", "Phone", "mobile", "Mobile", "contact_number",
        "contact number", "Contact Number", "phone_number",
        "phone number", "Phone Number", "telephone", "Telephone",
        "recipient_phone", "recipient phone", "Recipient Phone",
        "mobile_number", "mobile number", "Mobile Number",
    ],
    "customer_city": [
        "customer_city", "customer city", "Customer City",
        "city", "City", "destination_city", "destination city",
        "Destination City", "ship_to_city", "ship to city",
        "delivery_city", "delivery city", "Delivery City",
        "town", "Town",
    ],
    "customer_state": [
        "customer_state", "customer state", "Customer State",
        "state", "State", "destination_state", "destination state",
        "Destination State", "ship_to_state", "ship to state",
        "delivery_state", "delivery state", "Delivery State",
        "province", "Province", "region", "Region",
    ],
    "customer_pincode": [
        "customer_pincode", "customer pincode", "Customer Pincode",
        "pincode", "Pincode", "pin_code", "pin code", "Pin Code",
        "postal_code", "postal code", "Postal Code", "zipcode",
        "Zipcode", "zip_code", "zip code", "Zip Code", "zip",
        "Zip", "delivery_pincode", "delivery pincode",
        "destination_pincode", "destination pincode",
    ],
    "channel": [
        "channel", "Channel", "source", "Source", "platform",
        "Platform", "marketplace", "Marketplace", "sales_channel",
        "sales channel", "Sales Channel", "order_source",
        "order source", "Order Source", "store", "Store",
        "shop", "Shop",
    ],
    "payment_type": [
        "payment_type", "payment type", "Payment Type", "payment_method",
        "payment method", "Payment Method", "payment", "Payment",
        "payment_mode", "payment mode", "Payment Mode",
        "prepaid_or_cod", "prepaid or cod", "Prepaid or COD",
        "cod_status", "cod status", "COD Status", "is_cod",
        "is cod", "Is COD", "payment_terms", "payment terms",
    ],
    "priority": [
        "priority", "Priority", "order_priority", "order priority",
        "Order Priority", "shipping_priority", "shipping priority",
        "Shipping Priority", "express", "Express", "delivery_speed",
        "delivery speed", "Delivery Speed", "service_level",
        "service level", "Service Level",
    ],
}


def _normalize_column_name(col: str) -> str:
    col = col.strip().lower()
    col = re.sub(r"[\s\-]+", "_", col)
    col = re.sub(r"[^\w]", "", col)
    return col


def _map_columns_to_standard(df_columns: list) -> dict:
    mapping = {}
    normalized_cols = {col: _normalize_column_name(col) for col in df_columns}

    for standard_col, aliases in COLUMN_ALIASES.items():
        for df_col, normalized in normalized_cols.items():
            if normalized in [a.lower().replace(" ", "_").replace("-", "_") for a in aliases]:
                if standard_col not in mapping:
                    mapping[standard_col] = df_col
                    break

    return mapping


def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text or "product"


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


def parse_upload_file(file_bytes: bytes, filename: str):
    import pandas as pd
    import io

    if filename.endswith(".csv"):
        try:
            df = pd.read_csv(io.BytesIO(file_bytes), encoding="utf-8")
        except UnicodeDecodeError:
            df = pd.read_csv(io.BytesIO(file_bytes), encoding="latin-1")
    elif filename.endswith(".xlsx") or filename.endswith(".xls"):
        df = pd.read_excel(io.BytesIO(file_bytes))
    else:
        raise ValueError("Unsupported file format. Only CSV and Excel files are allowed.")

    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].astype(str).str.strip()

    return df


def validate_upload_dataframe(df) -> tuple:
    column_mapping = _map_columns_to_standard(list(df.columns))

    required_fields = ["product_name", "length_cm", "width_cm", "height_cm", "weight_kg", "quantity"]
    missing = [f for f in required_fields if f not in column_mapping]
    if missing:
        available = list(df.columns)
        raise ValueError(
            f"Cannot find required columns: {missing}. "
            f"Available columns: {available}. "
            f"Supported formats: Shiprocket, Shopify, Amazon, Flipkart, Meesho, Delhivery, Unicommerce, PackAI"
        )

    valid_rows = []
    errors = []

    for idx, row in df.iterrows():
        row_errors = []
        row_num = int(idx) + 1

        product_name = str(row.get(column_mapping.get("product_name", ""), "")).strip()
        if not product_name:
            row_errors.append("Product name is required and cannot be empty")

        for std_col in ["length_cm", "width_cm", "height_cm", "weight_kg"]:
            orig_col = column_mapping.get(std_col)
            if orig_col is None:
                continue
            try:
                val = float(row[orig_col])
                if val <= 0:
                    row_errors.append(f"{std_col.replace('_', ' ').capitalize()} must be greater than 0")
            except (ValueError, TypeError):
                row_errors.append(f"{std_col.replace('_', ' ').capitalize()} must be a valid number")

        qty_col = column_mapping.get("quantity")
        if qty_col:
            try:
                qty = int(float(row[qty_col]))
                if qty < 1:
                    row_errors.append("Quantity must be at least 1")
            except (ValueError, TypeError):
                row_errors.append("Quantity must be a valid integer")

        frag_col = column_mapping.get("fragility")
        if frag_col:
            fragility = str(row.get(frag_col, "")).lower().strip()
            if fragility not in ["yes", "no", "true", "false", "1", "0", "y", "n"]:
                row_errors.append("Fragility must be 'yes' or 'no'")

        if row_errors:
            errors.append({"row": row_num, "error": "; ".join(row_errors)})
        else:
            row_data = {
                "product_name": product_name,
                "length_cm": float(row[column_mapping["length_cm"]]),
                "width_cm": float(row[column_mapping["width_cm"]]),
                "height_cm": float(row[column_mapping["height_cm"]]),
                "weight_kg": float(row[column_mapping["weight_kg"]]),
                "quantity": int(float(row[column_mapping["quantity"]])),
            }

            frag_col = column_mapping.get("fragility")
            if frag_col:
                frag = str(row.get(frag_col, "no")).lower().strip()
                row_data["fragility"] = frag in ["yes", "true", "1", "y"]
            else:
                row_data["fragility"] = False

            sku_col = column_mapping.get("sku")
            if sku_col:
                row_data["sku"] = str(row.get(sku_col, "")).strip()

            cat_col = column_mapping.get("category")
            if cat_col:
                row_data["category"] = str(row.get(cat_col, "")).strip()

            order_id_col = column_mapping.get("order_id")
            if order_id_col:
                row_data["order_id"] = str(row.get(order_id_col, "")).strip()

            cust_name_col = column_mapping.get("customer_name")
            if cust_name_col:
                row_data["customer_name"] = str(row.get(cust_name_col, "")).strip()

            cust_phone_col = column_mapping.get("customer_phone")
            if cust_phone_col:
                row_data["customer_phone"] = str(row.get(cust_phone_col, "")).strip()

            cust_city_col = column_mapping.get("customer_city")
            if cust_city_col:
                row_data["customer_city"] = str(row.get(cust_city_col, "")).strip()

            cust_state_col = column_mapping.get("customer_state")
            if cust_state_col:
                row_data["customer_state"] = str(row.get(cust_state_col, "")).strip()

            cust_pin_col = column_mapping.get("customer_pincode")
            if cust_pin_col:
                row_data["customer_pincode"] = str(row.get(cust_pin_col, "")).strip()

            channel_col = column_mapping.get("channel")
            if channel_col:
                row_data["channel"] = str(row.get(channel_col, "")).strip()

            payment_col = column_mapping.get("payment_type")
            if payment_col:
                row_data["payment_type"] = str(row.get(payment_col, "")).strip()

            priority_col = column_mapping.get("priority")
            if priority_col:
                row_data["priority"] = str(row.get(priority_col, "")).strip()

            valid_rows.append(row_data)

    import pandas as pd
    valid_df = pd.DataFrame(valid_rows) if valid_rows else pd.DataFrame()
    return valid_df, errors


def ingest_upload_batch(
    db: Session, valid_df, user_id: int, shipping_zone: str
) -> list:
    order_ids = []

    for _, row in valid_df.iterrows():
        sku = str(row.get("sku", "")).strip() if "sku" in row else ""
        product_name = row["product_name"]

        product = None
        if sku:
            product = db.query(Product).filter(Product.sku == sku).first()
        if not product:
            product = db.query(Product).filter(Product.name.ilike(product_name)).first()

        if not product:
            if not sku:
                base_slug = _slugify(product_name)
                unique_suffix = str(uuid.uuid4())[:8]
                sku = f"{base_slug}-{unique_suffix}"
                while db.query(Product).filter(Product.sku == sku).first():
                    unique_suffix = str(uuid.uuid4())[:8]
                    sku = f"{base_slug}-{unique_suffix}"

            product = Product(
                name=product_name,
                sku=sku,
                category=row.get("category", ""),
                length_cm=row["length_cm"],
                width_cm=row["width_cm"],
                height_cm=row["height_cm"],
                weight_kg=row["weight_kg"],
                is_fragile=row.get("fragility", False),
            )
            db.add(product)
            db.flush()

        zone = shipping_zone
        pincode = row.get("customer_pincode", "")
        if pincode:
            zone = _detect_zone_from_pincode(pincode)

        order = Order(
            user_id=user_id,
            channel_order_id=row.get("order_id", ""),
            channel=row.get("channel", ""),
            customer_name=row.get("customer_name", ""),
            customer_phone=row.get("customer_phone", ""),
            customer_city=row.get("customer_city", ""),
            customer_state=row.get("customer_state", ""),
            customer_pincode=pincode,
            shipping_zone=zone,
            payment_type=row.get("payment_type", ""),
            priority=row.get("priority", ""),
            category=row.get("category", ""),
            status="pending",
        )
        db.add(order)
        db.flush()

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=row["quantity"],
        )
        db.add(order_item)
        order_ids.append(order.id)

    return order_ids
