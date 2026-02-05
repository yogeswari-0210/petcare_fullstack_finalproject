from pydantic import BaseModel
from typing import List, Optional
from .product_schemas import ProductRead

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class OrderItemRead(BaseModel):
    product_id: int
    quantity: int
    product: ProductRead

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    user_id: int
    items: List[OrderItemCreate]
    address: str
    payment_method: str

class OrderRead(BaseModel):
    id: int
    user_id: int
    address: Optional[str] = "" 
    payment_method: Optional[str] = ""
    status: Optional[str] = "Ordered"
    items: List[OrderItemRead] = []

    class Config:
        from_attributes = True

class OrderUpdate(BaseModel):
    quantity: int
