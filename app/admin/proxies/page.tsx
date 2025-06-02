"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Search, DollarSign, Check, X, Clock, TrendingUp, Settings } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import type { Payment } from "@/lib/context/app-context"

function ProxiesPageContent() {
  const { state, dispatch } = useApp()
  const { user } = useAuth("admin")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false)
  const [newProxyRate, setNewProxyRate] = useState(state.proxyRate.toString())

  if (!user) return null

  const filteredRequests = state.proxyRequests.filter((request) => {
    const matchesSearch =
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const totalPending = state.proxyRequests.filter((p) => p.status === "pending").length
  const totalApproved = state.proxyRequests.filter((p) => p.status === "approved").length
  const totalRejected = state.proxyRequests.filter((p) => p.status === "rejected").length
  const totalAmount = state.proxyRequests.filter((p) => p.status === "approved").reduce((sum, p) => sum + p.amount, 0)

  const stats = [
    {
      title: "Pending Requests",
      value: totalPending,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      description: "Awaiting approval",
    },
    {
      title: "Approved Requests",
      value: totalApproved,
      icon: Check,
      color: "from-green-500 to-emerald-500",
      description: "Ready for payment",
    },
    {
      title: "Total Value",
      value: `$${totalAmount}`,
      icon: DollarSign,
      color: "from-blue-500 to-cyan-500",
      description: "Approved amount",
    },
    {
      title: "Current Rate",
      value: `$${state.proxyRate}`,
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      description: "Per proxy",
    },
  ]

  const handleApproveRequest = (requestId: string) => {
    const request = state.proxyRequests.find((req) => req.id === requestId)
    if (!request) return

    const updatedRequest = {
      ...request,
      status: "approved" as const,
      approvedBy: user.id,
      approvedDate: new Date().toISOString().split("T")[0],
    }

    dispatch({ type: "UPDATE_PROXY_REQUEST", payload: updatedRequest })

    // Create payment record
    const payment: Payment = {
      id: `payment-${Date.now()}`,
      userId: request.userId,
      userName: request.userName,
      amount: request.amount,
      type: "proxy",
      status: "pending",
      description: `Proxy payment for ${request.date} - ${request.reason}`,
      createdDate: new Date().toISOString().split("T")[0],
      paymentMethod: "bank_transfer",
      referenceNumber: `PROXY-${Date.now()}`,
    }

    dispatch({ type: "ADD_PAYMENT", payload: payment })
  }

  const handleRejectRequest = (requestId: string) => {
    const reason = prompt("Enter rejection reason:")
    if (!reason) return

    const request = state.proxyRequests.find((req) => req.id === requestId)
    if (!request) return

    const updatedRequest = {
      ...request,
      status: "rejected" as const,
      approvedBy: user.id,
      approvedDate: new Date().toISOString().split("T")[0],
      rejectionReason: reason,
    }

    dispatch({ type: "UPDATE_PROXY_REQUEST", payload: updatedRequest })
  }

  const handleUpdateProxyRate = () => {
    const rate = Number.parseFloat(newProxyRate)
    if (rate > 0) {
      dispatch({ type: "SET_PROXY_RATE", payload: rate })
      setIsRateDialogOpen(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "pending":
        return "bg-yellow-500"
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
              <Link href="/admin">
                <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:border-purple-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Proxy Management</h1>
            </div>
            <Button
              onClick={() => setIsRateDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Settings className="h-4 w-4 mr-2" />
              Set Rate
            </Button>
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

          {/* Proxy Requests Table */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <CardTitle className="text-white flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Proxy Requests ({filteredRequests.length})
              </CardTitle>
              <CardDescription className="text-green-100">Review and approve proxy payment requests</CardDescription>
              <div className="flex flex-col lg:flex-row gap-4 mt-4">
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                  <Search className="h-4 w-4 text-white" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 bg-transparent text-white placeholder:text-green-200 focus:ring-0"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-48 bg-white/10 border-0 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">User</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Reason</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Applied Date</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No proxy requests found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests
                        .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
                        .map((request) => (
                          <TableRow key={request.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{request.userName}</TableCell>
                            <TableCell>{request.date}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {request.reason}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{request.description}</TableCell>
                            <TableCell className="font-semibold text-green-600">
                              ${request.amount}
                              <div className="text-xs text-gray-500">@ ${state.proxyRate}/proxy</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(request.status)} text-white border-0 capitalize`}>
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{request.createdDate}</TableCell>
                            <TableCell>
                              {request.status === "pending" && (
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApproveRequest(request.id)}
                                    className="hover:bg-green-50 hover:border-green-200"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRejectRequest(request.id)}
                                    className="hover:bg-red-50 hover:border-red-200"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              {request.status !== "pending" && (
                                <div className="text-sm text-gray-500">
                                  {request.status} on {request.approvedDate}
                                  {request.rejectionReason && (
                                    <div className="text-red-600 text-xs mt-1">Reason: {request.rejectionReason}</div>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proxy Rate Dialog */}
        <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Set Proxy Rate</DialogTitle>
              <DialogDescription>Update the payment rate per proxy request</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proxyRate">Rate per Proxy ($)</Label>
                <Input
                  id="proxyRate"
                  type="number"
                  value={newProxyRate}
                  onChange={(e) => setNewProxyRate(e.target.value)}
                  placeholder="Enter rate"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Current Rate:</strong> ${state.proxyRate} per proxy
                </p>
                <p className="text-xs text-blue-600 mt-1">This rate will apply to all new proxy requests</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsRateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProxyRate} className="bg-purple-500 hover:bg-purple-600">
                  Update Rate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default function ProxiesPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ProxiesPageContent />
    </ProtectedRoute>
  )
}
