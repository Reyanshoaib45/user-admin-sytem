"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ClipboardList,
  DollarSign,
  Calendar,
  LogOut,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function UserDashboardContent() {
  const { state } = useApp()
  const { user, logout } = useAuth("user")

  if (!user) return null

  // Get user-specific data
  const userTasks = state.tasks.filter((task) => task.assignedTo === user.id)
  const userProxyRequests = state.proxyRequests.filter((req) => req.userId === user.id)
  const userAttendance = state.attendanceRecords.filter((att) => att.userId === user.id)
  const userPayments = state.payments.filter((payment) => payment.userId === user.id)
  const userTrainingRequests = state.trainingRequests.filter((req) => req.userId === user.id)

  // Calculate pending payments
  const pendingPayments = userPayments
    .filter((payment) => payment.status === "pending")
    .reduce((sum, payment) => sum + payment.amount, 0)

  // Calculate bonus earnings
  const bonusEarnings = userPayments
    .filter((payment) => payment.type === "task_bonus" && payment.status === "processed")
    .reduce((sum, payment) => sum + payment.amount, 0)

  const stats = [
    {
      title: "Active Tasks",
      value: userTasks.filter((t) => t.status !== "completed").length,
      icon: ClipboardList,
      href: "/user/tasks",
      change: `${userTasks.filter((t) => t.status === "completed").length} completed`,
    },
    {
      title: "Pending Payments",
      value: `$${pendingPayments}`,
      icon: DollarSign,
      href: "/user/payments",
      change: `${userPayments.filter((p) => p.status === "pending").length} pending`,
    },
    {
      title: "Attendance This Month",
      value: `${userAttendance.length}/30`,
      icon: Calendar,
      href: "/user/attendance",
      change: "92% rate",
    },
    {
      title: "Bonus Earned",
      value: `$${bonusEarnings}`,
      icon: TrendingUp,
      href: "/user/payments",
      change: "This month",
    },
  ]

  const recentTasks = userTasks.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 lg:py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text">User Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="text-gray-700 font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.department}</p>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="hover:bg-red-50 hover:border-red-200 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Global Warning Message */}
          {state.warningMessage && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 font-medium">{state.warningMessage}</AlertDescription>
            </Alert>
          )}

          {/* Personal Warning Message */}
          {user.personalWarning && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 font-medium">
                <strong>Personal Notice:</strong> {user.personalWarning}
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <Link key={stat.title} href={stat.href}>
                <Card className="card-hover border-0 overflow-hidden group cursor-pointer">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <div className="p-2 lg:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="flex items-center text-blue-600 text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="text-blue-100">Common tasks and actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-4 lg:p-6">
                <Link href="/user/attendance/mark">
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105">
                    <Calendar className="h-4 w-4 mr-2" />
                    Mark Attendance
                  </Button>
                </Link>
                <Link href="/user/proxy/apply">
                  <Button className="w-full justify-start bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Apply for Proxy
                  </Button>
                </Link>
                <Link href="/user/tasks">
                  <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    View My Tasks
                  </Button>
                </Link>
                <Link href="/user/training">
                  <Button className="w-full justify-start bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Request Training
                  </Button>
                </Link>
                <Link href="/user/payments">
                  <Button className="w-full justify-start bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105">
                    <DollarSign className="h-4 w-4 mr-2" />
                    View Payments
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <CardTitle className="text-white">Recent Tasks</CardTitle>
                <CardDescription className="text-indigo-100">Your latest assigned tasks</CardDescription>
              </CardHeader>
              <CardContent className="p-4 lg:p-6">
                <div className="space-y-4">
                  {recentTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No tasks assigned yet</p>
                    </div>
                  ) : (
                    recentTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                      >
                        <div className="flex items-center space-x-3">
                          {task.status === "completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-blue-500" />
                          )}
                          <div>
                            <span className="text-sm font-medium text-gray-900 block">{task.title}</span>
                            <div className="text-xs text-gray-500">Due: {task.dueDate}</div>
                            {task.bonusEarned && (
                              <div className="text-xs text-green-600 font-medium">Bonus: ${task.bonusEarned}</div>
                            )}
                          </div>
                        </div>
                        <Badge
                          className={`${
                            task.status === "completed"
                              ? "bg-green-500"
                              : task.status === "in-progress"
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                          } text-white border-0 capitalize`}
                        >
                          {task.status.replace("-", " ")}
                        </Badge>
                      </div>
                    ))
                  )}
                  {recentTasks.length > 0 && (
                    <Link href="/user/tasks">
                      <Button variant="outline" className="w-full mt-4">
                        View All Tasks
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Training Requests Summary */}
          {userTrainingRequests.length > 0 && (
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                <CardTitle className="text-white flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Recent Training Requests
                </CardTitle>
                <CardDescription className="text-green-100">
                  Your latest training and development activities
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 lg:p-6">
                <div className="space-y-3">
                  {userTrainingRequests.slice(0, 3).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {request.type === "online" ? (
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <GraduationCap className="h-4 w-4 text-blue-600" />
                          </div>
                        ) : (
                          <div className="p-2 bg-green-100 rounded-lg">
                            <GraduationCap className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium text-gray-900">{request.topic}</span>
                          <div className="text-xs text-gray-500">{request.preferredDate}</div>
                        </div>
                      </div>
                      <Badge
                        className={`${
                          request.status === "approved"
                            ? "bg-green-500"
                            : request.status === "rejected"
                              ? "bg-red-500"
                              : request.status === "completed"
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                        } text-white border-0 capitalize`}
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                  <Link href="/user/training">
                    <Button variant="outline" className="w-full mt-4">
                      View All Training Requests
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default function UserDashboard() {
  return (
    <ProtectedRoute requiredRole="user">
      <UserDashboardContent />
    </ProtectedRoute>
  )
}
