import sys
import os
from pathlib import Path

# Add backend folder to Python path
sys.path.append(str(Path(__file__).parent.resolve()))

from sqlalchemy.orm import Session
from database.database import SessionLocal
from models.category_models import Category
from models.product_models import Product

def debug_db():
    db = SessionLocal()
    try:
        print("\n--- CATEGORIES ---")
        categories = db.query(Category).all()
        for cat in categories:
            print(f"ID: {cat.id}, Name: '{cat.name}'")

        print("\n--- RECENT PRODUCTS (Last 5) ---")
        products = db.query(Product).order_by(Product.id.desc()).limit(5).all()
        for prod in products:
            cat_name = prod.category.name if prod.category else "None"
            print(f"ID: {prod.id}, Name: '{prod.name}', CategoryID: {prod.category_id} ({cat_name})")

    except Exception as e:
        print(f"Error reading DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_db()
