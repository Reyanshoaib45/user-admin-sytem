"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  DollarSign,
  ClipboardList,
  Calendar,
  LogOut,
  TrendingUp,
  Activity,
  Settings,
  UserPlus,
  Gift,
} from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { NotificationSystem } from "@/components/ui/notification-system"

function AdminDashboardContent() {
  const { state, dispatch } = useApp()
  const { user, logout } = useAuth("admin")
  const [warningMessage, setWarningMessage] = useState(state.warningMessage)

  if (!user) return null

  const stats = [
    {
      title: "Total Users",
      value: state.users.filter((u) => u.role === "user").length,
      icon: Users,
      href: "/admin/users",
      gradient: "from-blue-500 to-cyan-500",
      change: `${state.users.filter((u) => u.status === "pending").length} pending`,
    },
    {
      title: "Signup Requests",
      value: state.signupRequests.filter((s) => s.status === "pending").length,
      icon: UserPlus,
      href: "/admin/signup-requests",
      gradient: "from-orange-500 to-red-500",
      change: `${state.signupRequests.length} total`,
    },
    {
      title: "Proxy Requests",
      value: state.proxyRequests.length,
      icon: DollarSign,
      href: "/admin/proxies",
      gradient: "from-green-500 to-emerald-500",
      change: `${state.proxyRequests.filter((p) => p.status === "pending").length} pending`,
    },
    {
      title: "Active Tasks",
      value: state.tasks.filter((t) => t.status !== "completed").length,
      icon: ClipboardList,
      href: "/admin/tasks",
      gradient: "from-purple-500 to-pink-500",
      change: `${state.tasks.filter((t) => t.status === "completed").length} completed`,
    },
    {
      title: "Payments",
      value: `$${state.payments.reduce((sum, p) => sum + p.amount, 0)}`,
      icon: DollarSign,
      href: "/admin/payments",
      gradient: "from-green-500 to-emerald-500",
      change: `${state.payments.filter((p) => p.status === "pending").length} pending`,
    },
    {
      title: "Referrals",
      value: state.referrals.length,
      icon: Gift,
      href: "/admin/referrals",
      gradient: "from-pink-500 to-rose-500",
      change: `${state.referrals.filter((r) => r.status === "activated").length} active`,
    },
    {
      title: "Attendance Today",
      value: `${state.attendanceRecords.filter((a) => a.date === new Date().toISOString().split("T")[0]).length}/${state.users.filter((u) => u.role === "user").length}`,
      icon: Calendar,
      href: "/admin/attendance",
      gradient: "from-orange-500 to-red-500",
      change: "Today's records",
    },
  ]

  const handleUpdateWarningMessage = () => {
    dispatch({ type: "SET_WARNING_MESSAGE", payload: warningMessage })
  }

  const recentActivities = [
    {
      id: 1,
      action: `${state.signupRequests.filter((s) => s.status === "pending").length} new signup requests`,
      time: "2 min ago",
      type: "signup",
    },
    {
      id: 2,
      action: `${state.proxyRequests.filter((p) => p.status === "pending").length} proxy requests pending`,
      time: "5 min ago",
      type: "proxy",
    },
    {
      id: 3,
      action: `${state.tasks.filter((t) => t.status === "completed").length} tasks completed today`,
      time: "10 min ago",
      type: "task",
    },
    {
      id: 4,
      action: `${state.attendanceRecords.filter((a) => a.date === new Date().toISOString().split("T")[0]).length} attendance records today`,
      time: "15 min ago",
      type: "attendance",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 lg:py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <NotificationSystem />
              <div className="hidden sm:block text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="text-gray-700 font-medium">{user.name}</p>
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
          {/* Warning Message Settings */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                System Warning Message
              </CardTitle>
              <CardDescription className="text-orange-100">Set a warning message for all users</CardDescription>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="warningMessage" className="text-sm font-medium text-gray-700">
                    Warning Message
                  </Label>
                  <Textarea
                    id="warningMessage"
                    value={warningMessage}
                    onChange={(e) => setWarningMessage(e.target.value)}
                    placeholder="Enter a warning message to display to all users (leave empty to disable)"
                    rows={3}
                    className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Button
                    onClick={handleUpdateWarningMessage}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Update Warning Message
                  </Button>
                  <Link href="/admin/settings">
                    <Button variant="outline" className="hover:bg-gray-50">
                      <Settings className="h-4 w-4 mr-2" />
                      All Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <Link key={stat.title} href={stat.href}>
                <Card className="card-hover border-0 overflow-hidden group cursor-pointer">
                  <div className={`h-1 bg-gradient-to-r ${stat.gradient}`}></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <div
                      className={`p-2 lg:p-3 rounded-lg bg-gradient-to-r ${stat.gradient} text-white group-hover:scale-110 transition-transform duration-300`}
                    >
                      <stat.icon className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="flex items-center text-green-600 text-sm">
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
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-purple-100">Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-4 lg:p-6">
                <Link href="/admin/users/create">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105">
                    <Users className="h-4 w-4 mr-2" />
                    Create New User
                  </Button>
                </Link>
                <Link href="/admin/signup-requests">
                  <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Review Signup Requests
                  </Button>
                </Link>
                <Link href="/admin/tasks/create">
                  <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Assign New Task
                  </Button>
                </Link>
                <Link href="/admin/proxies">
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Manage Proxy Payments
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button className="w-full justify-start bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  System Overview
                </CardTitle>
                <CardDescription className="text-orange-100">Current system status</CardDescription>
              </CardHeader>
              <CardContent className="p-4 lg:p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                    >
                      <div
                        className={`w-3 h-3 rounded-full animate-pulse ${
                          activity.type === "attendance"
                            ? "bg-green-500"
                            : activity.type === "proxy"
                              ? "bg-blue-500"
                              : activity.type === "task"
                                ? "bg-yellow-500"
                                : activity.type === "signup"
                                  ? "bg-orange-500"
                                  : "bg-purple-500"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">{activity.action}</span>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
