import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { supabase } from "../../lib/supabase"
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()

  const passwordRequirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    match: password === confirmPassword && password.length > 0
  }

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (!email || !password || !confirmPassword || !name) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        setSuccess("Account created successfully! Please check your email to confirm your account.")
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        <CardDescription className="text-center">
          Enter your information to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {password.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Password Requirements:</p>
              <div className="space-y-1 text-xs">
                <div className={`flex items-center gap-2 ${passwordRequirements.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {passwordRequirements.length ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border" />}
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-2 ${passwordRequirements.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {passwordRequirements.uppercase ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border" />}
                  One uppercase letter
                </div>
                <div className={`flex items-center gap-2 ${passwordRequirements.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {passwordRequirements.lowercase ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border" />}
                  One lowercase letter
                </div>
                <div className={`flex items-center gap-2 ${passwordRequirements.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {passwordRequirements.number ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border" />}
                  One number
                </div>
                {confirmPassword.length > 0 && (
                  <div className={`flex items-center gap-2 ${passwordRequirements.match ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordRequirements.match ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    Passwords match
                  </div>
                )}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || !isPasswordValid}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}