import requests
import json

# Sample stock data
sample_stocks = [
    {"symbol": "AAPL", "name": "Apple Inc.", "price": 150.25},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 2750.50},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "price": 320.75},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "price": 3400.00},
    {"symbol": "TSLA", "name": "Tesla Inc.", "price": 750.25},
    {"symbol": "NFLX", "name": "Netflix Inc.", "price": 450.80}
]

# Sample portfolio data
sample_portfolio = [
    {"stock_id": 1, "quantity": 10},
    {"stock_id": 2, "quantity": 5},
    {"stock_id": 3, "quantity": 8}
]

def add_sample_data():
    base_url = "http://localhost:8000"
    
    print("Adding sample stocks...")
    for stock in sample_stocks:
        try:
            response = requests.post(
                f"{base_url}/stocks",
                json=stock,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 200:
                print(f"✓ Added {stock['symbol']}")
            else:
                print(f"✗ Failed to add {stock['symbol']}: {response.text}")
        except Exception as e:
            print(f"✗ Error adding {stock['symbol']}: {e}")
    
    print("\nAdding sample portfolio items...")
    for item in sample_portfolio:
        try:
            response = requests.post(
                f"{base_url}/portfolio",
                json=item,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 200:
                print(f"✓ Added portfolio item for stock_id {item['stock_id']}")
            else:
                print(f"✗ Failed to add portfolio item: {response.text}")
        except Exception as e:
            print(f"✗ Error adding portfolio item: {e}")
    
    print("\nTriggering news scraping...")
    try:
        response = requests.post(f"{base_url}/scrape-news")
        if response.status_code == 200:
            print("✓ News scraping triggered")
        else:
            print(f"✗ News scraping failed: {response.text}")
    except Exception as e:
        print(f"✗ Error triggering news scraping: {e}")
    
    print("\nSample data addition completed!")

if __name__ == "__main__":
    add_sample_data() 