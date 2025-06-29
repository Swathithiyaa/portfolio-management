from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, crud, news_scraper
from . import stock_data as stock_data_module
from .database import engine, Base
from .utils import get_db
from typing import List
import time
import logging
import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Portfolio Management API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Portfolio Management API - Live Stock Data & News"}

@app.get("/stocks", response_model=List[schemas.Stock])
def read_stocks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        return crud.get_stocks(db, skip=skip, limit=limit)
    except Exception as e:
        logger.error(f"Error fetching stocks: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/stocks", response_model=schemas.Stock)
def create_stock(stock: schemas.StockCreate, db: Session = Depends(get_db)):
    try:
        db_stock = crud.get_stock_by_symbol(db, symbol=stock.symbol)
        if db_stock:
            raise HTTPException(status_code=400, detail="Stock already registered")
        
        # Fetch live data for the new stock
        try:
            live_data = stock_data_module.stock_service.get_stock_price(str(stock.symbol))
            if live_data:
                stock.price = live_data['price']
        except Exception as e:
            logger.warning(f"Could not fetch live data for {stock.symbol}: {e}")
        
        return crud.create_stock(db=db, stock=stock)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating stock: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/stocks/{symbol}/live")
def get_live_stock_data(symbol: str):
    """Get live stock data for a specific symbol"""
    try:
        live_data = stock_data_module.stock_service.get_stock_price(str(symbol))
        if not live_data:
            raise HTTPException(status_code=404, detail="Stock data not found")
        return live_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching live data for {symbol}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching live data")

@app.post("/stocks/update-all")
def update_all_stocks(db: Session = Depends(get_db)):
    """Update all stocks with live data"""
    try:
        stocks = crud.get_stocks(db)
        updated_count = 0
        
        for stock in stocks:
            try:
                live_data = stock_data_module.stock_service.get_stock_price(str(stock.symbol))
                if live_data:
                    stock.price = live_data['price']
                    stock.last_updated = datetime.datetime.utcnow()
                    updated_count += 1
            except Exception as e:
                logger.warning(f"Could not update stock {stock.symbol}: {e}")
                continue
        
        db.commit()
        return {"message": f"Updated {updated_count} stocks with live data"}
    except Exception as e:
        logger.error(f"Error updating stocks: {e}")
        raise HTTPException(status_code=500, detail="Error updating stocks")

