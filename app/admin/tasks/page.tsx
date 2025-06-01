"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Search, Edit, Trash2, Clock, CheckCircle, AlertCircle, ClipboardList } from "lucide-react"
import Link from "next/link"

export default function AdminTasksPage() {
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete project documentation",
      description: "Write comprehensive documentation for the new project",
      assignedTo: "John Doe",
      assignedToId: "user-1",
      status: "completed",
      priority: "medium",
      dueDate: "2024-01-20",
      createdDate: "2024-01-15",
    },
    {
      id: 2,
      title: "Review code changes",
      description: "Review and approve the latest code changes in the repository",
      assignedTo: "Jane Smith",
      assignedToId: "user-2",
      status: "in-progress",
      priority: "high",
      dueDate: "2024-01-25",
      createdDate: "2024-01-18",
    },
    {
      id: 3,
      title: "Prepare presentation",
      description: "Create presentation for the quarterly review meeting",
      assignedTo: "Mike Johnson",
      assignedToId: "user-3",
      status: "pending",
      priority: "low",
      dueDate: "2024-01-30",
      createdDate: "2024-01-20",
    },
    {
      id: 4,
      title: "Update database schema",
      description: "Implement new database schema changes for user management",
      assignedTo: "Sarah Wilson",
      assignedToId: "user-4",
      status: "in-progress",
      priority: "high",
      dueDate: "2024-01-28",
      createdDate: "2024-01-22",
    },
  ])
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== "admin") {
        router.push("/login")
        return
      }
      setUser(parsedUser)
    } else {
      router.push("/login")
    }
  }, [router])

  if (!user) return null

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  const stats = [
    { title: "Total Tasks", value: tasks.length, color: "from-blue-500 to-cyan-500" },
    {
      title: "Completed",
      value: tasks.filter((t) => t.status === "completed").length,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "In Progress",
      value: tasks.filter((t) => t.status === "in-progress").length,
      color: "from-yellow-500 to-orange-500",
    },
    { title: "Pending", value: tasks.filter((t) => t.status === "pending").length, color: "from-red-500 to-pink-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:border-purple-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Task Management
              </h1>
            </div>
            <Link href="/admin/tasks/create">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="shadow-lg border-0 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color} text-white`}>
                      <ClipboardList className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tasks Table */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
              <CardTitle className="text-white">All Tasks</CardTitle>
              <CardDescription className="text-purple-100">Manage and monitor task assignments</CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                  <Search className="h-4 w-4 text-white" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 bg-transparent text-white placeholder:text-purple-200 focus:ring-0"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-white/10 border-0 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Task</TableHead>
                    <TableHead className="font-semibold">Assigned To</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Due Date</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{task.description}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{task.assignedTo}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(task.status)} text-white border-0`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(task.status)}
                            <span className="capitalize">{task.status.replace("-", " ")}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getPriorityColor(task.priority)} text-white border-0 capitalize`}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.dueDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
