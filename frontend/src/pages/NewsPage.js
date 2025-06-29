import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { newsAPI, stocksAPI } from '../api/api';
import NewsFeed from '../components/NewsFeed';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [filterStock, setFilterStock] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsResponse, stocksResponse] = await Promise.all([
          newsAPI.getAll(),
          stocksAPI.getAll()
        ]);
        console.log('DEBUG NewsPage: News response:', newsResponse.data);
        console.log('DEBUG NewsPage: News count:', newsResponse.data.length);
        if (newsResponse.data.length > 0) {
          console.log('DEBUG NewsPage: First news item:', newsResponse.data[0]);
        }
        setNews(newsResponse.data);
        setStocks(stocksResponse.data);
      } catch (error) {
        console.error('Error fetching news data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleScrapeNews = async () => {
    setScraping(true);
    try {
      await newsAPI.scrape();
      // Refresh news data
      const newsResponse = await newsAPI.getAll();
      setNews(newsResponse.data);
    } catch (error) {
      console.error('Error scraping news:', error);
    } finally {
      setScraping(false);
    }
  };

  const filteredNews = filterStock === 'all' 
    ? news 
    : news.filter(item => item.stock_id === parseInt(filterStock));

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Latest News
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Stay updated with real-time news and sentiment analysis
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              Market News ({filteredNews.length})
            </Typography>
            <Button 
              variant="contained"
              onClick={handleScrapeNews}
              disabled={scraping}
            >
              {scraping ? 'Scraping...' : 'Refresh News'}
            </Button>
          </Box>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Stock</InputLabel>
            <Select
              value={filterStock}
              label="Filter by Stock"
              onChange={(e) => setFilterStock(e.target.value)}
            >
              <MenuItem value="all">All Stocks</MenuItem>
              {stocks.map((stock) => (
                <MenuItem key={stock.id} value={stock.id}>
                  {stock.symbol} - {stock.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <NewsFeed news={filteredNews} />
    </Container>
  );
};

export default NewsPage; 