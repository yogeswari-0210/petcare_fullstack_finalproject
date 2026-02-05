import requests
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"

def verify():
    print("--- Verifying Public Offers ---")
    resp = requests.get(f"{BASE_URL}/offers/")
    if resp.status_code == 200:
        offers = resp.json()
        print(f"Found {len(offers)} active/valid offers:")
        for o in offers:
            print(f" - {o['title']} (Code: {o['code']}, Ends: {o['end_date']})")
            # Verify expired/inactive are not here
            if "Expired" in o['title'] or "Inactive" in o['title']:
                print("FAILED: Found invalid offer in public list!")
    else:
        print(f"FAILED: GET /offers/ returned {resp.status_code}")

    print("\n--- Creating New Admin Offer ---")
    new_offer = {
        "title": "Admin Promo",
        "description": "Exclusive admin-created offer",
        "discount_percentage": 25,
        "end_date": (datetime.utcnow() + timedelta(days=7)).isoformat(),
        "active": True,
        "code": "ADMIN25",
        "image_url": None
    }
    resp = requests.post(f"{BASE_URL}/offers/admin", json=new_offer)
    if resp.status_code == 200:
        created = resp.json()
        print(f"SUCCESS: Created offer '{created['title']}' with ID {created['id']}")
    else:
        print(f"FAILED: POST /offers/admin returned {resp.status_code}")
        print(resp.text)

    print("\n--- Verifying Public Offers Again ---")
    resp = requests.get(f"{BASE_URL}/offers/")
    if resp.status_code == 200:
        offers = resp.json()
        if any(o['title'] == "Admin Promo" for o in offers):
            print("SUCCESS: New admin offer is visible in public list.")
        else:
            print("FAILED: New admin offer is NOT visible in public list.")

if __name__ == "__main__":
    verify()
