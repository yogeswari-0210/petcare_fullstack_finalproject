
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from dependency.auth_dependency import get_current_user
from dependency.db_dependency import get_db
from models.cart_models import Cart
from models.order_models import Order
from models.order_items_models import OrderItem
from models.product_models import Product
from schemas.order_schemas import OrderCreate, OrderRead, OrderUpdate, OrderItemCreate, OrderItemRead

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)











# -------------------------------
# Create order (JWT-secured)
# -------------------------------
@router.post("/create", response_model=OrderRead)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)  # <-- JWT user
):
    user_id = current_user["user_id"]

    if not order.items:
        raise HTTPException(status_code=400, detail="No items in order")

    total_price = 0

    # Calculate total price
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found"
            )
        total_price += product.price * item.quantity

    # Create order
    new_order = Order(
        user_id=user_id,
        total_price=total_price,
        address=order.address,
        payment_method=order.payment_method
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Add order items
    order_items = []
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=product.price
        )
        db.add(order_item)
        order_items.append(order_item)

    db.commit()
    new_order.items = order_items

    # Clear user's cart after successful order
    db.query(Cart).filter(Cart.user_id == user_id).delete()
    db.commit()

    return new_order


# -------------------------------
# Get all orders of logged-in user
# -------------------------------
@router.get("/me", response_model=List[OrderRead])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    return orders


# -------------------------------
# Delete an order (user-specific)
# -------------------------------
@router.delete("/delete/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == user_id  # Only allow user's own order
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db.delete(order)
    db.commit()
    return {"detail": "Order deleted successfully"}




# @router.post("/create", response_model=OrderRead)
# def create_order(order: OrderCreate, db: Session = Depends(get_db)):

#     if not order.items:
#         raise HTTPException(status_code=400, detail="No items in order")

#     total_price = 0

#     for item in order.items:
#         product = db.query(Product).filter(Product.id == item.product_id).first()
#         if not product:
#             raise HTTPException(
#                 status_code=404,
#                 detail=f"Product {item.product_id} not found"
#             )
#         total_price += product.price * item.quantity

   
#     new_order = Order(
#         user_id=order.user_id,
#         total_price=total_price
#     )
#     db.add(new_order)
#     db.commit()
#     db.refresh(new_order)

#     order_items = []
#     for item in order.items:
#         product = db.query(Product).filter(Product.id == item.product_id).first()

#         order_item = OrderItem(
#             order_id=new_order.id,
#             product_id=item.product_id,
#             quantity=item.quantity,
#             price=product.price
#         )
#         db.add(order_item)
#         order_items.append(order_item)

#     db.commit()

#     new_order.items = order_items
#     return new_order




    



# @router.get("/user/{user_id}", response_model=List[OrderRead])
# def get_orders_by_user(user_id: int, db: Session = Depends(get_db)):
#     orders = db.query(Order).filter(Order.user_id == user_id).all()
#     return orders




# # Delete an order

# @router.delete("/delete/{order_id}")
# def delete_order(order_id: int, db: Session = Depends(get_db)):
#     order = db.query(Order).filter(Order.id == order_id).first()
#     if not order:
#         raise HTTPException(status_code=404, detail="Order not found")
#     db.delete(order)
#     db.commit()
#     return {"detail": "Order deleted successfully"}
