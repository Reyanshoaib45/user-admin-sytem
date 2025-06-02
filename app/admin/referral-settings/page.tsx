"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Gift, DollarSign, Users, Calendar, Save } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function ReferralSettingsContent() {
  const { state, dispatch } = useApp()
  const { user } = useAuth("admin")
  const [settings, setSettings] = useState(state.referralSettings)
  const [isSaving, setIsSaving] = useState(false)

  if (!user) return null

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    dispatch({ type: "UPDATE_REFERRAL_SETTINGS", payload: settings })
    setIsSaving(false)
  }

  const totalReferrals = state.referrals.length
  const activeReferrals = state.referrals.filter((r) => r.status === "activated").length
  const totalBonusPaid = state.payments
    .filter((p) => p.type === "referral_bonus" && p.status === "processed")
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4 lg:py-6">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Referral Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{totalReferrals}</div>
                <div className="text-sm text-gray-600">Total Referrals</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <Gift className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{activeReferrals}</div>
                <div className="text-sm text-gray-600">Active Referrals</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">${totalBonusPaid}</div>
                <div className="text-sm text-gray-600">Total Bonuses Paid</div>
              </CardContent>
            </Card>
          </div>

          {/* Settings */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="text-white flex items-center">
                <Gift className="h-6 w-6 mr-2" />
                Referral Program Configuration
              </CardTitle>
              <CardDescription className="text-purple-100">
                Configure the referral program settings and bonus structure
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Enable/Disable Referral Program */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Enable Referral Program</h3>
                  <p className="text-sm text-gray-600">Turn on/off the entire referral system</p>
                </div>
                <Switch
                  checked={settings.isEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, isEnabled: checked })}
                />
              </div>

              {settings.isEnabled && (
                <>
                  {/* Bonus Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="bonusAmount" className="text-sm font-medium text-gray-700">
                      Referral Bonus Amount ($)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="bonusAmount"
                        type="number"
                        min="0"
                        step="10"
                        value={settings.bonusAmount}
                        onChange={(e) => setSettings({ ...settings, bonusAmount: Number(e.target.value) })}
                        className="pl-10"
                        placeholder="500"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Amount paid to referrer when referred user becomes active</p>
                  </div>

                  {/* Minimum Active Days */}
                  <div className="space-y-2">
                    <Label htmlFor="minimumDays" className="text-sm font-medium text-gray-700">
                      Minimum Active Days
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="minimumDays"
                        type="number"
                        min="1"
                        max="365"
                        value={settings.minimumActiveDays}
                        onChange={(e) => setSettings({ ...settings, minimumActiveDays: Number(e.target.value) })}
                        className="pl-10"
                        placeholder="30"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Number of days a referred user must be active before bonus is paid
                    </p>
                  </div>

                  {/* Max Referrals Per User */}
                  <div className="space-y-2">
                    <Label htmlFor="maxReferrals" className="text-sm font-medium text-gray-700">
                      Maximum Referrals Per User (Monthly)
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="maxReferrals"
                        type="number"
                        min="1"
                        max="50"
                        value={settings.maxReferralsPerUser}
                        onChange={(e) => setSettings({ ...settings, maxReferralsPerUser: Number(e.target.value) })}
                        className="pl-10"
                        placeholder="5"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Maximum number of referrals each user can make per month</p>
                  </div>

                  {/* Preview */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3">Referral Program Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-blue-800">${settings.bonusAmount}</div>
                        <div className="text-blue-600">Bonus per Referral</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-800">{settings.minimumActiveDays} days</div>
                        <div className="text-green-600">Minimum Activity</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-purple-800">{settings.maxReferralsPerUser}</div>
                        <div className="text-purple-600">Monthly Limit</div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Projection */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-orange-900 mb-2">Cost Projection</h4>
                    <div className="text-sm text-orange-700">
                      <p>
                        • If all {state.users.filter((u) => u.role === "user").length} users refer{" "}
                        {settings.maxReferralsPerUser} people monthly:
                      </p>
                      <p className="font-bold">
                        Maximum monthly cost: $
                        {state.users.filter((u) => u.role === "user").length *
                          settings.maxReferralsPerUser *
                          settings.bonusAmount}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Referral Settings
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

export default function ReferralSettingsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ReferralSettingsContent />
    </ProtectedRoute>
  )
}
