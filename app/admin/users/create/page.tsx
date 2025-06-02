"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { User } from "@/lib/context/app-context"

function CreateUserPageContent() {
  const { state, dispatch } = useApp()
  const { user } = useAuth("admin")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    department: "",
    timeShift: "",
    status: "active",
    disableMessage: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate form data
    if (!formData.name || !formData.email || !formData.password || !formData.department || !formData.timeShift) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    // Check if email already exists
    const existingUser = state.users.find((user) => user.email.toLowerCase() === formData.email.toLowerCase())

    if (existingUser) {
      setError("A user with this email already exists")
      setIsLoading(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    // Validate password length
    if (formData.password.length < 3) {
      setError("Password must be at least 3 characters long")
      setIsLoading(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role as "admin" | "user" | "hr" | "all-in-department",
      department: formData.department,
      timeShift: formData.timeShift as "morning" | "evening" | "night" | "flexible",
      joinDate: new Date().toISOString().split("T")[0],
      status: formData.status as "active" | "inactive",
      disableMessage: formData.disableMessage,
      workingHours: { start: "09:00", end: "17:00" },
      password: formData.password, // Store password properly
      isOnboarded: false, // New users need onboarding
      referralCode: `${formData.name.replace(/\s+/g, "").toUpperCase().slice(0, 4)}${Math.floor(Math.random() * 9999)
        .toString()
        .padStart(4, "0")}`,
    }

    dispatch({ type: "ADD_USER", payload: newUser })
    setIsLoading(false)
    setIsSuccess(true)

    // Redirect after success animation
    setTimeout(() => {
      router.push("/admin/users")
    }, 2000)
  }

  if (!user) return null

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md text-center shadow-xl border-0">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">User Created Successfully!</h2>
            <p className="text-gray-600 mb-4">
              <span className="font-medium">{formData.name}</span> can now login with their credentials.
            </p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to users page...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4 lg:py-6">
            <Link href="/admin/users">
              <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:border-purple-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Create New User</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <CardTitle className="text-white flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              User Information
            </CardTitle>
            <CardDescription className="text-purple-100">Enter the details for the new user account</CardDescription>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            {error && (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password (min 3 characters)"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                  required
                  minLength={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                    Role *
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="all-in-department">All in Department</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                    Department *
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="HR">Human Resources</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="IT">Information Technology</SelectItem>
                      <SelectItem value="Subuser">Subuser</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timeShift" className="text-sm font-medium text-gray-700">
                    Time Shift *
                  </Label>
                  <Select
                    value={formData.timeShift}
                    onValueChange={(value) => setFormData({ ...formData, timeShift: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select time shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning Shift (6:00 AM - 2:00 PM)</SelectItem>
                      <SelectItem value="evening">Evening Shift (2:00 PM - 10:00 PM)</SelectItem>
                      <SelectItem value="night">Night Shift (10:00 PM - 6:00 AM)</SelectItem>
                      <SelectItem value="flexible">Flexible Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status *
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.status === "inactive" && (
                <div className="space-y-2">
                  <Label htmlFor="disableMessage" className="text-sm font-medium text-gray-700">
                    Disable Message
                  </Label>
                  <Textarea
                    id="disableMessage"
                    value={formData.disableMessage}
                    onChange={(e) => setFormData({ ...formData, disableMessage: e.target.value })}
                    placeholder="Enter message to show when this user tries to login"
                    rows={3}
                    className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Account Information</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• The new user will be able to log in immediately with the provided credentials</p>
                  <p>• They will have access to features based on their assigned role</p>
                  <p>• Working hours will be set based on their time shift</p>
                  <p>• Account status can be changed later if needed</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full sm:w-auto px-6">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating User...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create User
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function CreateUserPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CreateUserPageContent />
    </ProtectedRoute>
  )
}
