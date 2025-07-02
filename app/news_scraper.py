import requests
from sqlalchemy.orm import Session
from . import models
import datetime
import random
from typing import Optional
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}

def analyze_sentiment(text):
    """Analyze sentiment using VADER and return a score between -1 and 1."""
    if not text or len(text.strip()) < 10:
        return 0.0
    return analyzer.polarity_scores(text)['compound']

def categorize_sentiment(sentiment):
    if sentiment >= 0.15:
        return "Positive"
    elif sentiment <= -0.15:
        return "Negative"
    else:
        return "Neutral"

def categorize_impact(sentiment):
    impact_value = abs(sentiment) * random.uniform(0.5, 1.0)
    if impact_value < 0.2:
        return "Small"
    elif impact_value < 0.5:
        return "Medium"
    else:
        return "Large"

def fetch_finnhub_news(symbol: str, stock_id: Optional[int] = None):
    """Fetch news for a stock symbol from Finnhub and analyze sentiment."""
    try:
        url = f"https://finnhub.io/api/v1/company-news"
        params = {
            'symbol': symbol,
            'from': (datetime.datetime.utcnow() - datetime.timedelta(days=7)).strftime('%Y-%m-%d'),
            'to': datetime.datetime.utcnow().strftime('%Y-%m-%d'),
            'token': 'd1gdri9r01qmqatuppq0d1gdri9r01qmqatuppqg'
        }
        response = requests.get(url, params=params, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        news_items = []
        for item in data[:5]:
            content = item.get('summary', '')
            sentiment = analyze_sentiment(content)
            sentiment_label = categorize_sentiment(sentiment)
            impact_label = categorize_impact(sentiment)
            ts = item.get('datetime')
            if ts is None:
                ts = datetime.datetime.utcnow().timestamp()
            news_item = {
                'headline': item.get('headline', ''),
                'content': content,
                'sentiment': sentiment,
                'sentiment_label': sentiment_label,
                'impact_label': impact_label,
                'published_at': datetime.datetime.fromtimestamp(float(ts)),
                'source': item.get('source', 'Finnhub'),
            }
            if stock_id is not None:
                try:
                    news_item['stock_id'] = int(stock_id)
                except Exception:
                    news_item['stock_id'] = -1
            news_items.append(news_item)
        print(f"Fetched {len(news_items)} news for {symbol} (stock_id={stock_id})")
        return news_items
    except Exception as e:
        print(f"Error fetching Finnhub news for {symbol}: {e}")
        return []

def generate_mock_news(symbol: str):
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
        sentiment = analyze_sentiment(headline)
        sentiment_label = categorize_sentiment(sentiment)
        impact_label = categorize_impact(sentiment)
        news_items.append({
            'headline': headline,
            'content': f"Financial analysis indicates {headline.lower()} with market experts closely monitoring developments.",
            'sentiment': sentiment,
            'sentiment_label': sentiment_label,
            'impact_label': impact_label,
            'published_at': datetime.datetime.utcnow(),
            'source': 'Market Analysis'
        })
    return news_items

def fetch_news_for_stock(symbol: str, stock_id: Optional[int] = None):
    return fetch_finnhub_news(symbol, stock_id)

def store_news(db: Session, stock_id: Optional[int], news_items):
    if stock_id is not None:
        try:
            stock_id_int = int(stock_id)
        except Exception:
            stock_id_int = -1
    else:
        stock_id_int = -1
    for news in news_items:
        db_news = models.News(
            headline=news['headline'],
            content=news['content'],
            sentiment=news['sentiment'],
            sentiment_label=news['sentiment_label'],
            impact_label=news['impact_label'],
            stock_id=stock_id_int,
            published_at=news['published_at']
        )
        db.add(db_news)
    db.commit()
    print(f"Stored {len(news_items)} news for stock_id={stock_id_int}")
    from . import crud
    crud.update_stock_sentiment(db, stock_id_int) 