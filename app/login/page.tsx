"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from "@/lib/context/app-context"
import { Eye, EyeOff, Loader2, Sparkles, AlertCircle, UserPlus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { state, dispatch } = useApp()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (!email || !password || !role) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    // Find user by email first, then validate role and password
    const foundUser = state.users.find((user) => user.email.toLowerCase() === email.toLowerCase())

    // Check if user exists
    if (!foundUser) {
      setError("Invalid email or user not found")
      setIsLoading(false)
      return
    }

    // Check if role matches
    if (foundUser.role !== role) {
      setError("Invalid role selected for this user")
      setIsLoading(false)
      return
    }

    // Check password
    if (foundUser.password !== password) {
      setError("Invalid password")
      setIsLoading(false)
      return
    }

    // Check user status
    if (foundUser.status === "inactive") {
      setError(foundUser.disableMessage || "Your account is inactive. Please contact administrator.")
      setIsLoading(false)
      return
    }

    if (foundUser.status === "pending") {
      setError("Your account is pending approval. Please contact HR at 03199759407.")
      setIsLoading(false)
      return
    }

    // Successful login
    dispatch({ type: "SET_CURRENT_USER", payload: foundUser })
    localStorage.setItem("currentUser", JSON.stringify(foundUser))

    // Redirect based on role
    if (foundUser.role === "admin") {
      router.push("/admin")
    } else if (foundUser.role === "hr") {
      router.push("/hr")
    } else {
      router.push("/user")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>

      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-float"></div>
      <div
        className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-xl animate-float"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/4 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      <Card className="w-full max-w-md relative z-10 glass-morphism border-white/20 shadow-2xl animate-pulse-glow">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-float">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold gradient-text">Welcome Back</CardTitle>
          <CardDescription className="text-gray-300">Enter your credentials to access the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 pr-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-white/90">
                Role
              </Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="all-in-department">All in Department</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="HR">Human Resources</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="IT">Information Technology</SelectItem>
                  <SelectItem value="Subuser">Subuser</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-white/60 text-sm mb-2">Don't have an account?</p>
            <Link href="/signup">
              <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center text-white/60 text-sm z-10">
        <p>For creation of account contact our HR 03199759407</p>
      </footer>
    </div>
  )
}
