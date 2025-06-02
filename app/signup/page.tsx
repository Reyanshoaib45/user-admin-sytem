"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/lib/context/app-context"
import { Loader2, UserPlus, CheckCircle, AlertCircle, ArrowLeft, Gift } from "lucide-react"
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
  const [referrerInfo, setReferrerInfo] = useState<{ name: string; bonus: number } | null>(null)
  const { state, dispatch } = useApp()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get("ref")
    if (refCode) {
      setReferralCode(refCode)
      validateReferralCode(refCode)
    }
  }, [searchParams])

  const validateReferralCode = (code: string) => {
    if (!code) {
      setReferrerInfo(null)
      return
    }

    const referrer = state.users.find((user) => user.referralCode === code.toUpperCase())
    if (referrer && state.referralSettings.isEnabled) {
      setReferrerInfo({
        name: referrer.name,
        bonus: state.referralSettings.bonusAmount,
      })
    } else {
      setReferrerInfo(null)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (!email || !phone) {
      setError("Please fill in all fields")
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

    // Validate phone format (basic validation)
    const phoneRegex = /^[0-9]{11}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      setError("Please enter a valid 11-digit phone number")
      setIsLoading(false)
      return
    }

    // Check if email already exists in users or signup requests
    const existingUser = state.users.find((user) => user.email.toLowerCase() === email.toLowerCase())
    const existingRequest = state.signupRequests.find((req) => req.email.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      setError("An account with this email already exists")
      setIsLoading(false)
      return
    }

    if (existingRequest && existingRequest.status === "pending") {
      setError("A signup request with this email is already pending approval")
      setIsLoading(false)
      return
    }

    // Validate referral code if provided
    let referrerId: string | undefined
    if (referralCode) {
      const referrer = state.users.find((user) => user.referralCode === referralCode.toUpperCase())
      if (!referrer) {
        setError("Invalid referral code")
        setIsLoading(false)
        return
      }
      referrerId = referrer.id
    }

    // Create signup request
    const newSignupRequest: SignupRequest = {
      id: `signup-${Date.now()}`,
      email: email.toLowerCase(),
      phone: phone.replace(/\s/g, ""),
      status: "pending",
      submittedDate: new Date().toISOString().split("T")[0],
      referralCode: referralCode.toUpperCase() || undefined,
      referredBy: referrerId,
    }

    dispatch({ type: "ADD_SIGNUP_REQUEST", payload: newSignupRequest })

    // If there's a valid referral code, create the referral record
    if (referrerId && state.referralSettings.isEnabled) {
      const referrer = state.users.find((user) => user.id === referrerId)!
      const newReferral = {
        id: `ref-${Date.now()}`,
        referrerId: referrerId,
        referrerName: referrer.name,
        referredEmail: email.toLowerCase(),
        referralCode: referralCode.toUpperCase(),
        status: "signed_up" as const,
        signupDate: new Date().toISOString().split("T")[0],
      }
      dispatch({ type: "ADD_REFERRAL", payload: newReferral })
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
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-blue-900 to-indigo-900"></div>

        <Card className="w-full max-w-md relative z-10 glass-morphism border-white/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
            <p className="text-white/80 mb-4">
              Your signup request has been submitted successfully. Our HR team will review your application and contact
              you soon.
            </p>
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <p className="text-white/90 text-sm">
                <strong>Contact HR:</strong> 03199759407
              </p>
              <p className="text-white/90 text-sm">
                <strong>Email:</strong> {email}
              </p>
              <p className="text-white/90 text-sm">
                <strong>Phone:</strong> {phone}
              </p>
              {referrerInfo && (
                <p className="text-white/90 text-sm">
                  <strong>Referred by:</strong> {referrerInfo.name}
                </p>
              )}
            </div>
            <p className="text-white/60 text-sm">Redirecting to login page...</p>
          </CardContent>
        </Card>

        <footer className="absolute bottom-4 text-center text-white/60 text-sm z-10">
          <p>For creation of account contact our HR 03199759407</p>
        </footer>
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
          <div className="flex items-center justify-between">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center animate-float">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold gradient-text">Create Account</CardTitle>
          <CardDescription className="text-gray-300">
            Submit your details and our HR team will contact you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Referral Info */}
          {referrerInfo && (
            <Alert className="bg-green-50 border-green-200">
              <Gift className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Great!</strong> You were referred by {referrerInfo.name}. They'll earn ${referrerInfo.bonus}{" "}
                when you become active!
              </AlertDescription>
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
                placeholder="Enter your email address"
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
              />
              <p className="text-white/60 text-xs">Enter 11-digit phone number</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="referralCode" className="text-white/90">
                Referral Code (Optional)
              </Label>
              <Input
                id="referralCode"
                type="text"
                value={referralCode}
                onChange={(e) => {
                  setReferralCode(e.target.value.toUpperCase())
                  validateReferralCode(e.target.value)
                }}
                placeholder="Enter referral code"
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-green-400"
              />
              {state.referralSettings.isEnabled && (
                <p className="text-white/60 text-xs">
                  Have a referral code? Enter it to help your referrer earn ${state.referralSettings.bonusAmount}!
                </p>
              )}
            </div>

            <div className="bg-white/10 rounded-lg p-4 space-y-2">
              <h4 className="text-white font-medium text-sm">What happens next?</h4>
              <ul className="text-white/80 text-xs space-y-1">
                <li>• Your request will be reviewed by our HR team</li>
                <li>• HR will contact you within 24-48 hours</li>
                <li>• Once approved, you'll receive login credentials</li>
                <li>• You can then access the system with your account</li>
                {referrerInfo && <li>• Your referrer will earn a bonus when you become active</li>}
              </ul>
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
            <p className="text-white/60 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-green-400 hover:text-green-300 underline">
                Sign In
              </Link>
            </p>
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
