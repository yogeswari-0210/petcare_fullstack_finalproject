import urllib.request
import urllib.parse
import json
import random

BASE_URL = "http://127.0.0.1:8000"

def verify():
    print("--- STARTING API VERIFICATION (URLLIB) ---")
    
    # 1. Signup/Login
    email = f"user_{random.randint(10000,99999)}@example.com"
    password = "password123"
    username = "Test User"
    
    print(f"1. Attempting Signup for {email}...")
    signup_payload = {
        "username": username,
        "email": email,
        "password": password,
        "role": "user",
        "phone_number": "1234567890"
    }
    
    req = urllib.request.Request(f"{BASE_URL}/users/signup", data=json.dumps(signup_payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            if response.getcode() == 200:
                print("   Signup Successful!")
    except Exception as e:
        print(f"   Error during signup: {e}")
        try:
             # Try to read error body if available
             if hasattr(e, 'read'):
                print(f"   Signup Error Body: {e.read().decode('utf-8')}")
        except:
             pass

    print("2. Attempting Login...")
    login_payload = {"email": email, "password": password}
    token = None
    
    req = urllib.request.Request(f"{BASE_URL}/users/login", data=json.dumps(login_payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            if response.getcode() == 200:
                data = json.loads(response.read().decode())
                token = data['access_token']
                print("   Login Successful! Token acquired.")
    except Exception as e:
        print(f"   Login Failed: {e}")
        return

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 2. Get a product
    product_id = None
    print("3. Fetching Products...")
    try:
        with urllib.request.urlopen(f"{BASE_URL}/products/") as response:
            products = json.loads(response.read().decode())
            print(f"   Products Response: {products}")
            if products:
                product_id = products[0]['id']
                print(f"   Found Product ID: {product_id} ({products[0]['name']})")
    except Exception as e:
         print(f"   Error fetching products: {e}")
         return

    if not product_id:
        print("   No products found to test with.")
        return

    # 3. Add to Cart
    print(f"4. Adding Product {product_id} to Cart...")
    cart_payload = {"product_id": product_id, "quantity": 1}
    req = urllib.request.Request(f"{BASE_URL}/carts/add", data=json.dumps(cart_payload).encode('utf-8'), headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
             print("   Added to Cart Successful!")
    except Exception as e:
        try:
            err = e.read().decode()
            print(f"   Add to Cart Failed: {e} - {err}")
        except:
             print(f"   Add to Cart Failed: {e}")

    # 4. Add to Wishlist
    print(f"5. Adding Product {product_id} to Wishlist...")
    wishlist_payload = {"product_id": product_id}
    req = urllib.request.Request(f"{BASE_URL}/wishlists/add", data=json.dumps(wishlist_payload).encode('utf-8'), headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
             print("   Added to Wishlist Successful!")
    except Exception as e:
         try:
            err = e.read().decode()
            print(f"   Add to Wishlist Response: {e} - {err}")
         except:
            print(f"   Add to Wishlist Error: {e}")

    # 5. Fetch Cart
    print("6. Fetching Cart Items...")
    req = urllib.request.Request(f"{BASE_URL}/carts/me", headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            items = json.loads(response.read().decode())
            print(f"   Cart Items: {len(items)}")
            if items:
                print(f"   - Verified Item: {items[0]}")
    except Exception as e:
        print(f"   Error fetching cart: {e}")

    # 6. Fetch Wishlist
    print("7. Fetching Wishlist Items...")
    req = urllib.request.Request(f"{BASE_URL}/wishlists/me", headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            items = json.loads(response.read().decode())
            print(f"   Wishlist Items: {len(items)}")
            if items:
                print(f"   - Verified Item: {items[0]}")
    except Exception as e:
        print(f"   Error fetching wishlist: {e}")

    print("--- VERIFICATION COMPLETE ---")

if __name__ == "__main__":
    verify()
