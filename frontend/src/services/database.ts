import { supabase } from '../lib/supabase'
import type { Tables, Database } from '../types/database'

export class DatabaseService {
  static async getPortfolios(userId?: string) {
    const query = supabase
      .from('portfolios')
      .select(`
        *,
        holdings (
          *
        )
      `)

    if (userId) {
      query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch portfolios: ${error.message}`)
    }

    return data
  }

  static async createPortfolio(portfolio: Database['public']['Tables']['portfolios']['Insert']) {
    const { data, error } = await supabase
      .from('portfolios')
      .insert(portfolio)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create portfolio: ${error.message}`)
    }

    return data
  }

  static async updatePortfolio(
    id: string, 
    updates: Database['public']['Tables']['portfolios']['Update']
  ) {
    const { data, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update portfolio: ${error.message}`)
    }

    return data
  }

  static async deletePortfolio(id: string) {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete portfolio: ${error.message}`)
    }
  }

  static async addHolding(holding: Database['public']['Tables']['holdings']['Insert']) {
    const { data, error } = await supabase
      .from('holdings')
      .insert(holding)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add holding: ${error.message}`)
    }

    return data
  }

  static async updateHolding(
    id: string, 
    updates: Database['public']['Tables']['holdings']['Update']
  ) {
    const { data, error } = await supabase
      .from('holdings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update holding: ${error.message}`)
    }

    return data
  }

  static async deleteHolding(id: string) {
    const { error } = await supabase
      .from('holdings')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete holding: ${error.message}`)
    }
  }

  static async getHedgingStrategies(portfolioId: string) {
    const { data, error } = await supabase
      .from('hedging_strategies')
      .select('*')
      .eq('portfolio_id', portfolioId)

    if (error) {
      throw new Error(`Failed to fetch hedging strategies: ${error.message}`)
    }

    return data
  }

  static async createHedgingStrategy(
    strategy: Database['public']['Tables']['hedging_strategies']['Insert']
  ) {
    const { data, error } = await supabase
      .from('hedging_strategies')
      .insert(strategy)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create hedging strategy: ${error.message}`)
    }

    return data
  }

  static async getRiskMetrics(portfolioId: string, strategyId?: string) {
    const query = supabase
      .from('risk_metrics')
      .select('*')
      .eq('portfolio_id', portfolioId)

    if (strategyId) {
      query.eq('strategy_id', strategyId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch risk metrics: ${error.message}`)
    }

    return data
  }

  static async saveRiskMetrics(
    metrics: Database['public']['Tables']['risk_metrics']['Insert']
  ) {
    const { data, error } = await supabase
      .from('risk_metrics')
      .insert(metrics)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save risk metrics: ${error.message}`)
    }

    return data
  }

  static async getMarketData(tickerSymbol: string) {
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .eq('ticker_symbol', tickerSymbol)
      .order('fetched_at', { ascending: false })
      .limit(1)

    if (error) {
      throw new Error(`Failed to fetch market data: ${error.message}`)
    }

    return data[0]
  }

  static async getHistoricalPrices(tickerSymbol: string, startDate?: string, endDate?: string) {
    const query = supabase
      .from('historical_prices')
      .select('*')
      .eq('ticker_symbol', tickerSymbol)
      .order('date', { ascending: true })

    if (startDate) {
      query.gte('date', startDate)
    }
    if (endDate) {
      query.lte('date', endDate)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch historical prices: ${error.message}`)
    }

    return data
  }

  static async getPetState(portfolioId: string) {
    const { data, error } = await supabase
      .from('pet_states')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch pet state: ${error.message}`)
    }

    return data
  }

  static async updatePetState(
    portfolioId: string,
    updates: Database['public']['Tables']['pet_states']['Update']
  ) {
    const { data, error } = await supabase
      .from('pet_states')
      .upsert({ portfolio_id: portfolioId, ...updates })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update pet state: ${error.message}`)
    }

    return data
  }

  static async saveSimulationResults(
    results: Database['public']['Tables']['simulation_results']['Insert']
  ) {
    const { data, error } = await supabase
      .from('simulation_results')
      .insert(results)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save simulation results: ${error.message}`)
    }

    return data
  }

  static async getSimulationResults(portfolioId: string, strategyId?: string) {
    const query = supabase
      .from('simulation_results')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false })

    if (strategyId) {
      query.eq('strategy_id', strategyId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch simulation results: ${error.message}`)
    }

    return data
  }
}