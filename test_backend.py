import requests
import json

def test_backend():
    base_url = "http://localhost:8000"
    
    print("Testing Portfolio Management Backend...")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n1. Testing Health Check...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Root Endpoint
    print("\n2. Testing Root Endpoint...")
    try:
        response = requests.get(f"{base_url}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 3: Get Stocks (should be empty initially)
    print("\n3. Testing Get Stocks...")
    try:
        response = requests.get(f"{base_url}/stocks")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 4: Add Stock
    print("\n4. Testing Add Stock...")
    try:
        stock_data = {
            "symbol": "AAPL",
            "name": "Apple Inc.",
            "price": 150.0
        }
        response = requests.post(
            f"{base_url}/stocks",
            json=stock_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 5: Get Live Stock Data
    print("\n5. Testing Live Stock Data...")
    try:
        response = requests.get(f"{base_url}/stocks/AAPL/live")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 6: Get Market Summary
    print("\n6. Testing Market Summary...")
    try:
        response = requests.get(f"{base_url}/market-summary")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 7: Get Portfolio
    print("\n7. Testing Get Portfolio...")
    try:
        response = requests.get(f"{base_url}/portfolio")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "=" * 50)
    print("Backend testing completed!")

if __name__ == "__main__":
    test_backend() 