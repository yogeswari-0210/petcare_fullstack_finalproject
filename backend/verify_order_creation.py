import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_order_creation():
    # 1. Login to get token (assuming user exists)
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    # Try to login or use a known token if possible. 
    # Since I don't know the password, I'll try to find an existing user or create one.
    # For now, let's assume login works or we try to find a user.
    
    print("Testing order creation endpoint...")
    
    # Mock order data
    order_data = {
        "user_id": 999, # Placeholder
        "items": [
            {"product_id": 1, "quantity": 1}
        ],
        "address": "123 Test St, Test City",
        "payment_method": "Cash on Delivery"
    }
    
    # We need a valid token. If we can't get one, we can at least check if the schema is accepted.
    # I'll try to send a request and see the error.
    
    try:
        response = requests.post(f"{BASE_URL}/orders/create", json=order_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_order_creation()
