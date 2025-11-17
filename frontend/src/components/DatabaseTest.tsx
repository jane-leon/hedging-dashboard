import { useEffect, useState } from 'react'
import { DatabaseService } from '../services/database'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function DatabaseTest() {
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await DatabaseService.getPortfolios()
      setPortfolios(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to database')
    } finally {
      setLoading(false)
    }
  }

  const createTestPortfolio = async () => {
    try {
      setLoading(true)
      setError(null)
      await DatabaseService.createPortfolio({
        name: 'Test Portfolio',
        description: 'A test portfolio created from the frontend',
        is_public: false
      })
      await testConnection()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create portfolio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testConnection} disabled={loading}>
            Test Connection
          </Button>
          <Button onClick={createTestPortfolio} disabled={loading}>
            Create Test Portfolio
          </Button>
        </div>
        
        {loading && <p>Loading...</p>}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div>
          <h3 className="font-semibold mb-2">Portfolios ({portfolios.length})</h3>
          {portfolios.length > 0 ? (
            <ul className="space-y-2">
              {portfolios.map((portfolio) => (
                <li key={portfolio.id} className="bg-gray-50 p-2 rounded">
                  <strong>{portfolio.name}</strong>
                  <br />
                  <span className="text-sm text-gray-600">{portfolio.description}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No portfolios found</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}