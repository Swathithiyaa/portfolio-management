import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { stocksAPI, portfolioAPI, newsAPI } from '../api/api';

// Predefined stock options
const STOCK_OPTIONS = [
  { symbol: 'MMM', name: '3M Company' },
  { symbol: 'CAT', name: 'Caterpillar Inc.' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.' },
  { symbol: 'INTC', name: 'Intel Corporation' },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc.' },
  { symbol: 'CVX', name: 'Chevron Corporation' },
  { symbol: 'NKE', name: 'Nike Inc.' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'PG', name: 'Procter & Gamble Co.' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'DIS', name: 'Walt Disney Co.' },
  { symbol: 'BA', name: 'Boeing Co.' },
  { symbol: 'KO', name: 'Coca-Cola Co.' }
];

const AddStockForm = ({ open, onClose, onStockAdded }) => {
  const [formData, setFormData] = useState({
    selectedStock: '',
    price: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const getSelectedStockInfo = () => {
    if (!formData.selectedStock) return null;
    return STOCK_OPTIONS.find(stock => stock.symbol === formData.selectedStock);
  };

  const validateForm = () => {
    if (!formData.selectedStock) {
      setError('Please select a stock');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      setError('Valid price is required');
      return false;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      setError('Valid quantity is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const selectedStockInfo = getSelectedStockInfo();
    if (!selectedStockInfo) {
      setError('Please select a valid stock');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use the combined endpoint that handles stock creation and portfolio addition
      const response = await stocksAPI.addWithPortfolio({
        symbol: selectedStockInfo.symbol,
        name: selectedStockInfo.name,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      });

      setSuccess(response.data.message);
      
      // Reset form
      setFormData({
        selectedStock: '',
        price: '',
        quantity: ''
      });

      // Notify parent component
      if (onStockAdded) {
        onStockAdded();
      }

      // Close dialog after a short delay to show success message
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);

    } catch (error) {
      console.error('Error adding stock:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.status === 400) {
        setError('Stock already exists in your portfolio');
      } else {
        setError('Failed to add stock. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        selectedStock: '',
        price: '',
        quantity: ''
      });
      setError('');
      setSuccess('');
      onClose();
    }
  };

  const selectedStockInfo = getSelectedStockInfo();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Add New Stock
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a stock and add it to your portfolio with current price and quantity
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Stock</InputLabel>
                <Select
                  value={formData.selectedStock}
                  label="Select Stock"
                  onChange={(e) => handleInputChange('selectedStock', e.target.value)}
                  disabled={loading}
                >
                  {STOCK_OPTIONS.map((stock) => (
                    <MenuItem key={stock.symbol} value={stock.symbol}>
                      {stock.symbol} - {stock.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {selectedStockInfo && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1, mb: 2 }}>
                  <Typography variant="subtitle2" color="primary.main" gutterBottom>
                    Selected Stock
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {selectedStockInfo.symbol} - {selectedStockInfo.name}
                  </Typography>
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="e.g., 150.25"
                disabled={loading}
                helperText="Current stock price per share"
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="e.g., 100"
                disabled={loading}
                helperText="Number of shares"
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              What happens when you add a stock:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Stock will be added to your portfolio with the specified quantity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Live price data will be fetched automatically
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • News and sentiment analysis will be scraped for this stock
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • You can view it in your portfolio immediately
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading || !formData.selectedStock || !formData.price || !formData.quantity}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Adding Stock...' : 'Add Stock'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStockForm; 