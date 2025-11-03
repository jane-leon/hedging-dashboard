# Hedging Dashboard

An interactive web application for simulating equity portfolios and testing 
hedging strategies with real-time risk visualization.

[TOC]

## Overview

The Hedging Dashboard enables users to build portfolios, apply hedging 
strategies, and visualize risk metrics through an intuitive web interface. 
The application combines quantitative finance calculations with interactive 
visualizations and gamification elements.

## Architecture

### Tech Stack

**Frontend**
- React 18+ with TypeScript and Vite
- shadcn/ui component library
- Tailwind CSS for styling
- Recharts for data visualization
- Zustand for state management
- React Hook Form with Zod validation

**Backend**
- Flask REST API
- yfinance for market data
- pandas and numpy for financial calculations
- Flask-CORS for cross-origin requests

### Project Structure

```
hedging-dashboard/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── lib/          # Utility functions
│   │   └── ...
│   ├── package.json
│   └── tailwind.config.js
├── backend/              # Flask API
│   ├── app/             # Application modules
│   ├── app.py           # Main Flask application
│   └── requirements.txt # Python dependencies
├── hedge_env/           # Python virtual environment
└── README.md
```

## Prerequisites

Before setting up the development environment, ensure you have:

- Node.js version 18 or higher
- Python 3.12 or higher
- Git for version control
- Code editor (VS Code recommended)

## Development Setup

### Initial Repository Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd hedging-dashboard
   ```

2. Create and checkout your development branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the existing Python virtual environment:
   ```bash
   source ../hedge_env/bin/activate
   ```

   **Note**: The virtual environment is located at the repository root level.
   If activation fails, verify the path exists or create a new environment:
   ```bash
   python3 -m venv ../hedge_env
   source ../hedge_env/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Verify installation by starting the development server:
   ```bash
   python app.py
   ```

   The API server will start at `http://localhost:5002`. You should see:
   ```
   * Running on http://0.0.0.0:5002
   * Debug mode: on
   ```

5. Test the health endpoint:
   ```bash
   curl http://localhost:5002/health
   ```

### Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start at `http://localhost:5173`. The terminal will show:
   ```
   Local:   http://localhost:5173/
   Network: use --host to expose
   ```

4. Open your browser and navigate to `http://localhost:5173` to verify the 
   application loads correctly.

## Development Workflow

### Git Branch Management

#### Creating Feature Branches

Always create a new branch for each feature or bug fix:

```bash
git checkout main
git pull origin main
git checkout -b feature/descriptive-feature-name
```

Branch naming conventions:
- `feature/portfolio-builder` - New features
- `bugfix/fix-var-calculation` - Bug fixes
- `refactor/improve-state-management` - Code refactoring
- `docs/update-api-documentation` - Documentation updates

#### Daily Development

1. **Start of each development session**:
   ```bash
   git checkout main
   git pull origin main
   git checkout your-feature-branch
   git merge main
   ```

2. **During development**, commit changes frequently:
   ```bash
   git add .
   git commit -m "Add portfolio validation logic"
   ```

3. **End of development session**:
   ```bash
   git push origin your-feature-branch
   ```

#### When to Pull from Main

Pull from main in these situations:
- At the start of each development session
- Before creating a pull request
- When conflicts arise with the main branch
- When you need recent changes from other developers

#### Merging Changes

1. **Before creating a pull request**:
   ```bash
   git checkout main
   git pull origin main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Resolve any conflicts** that arise during the rebase

3. **Push your updated branch**:
   ```bash
   git push origin your-feature-branch --force-with-lease
   ```

4. **Create a pull request** through the GitHub interface

### Running the Application

#### Development Mode

1. **Start the backend** (Terminal 1):
   ```bash
   cd backend
   source ../hedge_env/bin/activate
   python app.py
   ```

2. **Start the frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5002`
   - API Health Check: `http://localhost:5002/health`

#### Production Build

1. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Run linting and type checking**:
   ```bash
   npm run lint
   npm run type-check
   ```

## API Endpoints

The backend provides the following REST endpoints:

- `GET /health` - Health check endpoint
- `GET /api/portfolio` - Portfolio management (in development)
- `GET /api/strategies` - Available hedging strategies (in development)
- `GET /api/market-data/<ticker>` - Market data retrieval (in development)

## Development Commands

### Backend Commands

From the `backend/` directory with virtual environment activated:

```bash
# Start development server
python app.py

# Install new dependencies
pip install package-name
pip freeze > requirements.txt

# Run Python linting
pylint app.py

# Run type checking
mypy app.py
```

### Frontend Commands

From the `frontend/` directory:

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run type checking
npm run type-check

# Preview production build
npm run preview

# Install new dependencies
npm install package-name
```

## Code Style Guidelines

### Python Code Style

Follow the Google Python Style Guide strictly:

- Use 4 spaces for indentation
- Maximum line length of 80 characters
- Use descriptive variable names
- Add type hints to all function signatures
- Include docstrings for all public functions and classes

Example:
```python
def calculate_var(returns: list[float], confidence: float = 0.95) -> float:
    """Calculate Value at Risk for a given confidence level.
    
    Args:
        returns: List of historical returns.
        confidence: Confidence level for VaR calculation.
        
    Returns:
        Value at Risk as a decimal.
        
    Raises:
        ValueError: If confidence level is not between 0 and 1.
    """
    if not 0 < confidence < 1:
        raise ValueError('Confidence must be between 0 and 1')
    return float(np.percentile(returns, (1 - confidence) * 100))
```

### TypeScript Code Style

Follow the Google TypeScript Style Guide:

- Use 2 spaces for indentation
- Maximum line length of 80 characters
- Use descriptive variable names in camelCase
- Add type annotations for complex types
- Use interfaces for object shapes

Example:
```typescript
interface PortfolioData {
  holdings: Holding[];
  totalValue: number;
  riskMetrics: RiskMetrics;
}

function calculatePortfolioValue(holdings: Holding[]): number {
  return holdings.reduce((total, holding) => {
    return total + (holding.shares * holding.currentPrice);
  }, 0);
}
```

## Troubleshooting

### Common Backend Issues

**Virtual environment activation fails**:
```bash
# Recreate the virtual environment
python3 -m venv hedge_env
source hedge_env/bin/activate
pip install -r backend/requirements.txt
```

**Import errors**:
```bash
# Ensure virtual environment is activated
source hedge_env/bin/activate
# Reinstall dependencies
pip install -r backend/requirements.txt
```

**Port 5002 already in use**:
*note it can be any available port locally so long as your configs and APIs all point to it, i'm personally using 5002 since my port 5000 is frequently in use
```bash
# Find and kill process using port 5002
lsof -ti:5002 | xargs kill
```

### Common Frontend Issues

**Node modules issues**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build failures**:
```bash
# Check for TypeScript errors
npm run type-check
# Check for linting errors
npm run lint
```

**Port 5173 already in use**:
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill
```

## Testing

### Backend Testing

Run Python tests from the `backend/` directory:
```bash
python -m pytest tests/
```

### Frontend Testing

Run frontend tests from the `frontend/` directory:
```bash
npm test
```

## Contributing

1. Create a feature branch from main
2. Make your changes following the style guidelines
3. Write tests for new functionality
4. Ensure all tests pass
5. Create a pull request with a clear description
6. Request review from team members

## Support

For questions or issues:
- Check this documentation first
- Review existing GitHub issues
- Create a new issue with detailed information
- Reach out to team members for assistance