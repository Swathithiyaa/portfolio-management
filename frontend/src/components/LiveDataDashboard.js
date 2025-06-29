import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  Button, 
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import { marketAPI, stocksAPI, realTimeAPI } from '../api/api';

const LiveDataDashboard = () => {
  const [marketSummary, setMarketSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchMarketSummary = async () => {
    try {
      setLoading(true);
      const response = await marketAPI.getSummary();
      setMarketSummary(response.data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch market data');
      console.error('Error fetching market summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAllStocks = async () => {
    try {
      setLoading(true);
      await stocksAPI.updateAll();
      await fetchMarketSummary();
    } catch (err) {
      setError('Failed to update stocks');
      console.error('Error updating stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketSummary();
    
    // Set up real-time polling
    const stopPolling = realTimeAPI.pollMarketSummary((summary) => {
      setMarketSummary(summary);
      setLastUpdate(new Date());
    });

    return () => stopPolling();
  }, []);

  if (loading && !marketSummary) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading live market data...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Live Market Data
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={updateAllStocks}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Refresh All'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {marketSummary && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  ${marketSummary.total_portfolio_value?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Portfolio Value
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  {marketSummary.total_change > 0 ? (
                    <TrendingUpIcon sx={{ color: 'success.main', mr: 1 }} />
                  ) : marketSummary.total_change < 0 ? (
                    <TrendingDownIcon sx={{ color: 'error.main', mr: 1 }} />
                  ) : null}
                  <Typography 
                    variant="h4" 
                    color={marketSummary.total_change > 0 ? 'success.main' : marketSummary.total_change < 0 ? 'error.main' : 'text.primary'}
                  >
                    ${marketSummary.total_change?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total Change
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  {marketSummary.stock_count || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stocks Tracked
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}

        {lastUpdate && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label="Live" 
              color="success" 
              size="small" 
              icon={<TrendingUpIcon />}
            />
            <Typography variant="caption" color="text.secondary">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Market Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="Real-time Data" color="success" size="small" />
                <Typography variant="body2">
                  Connected to live market feeds
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="News Sentiment" color="info" size="small" />
                <Typography variant="body2">
                  Live news analysis active
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LiveDataDashboard; 