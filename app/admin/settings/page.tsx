"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Settings, DollarSign, Clock, Users, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function SettingsPageContent() {
  const { state, dispatch } = useApp()
  const { user } = useAuth("admin")
  const [settings, setSettings] = useState({
    proxyRate: state.proxyRate.toString(),
    warningMessage: state.warningMessage,
    baseSalary: state.paymentInfo.baseSalary.toString(),
    hourlyRate: state.paymentInfo.hourlyRate.toString(),
    overtimeRate: state.paymentInfo.overtimeRate.toString(),
    taskCompletionRate: state.paymentInfo.taskCompletionRate.toString(),
    workingHoursStart: state.attendanceSettings.workingHours.start,
    workingHoursEnd: state.attendanceSettings.workingHours.end,
    lateThreshold: state.attendanceSettings.lateThreshold.toString(),
    halfDayThreshold: state.attendanceSettings.halfDayThreshold.toString(),
    bonusEnabled: state.bonusSettings.isEnabled,
    taskCompletionBonus: state.bonusSettings.taskCompletionBonus.toString(),
    earlyCompletionMultiplier: state.bonusSettings.earlyCompletionMultiplier.toString(),
    qualityBonusMultiplier: state.bonusSettings.qualityBonusMultiplier.toString(),
    referralEnabled: state.referralSettings.isEnabled,
    referralBonus: state.referralSettings.bonusAmount.toString(),
    minimumActiveDays: state.referralSettings.minimumActiveDays.toString(),
    maxReferralsPerUser: state.referralSettings.maxReferralsPerUser.toString(),
  })

  if (!user) return null

  const handleSaveSettings = () => {
    // Update proxy rate
    dispatch({ type: "SET_PROXY_RATE", payload: Number.parseFloat(settings.proxyRate) })

    // Update warning message
    dispatch({ type: "SET_WARNING_MESSAGE", payload: settings.warningMessage })

    // Update payment info
    const paymentInfo = {
      baseSalary: Number.parseFloat(settings.baseSalary),
      hourlyRate: Number.parseFloat(settings.hourlyRate),
      overtimeRate: Number.parseFloat(settings.overtimeRate),
      taskCompletionRate: Number.parseFloat(settings.taskCompletionRate),
    }
    dispatch({ type: "LOAD_DATA", payload: { paymentInfo } })

    // Update attendance settings
    const attendanceSettings = {
      workingHours: {
        start: settings.workingHoursStart,
        end: settings.workingHoursEnd,
      },
      lateThreshold: Number.parseInt(settings.lateThreshold),
      halfDayThreshold: Number.parseInt(settings.halfDayThreshold),
    }
    dispatch({ type: "LOAD_DATA", payload: { attendanceSettings } })

    // Update bonus settings
    const bonusSettings = {
      isEnabled: settings.bonusEnabled,
      taskCompletionBonus: Number.parseFloat(settings.taskCompletionBonus),
      earlyCompletionMultiplier: Number.parseFloat(settings.earlyCompletionMultiplier),
      qualityBonusMultiplier: Number.parseFloat(settings.qualityBonusMultiplier),
    }
    dispatch({ type: "UPDATE_BONUS_SETTINGS", payload: bonusSettings })

    // Update referral settings
    const referralSettings = {
      isEnabled: settings.referralEnabled,
      bonusAmount: Number.parseFloat(settings.referralBonus),
      minimumActiveDays: Number.parseInt(settings.minimumActiveDays),
      maxReferralsPerUser: Number.parseInt(settings.maxReferralsPerUser),
    }
    dispatch({ type: "UPDATE_REFERRAL_SETTINGS", payload: referralSettings })

    alert("Settings saved successfully!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4 lg:py-6">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:border-purple-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">System Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Warning Message Settings */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Warning Message
              </CardTitle>
              <CardDescription className="text-orange-100">Global warning message for all users</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="warningMessage">Warning Message</Label>
                <Textarea
                  id="warningMessage"
                  value={settings.warningMessage}
                  onChange={(e) => setSettings({ ...settings, warningMessage: e.target.value })}
                  placeholder="Enter warning message (leave empty to disable)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <CardTitle className="text-white flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Payment Settings
              </CardTitle>
              <CardDescription className="text-green-100">Configure payment rates and amounts</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="proxyRate">Proxy Rate ($)</Label>
                  <Input
                    id="proxyRate"
                    type="number"
                    value={settings.proxyRate}
                    onChange={(e) => setSettings({ ...settings, proxyRate: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseSalary">Base Salary ($)</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={settings.baseSalary}
                    onChange={(e) => setSettings({ ...settings, baseSalary: e.target.value })}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={settings.hourlyRate}
                    onChange={(e) => setSettings({ ...settings, hourlyRate: e.target.value })}
                    placeholder="300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overtimeRate">Overtime Rate ($)</Label>
                  <Input
                    id="overtimeRate"
                    type="number"
                    value={settings.overtimeRate}
                    onChange={(e) => setSettings({ ...settings, overtimeRate: e.target.value })}
                    placeholder="450"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskCompletionRate">Task Completion Rate ($)</Label>
                  <Input
                    id="taskCompletionRate"
                    type="number"
                    value={settings.taskCompletionRate}
                    onChange={(e) => setSettings({ ...settings, taskCompletionRate: e.target.value })}
                    placeholder="500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Settings */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardTitle className="text-white flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Attendance Settings
              </CardTitle>
              <CardDescription className="text-blue-100">Configure working hours and attendance rules</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="workingHoursStart">Working Hours Start</Label>
                  <Input
                    id="workingHoursStart"
                    type="time"
                    value={settings.workingHoursStart}
                    onChange={(e) => setSettings({ ...settings, workingHoursStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workingHoursEnd">Working Hours End</Label>
                  <Input
                    id="workingHoursEnd"
                    type="time"
                    value={settings.workingHoursEnd}
                    onChange={(e) => setSettings({ ...settings, workingHoursEnd: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateThreshold">Late Threshold (minutes)</Label>
                  <Input
                    id="lateThreshold"
                    type="number"
                    value={settings.lateThreshold}
                    onChange={(e) => setSettings({ ...settings, lateThreshold: e.target.value })}
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="halfDayThreshold">Half Day Threshold (hours)</Label>
                  <Input
                    id="halfDayThreshold"
                    type="number"
                    value={settings.halfDayThreshold}
                    onChange={(e) => setSettings({ ...settings, halfDayThreshold: e.target.value })}
                    placeholder="4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bonus Settings */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Bonus Settings
              </CardTitle>
              <CardDescription className="text-purple-100">Configure task completion bonuses</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="bonusEnabled">Enable Bonus System</Label>
                  <p className="text-sm text-gray-500">Allow users to earn bonuses for task completion</p>
                </div>
                <Switch
                  id="bonusEnabled"
                  checked={settings.bonusEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, bonusEnabled: checked })}
                />
              </div>
              {settings.bonusEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="taskCompletionBonus">Task Completion Bonus ($)</Label>
                    <Input
                      id="taskCompletionBonus"
                      type="number"
                      value={settings.taskCompletionBonus}
                      onChange={(e) => setSettings({ ...settings, taskCompletionBonus: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="earlyCompletionMultiplier">Early Completion Multiplier</Label>
                    <Input
                      id="earlyCompletionMultiplier"
                      type="number"
                      step="0.1"
                      value={settings.earlyCompletionMultiplier}
                      onChange={(e) => setSettings({ ...settings, earlyCompletionMultiplier: e.target.value })}
                      placeholder="1.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qualityBonusMultiplier">Quality Bonus Multiplier</Label>
                    <Input
                      id="qualityBonusMultiplier"
                      type="number"
                      step="0.1"
                      value={settings.qualityBonusMultiplier}
                      onChange={(e) => setSettings({ ...settings, qualityBonusMultiplier: e.target.value })}
                      placeholder="2.0"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referral Settings */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
              <CardTitle className="text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Referral Settings
              </CardTitle>
              <CardDescription className="text-pink-100">Configure referral program</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="referralEnabled">Enable Referral Program</Label>
                  <p className="text-sm text-gray-500">Allow users to refer new members and earn bonuses</p>
                </div>
                <Switch
                  id="referralEnabled"
                  checked={settings.referralEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, referralEnabled: checked })}
                />
              </div>
              {settings.referralEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="referralBonus">Referral Bonus ($)</Label>
                    <Input
                      id="referralBonus"
                      type="number"
                      value={settings.referralBonus}
                      onChange={(e) => setSettings({ ...settings, referralBonus: e.target.value })}
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumActiveDays">Minimum Active Days</Label>
                    <Input
                      id="minimumActiveDays"
                      type="number"
                      value={settings.minimumActiveDays}
                      onChange={(e) => setSettings({ ...settings, minimumActiveDays: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxReferralsPerUser">Max Referrals Per User</Label>
                    <Input
                      id="maxReferralsPerUser"
                      type="number"
                      value={settings.maxReferralsPerUser}
                      onChange={(e) => setSettings({ ...settings, maxReferralsPerUser: e.target.value })}
                      placeholder="5"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-8 py-2"
            >
              <Settings className="h-4 w-4 mr-2" />
              Save All Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <SettingsPageContent />
    </ProtectedRoute>
  )
}
