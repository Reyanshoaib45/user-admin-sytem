"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/lib/context/app-context"
import { UserPlus, Loader2, CheckCircle, AlertCircle, Gift } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import type { SignupRequest } from "@/lib/context/app-context"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const { state, dispatch } = useApp()
  const router = useRouter()

  // Check for referral code in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const refCode = urlParams.get("ref")
    if (refCode) {
      setReferralCode(refCode)
    }
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate form data
    if (!email || !phone) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{11}$/
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 11-digit phone number")
      setIsLoading(false)
      return
    }

    // Check if email already exists
    const existingUser = state.users.find((user) => user.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      setError("A user with this email already exists")
      setIsLoading(false)
      return
    }

    // Check if signup request already exists
    const existingRequest = state.signupRequests.find((req) => req.email.toLowerCase() === email.toLowerCase())
    if (existingRequest) {
      setError("A signup request with this email already exists")
      setIsLoading(false)
      return
    }

    // Validate referral code if provided
    let referredBy = undefined
    if (referralCode) {
      const referrer = state.users.find((user) => user.referralCode === referralCode.toUpperCase())
      if (!referrer) {
        setError("Invalid referral code")
        setIsLoading(false)
        return
      }
      referredBy = referrer.id
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Create signup request
    const signupRequest: SignupRequest = {
      id: `signup-${Date.now()}`,
      email: email.toLowerCase(),
      phone,
      status: "pending",
      submittedDate: new Date().toISOString().split("T")[0],
      referralCode: referralCode.toUpperCase() || undefined,
      referredBy,
    }

    dispatch({ type: "ADD_SIGNUP_REQUEST", payload: signupRequest })

    // If this is a referral, create referral record
    if (referredBy && referralCode) {
      const referrer = state.users.find((user) => user.id === referredBy)
      if (referrer) {
        const referral = {
          id: `referral-${Date.now()}`,
          referrerId: referredBy,
          referrerName: referrer.name,
          referredEmail: email.toLowerCase(),
          referralCode: referralCode.toUpperCase(),
          status: "signed_up" as const,
          signupDate: new Date().toISOString().split("T")[0],
        }
        dispatch({ type: "ADD_REFERRAL", payload: referral })
      }
    }

    setIsLoading(false)
    setIsSuccess(true)

    // Redirect after success
    setTimeout(() => {
      router.push("/login")
    }, 3000)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-blue-900 to-purple-900"></div>
        <Card className="w-full max-w-md relative z-10 glass-morphism border-white/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
            <p className="text-gray-300 mb-4">
              Your signup request has been sent to HR for approval. You will be contacted at {phone} once approved.
            </p>
            {referralCode && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center space-x-2 text-green-300">
                  <Gift className="h-4 w-4" />
                  <span className="text-sm">Referral code applied: {referralCode}</span>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-400">Redirecting to login page...</p>
          </CardContent>
        </Card>
      </div>
    )
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

      <Card className="w-full max-w-md relative z-10 glass-morphism border-white/20 shadow-2xl animate-pulse-glow">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center animate-float">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold gradient-text">Create Account</CardTitle>
          <CardDescription className="text-gray-300">Request access to the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-green-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/90">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03199759407"
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-green-400"
                required
                maxLength={11}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referralCode" className="text-white/90">
                Referral Code (Optional)
              </Label>
              <div className="relative">
                <Input
                  id="referralCode"
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Enter referral code"
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-green-400 pl-10"
                />
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              </div>
              {referralCode && (
                <p className="text-xs text-green-300">✓ Referral code will be validated upon submission</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-white/60 text-sm mb-2">Already have an account?</p>
            <Link href="/login">
              <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                Sign In
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
