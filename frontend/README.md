# Portfolio Management Frontend

This is the React frontend for the Portfolio Management system, providing a professional stock market dashboard similar to Moneycontrol.com. It features real-time stock data, news sentiment analysis, and portfolio management capabilities.

## Features

- **Home Dashboard**: Overview of portfolio performance and recent stocks
- **Portfolio Management**: Track stocks with individual news impact and sentiment
- **News Feed**: Real-time news with sentiment analysis and filtering
- **Responsive Design**: Modern UI built with Material-UI
- **Real-time Updates**: Live data integration with backend API

## Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.js       # Navigation header
│   ├── StockCard.js    # Individual stock display
│   ├── SummaryBar.js   # Portfolio summary
│   └── NewsFeed.js     # News display component
├── pages/              # Page components
│   ├── Home.js         # Home dashboard
│   ├── PortfolioPage.js # Portfolio management
│   └── NewsPage.js     # News feed page
├── api/                # API service layer
│   └── api.js          # Axios configuration and endpoints
└── App.js              # Main app component with routing
```

## Technologies Used

- **React 18** - Frontend framework
- **Material-UI** - UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Chart.js** - Data visualization (ready for charts)

## API Integration

The frontend connects to the Python FastAPI backend running on `http://localhost:8000`. Make sure the backend is running before using the frontend.

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App 