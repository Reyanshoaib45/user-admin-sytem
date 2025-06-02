"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { DollarSign, Clock, Target, TrendingUp, Award, CheckCircle, ArrowRight, Calculator, Gift } from "lucide-react"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function OnboardingContent() {
  const { state, dispatch } = useApp()
  const { user } = useAuth("user")
  const router = useRouter()
  const [dailyHours, setDailyHours] = useState([8])
  const [dailyTaskTarget, setDailyTaskTarget] = useState([5])
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    if (user?.isOnboarded) {
      router.push("/user")
    }
  }, [user, router])

  if (!user || user.isOnboarded) return null

  const handleCompleteOnboarding = async () => {
    setIsCompleting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const updatedUser = {
      ...user,
      isOnboarded: true,
      workPreferences: {
        dailyHours: dailyHours[0],
        dailyTaskTarget: dailyTaskTarget[0],
      },
    }

    dispatch({ type: "UPDATE_USER", payload: updatedUser })
    router.push("/user")
  }

  // Calculate potential earnings
  const dailyEarnings =
    dailyHours[0] * state.paymentInfo.hourlyRate + dailyTaskTarget[0] * state.bonusSettings.taskCompletionBonus
  const monthlyEarnings = dailyEarnings * 22 // 22 working days

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text">Welcome to the Team!</h1>
            <p className="text-gray-600 mt-2">Let's set up your work preferences and show you how you can earn</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Payment Information */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardTitle className="text-white flex items-center">
                <DollarSign className="h-6 w-6 mr-2" />
                Your Earning Structure
              </CardTitle>
              <CardDescription className="text-green-100">Understanding how you get paid for your work</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">${state.paymentInfo.baseSalary}</div>
                  <div className="text-sm text-blue-600">Base Monthly Salary</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-2xl font-bold text-purple-800">${state.paymentInfo.hourlyRate}</div>
                  <div className="text-sm text-purple-600">Per Hour Rate</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <div className="text-2xl font-bold text-orange-800">${state.paymentInfo.overtimeRate}</div>
                  <div className="text-sm text-orange-600">Overtime Rate</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">${state.bonusSettings.taskCompletionBonus}</div>
                  <div className="text-sm text-green-600">Task Completion Bonus</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bonus System */}
          {state.bonusSettings.isEnabled && (
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="text-white flex items-center">
                  <Award className="h-6 w-6 mr-2" />
                  Bonus Opportunities
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Earn extra rewards for exceptional performance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-blue-800">${state.bonusSettings.taskCompletionBonus}</div>
                    <div className="text-sm text-blue-600">Regular Completion</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-green-800">
                      $
                      {Math.round(
                        state.bonusSettings.taskCompletionBonus * state.bonusSettings.earlyCompletionMultiplier,
                      )}
                    </div>
                    <div className="text-sm text-green-600">Early Completion</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <Gift className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-purple-800">
                      $
                      {Math.round(state.bonusSettings.taskCompletionBonus * state.bonusSettings.qualityBonusMultiplier)}
                    </div>
                    <div className="text-sm text-purple-600">Quality Bonus</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Referral Program */}
          {state.referralSettings.isEnabled && (
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
                <CardTitle className="text-white flex items-center">
                  <Gift className="h-6 w-6 mr-2" />
                  Referral Program
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  Earn ${state.referralSettings.bonusAmount} for each successful referral
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-indigo-900">Your Referral Code</h4>
                      <p className="text-sm text-indigo-700">Share this code with friends and family</p>
                    </div>
                    <Badge className="bg-indigo-600 text-white text-lg px-4 py-2">{user.referralCode}</Badge>
                  </div>
                  <div className="mt-4 text-sm text-indigo-700">
                    <p>• Refer someone and earn ${state.referralSettings.bonusAmount} when they become active</p>
                    <p>• Maximum {state.referralSettings.maxReferralsPerUser} referrals per month</p>
                    <p>• Bonus paid after {state.referralSettings.minimumActiveDays} days of activity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Preferences */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardTitle className="text-white flex items-center">
                <Target className="h-6 w-6 mr-2" />
                Set Your Work Preferences
              </CardTitle>
              <CardDescription className="text-blue-100">
                Tell us about your work goals and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Daily Hours */}
              <div className="space-y-4">
                <Label className="text-lg font-medium flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Daily Working Hours: {dailyHours[0]} hours
                </Label>
                <Slider value={dailyHours} onValueChange={setDailyHours} max={12} min={4} step={1} className="w-full" />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>4 hours (Part-time)</span>
                  <span>8 hours (Full-time)</span>
                  <span>12 hours (Maximum)</span>
                </div>
              </div>

              {/* Daily Task Target */}
              <div className="space-y-4">
                <Label className="text-lg font-medium flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Daily Task Target: {dailyTaskTarget[0]} tasks
                </Label>
                <Slider
                  value={dailyTaskTarget}
                  onValueChange={setDailyTaskTarget}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>1 task (Light)</span>
                  <span>5 tasks (Moderate)</span>
                  <span>10 tasks (Intensive)</span>
                </div>
              </div>

              {/* Earnings Calculator */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-4 flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Your Potential Earnings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800">${dailyEarnings}</div>
                    <div className="text-sm text-green-600">Daily Earnings</div>
                    <div className="text-xs text-green-500 mt-1">
                      {dailyHours[0]}h × ${state.paymentInfo.hourlyRate} + {dailyTaskTarget[0]} × $
                      {state.bonusSettings.taskCompletionBonus}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800">${monthlyEarnings}</div>
                    <div className="text-sm text-green-600">Monthly Earnings</div>
                    <div className="text-xs text-green-500 mt-1">Based on 22 working days</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complete Setup */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Get Started?</h3>
              <p className="text-gray-600 mb-6">
                Complete your setup and start earning with your personalized work preferences
              </p>
              <Button
                onClick={handleCompleteOnboarding}
                disabled={isCompleting}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 text-lg"
              >
                {isCompleting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Setting up your account...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <OnboardingContent />
    </ProtectedRoute>
  )
}
