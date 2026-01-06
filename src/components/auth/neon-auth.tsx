"use client"

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { useState, useEffect, useCallback} from "react"
import { useRouter, usePathname} from "next/navigation"
import { Input} from "@/components/ui/input"
import { Label} from "@/components/ui/label"
import { Alert, AlertDescription} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CalendarIcon, AlertCircle, CheckCircle, Lock, Crown, Loader2} from "lucide-react"
import { format, subYears} from "date-fns"
import { motion} from "framer-motion"
import type { User as AppUser } from "@/lib/neon/types"


export function NeonAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [user, setUser] = useState<AppUser | null>(null)
  
  // Enhanced sign-up form state
  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  })
  const [signUpErrors, setSignUpErrors] = useState<Record<string, string>>({})
  const [signUpLoading, setSignUpLoading] = useState(false)

  // Determine if we're on signin or signup page
  const isSignInPage = pathname === '/signin' || pathname === '/login' // Handle likely redirects
  const isSignUpPage = pathname === '/signup'

  // Verify JWT token and set user
  const verifyToken = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser((data.user ?? data) as AppUser)
        router.push("/dashboard")
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('authToken')
      }
    } catch (error) {
      logError('Token verification failed:', error)
      localStorage.removeItem('authToken')
    }
  }, [router])

  // Initialize auth on client side only
  useEffect(() => {
    setIsClient(true)
    
    // Check if user is already logged in
    const token = localStorage.getItem('authToken')
    if (token) {
      // Verify token and set user
      verifyToken(token)
    }
  }, [verifyToken])

  // Redirect to dashboard when user is authenticated
  useEffect(() => {
    if (user && isClient) {
      router.push("/dashboard")
    }
  }, [user, router, isClient])

  const handleSignIn = async (_formData?: unknown) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      if (!email || !password) {
        throw new Error("Please enter both email/username and password")
      }
      
      // Determine if input is email or username
      const isEmail = email.includes('@')
      const identifier = isEmail ? email : email.toLowerCase()
      
      // Call your real authentication API
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          identifier, // Send as identifier (can be email or username)
          password,
          isEmail // Flag to indicate if it's email or username
        }),
      })
      
      const contentType = response.headers.get('content-type') || ''
      if (!response.ok) {
        // Attempt to parse JSON, but fall back to text/HTML safely
        let message = 'Sign in failed'
        try {
          if (contentType.includes('application/json')) {
            const errorData = await response.json()
            message = errorData.error || message
          } else {
            const text = await response.text()
            // Extract a short snippet from potential HTML
            message = text?.slice(0, 140) || message
          }
        } catch (_) {
          // ignore parsing errors
        }
        throw new Error(message)
      }

      const data = contentType.includes('application/json')
        ? await response.json()
        : { token: undefined, user: undefined }
      
      // Store the token (you might want to use a more secure method)
      localStorage.setItem('authToken', data.token)
      
      setSuccess("Sign in successful! Redirecting to dashboard...")
      
      // Set user and redirect immediately
      setUser(data.user)
      router.push("/dashboard")
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const validateSignUpForm = () => {
    const errors: Record<string, string> = {}
    
    // First name validation
    if (!signUpData.firstName.trim()) {
      errors.firstName = "First name is required"
    } else if (signUpData.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters"
    }
    
    // Last name validation
    if (!signUpData.lastName.trim()) {
      errors.lastName = "Last name is required"
    } else if (signUpData.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters"
    }
    
    // Date of birth validation
    if (!signUpData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required"
    } else {
      const birthDate = new Date(signUpData.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      if (age < 18) {
        errors.dateOfBirth = "You must be at least 18 years old to use this app"
      }
    }
    
    // Email validation
    if (!signUpData.email) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    // Username validation
    if (!signUpData.username.trim()) {
      errors.username = "Username is required"
    } else if (signUpData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters"
    } else if (!/^[a-zA-Z0-9_]+$/.test(signUpData.username)) {
      errors.username = "Username can only contain letters, numbers, and underscores"
    }
    
    // Password validation
    if (!signUpData.password) {
      errors.password = "Password is required"
    } else if (signUpData.password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(signUpData.password)) {
      errors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
    
    // Confirm password validation
    if (!signUpData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (signUpData.password !== signUpData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }
    
    setSignUpErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSignUp = async (_formData?: unknown): Promise<{ success: boolean; error?: string }> => {
    if (!validateSignUpForm()) {
      return { success: false, error: "Please fix the form errors" }
    }
    
    setSignUpLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Call your real sign-up API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signUpData.email,
          password: signUpData.password,
          metadata: {
            full_name: `${signUpData.firstName} ${signUpData.lastName}`,
            username: signUpData.username,
            date_of_birth: signUpData.dateOfBirth,
          }
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Sign up failed')
      }
      
      const data = await response.json()
      
      // Auto-login after successful signup
      localStorage.setItem('authToken', data.token)
      setUser(data.user)
      setSuccess("Account created successfully! Welcome to SoloSuccess AI!")
      
      // Redirect to dashboard immediately
      router.push("/dashboard")
      
      return { success: true }

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setSignUpLoading(false)
    }
  }

  const handleSignUpInputChange = (field: string, value: string) => {
    setSignUpData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (signUpErrors[field]) {
      setSignUpErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  // Show loading during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-neon-cyan mx-auto mb-4" />
          <p className="text-gray-400 font-mono">Loading authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if user is authenticated (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 blur-[100px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/10 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-dark-card border border-gray-700/50 rounded-sm p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl hover:border-neon-cyan/30 transition-all duration-300">
          
          <div className="relative z-10">
            <div className="text-center mb-6">
              <motion.div
                className="inline-flex items-center space-x-2 mb-4 group"
              >
                <div className="w-12 h-12 bg-dark-bg border border-neon-cyan/50 rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(11,228,236,0.2)] group-hover:shadow-[0_0_20px_rgba(11,228,236,0.4)] transition-all">
                  <Crown className="w-6 h-6 text-neon-cyan" />
                </div>
                <span className="text-2xl font-bold font-orbitron text-white uppercase tracking-wider">
                  Solo<span className="text-neon-cyan">Success</span> AI
                </span>
              </motion.div>
              <p className="text-gray-400 font-mono text-sm">
                {isSignInPage ? "Welcome back, boss!" : "Join the empire of tomorrow"}
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <Alert className="mb-4 border-neon-magenta/50 bg-neon-magenta/10">
                <AlertCircle className="h-4 w-4 text-neon-magenta" />
                <AlertDescription className="text-neon-magenta font-mono">{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 border-neon-lime/50 bg-neon-lime/10">
                <CheckCircle className="h-4 w-4 text-neon-lime" />
                <AlertDescription className="text-neon-lime font-mono">{success}</AlertDescription>
              </Alert>
            )}

            {/* Sign In Form */}
            {isSignInPage && (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                                 <div className="space-y-2">
                   <Label htmlFor="email" className="text-sm font-bold font-mono text-neon-cyan uppercase tracking-wider">Email or Username</Label>
                   <Input
                     id="email"
                     name="email"
                     type="text"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="Enter your email or username"
                     className="bg-dark-bg border-gray-700 focus:border-neon-cyan focus:ring-neon-cyan/20"
                     required
                     autoComplete="username"
                   />
                 </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-bold font-mono text-neon-cyan uppercase tracking-wider">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-dark-bg border-gray-700 focus:border-neon-cyan focus:ring-neon-cyan/20"
                    required
                    autoComplete="current-password"
                  />
                </div>
                
                <Button
                  onClick={handleSignIn}
                  disabled={!email || !password || loading}
                  className="w-full"
                  variant="cyan"
                  type="button"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>

                {/* Forgot Password Link */}
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="text-sm text-gray-400 hover:text-neon-cyan font-mono transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="text-center mt-2">
                  <p className="text-sm text-gray-500 font-mono">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => router.push('/signup')}
                      className="text-neon-purple hover:text-neon-magenta font-bold transition-colors ml-1"
                    >
                      Sign up here
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Sign Up Form */}
            {isSignUpPage && (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-xs font-bold font-mono text-neon-cyan uppercase">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={signUpData.firstName}
                      onChange={(e) => handleSignUpInputChange("firstName", e.target.value)}
                      placeholder="First name"
                      className="bg-dark-bg border-gray-700 focus:border-neon-cyan focus:ring-neon-cyan/20"
                      required
                      autoComplete="given-name"
                    />
                    {signUpErrors.firstName && (
                      <p className="text-neon-magenta text-xs font-mono">{signUpErrors.firstName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-xs font-bold font-mono text-neon-cyan uppercase">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={signUpData.lastName}
                      onChange={(e) => handleSignUpInputChange("lastName", e.target.value)}
                      placeholder="Last name"
                      className="bg-dark-bg border-gray-700 focus:border-neon-cyan focus:ring-neon-cyan/20"
                      required
                      autoComplete="family-name"
                    />
                    {signUpErrors.lastName && (
                      <p className="text-neon-magenta text-xs font-mono">{signUpErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-xs font-bold font-mono text-neon-cyan uppercase">Date of Birth</Label>
                  <div className="relative">
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={signUpData.dateOfBirth}
                      onChange={(e) => handleSignUpInputChange("dateOfBirth", e.target.value)}
                      max={format(subYears(new Date(), 18), 'yyyy-MM-dd')}
                      className="bg-dark-bg border-gray-700 focus:border-neon-cyan focus:ring-neon-cyan/20 pr-10"
                      required
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {signUpErrors.dateOfBirth && (
                    <p className="text-neon-magenta text-xs font-mono">{signUpErrors.dateOfBirth}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold font-mono text-neon-cyan uppercase">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => handleSignUpInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className="bg-dark-bg border-gray-700 focus:border-neon-cyan focus:ring-neon-cyan/20"
                    required
                    autoComplete="email"
                  />
                  {signUpErrors.email && (
                    <p className="text-neon-magenta text-xs font-mono">{signUpErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-bold font-mono text-neon-cyan uppercase">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={signUpData.username}
                    onChange={(e) => handleSignUpInputChange("username", e.target.value)}
                    placeholder="Choose a username"
                    className="bg-dark-bg border-gray-700 focus:border-neon-cyan focus:ring-neon-cyan/20"
                    required
                    autoComplete="username"
                  />
                  {signUpErrors.username && (
                    <p className="text-neon-magenta text-xs font-mono">{signUpErrors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold font-mono text-neon-cyan uppercase">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => handleSignUpInputChange("password", e.target.value)}
                    placeholder="Create a strong password"
                    className="bg-dark-bg border-gray-700 focus:border-neon-cyan focus:ring-neon-cyan/20"
                    required
                    autoComplete="new-password"
                  />
                  {signUpErrors.password && (
                    <p className="text-neon-magenta text-xs font-mono">{signUpErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold font-mono text-neon-cyan uppercase">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => handleSignUpInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    className="bg-dark-bg border-gray-700 focus:border-neon-cyan focus:ring-neon-cyan/20"
                    required
                    autoComplete="new-password"
                  />
                  {signUpErrors.confirmPassword && (
                    <p className="text-neon-magenta text-xs font-mono">{signUpErrors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  onClick={handleSignUp}
                  disabled={signUpLoading}
                  className="w-full"
                  variant="purple"
                  type="button"
                >
                  {signUpLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500 font-mono">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => router.push('/signin')}
                      className="text-neon-cyan hover:text-neon-lime font-bold transition-colors ml-1"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
