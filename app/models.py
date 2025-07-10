from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class Stock(Base):
    __tablename__ = "stocks"
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True)
    name = Column(String)
    price = Column(Float)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)
    sentiment = Column(Float, default=0.0)
    sentiment_label = Column(String, nullable=True)
    impact_label = Column(String, nullable=True)
    previous_close = Column(Float, nullable=True)
    news = relationship("News", back_populates="stock")

class News(Base):
    __tablename__ = "news"
    id = Column(Integer, primary_key=True, index=True)
    headline = Column(String)
    content = Column(String)
    sentiment = Column(Float)
    sentiment_label = Column(String, nullable=True)
    impact_label = Column(String, nullable=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"))
    published_at = Column(DateTime, default=datetime.datetime.utcnow)
    stock = relationship("Stock", back_populates="news")

class Portfolio(Base):
    __tablename__ = "portfolio"
    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"))
    quantity = Column(Integer)
    stock = relationship("Stock") 