import sys
import os
from pathlib import Path
sys.path.append(str(Path(__file__).parent.resolve()))

from database.database import SessionLocal
from models.category_models import Category
from models.product_models import Product

def debug_db():
    db = SessionLocal()
    try:
        categories = db.query(Category).all()
        print(f"Total Categories: {len(categories)}")
        for cat in categories:
            parent_name = cat.parent.name if cat.parent else "None"
            product_count = db.query(Product).filter(Product.category_id == cat.id).count()
            print(f"ID: {cat.id} | Name: '{cat.name}' | Parent: {parent_name} | Products: {product_count}")
            
        print("\nProducts Sample:")
        products = db.query(Product).limit(10).all()
        for p in products:
            cat_name = p.category.name if p.category else "None"
            print(f"ID: {p.id} | Name: '{p.name}' | Category: {cat_name}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_db()
