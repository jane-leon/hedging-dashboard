import { supabase } from '../lib/supabase'

const API_BASE_URL = 'http://localhost:5002'

export interface PortfolioHolding {
  id: string
  symbol: string
  name: string
  quantity: number
  averagePrice: number
  currentPrice: number
  totalValue: number
  gainLoss: number
  gainLossPercent: number
}

export interface PortfolioStats {
  totalValue: number
  totalInvested: number
  totalGainLoss: number
  totalGainLossPercent: number
}

export interface PortfolioData {
  holdings: PortfolioHolding[]
  stats: PortfolioStats
}

export interface AddHoldingRequest {
  symbol: string
  type: 'shares' | 'dollars'
  quantity?: number
  amount?: number
}

class PortfolioService {
  private async getUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  }

  async getPortfolio(): Promise<PortfolioData> {
    const userId = await this.getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
      headers: {
        'X-User-ID': userId,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch portfolio: ${response.statusText}`)
    }

    return await response.json()
  }

  async addHolding(request: AddHoldingRequest): Promise<{ message: string; holding_id: string }> {
    const userId = await this.getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`${API_BASE_URL}/api/portfolio/holdings`, {
      method: 'POST',
      headers: {
        'X-User-ID': userId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to add holding: ${response.statusText}`)
    }

    return await response.json()
  }

  async removeHolding(holdingId: string): Promise<{ message: string }> {
    const userId = await this.getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`${API_BASE_URL}/api/portfolio/holdings/${holdingId}`, {
      method: 'DELETE',
      headers: {
        'X-User-ID': userId,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to remove holding: ${response.statusText}`)
    }

    return await response.json()
  }
}

export default new PortfolioService()