"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context/app-context"

export function useAuth(requiredRole?: "admin" | "user") {
  const { state, dispatch } = useApp()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem("currentUser")

        if (!userData) {
          setIsAuthenticated(false)
          setIsLoading(false)
          router.push("/login")
          return
        }

        const parsedUser = JSON.parse(userData)

        // Validate user data structure
        if (!parsedUser.id || !parsedUser.email || !parsedUser.role) {
          localStorage.removeItem("currentUser")
          setIsAuthenticated(false)
          setIsLoading(false)
          router.push("/login")
          return
        }

        // Check if user role matches required role
        if (requiredRole && parsedUser.role !== requiredRole) {
          setIsAuthenticated(false)
          setIsLoading(false)
          router.push("/login")
          return
        }

        // Set user in context if not already set
        if (!state.currentUser || state.currentUser.id !== parsedUser.id) {
          dispatch({ type: "SET_CURRENT_USER", payload: parsedUser })
        }

        setIsAuthenticated(true)
        setIsLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        localStorage.removeItem("currentUser")
        setIsAuthenticated(false)
        setIsLoading(false)
        router.push("/login")
      }
    }

    checkAuth()
  }, [requiredRole, router, dispatch, state.currentUser])

  const logout = () => {
    localStorage.removeItem("currentUser")
    dispatch({ type: "SET_CURRENT_USER", payload: null })
    router.push("/login")
  }

  return {
    user: state.currentUser,
    isLoading,
    isAuthenticated,
    logout,
  }
}
