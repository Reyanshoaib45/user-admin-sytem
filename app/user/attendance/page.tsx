"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function UserAttendancePageContent() {
  const { state } = useApp()
  const { user } = useAuth("user")
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  if (!user) return null

  // Get user's attendance records
  const userAttendance = state.attendanceRecords.filter((record) => record.userId === user.id)
  const userLeaveRequests = state.leaveRequests.filter((request) => request.userId === user.id)

  // Filter by selected month
  const monthlyAttendance = userAttendance.filter((record) => record.date.startsWith(selectedMonth))

  // Calculate statistics
  const totalDays = monthlyAttendance.length
  const presentDays = monthlyAttendance.filter((r) => r.status === "present").length
  const lateDays = monthlyAttendance.filter((r) => r.status === "late").length
  const leaveDays = monthlyAttendance.filter((r) => r.status === "leave").length
  const absentDays = monthlyAttendance.filter((r) => r.status === "absent").length

  const totalWorkingHours = monthlyAttendance.reduce((sum, record) => sum + (record.workingHours || 0), 0)
  const averageWorkingHours = totalDays > 0 ? (totalWorkingHours / totalDays).toFixed(1) : "0"

  const attendancePercentage = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0

  const stats = [
    {
      title: "Attendance Rate",
      value: `${attendancePercentage}%`,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      description: `${presentDays + lateDays}/${totalDays} days`,
    },
    {
      title: "Present Days",
      value: presentDays,
      icon: CheckCircle,
      color: "from-blue-500 to-cyan-500",
      description: "On time arrivals",
    },
    {
      title: "Late Days",
      value: lateDays,
      icon: AlertCircle,
      color: "from-yellow-500 to-orange-500",
      description: "Late arrivals",
    },
    {
      title: "Leave Days",
      value: leaveDays,
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      description: "Approved leaves",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "late":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "leave":
        return <Calendar className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500"
      case "late":
        return "bg-yellow-500"
      case "absent":
        return "bg-red-500"
      case "leave":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 lg:py-6">
            <div className="flex items-center space-x-4">
              <Link href="/user">
                <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text">My Attendance</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/user/attendance/mark">
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
              </Link>
              <Link href="/user/attendance/leave-request">
                <Button variant="outline" className="hover:bg-purple-50 hover:border-purple-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Request Leave
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Month Selector */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Month</h3>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="shadow-lg border-0 overflow-hidden card-hover">
                <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  <div className={`p-2 lg:p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white`}>
                    <stat.icon className="h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Attendance Records */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Records */}
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardTitle className="text-white">Daily Records</CardTitle>
                <CardDescription className="text-blue-100">Your attendance for {selectedMonth}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {monthlyAttendance.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No attendance records for this month</p>
                    </div>
                  ) : (
                    monthlyAttendance
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(record.status)}
                            <div>
                              <div className="font-medium">{record.date}</div>
                              <div className="text-sm text-gray-500">
                                {record.checkInTime && record.checkOutTime
                                  ? `${record.checkInTime} - ${record.checkOutTime}`
                                  : record.checkInTime
                                    ? `In: ${record.checkInTime}`
                                    : record.status === "leave"
                                      ? `Leave: ${record.leaveType}`
                                      : "No check-in"}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${getStatusColor(record.status)} text-white border-0 capitalize`}>
                              {record.status}
                            </Badge>
                            {record.workingHours && (
                              <div className="text-xs text-gray-500 mt-1">{record.workingHours}h</div>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Leave Requests */}
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="text-white">Leave Requests</CardTitle>
                <CardDescription className="text-purple-100">Your leave applications</CardDescription>
              </CardHeader>
              <CardContent className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {userLeaveRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No leave requests</p>
                    </div>
                  ) : (
                    userLeaveRequests
                      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
                      .map((request) => (
                        <div key={request.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              className={`${
                                request.status === "approved"
                                  ? "bg-green-500"
                                  : request.status === "rejected"
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                              } text-white border-0 capitalize`}
                            >
                              {request.status}
                            </Badge>
                            <span className="text-sm text-gray-500">{request.totalDays} days</span>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">{request.leaveType} leave</div>
                            <div className="text-gray-600">
                              {request.startDate} to {request.endDate}
                            </div>
                            <div className="text-gray-500 mt-1">{request.reason}</div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <CardTitle className="text-white">Monthly Summary</CardTitle>
              <CardDescription className="text-indigo-100">
                Overview of your attendance for {selectedMonth}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{totalWorkingHours.toFixed(1)}h</div>
                  <div className="text-sm text-gray-500">Total Working Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{averageWorkingHours}h</div>
                  <div className="text-sm text-gray-500">Average Daily Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{attendancePercentage}%</div>
                  <div className="text-sm text-gray-500">Attendance Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function UserAttendancePage() {
  return (
    <ProtectedRoute requiredRole="user">
      <UserAttendancePageContent />
    </ProtectedRoute>
  )
}
