"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function UsersPageContent() {
  const { state, dispatch } = useApp()
  const { user } = useAuth("admin")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [personalWarning, setPersonalWarning] = useState("")
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false)

  if (!user) return null

  const users = state.users.filter((u) => u.role !== "admin")

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      dispatch({ type: "DELETE_USER", payload: userId })
      // Also remove related tasks and proxy requests
      state.tasks
        .filter((t) => t.assignedTo === userId)
        .forEach((task) => {
          dispatch({ type: "DELETE_TASK", payload: task.id })
        })
    }
  }

  const handleToggleUserStatus = (userId: string) => {
    const userToUpdate = state.users.find((u) => u.id === userId)
    if (userToUpdate) {
      const updatedUser = {
        ...userToUpdate,
        status: userToUpdate.status === "active" ? ("inactive" as const) : ("active" as const),
      }
      dispatch({ type: "UPDATE_USER", payload: updatedUser })
    }
  }

  const handleSetPersonalWarning = () => {
    if (selectedUser) {
      const updatedUser = {
        ...selectedUser,
        personalWarning: personalWarning.trim() || undefined,
      }
      dispatch({ type: "UPDATE_USER", payload: updatedUser })
      setIsWarningDialogOpen(false)
      setPersonalWarning("")
      setSelectedUser(null)
    }
  }

  const openWarningDialog = (user: any) => {
    setSelectedUser(user)
    setPersonalWarning(user.personalWarning || "")
    setIsWarningDialogOpen(true)
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
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text">User Management</h1>
            </div>
            <Link href="/admin/users/create">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <CardTitle className="text-white flex items-center">
              <Users className="h-5 w-5 mr-2" />
              All Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription className="text-purple-100">Manage and monitor user accounts</CardDescription>
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2 mt-4">
              <Search className="h-4 w-4 text-white" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent text-white placeholder:text-purple-200 focus:ring-0"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="font-semibold">Time Shift</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Warning</TableHead>
                    <TableHead className="font-semibold">Join Date</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.timeShift?.replace("-", " ") || "Not set"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.personalWarning ? (
                          <Badge variant="destructive" className="bg-orange-500">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">None</Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openWarningDialog(user)}
                            className="hover:bg-orange-50 hover:border-orange-200"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`hover:${user.status === "active" ? "bg-red-50 hover:border-red-200" : "bg-green-50 hover:border-green-200"}`}
                          >
                            {user.status === "active" ? (
                              <ToggleRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="hover:bg-red-50 hover:border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No users found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Warning Dialog */}
        <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Personal Warning for {selectedUser?.name}
              </DialogTitle>
              <DialogDescription>
                Set a personal warning message that will be displayed to this specific user when they log in.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personalWarning">Warning Message</Label>
                <Textarea
                  id="personalWarning"
                  value={personalWarning}
                  onChange={(e) => setPersonalWarning(e.target.value)}
                  placeholder="Enter warning message for this user (leave empty to remove warning)"
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsWarningDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSetPersonalWarning} className="bg-orange-500 hover:bg-orange-600">
                  {personalWarning.trim() ? "Set Warning" : "Remove Warning"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <UsersPageContent />
    </ProtectedRoute>
  )
}
