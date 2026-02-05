from sqlalchemy.orm import Session
from database.database import SessionLocal
from models.order_models import Order
from datetime import datetime

def verify_insert():
    db = SessionLocal()
    try:
        print("Attempting to insert a test order...")
        # We need a valid user_id. Let's find one.
        from models.user_models import User
        user = db.query(User).first()
        if not user:
            print("No user found to associate order with.")
            # Create a temporary user if needed? Or just skip user_id check if possible?
            # Table has ForeignKey("users.id"), so we need a user.
            print("Creating a dummy user...")
            dummy_user = User(email="test_temp@example.com", hashed_password="hashed_password", full_name="Test User", role="user")
            db.add(dummy_user)
            db.commit()
            db.refresh(dummy_user)
            user_id = dummy_user.id
        else:
            user_id = user.id
            
        new_order = Order(
            user_id=user_id,
            total_price=100.0,
            address="123 Test St",
            payment_method="COD",
            status="Ordered",
            created_at=datetime.utcnow()
        )
        db.add(new_order)
        db.commit()
        print(f"Successfully inserted order with ID: {new_order.id}")
        
        # Cleanup
        db.delete(new_order)
        if user.email == "test_temp@example.com":
             db.delete(user)
        db.commit()
        print("Cleanup successful.")
        
    except Exception:
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    verify_insert()
