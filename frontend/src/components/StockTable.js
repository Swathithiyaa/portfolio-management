import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import { getSentimentDisplay, getSentimentIcon as getSentimentIconUtil, formatSentimentScore, getImpactScoreAndQuantum } from '../utils/sentimentUtils';

const StockTable = ({ stocks, portfolio, news = [], showNewsColumn = true }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const getSentimentColor = (sentiment) => {
    const display = getSentimentDisplay(sentiment);
    if (display.label === 'Positive') return 'success';
    if (display.label === 'Negative') return 'error';
    return 'default';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment >= 15) return <TrendingUpIcon />;
    if (sentiment <= -15) return <TrendingDownIcon />;
    return <RemoveIcon />;
  };

  const formatSentimentLabel = (sentiment) => {
    const display = getSentimentDisplay(sentiment);
    return `${display.label} (${display.percentage}%)`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleRowExpand = (stockId) => {
    setExpandedRows(prev => ({
      ...prev,
      [stockId]: !prev[stockId]
    }));
  };

  const getPortfolioQuantity = (stockId) => {
    const portfolioItem = portfolio.find(item => item.stock_id === stockId);
    return portfolioItem ? portfolioItem.quantity : 0;
  };

  const getStockNews = (stockId) => {
    return news.filter(item => item.stock_id === stockId).slice(0, 5);
  };

  const calculateTotalValue = (stock) => {
    const quantity = getPortfolioQuantity(stock.id);
    return (stock.current_price || stock.price || 0) * quantity;
  };

  // Calculate Day's Gain and Day's Gain %
  const calculateDaysGain = (stock) => {
    const quantity = getPortfolioQuantity(stock.id);
    const price = stock.current_price || stock.price || 0;
    const prevClose = stock.previous_close || 0;
    return ((price - prevClose) * quantity);
  };

  const calculateDaysGainPercent = (stock) => {
    const price = stock.current_price || stock.price || 0;
    const prevClose = stock.previous_close || 0;
    if (prevClose === 0) return 0;
    return ((price - prevClose) / prevClose) * 100;
  };

  // Helper to get sentiment label and color based on day's gain
  const getSentimentFromDaysGain = (daysGain) => {
    if (daysGain > 0) return { label: 'Positive', color: 'success' };
    if (daysGain < 0) return { label: 'Negative', color: 'error' };
    return { label: 'Neutral', color: 'default' };
  };

  if (!stocks || stocks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No stocks in your portfolio yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start by adding some stocks to track their performance and news sentiment
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Symbol</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Company</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Price</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Quantity</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total Value</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Day's Gain</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Day's Gain %</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Sentiment</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Impact</TableCell>
            {showNewsColumn && (
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">News</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {stocks.map((stock) => {
            const quantity = getPortfolioQuantity(stock.id);
            const totalValue = calculateTotalValue(stock);
            const daysGain = calculateDaysGain(stock);
            const daysGainPercent = calculateDaysGainPercent(stock);
            const stockNews = getStockNews(stock.id);
            const isExpanded = expandedRows[stock.id];
            const impact = getImpactScoreAndQuantum(stock.sentiment);
            const sentimentDisplay = getSentimentFromDaysGain(daysGain);

            return (
              <React.Fragment key={stock.id}>
                <TableRow hover>
                  <TableCell>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {stock.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {stock.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      ${(stock.current_price || stock.price || 0).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1">
                      {quantity.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                      ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" sx={{ fontWeight: 'medium', color: daysGain >= 0 ? 'success.main' : 'error.main' }}>
                      {daysGain >= 0 ? '+' : ''}{daysGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" sx={{ fontWeight: 'medium', color: daysGainPercent >= 0 ? 'success.main' : 'error.main' }}>
                      {daysGainPercent >= 0 ? '+' : ''}{daysGainPercent.toFixed(2)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={stock.sentiment_label || 'Neutral'}
                      color={stock.sentiment_label === 'Positive' ? 'success' : stock.sentiment_label === 'Negative' ? 'error' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={stock.impact_label || 'Small'}
                      size="small"
                    />
                  </TableCell>
                  {showNewsColumn && (
                    <TableCell align="center">
                      {stockNews.length > 0 ? (
                        <Tooltip title={isExpanded ? "Hide news" : "View news"}>
                          <IconButton
                            size="small"
                            onClick={() => handleRowExpand(stock.id)}
                            sx={{ 
                              color: isExpanded ? 'primary.main' : 'inherit',
                              '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' }
                            }}
                          >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No news
                        </Typography>
                      )}
                    </TableCell>
                  )}
                </TableRow>
                
                {/* Expanded News Row */}
                {showNewsColumn && isExpanded && stockNews.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={showNewsColumn ? 7 : 6} sx={{ py: 0 }}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid #e0e0e0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <NewspaperIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                              Recent News for {stock.symbol} ({stockNews.length})
                            </Typography>
                          </Box>
                          <List dense sx={{ p: 0 }}>
                            {stockNews.map((newsItem, index) => (
                              <React.Fragment key={newsItem.id}>
                                <ListItem sx={{ px: 0, py: 1 }}>
                                  <ListItemText
                                    primary={
                                      <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                                        {newsItem.headline}
                                      </Typography>
                                    }
                                    secondary={
                                      <Box>
                                        {newsItem.content && (
                                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {newsItem.content.length > 150 
                                              ? `${newsItem.content.substring(0, 150)}...` 
                                              : newsItem.content
                                            }
                                          </Typography>
                                        )}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary">
                                              {formatDate(newsItem.published_at)}
                                            </Typography>
                                          </Box>
                                          <Chip
                                            icon={getSentimentIcon(newsItem.sentiment)}
                                            label={formatSentimentScore(newsItem.sentiment)}
                                            color={getSentimentColor(newsItem.sentiment)}
                                            size="small"
                                            sx={{ height: 20 }}
                                          />
                                        </Box>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                                {index < stockNews.length - 1 && <Divider />}
                              </React.Fragment>
                            ))}
                          </List>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StockTable; 