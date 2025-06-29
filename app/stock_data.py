import requests
import os
from typing import Dict, List, Optional
import time
import random
import json

class AlphaVantageService:
    def __init__(self):
        # Use the user's provided API key
        self.api_key = '2MY5L3BRU88CE7XK'
        self.base_url = "https://www.alphavantage.co/query"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def get_stock_price(self, symbol: str) -> Optional[Dict]:
        """Fetch real-time stock price from Alpha Vantage API"""
        try:
            params = {
                'function': 'GLOBAL_QUOTE',
                'symbol': symbol,
                'apikey': self.api_key
            }
            
            response = requests.get(self.base_url, params=params, headers=self.headers, timeout=20)
            response.raise_for_status()
            
            data = response.json()
            
            if 'Global Quote' in data and data['Global Quote']:
                quote = data['Global Quote']
                price = float(quote.get('05. price', 0))
                change = float(quote.get('09. change', 0))
                change_percent = quote.get('10. change percent', '0%')
                volume = int(quote.get('06. volume', 0))
                
                return {
                    'symbol': quote.get('01. symbol'),
                    'price': price,
                    'change': change,
                    'change_percent': change_percent,
                    'volume': volume,
                    'last_updated': time.time()
                }
            else:
                print(f"No data found for {symbol}")
                return None
                
        except Exception as e:
            print(f"Error fetching Alpha Vantage data for {symbol}: {e}")
            return None

    def get_stock_info(self, symbol: str) -> Optional[Dict]:
        """Fetch basic stock information"""
        try:
            params = {
                'function': 'SYMBOL_SEARCH',
                'keywords': symbol,
                'apikey': self.api_key
            }
            
            response = requests.get(self.base_url, params=params, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            
            if 'bestMatches' in data and data['bestMatches']:
                match = data['bestMatches'][0]
                return {
                    'symbol': match.get('1. symbol'),
                    'name': match.get('2. name'),
                    'type': match.get('3. type'),
                    'region': match.get('4. region')
                }
            return None
            
        except Exception as e:
            print(f"Error fetching stock info for {symbol}: {e}")
            return None

    def update_all_stocks(self, db_session, stocks):
        """Update all stocks with live data"""
        updated_stocks = []
        
        for stock in stocks:
            live_data = self.get_stock_price(stock.symbol)
            if live_data:
                stock.price = live_data['price']
                stock.last_updated = time.time()
                updated_stocks.append(stock)
            
            # Rate limiting to avoid API limits
            time.sleep(0.2)
        
        db_session.commit()
        return updated_stocks

class YahooFinanceService:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
        }
    
    def get_stock_price(self, symbol: str) -> Optional[Dict]:
        """Fetch stock data from Yahoo Finance"""
        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
            
            response = requests.get(url, headers=self.headers, timeout=20)
            response.raise_for_status()
            
            data = response.json()
            
            if 'chart' in data and 'result' in data['chart'] and data['chart']['result']:
                result = data['chart']['result'][0]
                meta = result['meta']
                
                price = float(meta.get('regularMarketPrice', 0))
                prev_close = float(meta.get('previousClose', price))
                change = price - prev_close
                change_percent = (change / prev_close * 100) if prev_close > 0 else 0
                
                return {
                    'symbol': symbol,
                    'price': price,
                    'change': change,
                    'change_percent': f"{change_percent:.2f}%",
                    'volume': int(meta.get('regularMarketVolume', 0)),
                    'last_updated': meta.get('regularMarketTime', time.time())
                }
            return None
            
        except Exception as e:
            print(f"Error fetching Yahoo Finance data for {symbol}: {e}")
            return None

class MockStockService:
    def __init__(self):
        self.base_prices = {
            'AAPL': 150.0, 'GOOGL': 2750.0, 'MSFT': 320.0, 'AMZN': 3400.0,
            'TSLA': 750.0, 'NFLX': 450.0, 'META': 350.0, 'NVDA': 800.0
        }
    
    def get_stock_price(self, symbol: str):
        try:
            base_price = self.base_prices.get(symbol, 100.0)
            change_percent = random.uniform(-2, 2)
            change_amount = base_price * (change_percent / 100)
            new_price = base_price + change_amount
            
            self.base_prices[symbol] = new_price
            
            return {
                'symbol': symbol,
                'price': round(new_price, 2),
                'change': round(change_amount, 2),
                'change_percent': f"{change_percent:.2f}%",
                'volume': random.randint(1000000, 10000000),
                'last_updated': time.time()
            }
        except Exception as e:
            print(f"Error generating mock data for {symbol}: {e}")
            return None

# Initialize the best available service
def get_stock_service():
    """Get the best available stock service"""
    try:
        service = AlphaVantageService()
        test_data = service.get_stock_price('AAPL')
        if test_data and test_data['price'] > 0:
            print("Using Alpha Vantage for stock data")
            return service
    except Exception as e:
        print(f"Alpha Vantage failed: {e}")
    
    try:
        service = YahooFinanceService()
        test_data = service.get_stock_price('AAPL')
        if test_data and test_data['price'] > 0:
            print("Using Yahoo Finance for stock data")
            return service
    except Exception as e:
        print(f"Yahoo Finance failed: {e}")
    
    print("Falling back to mock service")
    return MockStockService()

# Create the stock service instance
stock_service = get_stock_service() 