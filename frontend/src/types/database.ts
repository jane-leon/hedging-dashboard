export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      portfolios: {
        Row: {
          id: string
          user_id: string | null
          name: string
          description: string | null
          is_public: boolean | null
          total_value: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          description?: string | null
          is_public?: boolean | null
          total_value?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          description?: string | null
          is_public?: boolean | null
          total_value?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      holdings: {
        Row: {
          id: string
          portfolio_id: string | null
          ticker_symbol: string
          company_name: string | null
          shares: number
          entry_price: number | null
          current_price: number | null
          sector: string | null
          market_cap: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id?: string | null
          ticker_symbol: string
          company_name?: string | null
          shares: number
          entry_price?: number | null
          current_price?: number | null
          sector?: string | null
          market_cap?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string | null
          ticker_symbol?: string
          company_name?: string | null
          shares?: number
          entry_price?: number | null
          current_price?: number | null
          sector?: string | null
          market_cap?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      hedging_strategies: {
        Row: {
          id: string
          portfolio_id: string | null
          strategy_type: 'protective_put' | 'collar' | 'bear_put_spread' | 'portfolio_rebalancing' | 'index_put'
          strategy_name: string
          parameters: Record<string, any>
          cost: number | null
          is_active: boolean | null
          applied_at: string
        }
        Insert: {
          id?: string
          portfolio_id?: string | null
          strategy_type: 'protective_put' | 'collar' | 'bear_put_spread' | 'portfolio_rebalancing' | 'index_put'
          strategy_name: string
          parameters: Record<string, any>
          cost?: number | null
          is_active?: boolean | null
          applied_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string | null
          strategy_type?: 'protective_put' | 'collar' | 'bear_put_spread' | 'portfolio_rebalancing' | 'index_put'
          strategy_name?: string
          parameters?: Record<string, any>
          cost?: number | null
          is_active?: boolean | null
          applied_at?: string
        }
      }
      risk_metrics: {
        Row: {
          id: string
          portfolio_id: string | null
          strategy_id: string | null
          var_95_1d: number | null
          var_99_1d: number | null
          var_95_30d: number | null
          var_99_30d: number | null
          expected_shortfall: number | null
          max_drawdown: number | null
          beta: number | null
          sharpe_ratio: number | null
          volatility: number | null
          is_hedged: boolean | null
          calculated_at: string
        }
        Insert: {
          id?: string
          portfolio_id?: string | null
          strategy_id?: string | null
          var_95_1d?: number | null
          var_99_1d?: number | null
          var_95_30d?: number | null
          var_99_30d?: number | null
          expected_shortfall?: number | null
          max_drawdown?: number | null
          beta?: number | null
          sharpe_ratio?: number | null
          volatility?: number | null
          is_hedged?: boolean | null
          calculated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string | null
          strategy_id?: string | null
          var_95_1d?: number | null
          var_99_1d?: number | null
          var_95_30d?: number | null
          var_99_30d?: number | null
          expected_shortfall?: number | null
          max_drawdown?: number | null
          beta?: number | null
          sharpe_ratio?: number | null
          volatility?: number | null
          is_hedged?: boolean | null
          calculated_at?: string
        }
      }
      market_data: {
        Row: {
          id: string
          ticker_symbol: string
          company_name: string | null
          current_price: number
          previous_close: number | null
          volume: number | null
          market_cap: number | null
          sector: string | null
          exchange: string | null
          currency: string | null
          fetched_at: string
        }
        Insert: {
          id?: string
          ticker_symbol: string
          company_name?: string | null
          current_price: number
          previous_close?: number | null
          volume?: number | null
          market_cap?: number | null
          sector?: string | null
          exchange?: string | null
          currency?: string | null
          fetched_at?: string
        }
        Update: {
          id?: string
          ticker_symbol?: string
          company_name?: string | null
          current_price?: number
          previous_close?: number | null
          volume?: number | null
          market_cap?: number | null
          sector?: string | null
          exchange?: string | null
          currency?: string | null
          fetched_at?: string
        }
      }
      historical_prices: {
        Row: {
          id: string
          ticker_symbol: string
          date: string
          open_price: number | null
          high_price: number | null
          low_price: number | null
          close_price: number | null
          adjusted_close: number | null
          volume: number | null
        }
        Insert: {
          id?: string
          ticker_symbol: string
          date: string
          open_price?: number | null
          high_price?: number | null
          low_price?: number | null
          close_price?: number | null
          adjusted_close?: number | null
          volume?: number | null
        }
        Update: {
          id?: string
          ticker_symbol?: string
          date?: string
          open_price?: number | null
          high_price?: number | null
          low_price?: number | null
          close_price?: number | null
          adjusted_close?: number | null
          volume?: number | null
        }
      }
      options_data: {
        Row: {
          id: string
          underlying_symbol: string
          option_symbol: string
          option_type: 'call' | 'put'
          strike_price: number
          expiration_date: string
          current_price: number | null
          bid_price: number | null
          ask_price: number | null
          implied_volatility: number | null
          delta: number | null
          gamma: number | null
          theta: number | null
          vega: number | null
          open_interest: number | null
          volume: number | null
          fetched_at: string
        }
        Insert: {
          id?: string
          underlying_symbol: string
          option_symbol: string
          option_type: 'call' | 'put'
          strike_price: number
          expiration_date: string
          current_price?: number | null
          bid_price?: number | null
          ask_price?: number | null
          implied_volatility?: number | null
          delta?: number | null
          gamma?: number | null
          theta?: number | null
          vega?: number | null
          open_interest?: number | null
          volume?: number | null
          fetched_at?: string
        }
        Update: {
          id?: string
          underlying_symbol?: string
          option_symbol?: string
          option_type?: 'call' | 'put'
          strike_price?: number
          expiration_date?: string
          current_price?: number | null
          bid_price?: number | null
          ask_price?: number | null
          implied_volatility?: number | null
          delta?: number | null
          gamma?: number | null
          theta?: number | null
          vega?: number | null
          open_interest?: number | null
          volume?: number | null
          fetched_at?: string
        }
      }
      pet_states: {
        Row: {
          id: string
          portfolio_id: string | null
          pet_name: string | null
          health_level: number | null
          mood: string | null
          last_fed_at: string | null
          total_feeds: number | null
          achievement_badges: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id?: string | null
          pet_name?: string | null
          health_level?: number | null
          mood?: string | null
          last_fed_at?: string | null
          total_feeds?: number | null
          achievement_badges?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string | null
          pet_name?: string | null
          health_level?: number | null
          mood?: string | null
          last_fed_at?: string | null
          total_feeds?: number | null
          achievement_badges?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      simulation_results: {
        Row: {
          id: string
          portfolio_id: string | null
          strategy_id: string | null
          simulation_type: 'monte_carlo' | 'historical' | 'scenario'
          parameters: Record<string, any>
          results: Record<string, any>
          summary_stats: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          portfolio_id?: string | null
          strategy_id?: string | null
          simulation_type: 'monte_carlo' | 'historical' | 'scenario'
          parameters: Record<string, any>
          results: Record<string, any>
          summary_stats: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string | null
          strategy_id?: string | null
          simulation_type?: 'monte_carlo' | 'historical' | 'scenario'
          parameters?: Record<string, any>
          results?: Record<string, any>
          summary_stats?: Record<string, any>
          created_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string | null
          portfolio_id: string | null
          session_start: string
          session_end: string | null
          actions_taken: number | null
          strategies_tested: number | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          portfolio_id?: string | null
          session_start?: string
          session_end?: string | null
          actions_taken?: number | null
          strategies_tested?: number | null
        }
        Update: {
          id?: string
          user_id?: string | null
          portfolio_id?: string | null
          session_start?: string
          session_end?: string | null
          actions_taken?: number | null
          strategies_tested?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]