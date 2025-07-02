#!/usr/bin/env python3

from app.news_scraper import news_scraper

print("Testing new content-based sentiment analysis:")
print("=" * 50)

# Test positive news
positive_text = "Apple stock surges 5% on strong earnings beat and positive outlook"
positive_score = news_scraper.analyze_sentiment(positive_text)
print(f"Positive news: {positive_score} points")
print(f"Text: {positive_text}")

print()

# Test negative news
negative_text = "Tesla stock plunges 10% on disappointing quarterly results and regulatory issues"
negative_score = news_scraper.analyze_sentiment(negative_text)
print(f"Negative news: {negative_score} points")
print(f"Text: {negative_text}")

print()

# Test neutral news
neutral_text = "Microsoft announces quarterly earnings report and analyst meeting"
neutral_score = news_scraper.analyze_sentiment(neutral_text)
print(f"Neutral news: {neutral_score} points")
print(f"Text: {neutral_text}")

print()

# Test very positive news
very_positive_text = "Excellent performance! Outstanding results! Amazing growth! Fantastic earnings!"
very_positive_score = news_scraper.analyze_sentiment(very_positive_text)
print(f"Very positive news: {very_positive_score} points")
print(f"Text: {very_positive_text}")

print()

# Test very negative news
very_negative_text = "Terrible performance! Awful results! Horrible decline! Disastrous losses!"
very_negative_score = news_scraper.analyze_sentiment(very_negative_text)
print(f"Very negative news: {very_negative_score} points")
print(f"Text: {very_negative_text}")

print()
print("=" * 50)
print("Sentiment Analysis Test Complete!") 