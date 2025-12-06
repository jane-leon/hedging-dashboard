import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Slider } from './ui/slider'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { type PortfolioHolding } from '../services/portfolioService'
import portfolioService from '../services/portfolioService'

export function HedgingStrategy({ selectedStock }: { selectedStock: PortfolioHolding | null }) {
  const [strategy, setStrategy] = useState('collar')
  const [currentPrice, setCurrentPrice] = useState([100])
  const [putStrike, setPutStrike] = useState([95])
  const [callStrike, setCallStrike] = useState([110])
  const [putPremium, setPutPremium] = useState('10')
  const [callPremium, setCallPremium] = useState('10')
  const [volatility, setVolatility] = useState<number | null>(null)
  const [loadingVolatility, setLoadingVolatility] = useState(false)

  // Update current price and strike prices when stock is selected
  useEffect(() => {
    if (selectedStock) {
      const price = selectedStock.currentPrice || 100
      setCurrentPrice([price])

      // Auto-calculate intelligent strike prices based on current price
      // Put strike: ~5-10% out of the money (below current price)
      const putStrikePrice = Math.round(price * 0.92) // 8% below
      setPutStrike([putStrikePrice])

      // Call strike: ~5-10% out of the money (above current price)  
      const callStrikePrice = Math.round(price * 1.08) // 8% above
      setCallStrike([callStrikePrice])

      // Fetch historical volatility
      setLoadingVolatility(true)
      portfolioService.getStockVolatility(selectedStock.symbol, 30)
        .then(data => {
          setVolatility(data.volatility)
          setLoadingVolatility(false)
        })
        .catch(error => {
          console.error('Failed to fetch volatility:', error)
          setVolatility(null)
          setLoadingVolatility(false)
        })
    } else {
      setVolatility(null)
    }
  }, [selectedStock])

  const generatePayoffData = () => {
    const data = []
    const basePrice = currentPrice[0]
    const minPrice = Math.max(1, basePrice * 0.7) // 30% below current price
    const maxPrice = basePrice * 1.3 // 30% above current price
    const step = (maxPrice - minPrice) / 50 // 50 data points

    for (let price = minPrice; price <= maxPrice; price += step) {
      let payoff = 0
      const stockGain = price - currentPrice[0]

      if (strategy === 'collar') {
        const putPayoff = Math.max(putStrike[0] - price, 0) - parseFloat(putPremium)
        const callPayoff = -Math.max(price - callStrike[0], 0) + parseFloat(callPremium)
        payoff = stockGain + putPayoff + callPayoff
      } else if (strategy === 'protective_put') {
        const putPayoff = Math.max(putStrike[0] - price, 0) - parseFloat(putPremium)
        payoff = stockGain + putPayoff
      } else if (strategy === 'bear_put_spread') {
        const longPutPayoff = Math.max(putStrike[0] - price, 0) - parseFloat(putPremium)
        const shortPutPayoff = -Math.max(callStrike[0] - price, 0) + parseFloat(callPremium)
        payoff = longPutPayoff + shortPutPayoff
      }

      data.push({
        price: Math.round(price * 100) / 100,
        payoff: Math.round(payoff * 100) / 100
      })
    }
    return data
  }

  const payoffData = generatePayoffData()

  const getBreakeven = () => {
    if (strategy === 'collar') {
      return currentPrice[0] + parseFloat(callPremium) - parseFloat(putPremium)
    } else if (strategy === 'protective_put') {
      return currentPrice[0] + parseFloat(putPremium)
    } else if (strategy === 'bear_put_spread') {
      return putStrike[0] - parseFloat(putPremium) + parseFloat(callPremium)
    }
    return currentPrice[0]
  }

  const breakeven = getBreakeven()
  const maxLoss = Math.min(...payoffData.map(d => d.payoff))
  const maxGain = Math.max(...payoffData.map(d => d.payoff))

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 p-6">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Hedging Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selected Stock Display */}
          {selectedStock ? (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {selectedStock.logo_url && (
                  <img
                    src={selectedStock.logo_url}
                    alt={`${selectedStock.symbol} logo`}
                    className="w-5 h-5 rounded-sm object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                <div>
                  <div className="font-semibold text-sm">{selectedStock.symbol}</div>
                  <div className="text-xs text-muted-foreground">{selectedStock.name}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-muted-foreground">Current Price: </span>
                  <span className="font-semibold">${selectedStock.currentPrice?.toFixed(2)}</span>
                </div>
                {loadingVolatility ? (
                  <div className="text-xs text-muted-foreground">Loading volatility...</div>
                ) : volatility !== null ? (
                  <div className="text-xs flex items-center gap-1">
                    <span className="text-muted-foreground">Volatility:</span>
                    <span
                      className={
                        volatility < 20
                          ? "font-semibold text-green-600"
                          : volatility < 40
                            ? "font-semibold text-yellow-600"
                            : "font-semibold text-red-600"
                      }
                    >
                      {volatility.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground text-[10px]">(30d)</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-muted rounded-lg text-center text-sm text-muted-foreground">
              Select a stock from your portfolio to analyze hedging strategies
            </div>
          )}

          <div className="space-y-2">
            <Label>Strategy</Label>
            <Select value={strategy} onValueChange={setStrategy} disabled={!selectedStock}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collar">Collar</SelectItem>
                <SelectItem value="protective_put">Protective Put</SelectItem>
                <SelectItem value="bear_put_spread">Bear Put Spread</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Put strike price</Label>
                <span className="font-medium">${putStrike[0]}</span>
              </div>
              <Slider
                value={putStrike}
                onValueChange={setPutStrike}
                max={currentPrice[0] - 5}
                min={Math.max(1, currentPrice[0] * 0.5)}
                step={1}
                className="w-full"
                disabled={!selectedStock}
              />
            </div>

            {(strategy === 'collar' || strategy === 'bear_put_spread') && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{strategy === 'bear_put_spread' ? 'Short put strike price' : 'Call strike price'}</Label>
                  <span className="font-medium">${callStrike[0]}</span>
                </div>
                <Slider
                  value={callStrike}
                  onValueChange={setCallStrike}
                  max={currentPrice[0] * 1.5}
                  min={strategy === 'bear_put_spread' ? putStrike[0] + 5 : currentPrice[0] + 5}
                  step={1}
                  className="w-full"
                  disabled={!selectedStock}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(strategy === 'collar' || strategy === 'bear_put_spread') && (
              <div className="space-y-2">
                <Label htmlFor="call-premium">
                  {strategy === 'bear_put_spread' ? 'Premium for Short Put' : 'Premium for Call'}
                </Label>
                <Input
                  id="call-premium"
                  value={callPremium}
                  onChange={(e) => setCallPremium(e.target.value)}
                  placeholder="$10"
                  disabled={!selectedStock}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="put-premium">
                {strategy === 'bear_put_spread' ? 'Premium for Long Put' : 'Premium for Put'}
              </Label>
              <Input
                id="put-premium"
                value={putPremium}
                onChange={(e) => setPutPremium(e.target.value)}
                placeholder="$10"
                disabled={!selectedStock}
              />
            </div>
            {strategy === 'protective_put' && <div></div>}
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>Payoff Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full mb-6">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={payoffData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="price"
                  label={{ value: 'Future Stock Price', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  label={{ value: 'Net Profit/Loss', angle: -90, position: 'insideLeft' }}
                />
                <Line
                  type="monotone"
                  dataKey="payoff"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Breakeven price</div>
              <div className="text-lg font-semibold">{Math.round(breakeven)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Max loss</div>
              <div className="text-lg font-semibold">{Math.round(maxLoss)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Max gain</div>
              <div className="text-lg font-semibold">{Math.round(maxGain)}</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm">
              You're limiting your losses to ${Math.abs(Math.round(maxLoss))}/share while capping your gains at ${Math.round(maxGain)}/share.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}