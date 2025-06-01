"use client"

import type React from "react"

import { useAuth } from "@/lib/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "user"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth(requiredRole)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" className="text-purple-600" />
          <p className="text-gray-600 font-medium">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return <>{children}</>
}
