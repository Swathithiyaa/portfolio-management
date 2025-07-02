from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class NewsBase(BaseModel):
    headline: str
    content: str
    sentiment: float
    published_at: Optional[datetime] = None

class NewsCreate(NewsBase):
    stock_id: int

class News(NewsBase):
    id: int
    stock_id: int
    class Config:
        from_attributes = True

class StockBase(BaseModel):
    symbol: str
    name: str
    price: float
    last_updated: Optional[datetime] = None
    sentiment: Optional[float] = 0.0
    previous_close: Optional[float] = None
    sentiment_label: Optional[str] = None
    impact_label: Optional[str] = None

class StockCreate(StockBase):
    pass

class Stock(StockBase):
    id: int
    news: List[News] = []
    
    @property
    def sentiment(self) -> float:
        if not self.news:
            return 0.0
        sentiments = [n.sentiment for n in self.news if n.sentiment is not None]
        if not sentiments:
            return 0.0
        return sum(sentiments) / len(sentiments)

    class Config:
        from_attributes = True

class PortfolioBase(BaseModel):
    stock_id: int
    quantity: int

class PortfolioCreate(PortfolioBase):
    pass

class Portfolio(PortfolioBase):
    id: int
    stock: Stock
    class Config:
        from_attributes = True

class AddStockRequest(BaseModel):
    symbol: str
    name: str
    price: float
    quantity: int

class AddStockResponse(BaseModel):
    stock: Stock
    portfolio: Portfolio
    message: str 