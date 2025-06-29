import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Grid } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const NewsFeed = ({ news }) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!news || news.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            No news available at the moment.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {news.map((item) => (
        <Card key={item.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" component="div" sx={{ flex: 1 }}>
                {item.headline}
              </Typography>
              <Chip
                icon={getSentimentIcon(item.sentiment)}
                label={`${(item.sentiment * 100).toFixed(1)}%`}
                color={getSentimentColor(item.sentiment)}
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
            
            {item.content && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {item.content}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatDate(item.published_at)}
                </Typography>
              </Box>
              
              {item.stock && (
                <Chip
                  label={item.stock.symbol}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default NewsFeed; 