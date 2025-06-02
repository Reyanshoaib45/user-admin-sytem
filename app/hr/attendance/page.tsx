"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Search,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function HRAttendancePageContent() {
  const { state } = useApp()
  const { user } = useAuth("hr")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")

  if (!user) return null

  const today = new Date().toISOString().split("T")[0]
  const thisMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

  // Filter attendance records
  const filteredRecords = state.attendanceRecords.filter((record) => {
    const matchesSearch =
      record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.userId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    const matchesDate = !dateFilter || record.date.startsWith(dateFilter)
    return matchesSearch && matchesStatus && matchesDate
  })

  // Calculate statistics
  const todayAttendance = state.attendanceRecords.filter((r) => r.date === today)
  const thisMonthAttendance = state.attendanceRecords.filter((r) => r.date.startsWith(thisMonth))
  const totalUsers = state.users.filter((u) => u.role === "user").length

  const stats = [
    {
      title: "Today's Attendance",
      value: `${todayAttendance.length}/${totalUsers}`,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      percentage: Math.round((todayAttendance.length / totalUsers) * 100),
    },
    {
      title: "Present Today",
      value: todayAttendance.filter((r) => r.status === "present").length,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      percentage: Math.round(
        (todayAttendance.filter((r) => r.status === "present").length / todayAttendance.length) * 100,
      ),
    },
    {
      title: "Late Today",
      value: todayAttendance.filter((r) => r.status === "late").length,
      icon: AlertCircle,
      color: "from-yellow-500 to-orange-500",
      percentage: Math.round(
        (todayAttendance.filter((r) => r.status === "late").length / todayAttendance.length) * 100,
      ),
    },
    {
      title: "On Leave",
      value: todayAttendance.filter((r) => r.status === "leave").length,
      icon: XCircle,
      color: "from-red-500 to-pink-500",
      percentage: Math.round(
        (todayAttendance.filter((r) => r.status === "leave").length / todayAttendance.length) * 100,
      ),
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "late":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "leave":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "half-day":
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500"
      case "late":
        return "bg-yellow-500"
      case "absent":
        return "bg-red-500"
      case "leave":
        return "bg-blue-500"
      case "half-day":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const exportAttendance = () => {
    // Simple CSV export
    const headers = ["Date", "Employee", "Check In", "Check Out", "Status", "Working Hours", "Notes"]
    const csvData = [
      headers.join(","),
      ...filteredRecords.map((record) =>
        [
          record.date,
          record.userName,
          record.checkInTime || "-",
          record.checkOutTime || "-",
          record.status,
          record.workingHours || "-",
          record.notes || "-",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 lg:py-6">
            <div className="flex items-center space-x-4">
              <Link href="/hr">
                <Button variant="outline" size="sm" className="hover:bg-orange-50 hover:border-orange-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Attendance Records</h1>
            </div>
            <Button
              onClick={exportAttendance}
              variant="outline"
              size="sm"
              className="hover:bg-green-50 hover:border-green-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
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
                  <div className="flex items-center justify-between">
                    <div className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="flex items-center text-green-600 text-sm">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.percentage}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Attendance Table */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardTitle className="text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Attendance Records ({filteredRecords.length})
              </CardTitle>
              <CardDescription className="text-orange-100">Monitor employee attendance records</CardDescription>
              <div className="flex flex-col lg:flex-row gap-4 mt-4">
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                  <Search className="h-4 w-4 text-white" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 bg-transparent text-white placeholder:text-orange-200 focus:ring-0"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-48 bg-white/10 border-0 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="leave">On Leave</SelectItem>
                    <SelectItem value="half-day">Half Day</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="month"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full lg:w-48 bg-white/10 border-0 text-white"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Employee</TableHead>
                      <TableHead className="font-semibold">Check In</TableHead>
                      <TableHead className="font-semibold">Check Out</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Working Hours</TableHead>
                      <TableHead className="font-semibold">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{record.date}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{record.userName}</div>
                            <div className="text-sm text-gray-500">{record.userId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{record.checkInTime || "-"}</TableCell>
                        <TableCell>{record.checkOutTime || "-"}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(record.status)} text-white border-0 capitalize`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(record.status)}
                              <span>{record.status.replace("-", " ")}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>{record.workingHours ? `${record.workingHours}h` : "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">{record.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredRecords.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No attendance records found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function HRAttendancePage() {
  return (
    <ProtectedRoute requiredRole="hr">
      <HRAttendancePageContent />
    </ProtectedRoute>
  )
}
