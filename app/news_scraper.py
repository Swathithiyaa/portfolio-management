import requests
from bs4 import BeautifulSoup
from textblob import TextBlob
from sqlalchemy.orm import Session
from . import models
import datetime
import time
import re
import random

class NewsScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
    
    def fetch_finnhub_news(self, symbol: str, stock_id: int = None):
        """Fetch news for a stock symbol from Finnhub and analyze sentiment."""
        try:
            url = f"https://finnhub.io/api/v1/company-news"
            params = {
                'symbol': symbol,
                'from': (datetime.datetime.utcnow() - datetime.timedelta(days=7)).strftime('%Y-%m-%d'),
                'to': datetime.datetime.utcnow().strftime('%Y-%m-%d'),
                'token': 'd1gdri9r01qmqatuppq0d1gdri9r01qmqatuppqg'
            }
            response = requests.get(url, params=params, headers=self.headers, timeout=15)
            response.raise_for_status()
            data = response.json()
            news_items = []
            for item in data[:5]:
                content = item.get('summary', '')
                sentiment = float(TextBlob(content).sentiment.polarity)
                news_item = {
                    'headline': item.get('headline', ''),
                    'content': content,
                    'sentiment': sentiment,
                    'published_at': datetime.datetime.fromtimestamp(item.get('datetime', datetime.datetime.utcnow().timestamp())),
                    'source': item.get('source', 'Finnhub'),
                }
                if stock_id is not None:
                    news_item['stock_id'] = stock_id
                news_items.append(news_item)
            print(f"Fetched {len(news_items)} news for {symbol} (stock_id={stock_id})")
            return news_items
        except Exception as e:
            print(f"Error fetching Finnhub news for {symbol}: {e}")
            return []
    
    def generate_mock_news(self, symbol: str):
        """Generate realistic mock news when APIs are unavailable"""
        mock_news_templates = [
            f"{symbol} stock shows strong performance in latest trading session",
            f"Analysts remain bullish on {symbol} despite market volatility",
            f"{symbol} announces new strategic initiatives for growth",
            f"Market sentiment positive for {symbol} as earnings approach",
            f"{symbol} continues to innovate in competitive market landscape"
        ]
        
        news_items = []
        for i in range(3):
            headline = random.choice(mock_news_templates)
            sentiment = random.uniform(-0.3, 0.8)  # Mostly positive sentiment
            
            news_items.append({
                'headline': headline,
                'content': f"Financial analysis indicates {headline.lower()} with market experts closely monitoring developments.",
                'sentiment': sentiment,
                'published_at': datetime.datetime.utcnow(),
                'source': 'Market Analysis'
            })
        
        return news_items
    
    def fetch_news_for_stock(self, symbol: str, stock_id: int = None):
        """Fetch news from Finnhub for a specific stock"""
        all_news = self.fetch_finnhub_news(symbol, stock_id)
        return all_news
    
    def store_news(self, db: Session, stock_id: int, news_items):
        """Store news items in database"""
        for news in news_items:
            db_news = models.News(
                headline=news['headline'],
                content=news['content'],
                sentiment=news['sentiment'],
                stock_id=stock_id,
                published_at=news['published_at']
            )
            db.add(db_news)
        db.commit()
        print(f"Stored {len(news_items)} news for stock_id={stock_id}")
        # Update sentiment for the stock after adding news
        from . import crud
        crud.update_stock_sentiment(db, stock_id)

# Create scraper instance
news_scraper = NewsScraper()

# Legacy functions for backward compatibility
def fetch_news_for_stock(symbol: str):
    return news_scraper.fetch_news_for_stock(symbol)

def store_news(db: Session, stock_id: int, news_items):
    news_scraper.store_news(db, stock_id, news_items) 