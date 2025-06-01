"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, CheckCircle, DollarSign } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import type { ProxyRequest } from "@/lib/context/app-context"

export default function ApplyProxyPage() {
  const { state, dispatch } = useApp()
  const [formData, setFormData] = useState({
    date: "",
    reason: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
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
    }
  }, [router, dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newProxyRequest: ProxyRequest = {
      id: `proxy-${Date.now()}`,
      userId: state.currentUser?.id || "",
      userName: state.currentUser?.name || "",
      date: formData.date,
      reason: formData.reason,
      description: formData.description,
      status: "pending",
      amount: state.proxyRate,
      createdDate: new Date().toISOString().split("T")[0],
    }

    dispatch({ type: "ADD_PROXY_REQUEST", payload: newProxyRequest })
    setIsLoading(false)
    setIsSuccess(true)

    // Redirect after success animation
    setTimeout(() => {
      router.push("/user")
    }, 2000)
  }

  if (!state.currentUser) return null

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md text-center shadow-xl border-0">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Proxy Request Submitted!</h2>
            <p className="text-gray-600">Your request is being reviewed by admin...</p>
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
            <Link href="/user">
              <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Apply for Proxy</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardTitle className="text-white flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Proxy Application
            </CardTitle>
            <CardDescription className="text-green-100">Submit a request for proxy payment</CardDescription>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                  Reason
                </Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Brief reason for proxy request"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed explanation for your proxy request"
                  rows={4}
                  className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Proxy Payment Information
                </h3>
                <p className="text-sm text-blue-700">
                  Current proxy rate: <span className="font-bold">${state.proxyRate}</span> per approved request.
                  Payment will be processed after admin approval.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6">
                <Link href="/user">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Submit Application
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
