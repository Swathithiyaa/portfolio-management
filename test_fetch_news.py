from app.news_scraper import news_scraper

symbol = 'AAPL'
news_items = news_scraper.fetch_finnhub_news(symbol)

print(f"Fetched {len(news_items)} news items for {symbol}.")
for i, item in enumerate(news_items, 1):
    print(f"\nNews {i}:")
    print(f"Headline: {item['headline']}")
    print(f"Content: {item['content']}")
    print(f"Sentiment: {item['sentiment']} points")
    print(f"Published at: {item['published_at']}")
    print(f"Source: {item['source']}") 