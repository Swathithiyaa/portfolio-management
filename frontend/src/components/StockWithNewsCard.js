import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Divider } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import { getSentimentDisplay } from '../utils/sentimentUtils';

const StockWithNewsCard = ({ stock, relatedNews = [] }) => {
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

  const stockNews = relatedNews.filter(news => news.stock_id === stock.id);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Stock Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {stock.symbol}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stock.name}
            </Typography>
          </Box>
          <Chip
            icon={getSentimentIcon(stock.sentiment)}
            label={getSentimentDisplay(stock.sentiment).label}
            color={getSentimentColor(stock.sentiment)}
            size="small"
          />
        </Box>

        {/* Stock Price Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            ${stock.current_price?.toFixed(2) || 'N/A'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Volume: {stock.volume?.toLocaleString() || 'N/A'}
          </Typography>
        </Box>

        {/* News Section */}
        <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              backgroundColor: 'grey.50', 
              borderRadius: 1,
              '&:hover': { backgroundColor: 'grey.100' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NewspaperIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                Latest News ({stockNews.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            {stockNews.length > 0 ? (
              <List dense sx={{ p: 0 }}>
                {stockNews.map((news, index) => (
                  <React.Fragment key={news.id}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                            {news.headline}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            {news.content && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {news.content.length > 150 
                                  ? `${news.content.substring(0, 150)}...` 
                                  : news.content
                                }
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(news.published_at)}
                                </Typography>
                              </Box>
                              <Chip
                                icon={getSentimentIcon(news.sentiment)}
                                label={getSentimentDisplay(news.sentiment).label}
                                color={getSentimentColor(news.sentiment)}
                                size="small"
                                sx={{ mb: 1 }}
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
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No news available for this stock
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default StockWithNewsCard; 