import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def get_data():
    try:
        print("\n--- CATEGORIES ---")
        with urllib.request.urlopen(f"{BASE_URL}/categories/") as response:
            categories = json.loads(response.read().decode())
            for cat in categories:
                print(f"ID: {cat['id']}, Name: '{cat['name']}'")

        print("\n--- PRODUCTS ---")
        with urllib.request.urlopen(f"{BASE_URL}/products/") as response:
            products = json.loads(response.read().decode())
            # Show last 10 products
            for prod in products[-10:]:
                print(f"ID: {prod['id']}, Name: '{prod['name']}', CategoryID: {prod['category_id']}")

    except Exception as e:
        print(f"Error fetching data: {e}")

if __name__ == "__main__":
    get_data()
