import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import StockService from '../services/stockService'
import PortfolioService, { type PortfolioHolding, type PortfolioStats, type AddHoldingRequest } from '../services/portfolioService'
import { TrendingUp, TrendingDown, RefreshCw, Trash2 } from 'lucide-react'


export function Portfolio({ onAddHolding }: { onAddHolding?: (loadPortfolio: () => void) => void }) {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [stats, setStats] = useState<PortfolioStats>({
    totalValue: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    totalInvested: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadPortfolio = useCallback(async () => {
    setLoading(true)
    setError('')
    
    try {
      const portfolioData = await PortfolioService.getPortfolio()
      setHoldings(portfolioData.holdings)
      setStats(portfolioData.stats)
    } catch (err) {
      console.error('Error loading portfolio:', err)
      setError(err instanceof Error ? err.message : 'Failed to load portfolio')
      // Start with empty portfolio if loading fails
      setHoldings([])
      setStats({
        totalValue: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        totalInvested: 0
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Force clean slate on component mount
    setHoldings([])
    setStats({
      totalValue: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      totalInvested: 0
    })
    loadPortfolio()
  }, [loadPortfolio])

  const refreshPrices = async () => {
    setRefreshing(true)
    setError('')
    
    try {
      // Reload portfolio data from server to get updated prices
      const portfolioData = await PortfolioService.getPortfolio()
      setHoldings(portfolioData.holdings)
      setStats(portfolioData.stats)
    } catch (err) {
      console.error('Error refreshing prices:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh prices')
    } finally {
      setRefreshing(false)
    }
  }


  const removeHolding = async (holdingId: string) => {
    try {
      await PortfolioService.removeHolding(holdingId)
      // Reload portfolio to get updated data
      await loadPortfolio()
    } catch (err) {
      console.error('Error removing holding:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove holding')
    }
  }

  const addHoldingByShares = async (symbol: string, name: string, quantity: number, price: number) => {
    // Validate inputs
    if (!symbol || typeof symbol !== 'string' || !symbol.trim()) {
      console.error('Invalid symbol:', symbol)
      return
    }

    if (quantity <= 0 || price <= 0) {
      console.error('Invalid quantity/price:', { quantity, price })
      return
    }

    try {
      const request: AddHoldingRequest = {
        symbol: symbol.trim().toUpperCase(),
        type: 'shares',
        quantity: quantity
      }

      await PortfolioService.addHolding(request)
      await loadPortfolio()
    } catch (err) {
      console.error('Error adding holding:', err)
      setError(err instanceof Error ? err.message : 'Failed to add holding')
    }
  }

  const addHoldingByDollars = async (symbol: string, name: string, dollarAmount: number, price: number) => {
    // Validate inputs
    if (!symbol || typeof symbol !== 'string' || !symbol.trim()) {
      console.error('Invalid symbol:', symbol)
      return
    }

    if (dollarAmount <= 0 || price <= 0) {
      console.error('Invalid dollarAmount/price:', { dollarAmount, price })
      return
    }

    try {
      const request: AddHoldingRequest = {
        symbol: symbol.trim().toUpperCase(),
        type: 'dollars',
        amount: dollarAmount
      }

      await PortfolioService.addHolding(request)
      await loadPortfolio()
    } catch (err) {
      console.error('Error adding holding:', err)
      setError(err instanceof Error ? err.message : 'Failed to add holding')
    }
  }

  // Legacy function for backward compatibility with StockSearch
  const addHolding = addHoldingByShares

  useEffect(() => {
    if (onAddHolding) {
      onAddHolding(loadPortfolio)
    }
  }, [onAddHolding, loadPortfolio])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading portfolio...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {/* Compact Portfolio Summary */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-medium text-muted-foreground">
              {holdings.filter(h => h.symbol && h.symbol.trim()).length} Holdings
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshPrices}
              disabled={refreshing || holdings.filter(h => h.symbol && h.symbol.trim()).length === 0}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Value</span>
              <span className="font-semibold">
                {StockService.formatPrice(stats.totalValue || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gain/Loss</span>
              <span className={`font-semibold ${
                (stats.totalGainLoss || 0) === 0 ? 'text-muted-foreground' :
                (stats.totalGainLoss || 0) > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(stats.totalGainLoss || 0) === 0 ? '$0.00' : 
                 ((stats.totalGainLoss || 0) >= 0 ? '+' : '') + 
                 StockService.formatPrice(Math.abs(stats.totalGainLoss || 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Return %</span>
              <span className={`font-semibold ${
                (stats.totalGainLossPercent || 0) === 0 ? 'text-muted-foreground' : 
                (stats.totalGainLossPercent || 0) > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(stats.totalGainLossPercent || 0) === 0 ? '0.00%' : 
                 StockService.formatPercent(stats.totalGainLossPercent || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-red-600 text-xs bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      {/* Compact Holdings List */}
      {holdings.filter(h => h.symbol && h.symbol.trim()).length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {holdings.filter(h => h.symbol && h.symbol.trim()).map((holding) => (
            <Card key={holding.id} className="border-0 shadow-sm">
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {holding.logo_url && (
                          <img
                            src={holding.logo_url}
                            alt={`${holding.symbol} logo`}
                            className="w-4 h-4 rounded-sm object-contain flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                        <div>
                          <div className="font-semibold text-sm">{holding.symbol}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {holding.quantity} shares
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHolding(holding.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-xs text-muted-foreground">
                        {StockService.formatPrice(holding.currentPrice || 0)}
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold">
                          {StockService.formatPrice(holding.totalValue || 0)}
                        </div>
                        <div className={`text-xs ${
                          (holding.gainLoss || 0) === 0 ? 'text-muted-foreground' :
                          (holding.gainLoss || 0) > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(holding.gainLossPercent || 0) === 0 ? '0.00%' : 
                           StockService.formatPercent(holding.gainLossPercent || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-4">
            <div className="text-muted-foreground text-xs">
              <div className="mb-1">No stocks yet</div>
              <div>Search above to get started</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}