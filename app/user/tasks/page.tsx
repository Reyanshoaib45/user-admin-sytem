"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Play,
  RotateCcw,
  ClipboardList,
} from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"

export default function UserTasksPage() {
  const { state, dispatch } = useApp()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== "user") {
        router.push("/login")
        return
      }
      dispatch({ type: "SET_CURRENT_USER", payload: parsedUser })
    } else {
      router.push("/login")
      return
    }

    setTimeout(() => setIsLoading(false), 800)
  }, [router, dispatch])

  if (isLoading || !state.currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const userTasks = state.tasks.filter((task) => task.assignedTo === state.currentUser?.id)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
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
        return "from-red-500 to-pink-500"
      case "medium":
        return "from-yellow-500 to-orange-500"
      case "low":
        return "from-green-500 to-emerald-500"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const handleUpdateProgress = (taskId: string, newProgress: number) => {
    const task = state.tasks.find((t) => t.id === taskId)
    if (!task) return

    const updatedTask = { ...task, progress: newProgress }

    if (newProgress === 100) {
      updatedTask.status = "completed"
      updatedTask.completedDate = new Date().toISOString().split("T")[0]
    } else if (newProgress > 0) {
      updatedTask.status = "in-progress"
    }

    dispatch({ type: "UPDATE_TASK", payload: updatedTask })
  }

  const stats = [
    { title: "Total Tasks", value: userTasks.length, color: "from-blue-500 to-cyan-500" },
    {
      title: "Completed",
      value: userTasks.filter((t) => t.status === "completed").length,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "In Progress",
      value: userTasks.filter((t) => t.status === "in-progress").length,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Pending",
      value: userTasks.filter((t) => t.status === "pending").length,
      color: "from-red-500 to-pink-500",
    },
  ]

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
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">My Tasks</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="shadow-lg border-0 overflow-hidden card-hover">
                <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-2 lg:p-3 rounded-full bg-gradient-to-r ${stat.color} text-white`}>
                      <User className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tasks Grid */}
          {userTasks.length === 0 ? (
            <Card className="shadow-xl border-0 text-center p-8">
              <CardContent>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Assigned</h3>
                <p className="text-gray-600">You don't have any tasks assigned yet. Check back later!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {userTasks.map((task) => (
                <Card key={task.id} className="shadow-xl border-0 overflow-hidden card-hover">
                  <div className={`h-1 bg-gradient-to-r ${getPriorityColor(task.priority)}`}></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">{task.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {task.dueDate}</span>
                          </div>
                          <Badge className={`${getStatusColor(task.status)} text-white border-0 capitalize`}>
                            {task.status.replace("-", " ")}
                          </Badge>
                        </div>
                      </div>
                      {getStatusIcon(task.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm leading-relaxed">{task.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-500">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Priority:</span>
                        <Badge
                          className={`ml-2 bg-gradient-to-r ${getPriorityColor(task.priority)} text-white border-0 capitalize`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-500">Assigned:</span>
                        <span className="ml-2 font-medium">{task.createdDate}</span>
                      </div>
                    </div>

                    {task.status !== "completed" && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {task.status === "pending" && (
                          <Button
                            onClick={() => handleUpdateProgress(task.id, 25)}
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start Task
                          </Button>
                        )}
                        {task.status === "in-progress" && (
                          <>
                            <Button
                              onClick={() => handleUpdateProgress(task.id, Math.min(task.progress + 25, 100))}
                              size="sm"
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Update Progress
                            </Button>
                            <Button
                              onClick={() => handleUpdateProgress(task.id, 100)}
                              size="sm"
                              variant="outline"
                              className="hover:bg-green-50 hover:border-green-200 transition-all duration-300"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          </>
                        )}
                      </div>
                    )}

                    {task.status === "completed" && task.completedDate && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-800 font-medium">Completed on {task.completedDate}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
