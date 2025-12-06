import { Button } from "./ui/button"
import { Link } from "react-router-dom"

const HowItWorks = () => {
    const steps = [
        {
            number: 1,
            title: "Add Stocks",
            description: "Search and add stocks to your portfolio. Track prices, gains, and volatility automatically."
        },
        {
            number: 2,
            title: "Select Strategy",
            description: "Click a stock, choose your strategy, and adjust strike prices with interactive sliders."
        },
        {
            number: 3,
            title: "Analyze Chart",
            description: "View profit/loss at any price. See breakeven, max loss, and max gain updated in real-time."
        }
    ]

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20">
            <div className="container mx-auto px-6 py-20">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                        How to Use HedgeDash
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Get started with professional hedging strategies in three simple steps
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {steps.map((step) => (
                            <div key={step.number} className="text-center space-y-4">
                                <div className="flex justify-center">
                                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                                        {step.number}
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold">{step.title}</h3>
                                <p className="text-muted-foreground">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" asChild>
                            <Link to="/dashboard">Get Started</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link to="/strategies">View Strategies</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HowItWorks
