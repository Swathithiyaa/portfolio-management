import requests
import json

# Test the news API
response = requests.get('http://localhost:8000/news')
print(f"Status Code: {response.status_code}")
print(f"Response Headers: {response.headers}")

if response.status_code == 200:
    data = response.json()
    print(f"\nNews count: {len(data)}")
    if len(data) > 0:
        print(f"\nFirst news item structure:")
        print(json.dumps(data[0], indent=2, default=str))
        
        # Check if stock_id is present
        if 'stock_id' in data[0]:
            print(f"\n✓ stock_id field is present: {data[0]['stock_id']}")
        else:
            print(f"\n✗ stock_id field is missing!")
            
        # Check if sentiment is present
        if 'sentiment' in data[0]:
            print(f"✓ sentiment field is present: {data[0]['sentiment']}")
        else:
            print(f"✗ sentiment field is missing!")
else:
    print(f"Error: {response.text}") 