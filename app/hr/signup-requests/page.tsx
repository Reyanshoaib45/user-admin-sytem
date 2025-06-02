"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Search, UserPlus, Check, X, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import type { User } from "@/lib/context/app-context"

function SignupRequestsPageContent() {
  const { state, dispatch } = useApp()
  const { user } = useAuth("hr")
  const [searchTerm, setSearchTerm] = useState("")
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [newUserData, setNewUserData] = useState({
    name: "",
    department: "",
    timeShift: "",
    password: "",
  })

  if (!user) return null

  const filteredRequests = state.signupRequests.filter(
    (request) => request.email.toLowerCase().includes(searchTerm.toLowerCase()) || request.phone.includes(searchTerm),
  )

  const handleApproveRequest = () => {
    if (
      !selectedRequest ||
      !newUserData.name ||
      !newUserData.department ||
      !newUserData.timeShift ||
      !newUserData.password
    ) {
      return
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: newUserData.name,
      email: selectedRequest.email,
      phone: selectedRequest.phone,
      role: "user",
      department: newUserData.department,
      timeShift: newUserData.timeShift as "morning" | "evening" | "night" | "flexible",
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
      workingHours: { start: "09:00", end: "17:00" },
      password: newUserData.password,
    }

    // Add user and update request
    dispatch({ type: "ADD_USER", payload: newUser })

    const updatedRequest = {
      ...selectedRequest,
      status: "approved" as const,
      processedBy: user.id,
      processedDate: new Date().toISOString().split("T")[0],
    }

    dispatch({ type: "UPDATE_SIGNUP_REQUEST", payload: updatedRequest })

    // Reset form and close dialog
    setIsApproveDialogOpen(false)
    setSelectedRequest(null)
    setNewUserData({
      name: "",
      department: "",
      timeShift: "",
      password: "",
    })
  }

  const handleRejectRequest = (requestId: string, reason: string) => {
    const request = state.signupRequests.find((req) => req.id === requestId)
    if (!request) return

    const updatedRequest = {
      ...request,
      status: "rejected" as const,
      processedBy: user.id,
      processedDate: new Date().toISOString().split("T")[0],
      rejectionReason: reason,
    }

    dispatch({ type: "UPDATE_SIGNUP_REQUEST", payload: updatedRequest })
  }

  const openApproveDialog = (request: any) => {
    setSelectedRequest(request)
    setNewUserData({
      name: "",
      department: "",
      timeShift: "",
      password: "",
    })
    setIsApproveDialogOpen(true)
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
          <div className="flex items-center space-x-4 py-4 lg:py-6">
            <Link href="/hr">
              <Button variant="outline" size="sm" className="hover:bg-orange-50 hover:border-orange-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Signup Requests</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardTitle className="text-white flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Account Requests ({filteredRequests.length})
            </CardTitle>
            <CardDescription className="text-orange-100">Review and approve new account requests</CardDescription>
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2 mt-4">
              <Search className="h-4 w-4 text-white" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent text-white placeholder:text-orange-200 focus:ring-0"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Submitted Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Processed By</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No signup requests found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests
                      .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
                      .map((request) => (
                        <TableRow key={request.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{request.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{request.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>{request.submittedDate}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(request.status)} text-white border-0 capitalize`}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.processedBy ? (
                              <div className="text-sm">
                                <div>Processed on {request.processedDate}</div>
                                {request.rejectionReason && (
                                  <div className="text-red-600 text-xs mt-1">Reason: {request.rejectionReason}</div>
                                )}
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {request.status === "pending" && (
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openApproveDialog(request)}
                                  className="hover:bg-green-50 hover:border-green-200"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const reason = prompt("Enter rejection reason:")
                                    if (reason) {
                                      handleRejectRequest(request.id, reason)
                                    }
                                  }}
                                  className="hover:bg-red-50 hover:border-red-200"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
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

        {/* Approve Request Dialog */}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Approve Account Request</DialogTitle>
              <DialogDescription>Create account for {selectedRequest?.email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Email:</strong> {selectedRequest?.email}
                </p>
                <p className="text-sm">
                  <strong>Phone:</strong> {selectedRequest?.phone}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <select
                  id="department"
                  value={newUserData.department}
                  onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="IT">Information Technology</option>
                  <option value="Subuser">Subuser</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeShift">Time Shift *</Label>
                <select
                  id="timeShift"
                  value={newUserData.timeShift}
                  onChange={(e) => setNewUserData({ ...newUserData, timeShift: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select time shift</option>
                  <option value="morning">Morning Shift (6:00 AM - 2:00 PM)</option>
                  <option value="evening">Evening Shift (2:00 PM - 10:00 PM)</option>
                  <option value="night">Night Shift (10:00 PM - 6:00 AM)</option>
                  <option value="flexible">Flexible Hours</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Initial Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="Enter initial password"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApproveRequest} className="bg-green-500 hover:bg-green-600">
                  Create Account
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default function SignupRequestsPage() {
  return (
    <ProtectedRoute requiredRole="hr">
      <SignupRequestsPageContent />
    </ProtectedRoute>
  )
}
