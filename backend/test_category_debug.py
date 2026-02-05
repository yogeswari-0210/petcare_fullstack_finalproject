import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def test_create_category():
    print("Testing Root Category Creation...")
    payload = {
        "name": "Test Category",
        "parent_id": None
    }
    
    req = urllib.request.Request(f"{BASE_URL}/categories/")
    req.add_header('Content-Type', 'application/json')
    jsondata = json.dumps(payload).encode('utf-8')
    req.add_header('Content-Length', len(jsondata))
    
    try:
        response = urllib.request.urlopen(req, jsondata)
        print(f"Status: {response.getcode()}")
        print(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"Error: {e.code}")
        print(e.read().decode('utf-8'))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_create_category()
