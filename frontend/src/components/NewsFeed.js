import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Grid } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getSentimentDisplay } from '../utils/sentimentUtils';

const NewsFeed = ({ news }) => {
  const getSentimentColor = (sentiment) => {
    if (sentiment > 15) return 'success';
    if (sentiment < -15) return 'error';
    return 'default';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment > 15) return <TrendingUpIcon />;
    if (sentiment < -15) return <TrendingDownIcon />;
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
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} sm={8}>
                <Typography variant="h6">{item.headline}</Typography>
                <Typography variant="body2" color="text.secondary">{item.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(item.published_at)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Chip
                  label={item.sentiment_label || 'Neutral'}
                  color={item.sentiment_label === 'Positive' ? 'success' : item.sentiment_label === 'Negative' ? 'error' : 'default'}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={item.impact_label || 'Small'}
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default NewsFeed; 