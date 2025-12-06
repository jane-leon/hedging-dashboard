import Navbar from '../components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Shield, TrendingDown, Minimize2 } from 'lucide-react'

export default function StrategiesPage() {
    const strategies = [
        {
            id: 'collar',
            name: 'Collar Strategy',
            icon: Shield,
            tagline: 'Protection with Income',
            description: 'Combine protective put + covered call to create a price range. Protected from major losses while capping upside.',
            bestFor: ['Long-term holdings', 'Reduce volatility', 'Low-cost protection'],
            setup: ['Buy protective put (-8% strike)', 'Sell covered call (+8% strike)', 'Call premium offsets put cost'],
            example: {
                stock: '$100',
                protection: '$92 floor',
                cap: '$108 ceiling',
                cost: 'Low/Zero net cost'
            }
        },
        {
            id: 'protective-put',
            name: 'Protective Put',
            icon: TrendingDown,
            tagline: 'Portfolio Insurance',
            description: 'Buy put option as insurance. Limits downside risk while keeping unlimited upside potential.',
            bestFor: ['Concentrated positions', 'Market uncertainty', 'Short-term protection'],
            setup: ['Own the stock', 'Buy put at protection level', 'Pay premium upfront', 'Keep unlimited upside'],
            example: {
                stock: '$500',
                protection: '$460 floor',
                upside: 'Unlimited',
                cost: 'Premium paid'
            }
        },
        {
            id: 'bear-put',
            name: 'Bear Put Spread',
            icon: Minimize2,
            tagline: 'Bearish with Limits',
            description: 'Buy higher strike put, sell lower strike put. Profits from moderate decline with defined risk/reward.',
            bestFor: ['Moderate bearish view', 'Reduce put cost', 'Defined risk + reward'],
            setup: ['Buy put at higher strike', 'Sell put at lower strike', 'Net debit = max loss', 'Spread = max profit potential'],
            example: {
                stock: '$400',
                maxProfit: '$28',
                maxLoss: '$12',
                breakeven: '$388'
            }
        }
    ]

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-6 py-16">
                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-3">
                        Hedging Strategies
                    </h1>
                    <p className="text-muted-foreground">
                        Professional options strategies visualized in real-time on your Dashboard
                    </p>
                </div>

                {/* Three Column Strategy Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto mb-16">
                    {strategies.map((strategy) => (
                        <Card key={strategy.id} className="border-2 hover:border-primary/50 transition-colors">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <strategy.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{strategy.name}</CardTitle>
                                        <CardDescription className="text-xs">{strategy.tagline}</CardDescription>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {strategy.description}
                                </p>
                            </CardHeader>

                            <CardContent className="space-y-4 text-sm">
                                {/* Best For */}
                                <div>
                                    <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">
                                        Best For
                                    </h4>
                                    <ul className="space-y-1">
                                        {strategy.bestFor.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <span className="text-primary text-xs mt-0.5">✓</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* How to Set Up */}
                                <div>
                                    <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">
                                        Setup
                                    </h4>
                                    <ol className="space-y-1">
                                        {strategy.setup.map((step, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <span className="font-semibold text-primary text-xs flex-shrink-0">{i + 1}.</span>
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {/* Example */}
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <h4 className="font-semibold text-xs uppercase tracking-wide mb-2">Example</h4>
                                    <div className="space-y-1 text-xs">
                                        {Object.entries(strategy.example).map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                                                <span className="text-muted-foreground capitalize">{key}:</span>
                                                <span className="font-medium">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
