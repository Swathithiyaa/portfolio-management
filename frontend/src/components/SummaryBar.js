import React from 'react';
import { Paper, Box, Typography, Grid, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { getSentimentDisplay } from '../utils/sentimentUtils';

const SummaryBar = ({ portfolio, stocks }) => {
  const calculateOverallSentimentLabel = () => {
    if (!stocks || stocks.length === 0) return 'Neutral';
    // Use the most common sentiment_label among tracked stocks
    const labelCounts = { Positive: 0, Neutral: 0, Negative: 0 };
    stocks.forEach(stock => {
      if (stock.sentiment_label) labelCounts[stock.sentiment_label] = (labelCounts[stock.sentiment_label] || 0) + 1;
    });
    const maxLabel = Object.entries(labelCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    return maxLabel;
  };

  const calculateTotalValue = () => {
    if (!portfolio || !stocks) return 0;
    
    return portfolio.reduce((total, item) => {
      const stock = stocks.find(s => s.id === item.stock_id);
      return total + (stock?.price || 0) * item.quantity;
    }, 0);
  };

  const overallSentimentLabel = calculateOverallSentimentLabel();
  const totalValue = calculateTotalValue();
  const sentimentDisplay = getSentimentDisplay(overallSentimentLabel);

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <Box display="flex" alignItems="center">
            <AssessmentIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Portfolio Value</Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box display="flex" alignItems="center">
            <TrendingUpIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="h6">Overall Sentiment</Typography>
          </Box>
          <Chip
            label={overallSentimentLabel}
            color={overallSentimentLabel === 'Positive' ? 'success' : overallSentimentLabel === 'Negative' ? 'error' : 'default'}
            size="medium"
          />
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