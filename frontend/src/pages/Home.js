import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { stocksAPI, portfolioAPI } from '../api/api';
import StockTable from '../components/StockTable';
import SummaryBar from '../components/SummaryBar';
import LiveDataDashboard from '../components/LiveDataDashboard';
import AddStockForm from '../components/AddStockForm';

const Home = () => {
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addStockOpen, setAddStockOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [stocksResponse, portfolioResponse] = await Promise.all([
        stocksAPI.getAll(),
        portfolioAPI.getAll()
      ]);
      setStocks(stocksResponse.data);
      setPortfolio(portfolioResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const handleStockUpdate = (updatedData) => {
    // Update the stock in the local state
    setStocks(prevStocks => 
      prevStocks.map(stock => 
        stock.symbol === updatedData.symbol 
          ? { ...stock, price: updatedData.price }
          : stock
      )
    );
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to Portfolio Manager
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Your professional stock market dashboard with real-time data and sentiment analysis
      </Typography>

      {/* Live Data Dashboard */}
      <Box sx={{ mb: 4 }}>
        <LiveDataDashboard />
      </Box>

      <SummaryBar portfolio={portfolio} stocks={stocks} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Live Stock Data</Typography>
                <Button 
                  component={RouterLink} 
                  to="/portfolio" 
                  variant="outlined"
                >
                  View All
                </Button>
              </Box>
              
              {stocks.length > 0 ? (
                <StockTable stocks={stocks.slice(0, 6)} portfolio={portfolio} showNewsColumn={false} />
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No stocks available yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Add some stocks to start tracking live market data and news sentiment
                  </Typography>
                  <Button 
                    variant="contained"
                    onClick={() => setAddStockOpen(true)}
                  >
                    Add Your First Stock
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  component={RouterLink} 
                  to="/portfolio" 
                  variant="contained" 
                  fullWidth
                >
                  View Portfolio
                </Button>
                
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => setAddStockOpen(true)}
                >
                  Add Stock
                </Button>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Live Features
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    ✓ Real-time stock prices
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✓ Live news sentiment analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✓ Portfolio value tracking
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✓ Market summary updates
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✓ Integrated stock & news view
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <AddStockForm open={addStockOpen} onClose={() => setAddStockOpen(false)} onStockAdded={handleStockAdded} />
    </Container>
  );
};

export default Home; 