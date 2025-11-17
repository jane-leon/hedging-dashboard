import { Button } from "./ui/button"
import { ArrowRight, Shield, TrendingUp, BarChart3 } from "lucide-react"

const Hero = () => {
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Professional{" "}
            <span className="text-primary">Risk Management</span>{" "}
            for Modern Portfolios
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Visualize, analyze, and hedge your investment risks with advanced tools. 
            From Monte Carlo simulations to interactive strategy modeling - take control of your portfolio's future.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="gap-2">
              Start Managing Risk
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <Shield className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Risk Protection</h3>
              <p className="text-sm text-muted-foreground">Advanced hedging strategies to protect your investments</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <BarChart3 className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-sm text-muted-foreground">Live market data and portfolio performance tracking</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Strategy Optimization</h3>
              <p className="text-sm text-muted-foreground">Backtest and optimize your hedging strategies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero