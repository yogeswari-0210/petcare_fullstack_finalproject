import requests
try:
    url = "http://127.0.0.1:8000/products/category/Dog%20Food"
    print(f"Testing {url}")
    r = requests.get(url)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text[:200]}")
except Exception as e:
    print(e)
