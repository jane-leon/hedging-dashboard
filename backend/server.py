"""Hedging Dashboard Flask API.

This module provides REST API endpoints for the hedging dashboard application,
including stock data retrieval, portfolio management, and market data access.
"""

from typing import Any, Dict, List
import os
import uuid
from datetime import datetime
from typing import Optional

from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def load_ticker_symbols() -> List[str]:
    """Load all ticker symbols from the tickers.txt file.
    
    Returns:
        List of ticker symbols.
    """
    tickers_file = os.path.join(os.path.dirname(__file__), 'tickers.txt')
    try:
        with open(tickers_file, 'r', encoding='utf-8') as file:
            return [line.strip().upper() for line in file if line.strip()]
    except FileNotFoundError:
        app.logger.warning('tickers.txt file not found, using empty list')
        return []


ALL_TICKERS = load_ticker_symbols()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print('Warning: Supabase configuration not found. Portfolio features will be disabled.')
    supabase: Optional[Client] = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def create_app() -> Flask:
    """Create and configure Flask application.
    
    Returns:
        Configured Flask app instance.
    """
    app = Flask(__name__)
    CORS(app)
    
    @app.route('/health')
    def health_check() -> Dict[str, str]:
        """Health check endpoint for monitoring service availability."""
        return jsonify({
            'status': 'healthy', 
            'message': 'Hedging Dashboard API is running'
        })
    
    @app.route('/api/stock/search', methods=['GET'])
    def search_stocks() -> Any:
        """Search for stock tickers by partial match.
        
        Query Parameters:
            q: Stock ticker symbol or partial symbol to search for.
            limit: Maximum number of results to return (default: 10).
            exact: If true, only return exact matches (default: false).
            
        Returns:
            JSON response with stock search suggestions or error message.
        """
        query = request.args.get('q', '').strip().upper()
        limit = int(request.args.get('limit', 10))
        exact_only = request.args.get('exact', 'false').lower() == 'true'
        
        if not query:
            return jsonify({'error': 'Query parameter required'}), 400
            
        try:
            # Find matching tickers
            if exact_only:
                # Exact match only
                matching_tickers = [query] if query in ALL_TICKERS else []
            else:
                # Partial match: tickers that start with the query
                matching_tickers = [
                    ticker for ticker in ALL_TICKERS 
                    if ticker.startswith(query)
                ][:limit]
            
            if not matching_tickers:
                return jsonify({'results': []})
            
            # For search suggestions, return just the symbols
            if not exact_only and len(query) <= 3:
                return jsonify({
                    'results': [{'symbol': ticker} for ticker in matching_tickers]
                })
            
            # For longer queries or exact matches, fetch detailed info
            results = []
            for ticker_symbol in matching_tickers[:5]:  # Limit detailed fetches
                try:
                    ticker = yf.Ticker(ticker_symbol)
                    info = ticker.info
                    
                    if info and 'symbol' in info:
                        result = {
                            'symbol': info.get('symbol', ticker_symbol),
                            'name': info.get('longName', 
                                           info.get('shortName', 'Unknown')),
                            'sector': info.get('sector', 'Unknown'),
                            'current_price': info.get('currentPrice', 
                                                    info.get('regularMarketPrice', 0)),
                            'market_cap': info.get('marketCap', 0),
                            'exchange': info.get('exchange', 'Unknown')
                        }
                        results.append(result)
                except Exception as ticker_error:
                    app.logger.warning('Error fetching data for %s: %s', 
                                     ticker_symbol, ticker_error)
                    # Still include symbol even if we can't get details
                    results.append({'symbol': ticker_symbol})
            
            return jsonify({'results': results})
            
        except Exception as error:
            app.logger.error('Error searching for stock %s: %s', query, error)
            return jsonify({'error': 'Failed to search stock'}), 500
    
    @app.route('/api/stock/<ticker>', methods=['GET'])
    def get_stock_info(ticker: str) -> Any:
        """Get detailed stock information for a specific ticker.
        
        Args:
            ticker: Stock ticker symbol.
            
        Returns:
            JSON response with detailed stock data or error message.
        """
        try:
            stock = yf.Ticker(ticker.upper())
            info = stock.info
            
            if not info or 'symbol' not in info:
                return jsonify({'error': 'Stock not found'}), 404
                
            stock_data = {
                'symbol': info.get('symbol', ticker.upper()),
                'name': info.get('longName', info.get('shortName', 'Unknown')),
                'sector': info.get('sector', 'Unknown'),
                'industry': info.get('industry', 'Unknown'),
                'current_price': info.get('currentPrice', 
                                        info.get('regularMarketPrice', 0)),
                'previous_close': info.get('previousClose', 0),
                'market_cap': info.get('marketCap', 0),
                'volume': info.get('volume', 0),
                'avg_volume': info.get('averageVolume', 0),
                'beta': info.get('beta', 0),
                'pe_ratio': info.get('forwardPE', info.get('trailingPE', 0)),
                'eps': info.get('forwardEps', info.get('trailingEps', 0)),
                'dividend_yield': info.get('dividendYield', 0),
                'week_52_high': info.get('fiftyTwoWeekHigh', 0),
                'week_52_low': info.get('fiftyTwoWeekLow', 0),
                'exchange': info.get('exchange', 'Unknown'),
                'currency': info.get('currency', 'USD')
            }
            
            return jsonify(stock_data)
            
        except Exception as error:
            app.logger.error('Error fetching stock data for %s: %s', 
                           ticker, error)
            return jsonify({'error': 'Failed to fetch stock data'}), 500
    
    @app.route('/api/stock/<ticker>/history', methods=['GET'])
    def get_stock_history(ticker: str) -> Any:
        """Get historical price data for a stock.
        
        Args:
            ticker: Stock ticker symbol.
            
        Query Parameters:
            period: Time period for historical data 
                   (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max).
            
        Returns:
            JSON response with historical price data or error message.
        """
        period = request.args.get('period', '1mo')
        
        try:
            stock = yf.Ticker(ticker.upper())
            hist = stock.history(period=period)
            
            if hist.empty:
                return jsonify({'error': 'No historical data found'}), 404
            
            history_data = []
            for date, row in hist.iterrows():
                history_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'open': round(float(row['Open']), 2),
                    'high': round(float(row['High']), 2),
                    'low': round(float(row['Low']), 2),
                    'close': round(float(row['Close']), 2),
                    'volume': int(row['Volume'])
                })
            
            return jsonify({
                'symbol': ticker.upper(),
                'period': period,
                'data': history_data
            })
            
        except Exception as error:
            app.logger.error('Error fetching historical data for %s: %s', 
                           ticker, error)
            return jsonify({'error': 'Failed to fetch historical data'}), 500
    
    @app.route('/api/stocks/batch', methods=['POST'])
    def get_batch_stocks() -> Any:
        """Get stock data for multiple tickers.
        
        Request Body:
            JSON object with 'tickers' array containing ticker symbols.
            
        Returns:
            JSON response with stock data for all requested tickers.
        """
        data = request.get_json()
        tickers = data.get('tickers', []) if data else []
        
        if not tickers:
            return jsonify({'error': 'Tickers array required'}), 400
            
        try:
            results = {}
            
            for ticker_symbol in tickers:
                stock = yf.Ticker(ticker_symbol.upper())
                info = stock.info
                
                if info and 'symbol' in info:
                    current_price = info.get('currentPrice', 
                                           info.get('regularMarketPrice', 0))
                    previous_close = info.get('previousClose', 0)
                    change = current_price - previous_close
                    change_percent = (
                        (change / previous_close) * 100 
                        if previous_close > 0 else 0
                    )
                    
                    results[ticker_symbol.upper()] = {
                        'symbol': info.get('symbol', ticker_symbol.upper()),
                        'name': info.get('longName', 
                                       info.get('shortName', 'Unknown')),
                        'current_price': current_price,
                        'previous_close': previous_close,
                        'change': round(change, 2),
                        'change_percent': round(change_percent, 2)
                    }
                    
            return jsonify({'stocks': results})
            
        except Exception as error:
            app.logger.error('Error fetching batch stock data: %s', error)
            return jsonify({'error': 'Failed to fetch batch stock data'}), 500
    
    # Portfolio endpoints
    @app.route('/api/portfolio', methods=['GET'])
    def get_portfolio() -> Any:
        """Get user's portfolio holdings with current market prices."""
        user_id = request.headers.get('X-User-ID')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 401
        
        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500
            
        try:
            # Ensure user exists first
            user_response = supabase.table('users').select('id').eq('id', user_id).execute()
            if not user_response.data:
                # Create user record if it doesn't exist
                user_data = {
                    'id': user_id,
                    'email': f'user_{user_id}@example.com',  # Placeholder email
                    'name': None
                }
                supabase.table('users').insert(user_data).execute()
            
            # Get user's default portfolio
            portfolio_response = supabase.table('portfolios').select('*').eq('user_id', user_id).limit(1).execute()
            
            if not portfolio_response.data:
                # Create default portfolio if none exists
                portfolio_data = {
                    'id': str(uuid.uuid4()),
                    'user_id': user_id,
                    'name': 'My Portfolio',
                    'description': 'Default portfolio',
                    'is_public': False,
                    'total_value': 0.0
                }
                create_response = supabase.table('portfolios').insert(portfolio_data).execute()
                portfolio_id = create_response.data[0]['id']
            else:
                portfolio_id = portfolio_response.data[0]['id']
            
            # Get all holdings for this portfolio
            holdings_response = supabase.table('holdings').select('*').eq('portfolio_id', portfolio_id).execute()
            
            holdings = []
            total_value = 0.0
            total_invested = 0.0
            
            for holding in holdings_response.data:
                try:
                    # Get current price from yfinance
                    ticker = yf.Ticker(holding['ticker_symbol'])
                    info = ticker.info
                    current_price = info.get('currentPrice', info.get('regularMarketPrice', holding['current_price'] or 0))
                    
                    # Update current price in database
                    supabase.table('holdings').update({
                        'current_price': current_price,
                        'updated_at': datetime.utcnow().isoformat()
                    }).eq('id', holding['id']).execute()
                    
                    # Calculate values
                    total_value_holding = holding['shares'] * current_price
                    total_invested_holding = holding['shares'] * (holding['entry_price'] or 0)
                    gain_loss = total_value_holding - total_invested_holding
                    gain_loss_percent = (gain_loss / total_invested_holding * 100) if total_invested_holding > 0 else 0
                    
                    holdings.append({
                        'id': holding['id'],
                        'symbol': holding['ticker_symbol'],
                        'name': holding['company_name'] or holding['ticker_symbol'],
                        'quantity': holding['shares'],
                        'averagePrice': holding['entry_price'] or 0,
                        'currentPrice': current_price,
                        'totalValue': total_value_holding,
                        'gainLoss': gain_loss,
                        'gainLossPercent': gain_loss_percent
                    })
                    
                    total_value += total_value_holding
                    total_invested += total_invested_holding
                    
                except Exception as price_error:
                    app.logger.warning('Error updating price for %s: %s', holding['ticker_symbol'], price_error)
                    # Use stored price as fallback
                    current_price = holding['current_price'] or 0
                    total_value_holding = holding['shares'] * current_price
                    total_invested_holding = holding['shares'] * (holding['entry_price'] or 0)
                    gain_loss = total_value_holding - total_invested_holding
                    gain_loss_percent = (gain_loss / total_invested_holding * 100) if total_invested_holding > 0 else 0
                    
                    holdings.append({
                        'id': holding['id'],
                        'symbol': holding['ticker_symbol'],
                        'name': holding['company_name'] or holding['ticker_symbol'],
                        'quantity': holding['shares'],
                        'averagePrice': holding['entry_price'] or 0,
                        'currentPrice': current_price,
                        'totalValue': total_value_holding,
                        'gainLoss': gain_loss,
                        'gainLossPercent': gain_loss_percent
                    })
                    
                    total_value += total_value_holding
                    total_invested += total_invested_holding
            
            # Update portfolio total value
            supabase.table('portfolios').update({
                'total_value': total_value,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', portfolio_id).execute()
            
            total_gain_loss = total_value - total_invested
            total_gain_loss_percent = (total_gain_loss / total_invested * 100) if total_invested > 0 else 0
            
            return jsonify({
                'holdings': holdings,
                'stats': {
                    'totalValue': total_value,
                    'totalInvested': total_invested,
                    'totalGainLoss': total_gain_loss,
                    'totalGainLossPercent': total_gain_loss_percent
                }
            })
            
        except Exception as error:
            app.logger.error('Error fetching portfolio: %s', error)
            return jsonify({'error': 'Failed to fetch portfolio'}), 500

    @app.route('/api/portfolio/holdings', methods=['POST'])
    def add_holding() -> Any:
        """Add a stock holding to the user's portfolio."""
        user_id = request.headers.get('X-User-ID')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 401
        
        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500
            
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400
            
        symbol = data.get('symbol', '').strip().upper()
        quantity = data.get('quantity', 0)
        purchase_type = data.get('type', 'shares')  # 'shares' or 'dollars'
        amount = data.get('amount', 0)  # For dollar-based purchases
        
        if not symbol:
            return jsonify({'error': 'Symbol required'}), 400
            
        try:
            # Get current stock price
            ticker = yf.Ticker(symbol)
            info = ticker.info
            if not info or 'symbol' not in info:
                return jsonify({'error': 'Invalid stock symbol'}), 400
                
            current_price = info.get('currentPrice', info.get('regularMarketPrice', 0))
            if current_price <= 0:
                return jsonify({'error': 'Could not fetch current price'}), 400
                
            # Calculate shares and cost based on purchase type
            if purchase_type == 'dollars':
                if amount <= 0:
                    return jsonify({'error': 'Amount must be positive for dollar-based purchases'}), 400
                shares = amount / current_price
                entry_price = current_price
            else:
                if quantity <= 0:
                    return jsonify({'error': 'Quantity must be positive for share-based purchases'}), 400
                shares = quantity
                entry_price = current_price
            
            # Ensure user exists first
            user_response = supabase.table('users').select('id').eq('id', user_id).execute()
            if not user_response.data:
                # Create user record if it doesn't exist
                user_data = {
                    'id': user_id,
                    'email': f'user_{user_id}@example.com',  # Placeholder email
                    'name': None
                }
                supabase.table('users').insert(user_data).execute()
            
            # Get user's default portfolio
            portfolio_response = supabase.table('portfolios').select('*').eq('user_id', user_id).limit(1).execute()
            
            if not portfolio_response.data:
                # Create default portfolio
                portfolio_data = {
                    'id': str(uuid.uuid4()),
                    'user_id': user_id,
                    'name': 'My Portfolio',
                    'description': 'Default portfolio',
                    'is_public': False,
                    'total_value': 0.0
                }
                create_response = supabase.table('portfolios').insert(portfolio_data).execute()
                portfolio_id = create_response.data[0]['id']
            else:
                portfolio_id = portfolio_response.data[0]['id']
            
            # Check if holding already exists
            existing_holding = supabase.table('holdings').select('*').eq('portfolio_id', portfolio_id).eq('ticker_symbol', symbol).execute()
            
            if existing_holding.data:
                # Update existing holding
                existing = existing_holding.data[0]
                new_shares = existing['shares'] + shares
                new_total_cost = (existing['shares'] * existing['entry_price']) + (shares * entry_price)
                new_average_price = new_total_cost / new_shares
                
                supabase.table('holdings').update({
                    'shares': new_shares,
                    'entry_price': new_average_price,
                    'current_price': current_price,
                    'updated_at': datetime.utcnow().isoformat()
                }).eq('id', existing['id']).execute()
                
                holding_id = existing['id']
            else:
                # Create new holding
                holding_data = {
                    'id': str(uuid.uuid4()),
                    'portfolio_id': portfolio_id,
                    'ticker_symbol': symbol,
                    'company_name': info.get('longName', info.get('shortName', symbol)),
                    'shares': shares,
                    'entry_price': entry_price,
                    'current_price': current_price,
                    'sector': info.get('sector'),
                    'market_cap': info.get('marketCap')
                }
                
                insert_response = supabase.table('holdings').insert(holding_data).execute()
                holding_id = insert_response.data[0]['id']
            
            return jsonify({
                'message': 'Holding added successfully',
                'holding_id': holding_id,
                'shares': shares,
                'entry_price': entry_price,
                'purchase_type': purchase_type
            })
            
        except Exception as error:
            app.logger.error('Error adding holding: %s', error)
            return jsonify({'error': 'Failed to add holding'}), 500

    @app.route('/api/portfolio/holdings/<holding_id>', methods=['DELETE'])
    def remove_holding(holding_id: str) -> Any:
        """Remove a holding from the user's portfolio."""
        user_id = request.headers.get('X-User-ID')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 401
        
        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500
            
        try:
            # Verify holding belongs to user's portfolio
            holding_response = supabase.table('holdings').select('*, portfolios!inner(user_id)').eq('id', holding_id).execute()
            
            if not holding_response.data or holding_response.data[0]['portfolios']['user_id'] != user_id:
                return jsonify({'error': 'Holding not found'}), 404
            
            # Delete holding
            supabase.table('holdings').delete().eq('id', holding_id).execute()
            
            return jsonify({'message': 'Holding removed successfully'})
            
        except Exception as error:
            app.logger.error('Error removing holding: %s', error)
            return jsonify({'error': 'Failed to remove holding'}), 500
    
    @app.route('/api/strategies', methods=['GET']) 
    def get_strategies() -> Dict[str, str]:
        """Legacy strategies endpoint - to be implemented."""
        return jsonify({'message': 'Strategies endpoint - to be implemented'})
    
    @app.route('/api/market-data/<ticker>', methods=['GET'])
    def get_market_data(ticker: str) -> Any:
        """Legacy market data endpoint - redirects to new stock endpoint."""
        return get_stock_info(ticker)
    
    return app

if __name__ == '__main__':
    app = create_app()
    print('Starting Flask server on http://localhost:5002')
    app.run(debug=True, host='127.0.0.1', port=5002, use_reloader=False)