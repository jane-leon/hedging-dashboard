-- Hedging Dashboard Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for Phase 2 collaborative features)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolios table
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  total_value DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Holdings table (individual stocks in portfolios)
CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  ticker_symbol TEXT NOT NULL,
  company_name TEXT,
  shares DECIMAL(15,6) NOT NULL,
  entry_price DECIMAL(10,4),
  current_price DECIMAL(10,4),
  sector TEXT,
  market_cap BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_shares CHECK (shares > 0)
);

-- Hedging strategies table
CREATE TABLE hedging_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  strategy_type TEXT NOT NULL CHECK (strategy_type IN (
    'protective_put', 
    'collar', 
    'bear_put_spread', 
    'portfolio_rebalancing',
    'index_put'
  )),
  strategy_name TEXT NOT NULL,
  parameters JSONB NOT NULL,
  cost DECIMAL(12,4),
  is_active BOOLEAN DEFAULT TRUE,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk metrics table (calculated results)
CREATE TABLE risk_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES hedging_strategies(id) ON DELETE SET NULL,
  var_95_1d DECIMAL(12,4),
  var_99_1d DECIMAL(12,4),
  var_95_30d DECIMAL(12,4),
  var_99_30d DECIMAL(12,4),
  expected_shortfall DECIMAL(12,4),
  max_drawdown DECIMAL(8,4),
  beta DECIMAL(6,4),
  sharpe_ratio DECIMAL(6,4),
  volatility DECIMAL(6,4),
  is_hedged BOOLEAN DEFAULT FALSE,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market data cache table (for performance)
CREATE TABLE market_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker_symbol TEXT NOT NULL,
  company_name TEXT,
  current_price DECIMAL(10,4) NOT NULL,
  previous_close DECIMAL(10,4),
  volume BIGINT,
  market_cap BIGINT,
  sector TEXT,
  exchange TEXT,
  currency TEXT DEFAULT 'USD',
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historical prices table (for backtesting and risk calculations)
CREATE TABLE historical_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker_symbol TEXT NOT NULL,
  date DATE NOT NULL,
  open_price DECIMAL(10,4),
  high_price DECIMAL(10,4),
  low_price DECIMAL(10,4),
  close_price DECIMAL(10,4),
  adjusted_close DECIMAL(10,4),
  volume BIGINT,
  
  UNIQUE(ticker_symbol, date)
);

-- Options data table (for hedging strategy calculations)
CREATE TABLE options_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  underlying_symbol TEXT NOT NULL,
  option_symbol TEXT NOT NULL,
  option_type TEXT NOT NULL CHECK (option_type IN ('call', 'put')),
  strike_price DECIMAL(10,4) NOT NULL,
  expiration_date DATE NOT NULL,
  current_price DECIMAL(8,4),
  bid_price DECIMAL(8,4),
  ask_price DECIMAL(8,4),
  implied_volatility DECIMAL(6,4),
  delta DECIMAL(6,4),
  gamma DECIMAL(8,6),
  theta DECIMAL(8,6),
  vega DECIMAL(8,6),
  open_interest INTEGER,
  volume INTEGER,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tamagotchi pet state table (gamification)
CREATE TABLE pet_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  pet_name TEXT DEFAULT 'Hedge-y',
  health_level INTEGER CHECK (health_level BETWEEN 1 AND 5), -- 1=Critical, 5=Euphoric
  mood TEXT DEFAULT 'neutral',
  last_fed_at TIMESTAMP WITH TIME ZONE,
  total_feeds INTEGER DEFAULT 0,
  achievement_badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(portfolio_id)
);

-- Simulation results table (for storing Monte Carlo results)
CREATE TABLE simulation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES hedging_strategies(id) ON DELETE CASCADE,
  simulation_type TEXT NOT NULL CHECK (simulation_type IN ('monte_carlo', 'historical', 'scenario')),
  parameters JSONB NOT NULL,
  results JSONB NOT NULL, -- Store array of simulation outcomes
  summary_stats JSONB NOT NULL, -- Store mean, std, percentiles, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table (for analytics and usage tracking)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE SET NULL,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  actions_taken INTEGER DEFAULT 0,
  strategies_tested INTEGER DEFAULT 0
);

-- Performance indexes
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX idx_holdings_ticker ON holdings(ticker_symbol);
CREATE INDEX idx_hedging_strategies_portfolio_id ON hedging_strategies(portfolio_id);
CREATE INDEX idx_risk_metrics_portfolio_id ON risk_metrics(portfolio_id);
CREATE INDEX idx_risk_metrics_strategy_id ON risk_metrics(strategy_id);
CREATE INDEX idx_market_data_ticker ON market_data(ticker_symbol);
CREATE INDEX idx_market_data_fetched_at ON market_data(fetched_at);
CREATE INDEX idx_historical_prices_ticker_date ON historical_prices(ticker_symbol, date);
CREATE INDEX idx_options_data_underlying ON options_data(underlying_symbol);
CREATE INDEX idx_options_data_expiration ON options_data(expiration_date);
CREATE INDEX idx_simulation_results_portfolio_id ON simulation_results(portfolio_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- Note: Unique constraints on date-truncated timestamps removed to avoid IMMUTABLE function issues
-- Application logic should handle preventing duplicate ticker data within the same day

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at 
  BEFORE UPDATE ON portfolios 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at 
  BEFORE UPDATE ON holdings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_states_updated_at 
  BEFORE UPDATE ON pet_states 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for the hedging dashboard';
COMMENT ON TABLE portfolios IS 'User-created portfolios containing stocks';
COMMENT ON TABLE holdings IS 'Individual stock positions within portfolios';
COMMENT ON TABLE hedging_strategies IS 'Applied hedging strategies with parameters';
COMMENT ON TABLE risk_metrics IS 'Calculated risk metrics for portfolios and strategies';
COMMENT ON TABLE market_data IS 'Cached market data for stocks';
COMMENT ON TABLE historical_prices IS 'Historical price data for backtesting';
COMMENT ON TABLE options_data IS 'Options market data for strategy calculations';
COMMENT ON TABLE pet_states IS 'Tamagotchi pet gamification state';
COMMENT ON TABLE simulation_results IS 'Monte Carlo and scenario simulation results';
COMMENT ON TABLE user_sessions IS 'User session tracking for analytics';