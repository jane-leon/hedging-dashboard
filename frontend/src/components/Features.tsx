import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import EuphoricBot from '../assets/icons/riskbot-euphoric.svg'
import HealthyBot from '../assets/icons/riskbot-healthy.svg'
import NervousBot from '../assets/icons/riskbot-nervous.svg'
import StressedBot from '../assets/icons/riskbot-stressed.svg'

const features = [
  {
    category: "Portfolio Management",
    title: "Track your holdings in real-time",
    details:
      "Add stocks by symbol or dollar amount. View live prices, gains/losses, and portfolio stats. Your portfolio updates automatically with current market data from yfinance.",
    image: HealthyBot,
    tutorialLink: "#",
  },
  {
    category: "Volatility Analysis",
    title: "Understand your portfolio's risk",
    details:
      "Get 30-day historical volatility for each stock. RiskBot calculates weighted average volatility across your entire portfolio and visualizes it with 5 emotional states from calm to critical.",
    image: NervousBot,
    tutorialLink: "#",
  },
  {
    category: "Hedging Strategies",
    title: "Visualize protection strategies",
    details:
      "Explore collar strategies, protective puts, and bear put spreads. Interactive payoff charts show exactly how each strategy affects your profit/loss at different stock prices.",
    image: EuphoricBot,
    tutorialLink: "#",
  },
  {
    category: "RiskBot Companion",
    title: "Your portfolio health at a glance",
    details:
      "Meet RiskBot - an animated pixel-art mascot that reacts to your portfolio's volatility. From happy bouncing (low risk) to worried shaking (high risk), RiskBot makes risk management engaging and intuitive.",
    image: StressedBot,
    tutorialLink: "#",
  },
];

const Features = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-6xl w-full py-10 px-6">
        <h2 className="text-4xl md:text-[2.75rem] md:leading-[1.2] font-semibold tracking-[-0.03em] sm:max-w-xl text-pretty sm:mx-auto sm:text-center">
          Smart Portfolio Risk Management
        </h2>
        <p className="mt-2 text-muted-foreground text-lg sm:text-xl sm:text-center">
          Track, analyze, and protect your investments with real-time data and interactive visualizations.
        </p>
        <div className="mt-8 md:mt-16 w-full mx-auto space-y-20">
          {features.map((feature) => (
            <div
              key={feature.category}
              className="flex flex-col md:flex-row items-center gap-x-12 gap-y-6 md:even:flex-row-reverse"
            >
              <div className="w-full aspect-[4/3] bg-muted rounded-xl border border-border/50 basis-1/2 flex items-center justify-center p-12">
                <img
                  src={feature.image}
                  alt={`${feature.category} illustration`}
                  className="w-full max-w-[300px] h-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="basis-1/2 shrink-0">
                <span className="uppercase font-medium text-sm text-muted-foreground">
                  {feature.category}
                </span>
                <h4 className="my-3 text-2xl font-semibold tracking-tight">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground">{feature.details}</p>
                <Button size="lg" className="mt-6 rounded-full gap-3">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;