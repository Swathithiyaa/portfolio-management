from sqlalchemy.orm import Session
from . import models, schemas
from typing import List
from .stock_data import stock_service
import random
from sqlalchemy.sql.schema import Column

def get_stock(db: Session, stock_id: int):
    return db.query(models.Stock).filter(models.Stock.id == stock_id).first()

def get_stock_by_symbol(db: Session, symbol: str):
    return db.query(models.Stock).filter(models.Stock.symbol == symbol).first()

def categorize_sentiment(sentiment):
    if sentiment >= 0.15:
        return "Positive"
    elif sentiment <= -0.15:
        return "Negative"
    else:
        return "Neutral"

def categorize_impact(sentiment):
    # Simulate impact as abs(sentiment) * random factor
    impact_value = abs(sentiment) * random.uniform(0.5, 1.0)
    if impact_value < 0.2:
        return "Small"
    elif impact_value < 0.5:
        return "Medium"
    else:
        return "Large"

def aggregate_stock_sentiment_and_impact(news_items):
    if not news_items:
        return 0.0, "Neutral", "Small"
    sentiments = [getattr(n, 'sentiment', None) for n in news_items if getattr(n, 'sentiment', None) is not None]
    sentiments = [s for s in sentiments if s is not None]  # Filter out None values
    avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0.0
    # Sentiment label
    if avg_sentiment >= 0.15:
        sentiment_label = "Positive"
    elif avg_sentiment <= -0.15:
        sentiment_label = "Negative"
    else:
        sentiment_label = "Neutral"
    # Impact label: take the highest among news
    impact_priority = {"Large": 3, "Medium": 2, "Small": 1}
    impact_labels = [getattr(n, 'impact_label', 'Small') for n in news_items]
    if impact_labels:
        max_impact = max(impact_labels, key=lambda x: impact_priority.get(x, 0))
    else:
        max_impact = "Small"
    return avg_sentiment, sentiment_label, max_impact

def get_stocks(db: Session, skip: int = 0, limit: int = 100):
    stocks = db.query(models.Stock).offset(skip).limit(limit).all()
    portfolio = db.query(models.Portfolio).all()
    
    for stock in stocks:
        news_items = db.query(models.News).filter(models.News.stock_id == stock.id).all()
        avg_news_sentiment, news_sentiment_label, news_impact_label = aggregate_stock_sentiment_and_impact(news_items)
        # Portfolio quantity
        portfolio_item = next((p for p in portfolio if p.stock_id == stock.id), None)
        quantity = portfolio_item.quantity if portfolio_item else 0
        # Fetch live data and attach previous_close
        try:
            live_data = stock_service.get_stock_price(str(getattr(stock, 'symbol')))
            price = live_data['price'] if live_data is not None and 'price' in live_data else (stock.price if stock.price is not None else 0)
            previous_close = live_data['previous_close'] if live_data is not None and 'previous_close' in live_data else (stock.previous_close if stock.previous_close is not None else 0)
        except Exception:
            price = stock.price if stock.price is not None else 0
            previous_close = stock.previous_close if stock.previous_close is not None else 0
        if isinstance(price, Column):
            price = 0.0
        price = float(price) if price is not None else 0.0
        if isinstance(previous_close, Column):
            previous_close = 0.0
        previous_close = float(previous_close) if previous_close is not None else 0.0
        if isinstance(quantity, Column):
            quantity = 0
        quantity = int(quantity) if quantity is not None else 0
        # Calculate Day's Gain and Day's Gain %
        if previous_close is not None and float(previous_close) != 0.0:
            days_gain_percent = ((price - previous_close) / previous_close * 100)
        else:
            days_gain_percent = 0
        days_gain = (price - previous_close) * quantity
        total_value = price * quantity
        # Combine news sentiment and price movement
        normalized_gain = max(min(days_gain_percent / 5, 1), -1)  # Clamp to [-1, 1]
        combined_sentiment = 0.7 * avg_news_sentiment + 0.3 * normalized_gain
        if combined_sentiment >= 0.15:
            sentiment_label = "Positive"
        elif combined_sentiment <= -0.15:
            sentiment_label = "Negative"
        else:
            sentiment_label = "Neutral"
        # Impact calculation
        impact_score = abs(combined_sentiment) * (abs(days_gain_percent) / 5) * (total_value / 10000)
        if impact_score > 1.0:
            impact_label = "Large"
        elif impact_score > 0.3:
            impact_label = "Medium"
        else:
            impact_label = "Small"
        # Attach all calculated fields
        setattr(stock, 'sentiment', combined_sentiment)
        setattr(stock, 'sentiment_label', sentiment_label)
        setattr(stock, 'impact_label', impact_label)
        setattr(stock, 'days_gain', days_gain)
        setattr(stock, 'days_gain_percent', days_gain_percent)
        setattr(stock, 'total_value', total_value)
        setattr(stock, 'quantity', quantity)
        setattr(stock, 'price', price)
        setattr(stock, 'previous_close', previous_close)
    db.commit()
    return stocks

def create_stock(db: Session, stock: schemas.StockCreate):
    db_stock = models.Stock(**stock.dict())
    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    return db_stock

def get_news(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.News).offset(skip).limit(limit).all()

def update_stock_sentiment(db: Session, stock_id: int):
    """Update sentiment for a specific stock based on its news"""
    stock = db.query(models.Stock).filter(models.Stock.id == stock_id).first()
    if stock:
        news_items = db.query(models.News).filter(models.News.stock_id == stock_id).all()
        if news_items:
            sentiments = [news.sentiment for news in news_items if news.sentiment is not None]
            if sentiments:
                setattr(stock, 'sentiment', sum(sentiments) / len(sentiments))
            else:
                setattr(stock, 'sentiment', 0.0)
        else:
            setattr(stock, 'sentiment', 0.0)
        db.commit()

def create_news(db: Session, news: schemas.NewsCreate):
    db_news = models.News(**news.dict())
    db.add(db_news)
    db.commit()
    db.refresh(db_news)
    
    # Update sentiment for the stock
    update_stock_sentiment(db, news.stock_id)
    
    return db_news

def get_portfolio(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Portfolio).offset(skip).limit(limit).all()

def create_portfolio(db: Session, portfolio: schemas.PortfolioCreate):
    db_portfolio = models.Portfolio(**portfolio.dict())
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio 