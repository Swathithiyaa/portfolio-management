import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box, CircularProgress, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Alert, Snackbar, IconButton, Badge, Popover, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import { stocksAPI, portfolioAPI, newsAPI } from '../api/api';
import StockTable from '../components/StockTable';
import SummaryBar from '../components/SummaryBar';
import NewsFeed from '../components/NewsFeed';
import AddStockForm from '../components/AddStockForm';

const PortfolioPage = () => {
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filterStock, setFilterStock] = useState('all');
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [sentimentAlerts, setSentimentAlerts] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  
  // Store previous sentiment states
  const previousSentiments = useRef({});

  // Helper function to get sentiment state
  const getSentimentState = (sentiment) => {
    if (sentiment > 0.1) return 'positive';
    if (sentiment < -0.1) return 'negative';
    return 'neutral';
  };

  // Helper function to get sentiment change message
  const getSentimentChangeMessage = (symbol, fromState, toState) => {
    const stateNames = {
      positive: 'Positive',
      negative: 'Negative', 
      neutral: 'Neutral'
    };
    return `${symbol} sentiment changed from ${stateNames[fromState]} to ${stateNames[toState]}`;
  };

  // Check for sentiment changes
  const checkSentimentChanges = (newStocks) => {
    const newAlerts = [];
    
    newStocks.forEach(stock => {
      const currentState = getSentimentState(stock.sentiment);
      const previousState = previousSentiments.current[stock.symbol];
      
      if (previousState && previousState !== currentState) {
        const alertMessage = getSentimentChangeMessage(stock.symbol, previousState, currentState);
        const alert = {
          id: Date.now() + Math.random(),
          message: alertMessage,
          symbol: stock.symbol,
          fromState: previousState,
          toState: currentState,
          timestamp: new Date(),
          read: false
        };
        newAlerts.push(alert);
      }
      
      // Update previous sentiment
      previousSentiments.current[stock.symbol] = currentState;
    });
    
    if (newAlerts.length > 0) {
      setSentimentAlerts(prev => [...prev, ...newAlerts]);
      setCurrentAlert(newAlerts[0]);
      setShowAlert(true);
    }
  };

  const fetchData = async () => {
    try {
      const [stocksResponse, portfolioResponse, newsResponse] = await Promise.all([
        stocksAPI.getAll(),
        portfolioAPI.getAll(),
        newsAPI.getAll()
      ]);
      console.log('DEBUG: Stocks response:', stocksResponse.data);
      console.log('DEBUG: News response:', newsResponse.data);
      console.log('DEBUG: News count:', newsResponse.data.length);
      if (newsResponse.data.length > 0) {
        console.log('DEBUG: First news item:', newsResponse.data[0]);
      }
      
      const newStocks = stocksResponse.data;
      setStocks(newStocks);
      setPortfolio(portfolioResponse.data);
      setNews(newsResponse.data);
      
      // Check for sentiment changes
      checkSentimentChanges(newStocks);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStockAdded = () => {
    // Refresh data after adding a stock
    fetchData();
  };

  const handleScrapeNews = async () => {
    setScraping(true);
    try {
      await newsAPI.scrape();
      // Refresh news data
      const newsResponse = await newsAPI.getAll();
      setNews(newsResponse.data);
      
      // Refresh stocks to check for sentiment changes
      const stocksResponse = await stocksAPI.getAll();
      const newStocks = stocksResponse.data;
      setStocks(newStocks);
      checkSentimentChanges(newStocks);
    } catch (error) {
      console.error('Error scraping news:', error);
    } finally {
      setScraping(false);
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    setCurrentAlert(null);
  };

  const handleNextAlert = () => {
    const currentIndex = sentimentAlerts.findIndex(alert => alert.id === currentAlert?.id);
    if (currentIndex < sentimentAlerts.length - 1) {
      setCurrentAlert(sentimentAlerts[currentIndex + 1]);
    } else {
      setShowAlert(false);
      setCurrentAlert(null);
    }
  };

  const getAlertSeverity = (fromState, toState) => {
    if (toState === 'positive') return 'success';
    if (toState === 'negative') return 'error';
    return 'info';
  };

  const getSentimentIcon = (toState) => {
    if (toState === 'positive') return <TrendingUpIcon />;
    if (toState === 'negative') return <TrendingDownIcon />;
    return <RemoveIcon />;
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const markAlertAsRead = (alertId) => {
    setSentimentAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };

  const clearAllAlerts = () => {
    setSentimentAlerts([]);
    setNotificationAnchor(null);
  };

  const unreadAlerts = sentimentAlerts.filter(alert => !alert.read);
  const open = Boolean(notificationAnchor);

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
      {/* Header with Notification Bell */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Portfolio Management
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Track your investments with real-time data and sentiment analysis
          </Typography>
        </Box>
        
        {/* Notification Bell */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={handleNotificationClick}
            sx={{ 
              backgroundColor: unreadAlerts.length > 0 ? 'primary.main' : 'grey.100',
              color: unreadAlerts.length > 0 ? 'white' : 'grey.600',
              '&:hover': {
                backgroundColor: unreadAlerts.length > 0 ? 'primary.dark' : 'grey.200'
              }
            }}
          >
            <Badge badgeContent={unreadAlerts.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          {/* Notification Popover */}
          <Popover
            open={open}
            anchorEl={notificationAnchor}
            onClose={handleNotificationClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: { width: 400, maxHeight: 500 }
            }}
          >
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Sentiment Alerts</Typography>
                {sentimentAlerts.length > 0 && (
                  <Button size="small" onClick={clearAllAlerts} color="error">
                    Clear All
                  </Button>
                )}
              </Box>
              
              {sentimentAlerts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No sentiment alerts
                </Typography>
              ) : (
                <List dense>
                  {sentimentAlerts.slice(-10).reverse().map((alert, index) => (
                    <React.Fragment key={alert.id}>
                      <ListItem 
                        sx={{ 
                          px: 1, 
                          py: 1,
                          backgroundColor: alert.read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.12)' }
                        }}
                        onClick={() => markAlertAsRead(alert.id)}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {getSentimentIcon(alert.toState)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {alert.symbol}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {alert.message}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                {alert.timestamp.toLocaleTimeString()}
                              </Typography>
                            </Box>
                          }
                        />
                        {!alert.read && (
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main' }} />
                        )}
                      </ListItem>
                      {index < sentimentAlerts.slice(-10).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          </Popover>
        </Box>
      </Box>

      <SummaryBar portfolio={portfolio} stocks={stocks} />

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Portfolio Overview</Typography>
            <Button 
              variant="contained"
              onClick={() => setAddStockOpen(true)}
            >
              Add Stock
            </Button>
          </Box>

          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Stocks" />
            <Tab label="News" />
          </Tabs>

          {activeTab === 0 && (
            <StockTable stocks={stocks} portfolio={portfolio} news={news} />
          )}

          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                  Latest News ({filteredNews.length})
                </Typography>
                <Button 
                  variant="contained"
                  onClick={handleScrapeNews}
                  disabled={scraping}
                >
                  {scraping ? 'Scraping...' : 'Refresh News'}
                </Button>
              </Box>

              <FormControl sx={{ minWidth: 200, mb: 3 }}>
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

              <NewsFeed news={filteredNews} />
            </Box>
          )}
        </CardContent>
      </Card>

      <AddStockForm open={addStockOpen} onClose={() => setAddStockOpen(false)} onStockAdded={handleStockAdded} />

      {/* Sentiment Change Snackbar */}
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseAlert}
          severity={currentAlert ? getAlertSeverity(currentAlert.fromState, currentAlert.toState) : 'info'}
          sx={{ width: '100%' }}
          action={
            sentimentAlerts.length > 1 && (
              <Button color="inherit" size="small" onClick={handleNextAlert}>
                Next
              </Button>
            )
          }
        >
          {currentAlert?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PortfolioPage; 