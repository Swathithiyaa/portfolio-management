import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Tooltip, Collapse, List, ListItem, ListItemText, Divider } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { stocksAPI } from '../api/api';

const StockCard = ({ stock, onUpdate, relatedNews = [] }) => {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const fetchLiveData = async () => {
    setLoading(true);
    try {
      const response = await stocksAPI.getLiveData(stock.symbol);
      setLiveData(response.data);
      setLastUpdate(new Date());
      if (onUpdate) onUpdate(response.data);
    } catch (error) {
      console.error(`Error fetching live data for ${stock.symbol}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch live data on component mount
    fetchLiveData();
  }, [stock.symbol]);

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.1) return 'success';
    if (sentiment < -0.1) return 'error';
    return 'default';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment > 0.1) return <TrendingUpIcon />;
    if (sentiment < -0.1) return <TrendingDownIcon />;
    return <RemoveIcon />;
  };

  const getPriceChangeColor = (change) => {
    if (!change) return 'text.primary';
    return change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.primary';
  };

  const getPriceChangeIcon = (change) => {
    if (!change) return null;
    return change > 0 ? <TrendingUpIcon /> : change < 0 ? <TrendingDownIcon /> : null;
  };

  const currentPrice = liveData?.price || stock.price;
  const priceChange = liveData?.change || 0;
  const priceChangePercent = liveData?.change_percent || '0%';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const stockNews = relatedNews.filter(news => news.stock_id === stock.id).slice(0, 3);

  return (
    <Card sx={{ minWidth: 275, mb: 2, position: 'relative' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" component="div">
              {stock.symbol}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {stock.name}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="h6" 
                color={getPriceChangeColor(priceChange)}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                ${currentPrice?.toFixed(2) || 'N/A'}
                {getPriceChangeIcon(priceChange)}
              </Typography>
            </Box>
            
            {priceChange !== 0 && (
              <Typography 
                variant="body2" 
                color={getPriceChangeColor(priceChange)}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent})
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {stock.news && stock.news.length > 0 && (
              <Chip
                icon={getSentimentIcon(stock.news[0]?.sentiment || 0)}
                label={`Sentiment: ${(stock.news[0]?.sentiment || 0).toFixed(2)}`}
                color={getSentimentColor(stock.news[0]?.sentiment || 0)}
                size="small"
              />
            )}
            
            {liveData?.volume && (
              <Chip
                label={`Vol: ${liveData.volume.toLocaleString()}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          
          <Tooltip title="Refresh live data">
            <IconButton 
              size="small" 
              onClick={fetchLiveData}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        {stock.news && stock.news.length > 0 && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            Latest: {stock.news[0]?.headline}
          </Typography>
        )}
        
        {lastUpdate && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Typography>
        )}

        {/* News Section */}
        {stockNews.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Recent News ({stockNews.length})
              </Typography>
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ p: 0 }}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expanded}>
              <List dense sx={{ p: 0 }}>
                {stockNews.map((news, index) => (
                  <React.Fragment key={news.id}>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {news.headline}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(news.published_at)}
                            </Typography>
                            <Chip
                              icon={getSentimentIcon(news.sentiment)}
                              label={`${(news.sentiment * 100).toFixed(1)}%`}
                              color={getSentimentColor(news.sentiment)}
                              size="small"
                              sx={{ ml: 1, height: 20 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < stockNews.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Collapse>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StockCard; 