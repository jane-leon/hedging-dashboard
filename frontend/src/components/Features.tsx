import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

const features = [
  {
    category: "Risk Management",
    title: "Visualize and minimize portfolio risk",
    details:
      "Advanced VaR calculations and Monte Carlo simulations help you understand your portfolio's risk profile. See potential losses and gains across different market scenarios with real-time visualizations.",
    tutorialLink: "#",
  },
  {
    category: "Hedging Strategies",
    title: "Implement professional protection strategies",
    details:
      "Choose from collar strategies, protective puts, and bear put spreads. Interactive charts show you exactly how each strategy affects your profit and loss profile before you commit.",
    tutorialLink: "#",
  },
  {
    category: "Portfolio Analytics",
    title: "Track performance with precision",
    details:
      "Monitor your holdings with real-time market data integration. Get instant calculations for beta, Sharpe ratio, volatility, and other key metrics that matter to sophisticated investors.",
    tutorialLink: "#",
  },
  {
    category: "Gamification",
    title: "Stay engaged with your investments",
    details:
      "Your virtual pet Hedge-y reflects your portfolio's health and risk management discipline. Earn achievements for good hedging practices and maintain streaks of smart risk management.",
    tutorialLink: "#",
  },
  {
    category: "Scenario Testing",
    title: "Stress test your strategies",
    details:
      "Run historical backtests and scenario analysis to see how your hedging strategies would have performed during market crashes, bull runs, and volatile periods.",
    tutorialLink: "#",
  },
];

const Features = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-6xl w-full py-10 px-6">
        <h2 className="text-4xl md:text-[2.75rem] md:leading-[1.2] font-semibold tracking-[-0.03em] sm:max-w-xl text-pretty sm:mx-auto sm:text-center">
          Master Your Portfolio Risk
        </h2>
        <p className="mt-2 text-muted-foreground text-lg sm:text-xl sm:text-center">
          Professional-grade tools for intelligent risk management and hedging strategies.
        </p>
        <div className="mt-8 md:mt-16 w-full mx-auto space-y-20">
          {features.map((feature) => (
            <div
              key={feature.category}
              className="flex flex-col md:flex-row items-center gap-x-12 gap-y-6 md:even:flex-row-reverse"
            >
              <div className="w-full aspect-[4/3] bg-muted rounded-xl border border-border/50 basis-1/2" />
              <div className="basis-1/2 shrink-0">
                <span className="uppercase font-medium text-sm text-muted-foreground">
                  {feature.category}
                </span>
                <h4 className="my-3 text-2xl font-semibold tracking-tight">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground">{feature.details}</p>
                <Button size="lg" className="mt-6 rounded-full gap-3">
                  Learn More <ArrowRight className="h-4 w-4" />
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