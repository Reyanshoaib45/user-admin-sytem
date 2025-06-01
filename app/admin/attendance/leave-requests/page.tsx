"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Calendar, Check, X, Clock } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function LeaveRequestsPageContent() {
  const { state, dispatch } = useApp()
  const { user } = useAuth("admin")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  if (!user) return null

  const filteredRequests = state.leaveRequests.filter((request) => {
    const matchesSearch =
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleApproveLeave = (requestId: string) => {
    const request = state.leaveRequests.find((r) => r.id === requestId)
    if (!request) return

    const updatedRequest = {
      ...request,
      status: "approved" as const,
      approvedBy: user.id,
      approvedDate: new Date().toISOString().split("T")[0],
    }

    dispatch({ type: "UPDATE_LEAVE_REQUEST", payload: updatedRequest })

    // Create attendance records for leave days
    const startDate = new Date(request.startDate)
    const endDate = new Date(request.endDate)
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split("T")[0]
      const attendanceRecord = {
        id: `att-leave-${Date.now()}-${currentDate.getTime()}`,
        userId: request.userId,
        userName: request.userName,
        date: dateString,
        status: "leave" as const,
        leaveType: request.leaveType,
        notes: `Approved leave: ${request.reason}`,
      }

      dispatch({ type: "ADD_ATTENDANCE", payload: attendanceRecord })
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }

  const handleRejectLeave = (requestId: string) => {
    const request = state.leaveRequests.find((r) => r.id === requestId)
    if (!request) return

    const updatedRequest = {
      ...request,
      status: "rejected" as const,
      approvedBy: user.id,
      approvedDate: new Date().toISOString().split("T")[0],
    }

    dispatch({ type: "UPDATE_LEAVE_REQUEST", payload: updatedRequest })
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

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case "sick":
        return "bg-red-100 text-red-800"
      case "casual":
        return "bg-blue-100 text-blue-800"
      case "vacation":
        return "bg-green-100 text-green-800"
      case "emergency":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4 lg:py-6">
            <Link href="/admin/attendance">
              <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:border-purple-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Leave Requests</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <CardTitle className="text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Leave Requests ({filteredRequests.length})
            </CardTitle>
            <CardDescription className="text-purple-100">Review and manage employee leave requests</CardDescription>
            <div className="flex flex-col lg:flex-row gap-4 mt-4">
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-white" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 bg-transparent text-white placeholder:text-purple-200 focus:ring-0"
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
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold">Leave Type</TableHead>
                    <TableHead className="font-semibold">Start Date</TableHead>
                    <TableHead className="font-semibold">End Date</TableHead>
                    <TableHead className="font-semibold">Days</TableHead>
                    <TableHead className="font-semibold">Reason</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.userName}</div>
                          <div className="text-sm text-gray-500">Applied: {request.appliedDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getLeaveTypeColor(request.leaveType)} border-0 capitalize`}>
                          {request.leaveType}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.startDate}</TableCell>
                      <TableCell>{request.endDate}</TableCell>
                      <TableCell>{request.totalDays} days</TableCell>
                      <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(request.status)} text-white border-0 capitalize`}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveLeave(request.id)}
                              className="hover:bg-green-50 hover:border-green-200"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectLeave(request.id)}
                              className="hover:bg-red-50 hover:border-red-200"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {request.status !== "pending" && (
                          <div className="text-sm text-gray-500">
                            {request.status} on {request.approvedDate}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No leave requests found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function LeaveRequestsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <LeaveRequestsPageContent />
    </ProtectedRoute>
  )
}
