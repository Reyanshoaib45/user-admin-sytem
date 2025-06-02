"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Video, MapPin, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Users, Eye } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function TrainingRequestsContent() {
  const { state, dispatch } = useApp()
  const { user } = useAuth("admin")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [actionData, setActionData] = useState({
    meetingLink: "",
    location: "",
    notes: "",
  })

  if (!user) return null

  const handleApprove = (request: any) => {
    const updatedRequest = {
      ...request,
      status: "approved" as const,
      approvedDate: new Date().toISOString().split("T")[0],
      meetingLink: request.type === "online" ? actionData.meetingLink : undefined,
      location: request.type === "physical" ? actionData.location : undefined,
      notes: actionData.notes,
    }

    dispatch({ type: "UPDATE_TRAINING_REQUEST", payload: updatedRequest })
    setSelectedRequest(null)
    setActionData({ meetingLink: "", location: "", notes: "" })
  }

  const handleReject = (request: any) => {
    const updatedRequest = {
      ...request,
      status: "rejected" as const,
      approvedDate: new Date().toISOString().split("T")[0],
      notes: actionData.notes,
    }

    dispatch({ type: "UPDATE_TRAINING_REQUEST", payload: updatedRequest })
    setSelectedRequest(null)
    setActionData({ meetingLink: "", location: "", notes: "" })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "completed":
        return "bg-blue-500"
      default:
        return "bg-yellow-500"
    }
  }

  const stats = [
    {
      title: "Total Requests",
      value: state.trainingRequests.length,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Pending",
      value: state.trainingRequests.filter((r) => r.status === "pending").length,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Approved",
      value: state.trainingRequests.filter((r) => r.status === "approved").length,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Completed",
      value: state.trainingRequests.filter((r) => r.status === "completed").length,
      color: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4 lg:py-6">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Training Requests</h1>
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
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color} text-white`}>
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Training Requests Table */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <CardTitle className="text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                All Training Requests
              </CardTitle>
              <CardDescription className="text-purple-100">
                Manage employee training and development requests
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Topic</TableHead>
                    <TableHead className="font-semibold">Preferred Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.trainingRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No training requests yet</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    state.trainingRequests
                      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
                      .map((request) => (
                        <TableRow key={request.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{request.userName}</div>
                              <div className="text-sm text-gray-500">Requested: {request.requestDate}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {request.type === "online" ? (
                                <Video className="h-4 w-4 text-blue-500" />
                              ) : (
                                <MapPin className="h-4 w-4 text-green-500" />
                              )}
                              <span className="capitalize">{request.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.topic}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">{request.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              <span>{request.preferredDate}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{request.preferredTime}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(request.status)} text-white border-0 capitalize`}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedRequest(request)}
                                    className="hover:bg-blue-50 hover:border-blue-200"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Training Request Details</DialogTitle>
                                    <DialogDescription>
                                      Review and manage training request from {request.userName}
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedRequest && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700">Employee</Label>
                                          <p className="text-sm text-gray-900">{selectedRequest.userName}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700">Type</Label>
                                          <div className="flex items-center space-x-2">
                                            {selectedRequest.type === "online" ? (
                                              <Video className="h-4 w-4 text-blue-500" />
                                            ) : (
                                              <MapPin className="h-4 w-4 text-green-500" />
                                            )}
                                            <span className="text-sm capitalize">{selectedRequest.type}</span>
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700">Topic</Label>
                                          <p className="text-sm text-gray-900">{selectedRequest.topic}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700">Status</Label>
                                          <Badge
                                            className={`${getStatusColor(selectedRequest.status)} text-white border-0 capitalize`}
                                          >
                                            {selectedRequest.status}
                                          </Badge>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700">Preferred Date</Label>
                                          <p className="text-sm text-gray-900">{selectedRequest.preferredDate}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700">Preferred Time</Label>
                                          <p className="text-sm text-gray-900">{selectedRequest.preferredTime}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                                        <p className="text-sm text-gray-900">{selectedRequest.description}</p>
                                      </div>

                                      {selectedRequest.status === "pending" && (
                                        <div className="space-y-4 border-t pt-4">
                                          <h4 className="font-medium text-gray-900">Action Required</h4>

                                          {selectedRequest.type === "online" && (
                                            <div className="space-y-2">
                                              <Label htmlFor="meetingLink">Meeting Link</Label>
                                              <Input
                                                id="meetingLink"
                                                value={actionData.meetingLink}
                                                onChange={(e) =>
                                                  setActionData({ ...actionData, meetingLink: e.target.value })
                                                }
                                                placeholder="https://zoom.us/j/..."
                                              />
                                            </div>
                                          )}

                                          {selectedRequest.type === "physical" && (
                                            <div className="space-y-2">
                                              <Label htmlFor="location">Meeting Location</Label>
                                              <Input
                                                id="location"
                                                value={actionData.location}
                                                onChange={(e) =>
                                                  setActionData({ ...actionData, location: e.target.value })
                                                }
                                                placeholder="Conference Room A, 2nd Floor"
                                              />
                                            </div>
                                          )}

                                          <div className="space-y-2">
                                            <Label htmlFor="notes">Notes (Optional)</Label>
                                            <Textarea
                                              id="notes"
                                              value={actionData.notes}
                                              onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                                              placeholder="Additional information for the employee..."
                                              rows={3}
                                            />
                                          </div>

                                          <div className="flex space-x-2">
                                            <Button
                                              onClick={() => handleApprove(selectedRequest)}
                                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                            >
                                              <CheckCircle className="h-4 w-4 mr-2" />
                                              Approve
                                            </Button>
                                            <Button
                                              onClick={() => handleReject(selectedRequest)}
                                              variant="outline"
                                              className="hover:bg-red-50 hover:border-red-200"
                                            >
                                              <XCircle className="h-4 w-4 mr-2" />
                                              Reject
                                            </Button>
                                          </div>
                                        </div>
                                      )}

                                      {selectedRequest.status === "approved" && (
                                        <div className="border-t pt-4">
                                          <h4 className="font-medium text-gray-900 mb-2">Approved Details</h4>
                                          {selectedRequest.meetingLink && (
                                            <div className="mb-2">
                                              <Label className="text-sm font-medium text-gray-700">Meeting Link</Label>
                                              <p className="text-sm text-blue-600">{selectedRequest.meetingLink}</p>
                                            </div>
                                          )}
                                          {selectedRequest.location && (
                                            <div className="mb-2">
                                              <Label className="text-sm font-medium text-gray-700">Location</Label>
                                              <p className="text-sm text-gray-900">{selectedRequest.location}</p>
                                            </div>
                                          )}
                                          {selectedRequest.notes && (
                                            <div>
                                              <Label className="text-sm font-medium text-gray-700">Notes</Label>
                                              <p className="text-sm text-gray-900">{selectedRequest.notes}</p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function TrainingRequestsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <TrainingRequestsContent />
    </ProtectedRoute>
  )
}