@app.get("/portfolio", response_model=List[schemas.Portfolio])
def read_portfolio(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        return crud.get_portfolio(db, skip=skip, limit=limit)
    except Exception as e:
        logger.error(f"Error fetching portfolio: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/portfolio", response_model=schemas.Portfolio)
def create_portfolio(portfolio: schemas.PortfolioCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_portfolio(db=db, portfolio=portfolio)
    except Exception as e:
        logger.error(f"Error creating portfolio: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/add-stock", response_model=schemas.AddStockResponse)
def add_stock_with_portfolio(request: schemas.AddStockRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Add a stock to the system and portfolio in one request"""
    try:
        # Check if stock already exists
        db_stock = crud.get_stock_by_symbol(db, symbol=request.symbol)
        if db_stock:
            raise HTTPException(status_code=400, detail="Stock already registered")
        
        # Create stock
        stock_data = schemas.StockCreate(
            symbol=request.symbol.upper(),
            name=request.name,
            price=request.price
        )
        
        # Try to fetch live data for the new stock
        try:
            live_data = stock_data_module.stock_service.get_stock_price(str(request.symbol.upper()))
            if live_data:
                stock_data.price = live_data['price']
        except Exception as e:
            logger.warning(f"Could not fetch live data for {request.symbol}: {e}")
        
        created_stock = crud.create_stock(db=db, stock=stock_data)
        
        # Add to portfolio
        portfolio_data = schemas.PortfolioCreate(
            stock_id=int(created_stock.id),
            quantity=request.quantity
        )
        created_portfolio = crud.create_portfolio(db=db, portfolio=portfolio_data)

        # Synchronously fetch and store news for the new stock
        try:
            news_items = news_scraper.news_scraper.fetch_news_for_stock(str(getattr(created_stock, 'symbol')), int(getattr(created_stock, 'id')))
            if news_items:
                news_scraper.news_scraper.store_news(db, int(getattr(created_stock, 'id')), news_items)
        except Exception as e:
            logger.warning(f"Error scraping news for new stock {request.symbol} (sync): {e}")
        
        # Trigger news scraping for the new stock in background (redundancy)
        def scrape_news_for_new_stock():
            try:
                news_items = news_scraper.news_scraper.fetch_news_for_stock(str(getattr(created_stock, 'symbol')), int(getattr(created_stock, 'id')))
                if news_items:
                    news_scraper.news_scraper.store_news(db, int(getattr(created_stock, 'id')), news_items)
            except Exception as e:
                logger.warning(f"Error scraping news for new stock {request.symbol}: {e}")
        
        background_tasks.add_task(scrape_news_for_new_stock)
        
        return schemas.AddStockResponse(
            stock=created_stock,
            portfolio=created_portfolio,
            message=f"Successfully added {request.symbol.upper()} to your portfolio"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding stock with portfolio: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/news", response_model=List[schemas.News])
def read_news(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        return crud.get_news(db, skip=skip, limit=limit)
    except Exception as e:
        logger.error(f"Error fetching news: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/scrape-news")
def scrape_news(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Trigger news scraping for all stocks"""
    try:
        stocks = crud.get_stocks(db)
        # Extract symbol and id into a list of dicts
        stock_data = [{"symbol": stock.symbol, "id": stock.id} for stock in stocks]
        print(f"Scraping news for {len(stock_data)} stocks...")
        def scrape_news_background(stock_data):
            for stock in stock_data:
                try:
                    print(f"Scraping news for {stock['symbol']} (id={stock['id']})...")
                    news_items = news_scraper.news_scraper.fetch_news_for_stock(str(stock['symbol']), stock['id'])
                    if news_items:
                        news_scraper.news_scraper.store_news(db, int(stock['id']), news_items)
                    else:
                        print(f"No news found for {stock['symbol']}")
                    time.sleep(1)  # Rate limiting
                except Exception as e:
                    logger.warning(f"Error scraping news for {stock['symbol']}: {e}")
                    continue
        background_tasks.add_task(scrape_news_background, stock_data)
        return {"message": "News scraping started in background"}
    except Exception as e:
        logger.error(f"Error starting news scraping: {e}")
        raise HTTPException(status_code=500, detail="Error starting news scraping")

@app.get("/market-summary")
def get_market_summary(db: Session = Depends(get_db)):
    """Get overall market summary with live data"""
    try:
        stocks = crud.get_stocks(db)
        portfolio = crud.get_portfolio(db)
        
        total_value = 0
        total_change = 0
        stock_count = len(stocks)
        
        for stock in stocks:
            try:
                live_data = stock_data_module.stock_service.get_stock_price(str(stock.symbol))
                if live_data:
                    portfolio_item = next((p for p in portfolio if p.stock_id == stock.id), None)
                    if portfolio_item is not None:
                        total_value += live_data['price'] * portfolio_item.quantity
                        total_change += live_data['change'] * portfolio_item.quantity
            except Exception as e:
                logger.warning(f"Could not get live data for {stock.symbol}: {e}")
                continue
        
        return {
            "total_portfolio_value": total_value,
            "total_change": total_change,
            "stock_count": stock_count,
            "last_updated": time.time()
        }
    except Exception as e:
        logger.error(f"Error getting market summary: {e}")
        raise HTTPException(status_code=500, detail="Error getting market summary")

@app.get("/health")
def health_check():
    """Health check endpoint"""
    try:
        return {"status": "healthy", "timestamp": time.time()}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Service unhealthy") 