"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, ClipboardList, Calendar, LogOut, TrendingUp, Activity, UserPlus } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function HRDashboardContent() {
  const { state } = useApp()
  const { user, logout } = useAuth("hr")

  if (!user) return null

  const stats = [
    {
      title: "Total Users",
      value: state.users.filter((u) => u.role === "user").length,
      icon: Users,
      href: "/hr/users",
      gradient: "from-blue-500 to-cyan-500",
      change: "+12%",
    },
    {
      title: "Pending Signups",
      value: state.signupRequests.filter((req) => req.status === "pending").length,
      icon: UserPlus,
      href: "/hr/signup-requests",
      gradient: "from-orange-500 to-red-500",
      change: "+5%",
    },
    {
      title: "Proxy Requests",
      value: state.proxyRequests.length,
      icon: ClipboardList,
      href: "/hr/proxy-requests",
      gradient: "from-green-500 to-emerald-500",
      change: "+8%",
    },
    {
      title: "Attendance Today",
      value: `${state.attendanceRecords.filter((a) => a.date === new Date().toISOString().split("T")[0]).length}/${state.users.filter((u) => u.role === "user").length}`,
      icon: Calendar,
      href: "/hr/attendance",
      gradient: "from-purple-500 to-pink-500",
      change: "+3%",
    },
  ]

  const recentActivities = [
    { id: 1, action: "New signup request received", time: "2 min ago", type: "signup" },
    { id: 2, action: "User attendance marked", time: "5 min ago", type: "attendance" },
    { id: 3, action: "Proxy request submitted", time: "10 min ago", type: "proxy" },
    { id: 4, action: "Leave request approved", time: "15 min ago", type: "leave" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 lg:py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text">HR Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="text-gray-700 font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">HR Department</p>
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
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-orange-100">Common HR tasks and actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-4 lg:p-6">
                <Link href="/hr/signup-requests">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Review Signup Requests
                  </Button>
                </Link>
                <Link href="/hr/users">
                  <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/hr/attendance">
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Attendance
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-purple-100">Latest HR activities</CardDescription>
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

export default function HRDashboard() {
  return (
    <ProtectedRoute requiredRole="hr">
      <HRDashboardContent />
    </ProtectedRoute>
  )
}
