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
      <div className="flex h-screen pt-16">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-border bg-card/30 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Compact Stock Search */}
            <div>
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">STOCK SEARCH</h3>
              <StockSearch onPortfolioUpdate={portfolioRefresh ?? undefined} />
            </div>
            
            {/* Compact Portfolio */}
            <div>
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">MY PORTFOLIO</h3>
              <Portfolio onAddHolding={setPortfolioRefresh} />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Hedging Dashboard</h1>
              <p className="text-sm text-muted-foreground">Analyze and visualize hedging strategies</p>
            </div>
            
            <HedgingStrategy />
          </div>
        </div>
      </div>
    </div>
  )
}