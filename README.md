# Portfolio Management System

A comprehensive stock portfolio management application with real-time data, news sentiment analysis, and professional dashboard interface.

## 🚀 Features

### Core Features
- **Real-time Stock Data**: Live price updates and market information
- **Portfolio Management**: Track stocks, quantities, and total portfolio value
- **News Integration**: Real-time financial news with sentiment analysis
- **Sentiment Alerts**: Notifications when stock sentiment changes
- **Professional UI**: Modern, responsive design similar to professional trading platforms

### Advanced Features
- **News Dropdown**: Expandable news sections for each stock
- **Sentiment Tracking**: Monitor positive, neutral, and negative sentiment changes
- **Bell Notifications**: Real-time alerts for sentiment changes
- **Stock Filtering**: Filter news by specific stocks
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Database (can be easily changed to PostgreSQL/MySQL)
- **TextBlob** - Sentiment analysis
- **Finnhub API** - Financial news and data

### Frontend
- **React 18** - Frontend framework
- **Material-UI** - UI component library
- **Axios** - HTTP client
- **React Router** - Client-side routing

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd portfolio-management
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### 4. API Keys Setup
You'll need to get API keys for:
- **Finnhub**: For financial news data
- **Alpha Vantage**: For stock price data (optional)

Update the API keys in `app/news_scraper.py` and `app/stock_data.py`.

## 📁 Project Structure

```
portfolio-management/
├── app/                    # Backend application
│   ├── __init__.py
│   ├── main.py            # FastAPI application
│   ├── models.py          # Database models
│   ├── schemas.py         # Pydantic schemas
│   ├── crud.py            # Database operations
│   ├── database.py        # Database configuration
│   ├── news_scraper.py    # News fetching and sentiment
│   ├── stock_data.py      # Stock data fetching
│   └── utils.py           # Utility functions
├── frontend/              # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── api/           # API service layer
│   │   └── App.js         # Main app component
│   ├── package.json
│   └── README.md
├── requirements.txt       # Python dependencies
├── README.md             # This file
└── .gitignore           # Git ignore rules
```

## 🎯 Usage

### Adding Stocks
1. Navigate to the Portfolio page
2. Click "Add Stock" button
3. Select from predefined stocks or enter custom symbol
4. Add quantity and purchase price

### Viewing News & Sentiment
1. Go to the News tab in Portfolio page
2. Click "Refresh News" to fetch latest news
3. Filter news by specific stocks using the dropdown
4. View sentiment scores for each news item

### Sentiment Alerts
- Bell icon shows notification count for sentiment changes
- Click bell to view all sentiment alerts
- Alerts show when stock sentiment changes between positive, neutral, and negative

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
FINNHUB_API_KEY=your_finnhub_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
DATABASE_URL=sqlite:///./portfolio.db
```

### API Configuration
Update API keys in the respective files:
- `app/news_scraper.py` - Finnhub API key
- `app/stock_data.py` - Alpha Vantage API key

## 🚀 Deployment

### Backend Deployment
```bash
# Install production dependencies
pip install gunicorn

# Run with gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend Deployment
```bash
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [Material-UI](https://mui.com/) for the UI components
- [Finnhub](https://finnhub.io/) for financial data
- [TextBlob](https://textblob.readthedocs.io/) for sentiment analysis

## 📞 Support

If you have any questions or need help, please open an issue on GitHub. 