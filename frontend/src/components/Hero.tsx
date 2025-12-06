import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { ArrowRight, Shield, TrendingUp, BarChart3 } from "lucide-react"
import EuphoricBot from '../assets/icons/riskbot-euphoric.svg'
import HealthyBot from '../assets/icons/riskbot-healthy.svg'
import NervousBot from '../assets/icons/riskbot-nervous.svg'
import StressedBot from '../assets/icons/riskbot-stressed.svg'
import CriticalBot from '../assets/icons/riskbot-critical.svg'

const Hero = () => {
  const botStates = [EuphoricBot, HealthyBot, NervousBot, StressedBot, CriticalBot]
  const [currentBotIndex, setCurrentBotIndex] = useState(1) // Start with healthy

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBotIndex(Math.floor(Math.random() * botStates.length))
    }, 4000) // Change state every 4 seconds

    return () => clearInterval(interval)
  }, [botStates.length])

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-background to-muted/20 overflow-hidden">
      {/* Walking RiskBot with Random States */}
      <div className="walking-riskbot">
        <img
          src={botStates[currentBotIndex]}
          alt="RiskBot walking"
          className="w-16 h-16"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      <div className="container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Visualize Your{" "}
            <span className="text-primary">Portfolio Risk</span>{" "}
            with RiskBot
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track your portfolio, analyze volatility, and explore hedging strategies.
            Meet RiskBot - your animated companion that shows your portfolio's health at a glance.
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
              <h3 className="font-semibold mb-2">Portfolio Tracking</h3>
              <p className="text-sm text-muted-foreground">Real-time portfolio management with live price updates</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <BarChart3 className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Volatility Analysis</h3>
              <p className="text-sm text-muted-foreground">30-day historical volatility for risk assessment</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Hedging Strategies</h3>
              <p className="text-sm text-muted-foreground">Visualize collars, protective puts, and spreads</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .walking-riskbot {
          position: absolute;
          animation: walk-path 30s linear infinite;
          z-index: 10;
        }

        @keyframes walk-path {
          0% {
            left: -80px;
            top: 20%;
            transform: scaleX(1);
          }
          20% {
            left: calc(100% - 80px);
            top: 20%;
            transform: scaleX(1);
          }
          25% {
            left: calc(100% - 80px);
            top: 20%;
            transform: scaleX(-1);
          }
          45% {
            left: -80px;
            top: 40%;
            transform: scaleX(-1);
          }
          50% {
            left: -80px;
            top: 40%;
            transform: scaleX(1);
          }
          70% {
            left: calc(100% - 80px);
            top: 60%;
            transform: scaleX(1);
          }
          75% {
            left: calc(100% - 80px);
            top: 60%;
            transform: scaleX(-1);
          }
          95% {
            left: -80px;
            top: 80%;
            transform: scaleX(-1);
          }
          100% {
            left: -80px;
            top: 20%;
            transform: scaleX(1);
          }
        }

        .walking-riskbot img {
          animation: bounce-walk 0.5s ease-in-out infinite;
        }

        @keyframes bounce-walk {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  )
}

export default Hero