import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def verify_price():
    print("Verifying Price Filtering Logic...\n")
    
    # Prerequisite: Ensure we have some products or just test logic if server is up
    # We will test existing products.
    
    # 1. Get all products to see what prices we have
    try:
        all_res = requests.get(f"{BASE_URL}/products/")
        if all_res.status_code != 200:
            print("Cannot connect to API or fetch products. Is server running?")
            return
        
        all_products = all_res.json()
        print(f"Total products in DB: {len(all_products)}")
        if not all_products:
            print("No products to test with.")
            return

        # Pick a price range based on actual data
        prices = [p['price'] for p in all_products]
        min_p = min(prices)
        max_p = max(prices)
        avg_p = sum(prices) / len(prices)
        print(f"Price range: {min_p} - {max_p}, Avg: {avg_p}\n")
        
        # Test 1: General Category with Price Filter
        # Let's find a category that has products
        # We'll just use a broad range first
        
        target_min = min_p
        target_max = avg_p
        
        print(f"Test 1: Filter all by price {target_min} - {target_max}")
        # Note: We didn't add global price filter to /products/ root, 
        # but we added it to /category/{name} and /filter/strict
        
        # We need a category name. Let's guess "Shop for Dogs" or check product categories
        cat_name = all_products[0]['category_id'] # wait we just have ID.
        # Let's assume 'Shop for Dogs' exists
        
        url = f"{BASE_URL}/products/category/Shop for Dogs?min_price={target_min}&max_price={target_max}"
        print(f"Requesting: {url}")
        res = requests.get(url)
        if res.status_code == 200:
            filtered = res.json()
            print(f"Found {len(filtered)} products")
            failures = [p for p in filtered if p['price'] < target_min or p['price'] > target_max]
            if not failures:
                print("✅ Price filter respected (Category endpoint)")
            else:
                print(f"❌ FAILURE: Found products outside range: {failures}")
        else:
            print(f"⚠️ API Error (maybe category doesn't exist?): {res.status_code}")

        # Test 2: Strict Filter (Subcategory) with Price
        print(f"\nTest 2: Strict Filter (Dog Food) with Price {target_min} - {target_max}")
        url = f"{BASE_URL}/products/filter/strict?category=Shop for Dogs&subcategory=Food&min_price={target_min}&max_price={target_max}"
        res = requests.get(url)
        if res.status_code == 200:
            filtered = res.json()
            print(f"Found {len(filtered)} products")
            failures = [p for p in filtered if p['price'] < target_min or p['price'] > target_max]
            if not failures:
                print("✅ Price filter respected (Strict endpoint)")
            else:
                print(f"❌ FAILURE: Found products outside range: {failures}")
        elif res.status_code == 404:
             print("⚠️ 404 - No products found (could be valid if no food in that price range)")
        else:
            print(f"❌ API Error: {res.status_code}")

    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    verify_price()
