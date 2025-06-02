"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Video, MapPin, Calendar, Clock, Plus, CheckCircle, XCircle, AlertCircle, Users } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function UserTrainingContent() {
  const { state, dispatch } = useApp()
  const { user } = useAuth("user")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: "online" as "online" | "physical",
    topic: "",
    description: "",
    preferredDate: "",
    preferredTime: "",
  })

  if (!user) return null

  const userTrainingRequests = state.trainingRequests.filter((req) => req.userId === user.id)
  const managers = state.users.filter((u) => u.role === "admin" || u.role === "hr")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const manager = managers[0] // Assign to first available manager

    const newRequest = {
      id: `training-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      type: formData.type,
      topic: formData.topic,
      description: formData.description,
      preferredDate: formData.preferredDate,
      preferredTime: formData.preferredTime,
      status: "pending" as const,
      managerId: manager?.id,
      managerName: manager?.name,
      requestDate: new Date().toISOString().split("T")[0],
    }

    dispatch({ type: "ADD_TRAINING_REQUEST", payload: newRequest })

    setFormData({
      type: "online",
      topic: "",
      description: "",
      preferredDate: "",
      preferredTime: "",
    })
    setShowForm(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 lg:py-6">
            <div className="flex items-center space-x-4">
              <Link href="/user">
                <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Training & Development</h1>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Training
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Training Request Form */}
          {showForm && (
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <CardTitle className="text-white">Request Training Session</CardTitle>
                <CardDescription className="text-purple-100">
                  Choose between online meeting or physical meetup with manager
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Training Type</Label>
                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          variant={formData.type === "online" ? "default" : "outline"}
                          onClick={() => setFormData({ ...formData, type: "online" })}
                          className="flex-1"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Online Meeting
                        </Button>
                        <Button
                          type="button"
                          variant={formData.type === "physical" ? "default" : "outline"}
                          onClick={() => setFormData({ ...formData, type: "physical" })}
                          className="flex-1"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Physical Meetup
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="topic">Training Topic</Label>
                      <Input
                        id="topic"
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        placeholder="e.g., Project Management, Technical Skills"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredDate">Preferred Date</Label>
                      <Input
                        id="preferredDate"
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredTime">Preferred Time</Label>
                      <Input
                        id="preferredTime"
                        type="time"
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what you'd like to learn or discuss..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    >
                      Submit Request
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Training Requests History */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <CardTitle className="text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                My Training Requests
              </CardTitle>
              <CardDescription className="text-indigo-100">Track your training sessions and meetings</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {userTrainingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No training requests yet</p>
                  <p className="text-sm text-gray-400">Request your first training session to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTrainingRequests
                    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
                    .map((request) => (
                      <div
                        key={request.id}
                        className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {request.type === "online" ? (
                                <Video className="h-5 w-5 text-blue-500" />
                              ) : (
                                <MapPin className="h-5 w-5 text-green-500" />
                              )}
                              <h3 className="font-semibold text-gray-900">{request.topic}</h3>
                              <Badge className={`${getStatusColor(request.status)} text-white border-0 capitalize`}>
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {request.preferredDate}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {request.preferredTime}
                              </div>
                              {request.managerName && (
                                <div className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  Manager: {request.managerName}
                                </div>
                              )}
                            </div>
                            {request.meetingLink && request.status === "approved" && (
                              <div className="mt-2">
                                <a
                                  href={request.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  Join Meeting →
                                </a>
                              </div>
                            )}
                            {request.location && request.status === "approved" && (
                              <div className="mt-2">
                                <span className="text-sm text-gray-600">
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  Location: {request.location}
                                </span>
                              </div>
                            )}
                            {request.notes && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                                <strong>Manager Notes:</strong> {request.notes}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">{getStatusIcon(request.status)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function UserTrainingPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <UserTrainingContent />
    </ProtectedRoute>
  )
}
