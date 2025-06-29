import sqlite3

def check_database():
    conn = sqlite3.connect('portfolio.db')
    cursor = conn.cursor()
    
    print("=== Database Schema Check ===")
    
    # Check news table
    print("\nNews table columns:")
    cursor.execute('PRAGMA table_info(news)')
    news_columns = cursor.fetchall()
    for row in news_columns:
        print(f"  {row[1]} ({row[2]})")
    
    # Check stocks table
    print("\nStocks table columns:")
    cursor.execute('PRAGMA table_info(stocks)')
    stocks_columns = cursor.fetchall()
    for row in stocks_columns:
        print(f"  {row[1]} ({row[2]})")
    
    # Check news data
    print("\nNews data count:")
    cursor.execute('SELECT COUNT(*) FROM news')
    news_count = cursor.fetchone()[0]
    print(f"  Total news: {news_count}")
    
    # Check news with stock_id
    cursor.execute('SELECT COUNT(*) FROM news WHERE stock_id IS NOT NULL')
    news_with_stock_id = cursor.fetchone()[0]
    print(f"  News with stock_id: {news_with_stock_id}")
    
    # Check news without stock_id
    cursor.execute('SELECT COUNT(*) FROM news WHERE stock_id IS NULL')
    news_without_stock_id = cursor.fetchone()[0]
    print(f"  News without stock_id: {news_without_stock_id}")
    
    # Show sample news data
    print("\nSample news data:")
    cursor.execute('SELECT id, headline, stock_id, sentiment FROM news LIMIT 5')
    sample_news = cursor.fetchall()
    for row in sample_news:
        print(f"  ID: {row[0]}, Headline: {row[1][:50]}..., Stock ID: {row[2]}, Sentiment: {row[3]}")
    
    conn.close()

def clear_old_news():
    conn = sqlite3.connect('portfolio.db')
    cursor = conn.cursor()
    
    print("\n=== Clearing old news data ===")
    
    # Delete news without stock_id
    cursor.execute('DELETE FROM news WHERE stock_id IS NULL')
    deleted_count = cursor.rowcount
    print(f"Deleted {deleted_count} news items without stock_id")
    
    # Delete all news (if you want to start fresh)
    cursor.execute('DELETE FROM news')
    total_deleted = cursor.rowcount
    print(f"Deleted {total_deleted} total news items")
    
    conn.commit()
    conn.close()
    
    print("Database cleared. You can now re-scrape news.")

if __name__ == "__main__":
    check_database()
    clear_old_news() 