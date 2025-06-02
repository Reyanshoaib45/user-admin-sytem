"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Gift, Users, DollarSign, Share2, Copy, CheckCircle, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function ReferralsContent() {
  const { state, dispatch } = useApp()
  const { user } = useAuth("user")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!user) return null

  const userReferrals = state.referrals.filter((ref) => ref.referrerId === user.id)
  const referralPayments = state.payments.filter(
    (payment) => payment.userId === user.id && payment.type === "referral_bonus",
  )

  const totalEarnings = referralPayments
    .filter((p) => p.status === "processed")
    .reduce((sum, payment) => sum + payment.amount, 0)

  const pendingEarnings = referralPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, payment) => sum + payment.amount, 0)

  const handleSendReferral = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !state.referralSettings.isEnabled) return

    setIsSubmitting(true)

    // Check if user has reached monthly limit
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyReferrals = userReferrals.filter((ref) => {
      const refDate = new Date(ref.signupDate || Date.now())
      return refDate.getMonth() === currentMonth && refDate.getFullYear() === currentYear
    })

    if (monthlyReferrals.length >= state.referralSettings.maxReferralsPerUser) {
      alert(`You've reached the monthly limit of ${state.referralSettings.maxReferralsPerUser} referrals`)
      setIsSubmitting(false)
      return
    }

    // Check if email already referred
    const existingReferral = userReferrals.find((ref) => ref.referredEmail.toLowerCase() === email.toLowerCase())
    if (existingReferral) {
      alert("You've already referred this email address")
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newReferral = {
      id: `ref-${Date.now()}`,
      referrerId: user.id,
      referrerName: user.name,
      referredEmail: email.toLowerCase(),
      referralCode: user.referralCode!,
      status: "pending" as const,
    }

    dispatch({ type: "ADD_REFERRAL", payload: newReferral })
    setEmail("")
    setIsSubmitting(false)
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode!)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyReferralLink = () => {
    const link = `${window.location.origin}/signup?ref=${user.referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!state.referralSettings.isEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <Link href="/user">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Referral Program</h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card className="text-center p-8">
            <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Referral Program Not Available</h2>
            <p className="text-gray-600">The referral program is currently disabled by administration.</p>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/user">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Referral Program</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{userReferrals.length}</div>
                <div className="text-sm text-gray-600">Total Referrals</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {userReferrals.filter((r) => r.status === "activated").length}
                </div>
                <div className="text-sm text-gray-600">Active Referrals</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">${totalEarnings}</div>
                <div className="text-sm text-gray-600">Total Earned</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">${pendingEarnings}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
          </div>

          {/* Referral Code & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="text-white flex items-center">
                  <Gift className="h-5 w-5 mr-2" />
                  Your Referral Code
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Share this code to earn ${state.referralSettings.bonusAmount} per referral
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{user.referralCode}</div>
                  <div className="flex space-x-2 justify-center">
                    <Button onClick={copyReferralCode} variant="outline" size="sm">
                      {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copied ? "Copied!" : "Copy Code"}
                    </Button>
                    <Button onClick={copyReferralLink} variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-sm">
                  <h4 className="font-semibold text-purple-900 mb-2">How it works:</h4>
                  <ul className="text-purple-700 space-y-1">
                    <li>• Share your code with friends and family</li>
                    <li>• They use it during signup</li>
                    <li>• You earn ${state.referralSettings.bonusAmount} when they become active</li>
                    <li>• Bonus paid after {state.referralSettings.minimumActiveDays} days</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Send Referral
                </CardTitle>
                <CardDescription className="text-blue-100">Invite someone directly via email</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSendReferral} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="friend@example.com"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4 mr-2" />
                        Send Referral
                      </>
                    )}
                  </Button>
                </form>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Monthly limit: {state.referralSettings.maxReferralsPerUser} referrals</p>
                  <p>
                    Used this month:{" "}
                    {
                      userReferrals.filter((ref) => {
                        const refDate = new Date(ref.signupDate || Date.now())
                        const now = new Date()
                        return refDate.getMonth() === now.getMonth() && refDate.getFullYear() === now.getFullYear()
                      }).length
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referrals Table */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Your Referrals ({userReferrals.length})
              </CardTitle>
              <CardDescription className="text-green-100">Track your referral progress and earnings</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {userReferrals.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No referrals yet. Start sharing your code!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Signup Date</TableHead>
                        <TableHead>Activation Date</TableHead>
                        <TableHead>Bonus</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userReferrals.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell className="font-medium">{referral.referredEmail}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${
                                referral.status === "bonus_paid"
                                  ? "bg-green-500"
                                  : referral.status === "activated"
                                    ? "bg-blue-500"
                                    : referral.status === "signed_up"
                                      ? "bg-yellow-500"
                                      : "bg-gray-500"
                              } text-white border-0 capitalize`}
                            >
                              {referral.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>{referral.signupDate || "Not yet"}</TableCell>
                          <TableCell>{referral.activationDate || "Not yet"}</TableCell>
                          <TableCell>
                            {referral.bonusAmount ? (
                              <span className="text-green-600 font-medium">${referral.bonusAmount}</span>
                            ) : (
                              <span className="text-gray-400">Pending</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function ReferralsPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <ReferralsContent />
    </ProtectedRoute>
  )
}
