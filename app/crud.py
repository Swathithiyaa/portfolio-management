from sqlalchemy.orm import Session
from . import models, schemas
from typing import List

def get_stock(db: Session, stock_id: int):
    return db.query(models.Stock).filter(models.Stock.id == stock_id).first()

def get_stock_by_symbol(db: Session, symbol: str):
    return db.query(models.Stock).filter(models.Stock.symbol == symbol).first()

def get_stocks(db: Session, skip: int = 0, limit: int = 100):
    stocks = db.query(models.Stock).offset(skip).limit(limit).all()
    
    # Calculate sentiment for each stock based on its news
    for stock in stocks:
        news_items = db.query(models.News).filter(models.News.stock_id == stock.id).all()
        if news_items:
            sentiments = [news.sentiment for news in news_items if news.sentiment is not None]
            if sentiments:
                setattr(stock, 'sentiment', sum(sentiments) / len(sentiments))
            else:
                setattr(stock, 'sentiment', 0.0)
        else:
            setattr(stock, 'sentiment', 0.0)
    
    # Save the calculated sentiments to the database
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