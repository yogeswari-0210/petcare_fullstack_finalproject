from sqlalchemy.orm import Session
from database import SessionLocal
from models import Category, Product

def check_data():
    db: Session = SessionLocal()
    try:
        print("--- Categories ---")
        categories = db.query(Category).all()
        for cat in categories:
            print(f"ID: {cat.id}, Name: '{cat.name}'")
            
        print("\n--- Products in 'Dog Food' ---")
        # specific check for Dog Food
        dog_food = db.query(Category).filter(Category.name == "Dog Food").first()
        if dog_food:
            products = db.query(Product).filter(Product.category_id == dog_food.id).all()
            print(f"Found {len(products)} products in 'Dog Food'")
            for p in products:
                print(f" - {p.name}")
        else:
            print("Category 'Dog Food' NOT FOUND")

    finally:
        db.close()

if __name__ == "__main__":
    check_data()
