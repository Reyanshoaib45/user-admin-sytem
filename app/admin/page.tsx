"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  ClipboardList,
  DollarSign,
  Calendar,
  Settings,
  AlertTriangle,
  TrendingUp,
  Award,
  Gift,
  GraduationCap,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function AdminDashboardContent() {
  const { state } = useApp()
  const { user, logout } = useAuth("admin")

  if (!user) return null

  const totalUsers = state.users.filter((u) => u.role === "user").length
  const activeUsers = state.users.filter((u) => u.role === "user" && u.status === "active").length
  const totalTasks = state.tasks.length
  const pendingTasks = state.tasks.filter((t) => t.status === "pending").length
  const totalPayments = state.payments.reduce((sum, p) => sum + p.amount, 0)
  const pendingPayments = state.payments.filter((p) => p.status === "pending").length
  const totalReferrals = state.referrals.length
  const pendingSignups = state.signupRequests.filter((s) => s.status === "pending").length
  const pendingTraining = state.trainingRequests.filter((t) => t.status === "pending").length

  const quickStats = [
    {
      title: "Total Users",
      value: `${activeUsers}/${totalUsers}`,
      icon: Users,
      href: "/admin/users",
      change: `${state.users.filter((u) => u.status === "pending").length} pending`,
      color: "blue",
    },
    {
      title: "Active Tasks",
      value: `${pendingTasks}/${totalTasks}`,
      icon: ClipboardList,
      href: "/admin/tasks",
      change: `${state.tasks.filter((t) => t.status === "completed").length} completed`,
      color: "green",
    },
    {
      title: "Total Payments",
      value: `$${totalPayments}`,
      icon: DollarSign,
      href: "/admin/payments",
      change: `${pendingPayments} pending`,
      color: "purple",
    },
    {
      title: "Referrals",
      value: totalReferrals,
      icon: Gift,
      href: "/admin/referrals",
      change: `${state.referrals.filter((r) => r.status === "activated").length} active`,
      color: "pink",
    },
  ]

  const managementCards = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: Users,
      href: "/admin/users",
      badge: state.users.filter((u) => u.status === "pending").length,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Task Management",
      description: "Create and assign tasks to users",
      icon: ClipboardList,
      href: "/admin/tasks",
      badge: pendingTasks,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Payment Management",
      description: "Handle payments and financial records",
      icon: DollarSign,
      href: "/admin/payments",
      badge: pendingPayments,
      color: "from-purple-500 to-violet-500",
    },
    {
      title: "Attendance Records",
      description: "Monitor attendance and leave requests",
      icon: Calendar,
      href: "/admin/attendance",
      badge: state.leaveRequests.filter((l) => l.status === "pending").length,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Proxy Requests",
      description: "Review and approve proxy requests",
      icon: AlertTriangle,
      href: "/admin/proxies",
      badge: state.proxyRequests.filter((p) => p.status === "pending").length,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Training Requests",
      description: "Manage training and development requests",
      icon: GraduationCap,
      href: "/admin/training-requests",
      badge: pendingTraining,
      color: "from-indigo-500 to-blue-500",
    },
    {
      title: "Referral Program",
      description: "Manage referrals and bonus payments",
      icon: Gift,
      href: "/admin/referrals",
      badge: state.referrals.filter((r) => r.status === "activated").length,
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "Bonus Settings",
      description: "Configure task completion bonuses",
      icon: Award,
      href: "/admin/bonus-settings",
      badge: state.bonusSettings.isEnabled ? "ON" : "OFF",
      color: "from-teal-500 to-cyan-500",
    },
    {
      title: "Referral Settings",
      description: "Configure referral program settings",
      icon: Settings,
      href: "/admin/referral-settings",
      badge: state.referralSettings.isEnabled ? "ON" : "OFF",
      color: "from-violet-500 to-purple-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 lg:py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="text-gray-700 font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
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
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {quickStats.map((stat, index) => (
              <Link key={stat.title} href={stat.href}>
                <Card className="card-hover border-0 overflow-hidden group cursor-pointer">
                  <div className={`h-1 bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600`}></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <div
                      className={`p-2 lg:p-3 rounded-lg bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 text-white group-hover:scale-110 transition-transform duration-300`}
                    >
                      <stat.icon className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className={`flex items-center text-${stat.color}-600 text-xs`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pending Items Alert */}
          {(pendingSignups > 0 || pendingTraining > 0 || pendingPayments > 0) && (
            <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">Pending Items Require Attention</h3>
                    <div className="text-sm text-yellow-700 mt-1">
                      {pendingSignups > 0 && <span>{pendingSignups} signup requests • </span>}
                      {pendingTraining > 0 && <span>{pendingTraining} training requests • </span>}
                      {pendingPayments > 0 && <span>{pendingPayments} pending payments</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managementCards.map((card, index) => (
              <Link key={card.title} href={card.href}>
                <Card className="card-hover border-0 overflow-hidden group cursor-pointer h-full">
                  <CardHeader className={`bg-gradient-to-r ${card.color} text-white relative`}>
                    <div className="flex items-center justify-between">
                      <card.icon className="h-8 w-8 text-white" />
                      {typeof card.badge === "number" && card.badge > 0 && (
                        <Badge className="bg-white/20 text-white border-white/30">{card.badge}</Badge>
                      )}
                      {typeof card.badge === "string" && (
                        <Badge className={`${card.badge === "ON" ? "bg-green-500" : "bg-red-500"} text-white border-0`}>
                          {card.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-white text-lg">{card.title}</CardTitle>
                    <CardDescription className="text-white/90 text-sm">{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">
                      Click to manage and configure {card.title.toLowerCase()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
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
