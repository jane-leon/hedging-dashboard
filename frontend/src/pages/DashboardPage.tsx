import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import { HedgingStrategy } from '../components/HedgingStrategy'
import { StockSearch } from '../components/StockSearch'
import { Portfolio } from '../components/Portfolio'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [portfolioRefresh, setPortfolioRefresh] = useState<(() => void) | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8">Hedging Dashboard</h1>
        
        <div className="space-y-12">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Stock Search</h2>
            <StockSearch onPortfolioUpdate={portfolioRefresh ?? undefined} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">My Portfolio</h2>
            <Portfolio onAddHolding={setPortfolioRefresh} />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Hedging Strategies</h2>
            <HedgingStrategy />
          </div>
        </div>
      </div>
    </div>
  )
}