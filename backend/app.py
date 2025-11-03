from flask import Flask, jsonify
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'Hedging Dashboard API is running'})
    
    # API routes will be added here
    @app.route('/api/portfolio', methods=['GET'])
    def get_portfolio():
        return jsonify({'message': 'Portfolio endpoint - to be implemented'})
    
    @app.route('/api/strategies', methods=['GET'])
    def get_strategies():
        return jsonify({'message': 'Strategies endpoint - to be implemented'})
    
    @app.route('/api/market-data/<ticker>', methods=['GET'])
    def get_market_data(ticker):
        return jsonify({'message': f'Market data for {ticker} - to be implemented'})
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5002)