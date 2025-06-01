"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, DollarSign, Check, X } from "lucide-react"
import Link from "next/link"

export default function ProxiesPage() {
  const [user, setUser] = useState<any>(null)
  const [proxyRate, setProxyRate] = useState("50")
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

  // Mock proxy requests data
  const proxyRequests = [
    { id: 1, userName: "John Doe", date: "2024-01-15", reason: "Medical appointment", status: "pending", amount: 50 },
    { id: 2, userName: "Jane Smith", date: "2024-01-16", reason: "Family emergency", status: "approved", amount: 50 },
    { id: 3, userName: "Mike Johnson", date: "2024-01-17", reason: "Personal work", status: "rejected", amount: 0 },
    { id: 4, userName: "Sarah Wilson", date: "2024-01-18", reason: "Court appearance", status: "pending", amount: 50 },
  ]

  const totalPendingAmount = proxyRequests
    .filter((req) => req.status === "pending")
    .reduce((sum, req) => sum + req.amount, 0)

  const totalApprovedAmount = proxyRequests
    .filter((req) => req.status === "approved")
    .reduce((sum, req) => sum + req.amount, 0)

  const handleApprove = (id: number) => {
    console.log("Approving proxy request:", id)
  }

  const handleReject = (id: number) => {
    console.log("Rejecting proxy request:", id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-6">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Proxy Management</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {/* Proxy Rate Setting */}
          <Card>
            <CardHeader>
              <CardTitle>Proxy Rate Configuration</CardTitle>
              <CardDescription>Set the amount paid per proxy request</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-sm">
                  <Label htmlFor="proxyRate">Amount per Proxy ($)</Label>
                  <Input
                    id="proxyRate"
                    type="number"
                    value={proxyRate}
                    onChange={(e) => setProxyRate(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <Button className="mt-6">Update Rate</Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalPendingAmount}</div>
                <p className="text-xs text-muted-foreground">
                  {proxyRequests.filter((req) => req.status === "pending").length} requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalApprovedAmount}</div>
                <p className="text-xs text-muted-foreground">
                  {proxyRequests.filter((req) => req.status === "approved").length} requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Rate</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${proxyRate}</div>
                <p className="text-xs text-muted-foreground">per proxy</p>
              </CardContent>
            </Card>
          </div>

          {/* Proxy Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Proxy Requests</CardTitle>
              <CardDescription>Review and manage proxy payment requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proxyRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.userName}</TableCell>
                      <TableCell>{request.date}</TableCell>
                      <TableCell>{request.reason}</TableCell>
                      <TableCell>${request.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            request.status === "approved"
                              ? "default"
                              : request.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleApprove(request.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleReject(request.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
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
