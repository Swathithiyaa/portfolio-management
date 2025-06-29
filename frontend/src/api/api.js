import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Stocks API
export const stocksAPI = {
  getAll: () => api.get('/stocks'),
  create: (stock) => api.post('/stocks', stock),
  getBySymbol: (symbol) => api.get(`/stocks/${symbol}`),
  getLiveData: (symbol) => api.get(`/stocks/${symbol}/live`),
  updateAll: () => api.post('/stocks/update-all'),
  addWithPortfolio: (stockData) => api.post('/add-stock', stockData),
};

// Portfolio API
export const portfolioAPI = {
  getAll: () => api.get('/portfolio'),
  add: (portfolio) => api.post('/portfolio', portfolio),
};

// News API
export const newsAPI = {
  getAll: () => api.get('/news'),
  scrape: () => api.post('/scrape-news'),
};

// Market API
export const marketAPI = {
  getSummary: () => api.get('/market-summary'),
  getHealth: () => api.get('/health'),
};

// Real-time data polling
export const realTimeAPI = {
  // Poll for live stock updates
  pollStockUpdates: (symbols, callback) => {
    const interval = setInterval(async () => {
      try {
        const promises = symbols.map(symbol => 
          stocksAPI.getLiveData(symbol).catch(() => null)
        );
        const results = await Promise.all(promises);
        const validResults = results.filter(result => result !== null);
        callback(validResults);
      } catch (error) {
        console.error('Error polling stock updates:', error);
      }
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  },
  
  // Poll for market summary
  pollMarketSummary: (callback) => {
    const interval = setInterval(async () => {
      try {
        const summary = await marketAPI.getSummary();
        callback(summary);
      } catch (error) {
        console.error('Error polling market summary:', error);
      }
    }, 60000); // Poll every minute
    
    return () => clearInterval(interval);
  }
};

export default api; 