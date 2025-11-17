import { Button } from "./ui/button"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { LogOut, User, Settings } from "lucide-react"

const Navbar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 bg-primary rounded-md"></div>
          <Link to="/" className="font-bold text-xl">HedgeDash</Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Portfolio
              </a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Strategies
              </a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Analytics
              </a>
            </>
          ) : (
            <>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Strategies
              </a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{user.user_metadata?.name || user.email}</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar