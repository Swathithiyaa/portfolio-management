import React from 'react';
import { Paper, Box, Typography, Grid } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AssessmentIcon from '@mui/icons-material/Assessment';

const SummaryBar = ({ portfolio, stocks }) => {
  const calculateOverallSentiment = () => {
    if (!stocks || stocks.length === 0) return 0;
    
    const totalSentiment = stocks.reduce((sum, stock) => {
      if (stock.news && stock.news.length > 0) {
        return sum + stock.news[0].sentiment;
      }
      return sum;
    }, 0);
    
    return totalSentiment / stocks.length;
  };

  const calculateTotalValue = () => {
    if (!portfolio || !stocks) return 0;
    
    return portfolio.reduce((total, item) => {
      const stock = stocks.find(s => s.id === item.stock_id);
      return total + (stock?.price || 0) * item.quantity;
    }, 0);
  };

  const overallSentiment = calculateOverallSentiment();
  const totalValue = calculateTotalValue();

  return (
    <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AssessmentIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Portfolio Summary</Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              ${totalValue.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Portfolio Value
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {overallSentiment > 0.1 ? (
                <TrendingUpIcon sx={{ color: 'success.main', mr: 1 }} />
              ) : overallSentiment < -0.1 ? (
                <TrendingDownIcon sx={{ color: 'error.main', mr: 1 }} />
              ) : null}
              <Typography variant="h4" color={overallSentiment > 0.1 ? 'success.main' : overallSentiment < -0.1 ? 'error.main' : 'text.primary'}>
                {(overallSentiment * 100).toFixed(1)}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Overall Sentiment
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {portfolio?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Stocks Tracked
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SummaryBar; 