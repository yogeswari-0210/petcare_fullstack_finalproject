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
        if not categories:
            print("No categories found.")
        for cat in categories:
            print(f"ID: {cat.id}, Name: '{cat.name}', ParentID: {cat.parent_id}")

        print("\n--- PRODUCTS ---")
        products = db.query(Product).all()
        if not products:
            print("No products found.")
        for prod in products:
            cat_name = prod.category.name if prod.category else "None"
            print(f"ID: {prod.id}, Name: '{prod.name}', CategoryID: {prod.category_id} ({cat_name})")

    except Exception as e:
        print(f"Error reading DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_db()
