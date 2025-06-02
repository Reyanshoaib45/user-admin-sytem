"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, DollarSign, Clock, CheckCircle, XCircle, CreditCard } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function UserPaymentsPageContent() {
  const { state } = useApp()
  const { user } = useAuth("user")

  if (!user) return null

  // Get user-specific payments
  const userPayments = state.payments.filter((payment) => payment.userId === user.id)
  const userProxyRequests = state.proxyRequests.filter((req) => req.userId === user.id)

  // Calculate statistics
  const totalEarnings = userPayments.filter((p) => p.status === "processed").reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = userPayments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)

  // Separate proxy payments
  const proxyPayments = userPayments.filter((p) => p.type === "proxy")
  const totalProxyEarnings = proxyPayments.filter((p) => p.status === "processed").reduce((sum, p) => sum + p.amount, 0)
  const pendingProxyAmount = proxyPayments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)

  // Calculate approved proxy amount (not yet paid)
  const approvedProxyAmount = userProxyRequests
    .filter((req) => req.status === "approved")
    .reduce((sum, req) => sum + req.amount, 0)

  const stats = [
    {
      title: "Total Earnings",
      value: `$${totalEarnings}`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      description: "All processed payments",
    },
    {
      title: "Proxy Earnings",
      value: `$${totalProxyEarnings}`,
      icon: DollarSign,
      color: "from-blue-500 to-cyan-500",
      description: `${proxyPayments.filter((p) => p.status === "processed").length} proxy payments`,
    },
    {
      title: "Pending Payments",
      value: `$${pendingAmount}`,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      description: "Awaiting processing",
    },
    {
      title: "Approved Proxies",
      value: `$${approvedProxyAmount}`,
      icon: CheckCircle,
      color: "from-purple-500 to-pink-500",
      description: "Ready for payment",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "proxy":
        return "bg-blue-100 text-blue-800"
      case "salary":
        return "bg-green-100 text-green-800"
      case "bonus":
        return "bg-purple-100 text-purple-800"
      case "overtime":
        return "bg-orange-100 text-orange-800"
      case "task_bonus":
        return "bg-pink-100 text-pink-800"
      case "referral_bonus":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4 lg:py-6">
            <Link href="/user">
              <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">My Payments</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
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

          {/* Proxy Payment Breakdown */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardTitle className="text-white flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Proxy Payment Breakdown
              </CardTitle>
              <CardDescription className="text-blue-100">Detailed view of your proxy earnings</CardDescription>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">${state.proxyRate}</div>
                  <div className="text-sm text-gray-500">Rate per proxy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {proxyPayments.filter((p) => p.status === "processed").length}
                  </div>
                  <div className="text-sm text-gray-500">Processed proxies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {proxyPayments.filter((p) => p.status === "pending").length}
                  </div>
                  <div className="text-sm text-gray-500">Pending proxies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ${totalProxyEarnings + pendingProxyAmount + approvedProxyAmount}
                  </div>
                  <div className="text-sm text-gray-500">Total proxy value</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <CardTitle className="text-white flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment History ({userPayments.length})
              </CardTitle>
              <CardDescription className="text-green-100">Track your payment transactions and status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Method</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No payment records found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      userPayments
                        .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
                        .map((payment) => (
                          <TableRow key={payment.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{payment.createdDate}</TableCell>
                            <TableCell>
                              <Badge className={`${getPaymentTypeColor(payment.type)} border-0 capitalize`}>
                                {payment.type.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{payment.description}</TableCell>
                            <TableCell className="font-semibold text-green-600">
                              ${payment.amount}
                              {payment.type === "proxy" && (
                                <div className="text-xs text-gray-500">@ ${state.proxyRate}/proxy</div>
                              )}
                            </TableCell>
                            <TableCell className="capitalize">
                              {payment.paymentMethod?.replace("_", " ") || "Not specified"}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(payment.status)} text-white border-0 capitalize`}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(payment.status)}
                                  <span>{payment.status}</span>
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">{payment.referenceNumber || "-"}</TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Link href="/user/proxy/apply">
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Apply for Proxy Payment
                  </Button>
                </Link>
                <Link href="/user/attendance">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                    <Clock className="h-4 w-4 mr-2" />
                    View Attendance Records
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardTitle className="text-white">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Processed:</span>
                    <span className="font-semibold text-green-600">${totalEarnings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Proxy Earnings:</span>
                    <span className="font-semibold text-blue-600">${totalProxyEarnings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Amount:</span>
                    <span className="font-semibold text-yellow-600">${pendingAmount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Approved Proxies:</span>
                    <span className="font-semibold text-purple-600">${approvedProxyAmount}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-medium">Expected Total:</span>
                    <span className="font-bold text-lg text-gray-900">
                      ${totalEarnings + pendingAmount + approvedProxyAmount}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function UserPaymentsPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <UserPaymentsPageContent />
    </ProtectedRoute>
  )
}
