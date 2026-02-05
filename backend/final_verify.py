import urllib.request
import json
import random

BASE_URL = "http://127.0.0.1:8000"

def run_request(url, method="GET", data=None, headers={}):
    try:
        req = urllib.request.Request(url, method=method, headers=headers)
        if data:
            req.data = json.dumps(data).encode('utf-8')
            req.add_header('Content-Type', 'application/json')
        
        with urllib.request.urlopen(req) as response:
            return response.getcode(), json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return 0, str(e)

def verify():
    print("--- FINAL VERIFICATION ---")

    email = "test@example.com"
    password = "password123"
    token = None

    # 1. Try Login
    print(f"1. Login as {email}...")
    code, resp = run_request(f"{BASE_URL}/users/login", "POST", {"email": email, "password": password})
    
    if code == 200:
        print("   Login Successful!")
        token = resp['access_token']
    else:
        print(f"   Login Failed ({code}). Attempting Signup...")
        # 2. Signup
        signup_data = {
            "username": f"Test User {random.randint(1000,9999)}",
            "email": email,
            "password": password,
            "role": "user"
        }
        code, resp = run_request(f"{BASE_URL}/users/signup", "POST", signup_data)
        if code == 200:
             print("   Signup Successful! Access Token received (if auto-login implemented).")
             # Try login again just to be sure
             code, resp = run_request(f"{BASE_URL}/users/login", "POST", {"email": email, "password": password})
             if code == 200:
                 token = resp['access_token']
                 print("   Login Successful after signup!")
        else:
             print(f"   Signup Failed: {code} - {resp}")
             return

    if not token:
        print("   Could not get token. Aborting.")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Get Products
    print("2. Fetch Products...")
    code, products = run_request(f"{BASE_URL}/products/", "GET")
    print(f"   Products Response: {products}")
    if code != 200 or not products:
        print("   Failed to fetch products.")
        return
    
    product_id = products[0]['id']
    print(f"   Found Product: {products[0]['name']} (ID: {product_id})")

    # 4. Add to Cart
    print("3. Add to Cart...")
    code, resp = run_request(f"{BASE_URL}/carts/add", "POST", {"product_id": product_id, "quantity": 1}, headers)
    if code == 200:
        print("   Added to Cart!")
    else:
        print(f"   Add to Cart Failed: {code} - {resp}")

    # 5. Get Cart
    print("4. Get Cart Items...")
    code, items = run_request(f"{BASE_URL}/carts/me", "GET", headers=headers)
    if code == 200:
        print(f"   Cart Items Count: {len(items)}")
        if len(items) > 0:
            print(f"   - Item 1: Product ID {items[0]['product_id']}")
    else:
        print(f"   Get Cart Failed: {code} - {items}")

    # 6. Add to Wishlist
    print("5. Add to Wishlist...")
    code, resp = run_request(f"{BASE_URL}/wishlists/add", "POST", {"product_id": product_id}, headers)
    if code == 200:
        print("   Added to Wishlist!")
    else:
        print(f"   Add to Wishlist Failed/Exists: {code}")

    # 7. Get Wishlist
    print("6. Get Wishlist Items...")
    code, items = run_request(f"{BASE_URL}/wishlists/me", "GET", headers=headers)
    if code == 200:
        print(f"   Wishlist Items Count: {len(items)}")
    else:
        print(f"   Get Wishlist Failed: {code} - {items}")

    print("--- SUCCESS ---")

if __name__ == "__main__":
    import sys
    with open("verify_output.txt", "w") as f:
        sys.stdout = f
        verify()
