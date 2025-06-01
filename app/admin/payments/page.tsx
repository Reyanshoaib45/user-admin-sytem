"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Plus, Search, DollarSign, Check, X, CreditCard, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import type { Payment } from "@/lib/context/app-context"

function PaymentsPageContent() {
  const { state, dispatch } = useApp()
  const { user } = useAuth("admin")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPayment, setNewPayment] = useState({
    userId: "",
    amount: "",
    type: "proxy",
    description: "",
    paymentMethod: "bank_transfer",
  })

  if (!user) return null

  const filteredPayments = state.payments.filter((payment) => {
    const matchesSearch =
      payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const totalPending = state.payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)

  const totalProcessed = state.payments.filter((p) => p.status === "processed").reduce((sum, p) => sum + p.amount, 0)

  const thisMonthPayments = state.payments.filter((p) =>
    p.createdDate.startsWith(new Date().toISOString().slice(0, 7)),
  ).length

  const stats = [
    {
      title: "Pending Payments",
      value: `$${totalPending}`,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      count: state.payments.filter((p) => p.status === "pending").length,
    },
    {
      title: "Processed This Month",
      value: `$${totalProcessed}`,
      icon: Check,
      color: "from-green-500 to-emerald-500",
      count: state.payments.filter((p) => p.status === "processed").length,
    },
    {
      title: "Total Transactions",
      value: state.payments.length,
      icon: CreditCard,
      color: "from-blue-500 to-cyan-500",
      count: thisMonthPayments,
    },
    {
      title: "Average Payment",
      value: `$${state.payments.length > 0 ? Math.round(state.payments.reduce((sum, p) => sum + p.amount, 0) / state.payments.length) : 0}`,
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      count: state.payments.filter((p) => p.amount > 100).length,
    },
  ]

  const handleCreatePayment = () => {
    const selectedUser = state.users.find((u) => u.id === newPayment.userId)
    if (!selectedUser || !newPayment.amount) return

    const payment: Payment = {
      id: `payment-${Date.now()}`,
      userId: newPayment.userId,
      userName: selectedUser.name,
      amount: Number.parseFloat(newPayment.amount),
      type: newPayment.type as "proxy" | "salary" | "bonus" | "overtime",
      status: "pending",
      description: newPayment.description,
      createdDate: new Date().toISOString().split("T")[0],
      paymentMethod: newPayment.paymentMethod as "bank_transfer" | "cash" | "check",
      referenceNumber: `REF-${Date.now()}`,
    }

    dispatch({ type: "ADD_PAYMENT", payload: payment })
    setIsCreateDialogOpen(false)
    setNewPayment({
      userId: "",
      amount: "",
      type: "proxy",
      description: "",
      paymentMethod: "bank_transfer",
    })
  }

  const handleProcessPayment = (paymentId: string) => {
    const payment = state.payments.find((p) => p.id === paymentId)
    if (!payment) return

    const updatedPayment = {
      ...payment,
      status: "processed" as const,
      processedDate: new Date().toISOString().split("T")[0],
    }

    dispatch({ type: "UPDATE_PAYMENT", payload: updatedPayment })
  }

  const handleRejectPayment = (paymentId: string) => {
    const payment = state.payments.find((p) => p.id === paymentId)
    if (!payment) return

    const updatedPayment = {
      ...payment,
      status: "failed" as const,
      processedDate: new Date().toISOString().split("T")[0],
    }

    dispatch({ type: "UPDATE_PAYMENT", payload: updatedPayment })
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
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Payment Management</h1>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Payment</DialogTitle>
                  <DialogDescription>Add a new payment for a user</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId">Select User</Label>
                    <Select
                      value={newPayment.userId}
                      onValueChange={(value) => setNewPayment({ ...newPayment, userId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose user" />
                      </SelectTrigger>
                      <SelectContent>
                        {state.users
                          .filter((u) => u.role === "user")
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={newPayment.type}
                        onValueChange={(value) => setNewPayment({ ...newPayment, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="proxy">Proxy</SelectItem>
                          <SelectItem value="salary">Salary</SelectItem>
                          <SelectItem value="bonus">Bonus</SelectItem>
                          <SelectItem value="overtime">Overtime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newPayment.description}
                      onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                      placeholder="Payment description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={newPayment.paymentMethod}
                      onValueChange={(value) => setNewPayment({ ...newPayment, paymentMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePayment} className="bg-green-500 hover:bg-green-600">
                      Create Payment
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                  <div className="text-xs text-gray-500">{stat.count} transactions</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payments Table */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <CardTitle className="text-white flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Payment Records ({filteredPayments.length})
              </CardTitle>
              <CardDescription className="text-green-100">Manage and process user payments</CardDescription>
              <div className="flex flex-col lg:flex-row gap-4 mt-4">
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                  <Search className="h-4 w-4 text-white" />
                  <Input
                    placeholder="Search payments..."
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
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
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
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="font-semibold">Method</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No payment records found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments
                        .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
                        .map((payment) => (
                          <TableRow key={payment.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{payment.userName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {payment.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">${payment.amount}</TableCell>
                            <TableCell className="max-w-xs truncate">{payment.description}</TableCell>
                            <TableCell className="capitalize">
                              {payment.paymentMethod?.replace("_", " ") || "Not specified"}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(payment.status)} text-white border-0 capitalize`}>
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{payment.createdDate}</TableCell>
                            <TableCell>
                              {payment.status === "pending" && (
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleProcessPayment(payment.id)}
                                    className="hover:bg-green-50 hover:border-green-200"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRejectPayment(payment.id)}
                                    className="hover:bg-red-50 hover:border-red-200"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              {payment.status !== "pending" && (
                                <div className="text-sm text-gray-500">
                                  {payment.status} on {payment.processedDate}
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
      </main>
    </div>
  )
}

export default function PaymentsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <PaymentsPageContent />
    </ProtectedRoute>
  )
}
