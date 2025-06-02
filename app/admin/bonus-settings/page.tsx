"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Award, DollarSign, TrendingUp, Save } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function BonusSettingsContent() {
  const { state, dispatch } = useApp()
  const { user } = useAuth("admin")
  const [settings, setSettings] = useState(state.bonusSettings)
  const [isSaving, setIsSaving] = useState(false)

  if (!user) return null

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    dispatch({ type: "UPDATE_BONUS_SETTINGS", payload: settings })
    setIsSaving(false)
  }

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
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Bonus Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="text-white flex items-center">
                <Award className="h-6 w-6 mr-2" />
                Task Completion Bonus System
              </CardTitle>
              <CardDescription className="text-purple-100">
                Configure bonus rewards for task completion and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Enable/Disable Bonus System */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Enable Bonus System</h3>
                  <p className="text-sm text-gray-600">Turn on/off the entire bonus system</p>
                </div>
                <Switch
                  checked={settings.isEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, isEnabled: checked })}
                />
              </div>

              {settings.isEnabled && (
                <>
                  {/* Base Task Completion Bonus */}
                  <div className="space-y-2">
                    <Label htmlFor="taskBonus" className="text-sm font-medium text-gray-700">
                      Base Task Completion Bonus ($)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="taskBonus"
                        type="number"
                        min="0"
                        step="10"
                        value={settings.taskCompletionBonus}
                        onChange={(e) => setSettings({ ...settings, taskCompletionBonus: Number(e.target.value) })}
                        className="pl-10"
                        placeholder="100"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Base amount awarded for each completed task</p>
                  </div>

                  {/* Early Completion Multiplier */}
                  <div className="space-y-2">
                    <Label htmlFor="earlyMultiplier" className="text-sm font-medium text-gray-700">
                      Early Completion Multiplier
                    </Label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="earlyMultiplier"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={settings.earlyCompletionMultiplier}
                        onChange={(e) =>
                          setSettings({ ...settings, earlyCompletionMultiplier: Number(e.target.value) })
                        }
                        className="pl-10"
                        placeholder="1.5"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Multiplier applied when tasks are completed ahead of schedule (e.g., 1.5x = 50% bonus)
                    </p>
                  </div>

                  {/* Quality Bonus Multiplier */}
                  <div className="space-y-2">
                    <Label htmlFor="qualityMultiplier" className="text-sm font-medium text-gray-700">
                      Quality Bonus Multiplier
                    </Label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="qualityMultiplier"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={settings.qualityBonusMultiplier}
                        onChange={(e) => setSettings({ ...settings, qualityBonusMultiplier: Number(e.target.value) })}
                        className="pl-10"
                        placeholder="2.0"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Multiplier applied for exceptional work quality (manually awarded by admin)
                    </p>
                  </div>

                  {/* Bonus Preview */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3">Bonus Examples</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-blue-800">${settings.taskCompletionBonus}</div>
                        <div className="text-blue-600">Regular Completion</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-800">
                          ${Math.round(settings.taskCompletionBonus * settings.earlyCompletionMultiplier)}
                        </div>
                        <div className="text-green-600">Early Completion</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-purple-800">
                          ${Math.round(settings.taskCompletionBonus * settings.qualityBonusMultiplier)}
                        </div>
                        <div className="text-purple-600">Quality Bonus</div>
                      </div>
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
                    Save Bonus Settings
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

export default function BonusSettingsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <BonusSettingsContent />
    </ProtectedRoute>
  )
}
