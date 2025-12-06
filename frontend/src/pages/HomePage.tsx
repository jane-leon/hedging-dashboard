import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
    </div>
  )
}