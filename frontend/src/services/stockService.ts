/**
 * Stock market data service for API interactions.
 */

export interface StockSearchResult {
  symbol: string
  name: string
  sector: string
  current_price: number
  market_cap: number
  exchange: string
}

export interface StockDetails {
  symbol: string
  name: string
  sector: string
  industry: string
  current_price: number
  previous_close: number
  market_cap: number
  volume: number
  avg_volume: number
  beta: number
  pe_ratio: number
  eps: number
  dividend_yield: number
  week_52_high: number
  week_52_low: number
  exchange: string
  currency: string
}

export interface HistoricalDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface StockHistory {
  symbol: string
  period: string
  data: HistoricalDataPoint[]
}

export interface BatchStockData {
  symbol: string
  name: string
  current_price: number
  previous_close: number
  change: number
  change_percent: number
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'

class StockService {
  static async searchStock(query: string): Promise<StockSearchResult[]> {
    if (!query.trim()) {
      return []
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/stock/search?q=${encodeURIComponent(query)}`
      )
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error('Failed to search stocks:', error)
      throw new Error('Failed to search stocks')
    }
  }

  static async getStockDetails(ticker: string): Promise<StockDetails> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock/${ticker}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Stock not found')
        }
        throw new Error(`Failed to fetch stock details: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Failed to get details for ${ticker}:`, error)
      throw error instanceof Error ? error : new Error('Failed to fetch stock details')
    }
  }

  static async getStockHistory(
    ticker: string, 
    period: string = '1mo'
  ): Promise<StockHistory> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/stock/${ticker}/history?period=${period}`
      )
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Historical data not found')
        }
        throw new Error(`Failed to fetch history: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Failed to get history for ${ticker}:`, error)
      throw error instanceof Error ? error : new Error('Failed to fetch stock history')
    }
  }

  static async getBatchStockData(tickers: string[]): Promise<Record<string, BatchStockData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stocks/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickers }),
      })
      
      if (!response.ok) {
        throw new Error(`Batch request failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.stocks || {}
    } catch (error) {
      console.error('Failed to get batch stock data:', error)
      throw new Error('Failed to fetch stock data')
    }
  }

  static async isMarketOpen(): Promise<boolean> {
    // Simple check - can be enhanced with actual market hours API
    const now = new Date()
    const day = now.getDay()
    const hour = now.getHours()
    
    // Basic check: Monday-Friday, 9:30 AM - 4:00 PM EST
    // This is simplified and doesn't account for holidays or different timezones
    return day >= 1 && day <= 5 && hour >= 9 && hour < 16
  }

  static formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  static formatMarketCap(marketCap: number): string {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`
    } else {
      return `$${marketCap.toLocaleString()}`
    }
  }

  static formatPercent(percent: number): string {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }
}

export default StockService