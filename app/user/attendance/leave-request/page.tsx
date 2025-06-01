"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import type { LeaveRequest } from "@/lib/context/app-context"

function LeaveRequestPageContent() {
  const { dispatch } = useApp()
  const { user } = useAuth("user")
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    leaveType: "",
    reason: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  if (!user) return null

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newLeaveRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      leaveType: formData.leaveType as "sick" | "casual" | "vacation" | "emergency",
      reason: formData.reason,
      status: "pending",
      appliedDate: new Date().toISOString().split("T")[0],
      totalDays: calculateDays(),
    }

    dispatch({ type: "ADD_LEAVE_REQUEST", payload: newLeaveRequest })
    setIsLoading(false)
    setIsSuccess(true)

    // Redirect after success animation
    setTimeout(() => {
      router.push("/user/attendance")
    }, 2000)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md text-center shadow-xl border-0">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Leave Request Submitted!</h2>
            <p className="text-gray-600">Your request is being reviewed by admin...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4 lg:py-6">
            <Link href="/user/attendance">
              <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Request Leave</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <CardTitle className="text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Leave Application
            </CardTitle>
            <CardDescription className="text-purple-100">Submit a request for leave</CardDescription>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaveType" className="text-sm font-medium text-gray-700">
                  Leave Type
                </Label>
                <Select
                  value={formData.leaveType}
                  onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="casual">Casual Leave</SelectItem>
                    <SelectItem value="vacation">Vacation Leave</SelectItem>
                    <SelectItem value="emergency">Emergency Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                  Reason
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Provide reason for leave"
                  rows={4}
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {formData.startDate && formData.endDate && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Leave Summary
                  </h3>
                  <div className="text-sm text-blue-700">
                    <p>
                      <span className="font-medium">Duration:</span> {calculateDays()} day(s)
                    </p>
                    <p>
                      <span className="font-medium">From:</span> {formData.startDate}{" "}
                      <span className="font-medium">To:</span> {formData.endDate}
                    </p>
                    <p className="mt-2 text-xs">
                      Your leave request will be reviewed by the admin and you will be notified of the decision.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6">
                <Link href="/user/attendance">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Submit Leave Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function LeaveRequestPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <LeaveRequestPageContent />
    </ProtectedRoute>
  )
}
