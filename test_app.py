import requests
import json

def test_application():
    base_url = "http://localhost:8000"
    
    print("🚀 Testing Portfolio Management Application")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n1. Testing Health Check...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Backend is healthy!")
        else:
            print("❌ Backend health check failed")
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # Test 2: Add Sample Stocks
    print("\n2. Adding Sample Stocks...")
    sample_stocks = [
        {"symbol": "AAPL", "name": "Apple Inc.", "price": 150.25},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 2750.50},
        {"symbol": "MSFT", "name": "Microsoft Corporation", "price": 320.75},
        {"symbol": "TSLA", "name": "Tesla Inc.", "price": 750.25}
    ]
    
    for stock in sample_stocks:
        try:
            response = requests.post(
                f"{base_url}/stocks",
                json=stock,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 200:
                print(f"✅ Added {stock['symbol']}")
            else:
                print(f"❌ Failed to add {stock['symbol']}: {response.text}")
        except Exception as e:
            print(f"❌ Error adding {stock['symbol']}: {e}")
    
    # Test 3: Get Live Stock Data
    print("\n3. Testing Live Stock Data...")
    try:
        response = requests.get(f"{base_url}/stocks/AAPL/live")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Live AAPL data: ${data['price']} ({data['change_percent']})")
        else:
            print("❌ Failed to get live data")
    except Exception as e:
        print(f"❌ Error getting live data: {e}")
    
    # Test 4: Get All Stocks
    print("\n4. Getting All Stocks...")
    try:
        response = requests.get(f"{base_url}/stocks")
        if response.status_code == 200:
            stocks = response.json()
            print(f"✅ Found {len(stocks)} stocks")
            for stock in stocks:
                print(f"   - {stock['symbol']}: ${stock['price']}")
        else:
            print("❌ Failed to get stocks")
    except Exception as e:
        print(f"❌ Error getting stocks: {e}")
    
    # Test 5: Market Summary
    print("\n5. Testing Market Summary...")
    try:
        response = requests.get(f"{base_url}/market-summary")
        if response.status_code == 200:
            summary = response.json()
            print(f"✅ Market Summary: {summary['stock_count']} stocks tracked")
        else:
            print("❌ Failed to get market summary")
    except Exception as e:
        print(f"❌ Error getting market summary: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Application Testing Complete!")
    print("\n📱 Frontend URL: http://localhost:3000")
    print("🔧 Backend API: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")

if __name__ == "__main__":
    test_application() 