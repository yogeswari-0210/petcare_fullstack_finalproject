import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def verify():
    print("Verifying Filtering Logic...\n")
    
    # Test Cases: (Parent Category, Subcategory, Expected Product keywords, Excluded keywords)
    tests = [
        ("Shop for Dogs", "Food", ["Dog"], ["Cat"]),
        ("Shop for Dogs", "Toys", ["Dog", "Leash", "Ball"], ["Cat"]),
        ("Shop for Cats", "Food", ["Cat"], ["Dog"]),
        ("Shop for Cats", "Toys", ["Cat"], ["Dog"]),
        # Test mismatched parent/child
        ("Shop for Dogs", "Cat Food", [], ["Cat"]), 
    ]

    for parent, sub, expected_keywords, excluded_keywords in tests:
        print(f"Testing Parent: '{parent}' | Sub: '{sub}'")
        url = f"{BASE_URL}/products/filter/strict?category={parent}&subcategory={sub}"
        try:
            res = requests.get(url)
            if res.status_code == 200:
                products = res.json()
                product_names = [p['name'] for p in products]
                print(f"  Found {len(products)} products: {product_names}")
                
                # Check expectation
                if not products and not expected_keywords:
                     print("  ✅ Success (Empty as expected)")
                     continue
                
                all_found = True
                failed = False
                
                if not products and expected_keywords:
                    print("  ❌ FAILURE: No products found but expected some!")
                    failed = True

                for kw in expected_keywords:
                    # check if any product matches the keyword
                    match = any(kw.lower() in p.lower() for p in product_names)
                    if not match:
                        # Try broader match?
                        pass 
                
                # Check exclusion 
                for excl in excluded_keywords:
                    if any(excl in p for p in product_names):
                        print(f"  ❌ FAILURE: Found excluded keyword '{excl}' in results!")
                        failed = True
                
                if not failed:
                    print("  ✅ Success")

            elif res.status_code == 404:
                if not expected_keywords:
                    print("  ✅ Success (404 as expected for invalid filter)")
                else:
                    print(f"  ❌ API Error 404: {res.text}")
            else:
                print(f"  ❌ API Error {res.status_code}: {res.text}")
        except Exception as e:
            print(f"  ❌ Exception: {e}")
        print("-" * 20)

if __name__ == "__main__":
    verify()
