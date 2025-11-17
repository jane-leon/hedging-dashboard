import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Slider } from './ui/slider'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

export function HedgingStrategy() {
  const [strategy, setStrategy] = useState('collar')
  const [currentPrice, setCurrentPrice] = useState([100])
  const [putStrike, setPutStrike] = useState([95])
  const [callStrike, setCallStrike] = useState([110])
  const [putPremium, setPutPremium] = useState('10')
  const [callPremium, setCallPremium] = useState('10')

  const generatePayoffData = () => {
    const data = []
    for (let price = 85; price <= 120; price += 1) {
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
        price,
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Hedging Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Strategy</Label>
            <Select value={strategy} onValueChange={setStrategy}>
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
                <Label>Current stock price</Label>
                <span className="font-medium">${currentPrice[0]}</span>
              </div>
              <Slider
                value={currentPrice}
                onValueChange={setCurrentPrice}
                max={150}
                min={50}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Put strike price</Label>
                <span className="font-medium">${putStrike[0]}</span>
              </div>
              <Slider
                value={putStrike}
                onValueChange={setPutStrike}
                max={currentPrice[0] - 5}
                min={50}
                step={1}
                className="w-full"
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
                  max={150}
                  min={strategy === 'bear_put_spread' ? putStrike[0] + 5 : currentPrice[0] + 5}
                  step={1}
                  className="w-full"
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
              />
            </div>
            {strategy === 'protective_put' && <div></div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payoff Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
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