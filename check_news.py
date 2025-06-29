import sqlite3

conn = sqlite3.connect('portfolio.db')
cursor = conn.cursor()

cursor.execute('SELECT COUNT(*) FROM news')
news_count = cursor.fetchone()[0]
print(f'News count: {news_count}')

if news_count > 0:
    cursor.execute('SELECT id, headline, stock_id, sentiment FROM news LIMIT 3')
    for row in cursor.fetchall():
        print(f'ID: {row[0]}, Stock ID: {row[2]}, Sentiment: {row[3]}, Headline: {row[1][:50]}...')

conn.close() 