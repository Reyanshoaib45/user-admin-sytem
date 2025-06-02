"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, DollarSign } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

function HRProxyRequestsPageContent() {
  const { state } = useApp()
  const { user } = useAuth("hr")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  if (!user) return null

  const filteredRequests = state.proxyRequests.filter((request) => {
    const matchesSearch =
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Proxy Requests</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardTitle className="text-white flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Proxy Requests ({filteredRequests.length})
            </CardTitle>
            <CardDescription className="text-orange-100">View all proxy payment requests</CardDescription>
            <div className="flex flex-col lg:flex-row gap-4 mt-4">
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-white" />
                <Input
                  placeholder="Search requests..."
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
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Reason</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Submitted</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No proxy requests found matching your criteria.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests
                      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
                      .map((request) => (
                        <TableRow key={request.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{request.userName}</TableCell>
                          <TableCell>{request.date}</TableCell>
                          <TableCell>{request.reason}</TableCell>
                          <TableCell className="font-semibold text-green-600">${request.amount}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(request.status)} text-white border-0 capitalize`}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{request.createdDate}</TableCell>
                          <TableCell className="max-w-xs">
                            {request.description ? (
                              <div className="group relative">
                                <div className="truncate">{request.description}</div>
                                <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-black text-white text-xs p-2 rounded shadow-lg z-10 max-w-xs">
                                  {request.description}
                                </div>
                              </div>
                            ) : (
                              "-"
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
      </main>
    </div>
  )
}

export default function HRProxyRequestsPage() {
  return (
    <ProtectedRoute requiredRole="hr">
      <HRProxyRequestsPageContent />
    </ProtectedRoute>
  )
}
