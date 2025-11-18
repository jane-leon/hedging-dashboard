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
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Portfolio Overview</CardTitle>
            <CardDescription>
              {holdings.filter(h => h.symbol && h.symbol.trim()).length} {holdings.filter(h => h.symbol && h.symbol.trim()).length === 1 ? 'holding' : 'holdings'}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshPrices}
            disabled={refreshing || holdings.filter(h => h.symbol && h.symbol.trim()).length === 0}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Value</div>
              <div className="text-2xl font-bold">
                {StockService.formatPrice(stats.totalValue || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Invested</div>
              <div className="text-xl font-semibold">
                {StockService.formatPrice(stats.totalInvested || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Gain/Loss</div>
              {(stats.totalGainLoss || 0) === 0 ? (
                <div className="text-xl font-semibold text-muted-foreground">
                  $0.00
                </div>
              ) : (
                <div className={`text-xl font-semibold flex items-center gap-1 ${
                  (stats.totalGainLoss || 0) > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(stats.totalGainLoss || 0) > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {StockService.formatPrice(Math.abs(stats.totalGainLoss || 0))}
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Return %</div>
              <div className={`text-xl font-semibold ${
                (stats.totalGainLossPercent || 0) === 0 ? 'text-muted-foreground' : 
                (stats.totalGainLossPercent || 0) > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(stats.totalGainLossPercent || 0) === 0 ? '0.00%' : StockService.formatPercent(stats.totalGainLossPercent || 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      {/* Holdings List */}
      {holdings.filter(h => h.symbol && h.symbol.trim()).length > 0 ? (
        <div className="space-y-3">
          {holdings.filter(h => h.symbol && h.symbol.trim()).map((holding) => (
            <Card key={holding.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-semibold text-lg">{holding.symbol}</div>
                        <div className="text-sm text-muted-foreground">{holding.name}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-8 flex-1 text-right">
                    <div>
                      <div className="text-xs text-muted-foreground">Shares</div>
                      <div className="font-semibold">{holding.quantity}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Avg Price</div>
                      <div className="font-semibold">
                        {StockService.formatPrice(holding.averagePrice || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Current Price</div>
                      <div className="font-semibold">
                        {StockService.formatPrice(holding.currentPrice || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Total Value</div>
                      <div className="font-bold text-lg">
                        {StockService.formatPrice(holding.totalValue || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`font-semibold ${
                        (holding.gainLoss || 0) === 0 ? 'text-muted-foreground' :
                        (holding.gainLoss || 0) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(holding.gainLoss || 0) === 0 ? '$0.00' : 
                         ((holding.gainLoss || 0) >= 0 ? '+' : '') + StockService.formatPrice(Math.abs(holding.gainLoss || 0))}
                      </div>
                      <div className={`text-sm ${
                        (holding.gainLossPercent || 0) === 0 ? 'text-muted-foreground' :
                        (holding.gainLossPercent || 0) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(holding.gainLossPercent || 0) === 0 ? '0.00%' : StockService.formatPercent(holding.gainLossPercent || 0)}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeHolding(holding.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              <div className="mb-2">No stocks in your portfolio yet</div>
              <div className="text-sm">Search for stocks above and add them to get started!</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}