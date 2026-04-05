"""Migration script to add item_order column to packaging_plans table."""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "packai.db")

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}, skipping migration.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute("PRAGMA table_info(packaging_plans)")
        columns = [row[1] for row in cursor.fetchall()]

        if "item_order" not in columns:
            print("Adding item_order column to packaging_plans...")
            cursor.execute("ALTER TABLE packaging_plans ADD COLUMN item_order TEXT")
            conn.commit()
            print("Migration complete: item_order column added.")
        else:
            print("item_order column already exists. No migration needed.")
    except Exception as e:
        print(f"Migration error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
