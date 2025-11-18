import { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import StockService, { type StockSearchResult, type StockDetails } from '../services/stockService'
import PortfolioService, { type AddHoldingRequest } from '../services/portfolioService'
import { Search, TrendingUp, TrendingDown, Plus } from 'lucide-react'

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }) as T
}

export function StockSearch({ onPortfolioUpdate }: { onPortfolioUpdate?: () => void }) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([])
  const [selectedStock, setSelectedStock] = useState<StockDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [stockToAdd, setStockToAdd] = useState<StockDetails | null>(null)
  const [quantity, setQuantity] = useState('')
  const [purchaseType, setPurchaseType] = useState<'shares' | 'dollars'>('shares')
  const [dollarAmount, setDollarAmount] = useState('')
  const [addingToPortfolio, setAddingToPortfolio] = useState(false)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        setShowSuggestions(false)
        return
      }

      setLoading(true)
      setError('')
      
      try {
        const results = await StockService.searchStock(searchQuery)
        setSearchResults(results)
        setShowSuggestions(true)
      } catch (err) {
        setError('Failed to search stocks')
        setSearchResults([])
        setShowSuggestions(false)
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  // Effect to trigger search on query change
  useEffect(() => {
    if (query.length >= 1) {
      debouncedSearch(query)
    } else {
      setSearchResults([])
      setShowSuggestions(false)
    }
  }, [query, debouncedSearch])

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setShowSuggestions(false)
    
    try {
      const results = await StockService.searchStock(query)
      setSearchResults(results)
    } catch (err) {
      setError('Failed to search stocks')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectStock = async (result: StockSearchResult) => {
    setQuery(result.symbol)
    setShowSuggestions(false)
    setLoading(true)
    setError('')
    
    try {
      const details = await StockService.getStockDetails(result.symbol)
      setSelectedStock(details)
    } catch (err) {
      setError('Failed to get stock details')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (selectedStock) {
      setSelectedStock(null) // Clear selected stock when typing
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleAddToPortfolio = (stock: StockDetails) => {
    setStockToAdd(stock)
    setShowAddDialog(true)
    setQuantity('')
    setDollarAmount('')
    setPurchaseType('shares')
  }

  const confirmAddToPortfolio = async () => {
    if (!stockToAdd) {
      setError('No stock selected')
      return
    }

    // Validate input based on purchase type
    if (purchaseType === 'shares') {
      if (!quantity || parseFloat(quantity) <= 0) {
        setError('Please enter a valid number of shares')
        return
      }
    } else {
      if (!dollarAmount || parseFloat(dollarAmount) <= 0) {
        setError('Please enter a valid dollar amount')
        return
      }
    }

    setAddingToPortfolio(true)
    setError('')

    try {
      const request: AddHoldingRequest = {
        symbol: stockToAdd.symbol.trim().toUpperCase(),
        type: purchaseType
      }

      if (purchaseType === 'shares') {
        request.quantity = parseFloat(quantity)
      } else {
        request.amount = parseFloat(dollarAmount)
      }

      await PortfolioService.addHolding(request)
      
      // Reset state
      setShowAddDialog(false)
      setStockToAdd(null)
      setQuantity('')
      setDollarAmount('')
      setError('')
      
      // Notify parent component to refresh portfolio
      onPortfolioUpdate?.()
    } catch (err) {
      console.error('Error adding stock to portfolio:', err)
      setError('Failed to add stock to portfolio')
    } finally {
      setAddingToPortfolio(false)
    }
  }

  const cancelAddToPortfolio = () => {
    setShowAddDialog(false)
    setStockToAdd(null)
    setQuantity('')
    setDollarAmount('')
    setError('')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stock Search</CardTitle>
          <CardDescription>
            Search for stocks to add to your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 relative">
            <div className="flex-1 relative">
              <Input
                placeholder="Start typing a stock ticker (e.g., A, AAPL, MSFT)"
                value={query}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="flex-1"
                onFocus={() => setShowSuggestions(searchResults.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              
              {/* Dynamic search suggestions dropdown */}
              {showSuggestions && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.symbol}
                      className="p-2 cursor-pointer hover:bg-muted transition-colors border-b last:border-b-0"
                      onClick={() => handleSelectStock(result)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-sm">{result.symbol}</div>
                          {result.name && (
                            <div className="text-xs text-muted-foreground truncate">{result.name}</div>
                          )}
                        </div>
                        {result.current_price && (
                          <div className="text-sm font-medium">
                            {StockService.formatPrice(result.current_price)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                'Searching...'
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {!showSuggestions && searchResults.length > 0 && !selectedStock && (
            <div className="space-y-2">
              <h3 className="font-semibold">Search Results:</h3>
              {searchResults.map((result) => (
                <div
                  key={result.symbol}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSelectStock(result)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{result.symbol}</div>
                      {result.name && (
                        <div className="text-sm text-muted-foreground">{result.name}</div>
                      )}
                      {result.sector && (
                        <div className="text-xs text-muted-foreground">{result.sector}</div>
                      )}
                    </div>
                    <div className="text-right">
                      {result.current_price && (
                        <div className="font-semibold">
                          {StockService.formatPrice(result.current_price)}
                        </div>
                      )}
                      {result.market_cap && (
                        <div className="text-xs text-muted-foreground">
                          {StockService.formatMarketCap(result.market_cap)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStock && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedStock.symbol} - {selectedStock.name}
                {selectedStock.current_price > selectedStock.previous_close ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              <Button
                onClick={() => handleAddToPortfolio(selectedStock)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add to Portfolio
              </Button>
            </CardTitle>
            <CardDescription>
              {selectedStock.sector} • {selectedStock.exchange}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Current Price</div>
                <div className="text-2xl font-bold">
                  {StockService.formatPrice(selectedStock.current_price)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Change</div>
                <div className={`text-lg font-semibold ${
                  selectedStock.current_price > selectedStock.previous_close 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {StockService.formatPercent(
                    ((selectedStock.current_price - selectedStock.previous_close) / selectedStock.previous_close) * 100
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="text-lg font-semibold">
                  {StockService.formatMarketCap(selectedStock.market_cap)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">P/E Ratio</div>
                <div className="text-lg font-semibold">
                  {selectedStock.pe_ratio ? selectedStock.pe_ratio.toFixed(2) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Beta</div>
                <div className="text-lg font-semibold">
                  {selectedStock.beta ? selectedStock.beta.toFixed(2) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">52W High</div>
                <div className="text-lg font-semibold">
                  {StockService.formatPrice(selectedStock.week_52_high)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">52W Low</div>
                <div className="text-lg font-semibold">
                  {StockService.formatPrice(selectedStock.week_52_low)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Volume</div>
                <div className="text-lg font-semibold">
                  {selectedStock.volume.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add to Portfolio Dialog */}
      {showAddDialog && stockToAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 max-w-md">
            <CardHeader>
              <CardTitle>Add {stockToAdd.symbol} to Portfolio</CardTitle>
              <CardDescription>
                Current Price: {StockService.formatPrice(stockToAdd.current_price)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Purchase Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Purchase Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={purchaseType === 'shares' ? 'default' : 'outline'}
                    onClick={() => setPurchaseType('shares')}
                    className="w-full"
                  >
                    Shares
                  </Button>
                  <Button
                    type="button"
                    variant={purchaseType === 'dollars' ? 'default' : 'outline'}
                    onClick={() => setPurchaseType('dollars')}
                    className="w-full"
                  >
                    Dollars
                  </Button>
                </div>
              </div>

              {/* Input based on purchase type */}
              {purchaseType === 'shares' ? (
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                    Number of Shares
                  </label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Enter number of shares"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="0"
                    step="0.001"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="dollarAmount" className="block text-sm font-medium mb-2">
                    Dollar Amount
                  </label>
                  <Input
                    id="dollarAmount"
                    type="number"
                    placeholder="Enter dollar amount"
                    value={dollarAmount}
                    onChange={(e) => setDollarAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
              
              {/* Preview calculation */}
              {purchaseType === 'shares' && quantity && !isNaN(parseFloat(quantity)) && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Cost</div>
                  <div className="text-lg font-semibold">
                    {StockService.formatPrice(parseFloat(quantity) * stockToAdd.current_price)}
                  </div>
                </div>
              )}
              
              {purchaseType === 'dollars' && dollarAmount && !isNaN(parseFloat(dollarAmount)) && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Shares to Purchase</div>
                  <div className="text-lg font-semibold">
                    {(parseFloat(dollarAmount) / stockToAdd.current_price).toFixed(4)} shares
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={cancelAddToPortfolio}
                  disabled={addingToPortfolio}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmAddToPortfolio}
                  disabled={
                    addingToPortfolio || 
                    (purchaseType === 'shares' && (!quantity || parseFloat(quantity) <= 0)) ||
                    (purchaseType === 'dollars' && (!dollarAmount || parseFloat(dollarAmount) <= 0))
                  }
                >
                  {addingToPortfolio ? 'Adding...' : 'Add to Portfolio'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}