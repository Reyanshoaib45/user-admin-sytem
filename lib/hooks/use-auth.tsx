"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context/app-context"

export function useAuth(requiredRole?: "admin" | "user" | "hr") {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        if (!state.currentUser) {
          dispatch({ type: "SET_CURRENT_USER", payload: parsedUser })
        }

        // Check if user needs onboarding
        if (parsedUser.role === "user" && !parsedUser.isOnboarded && window.location.pathname !== "/user/onboarding") {
          router.push("/user/onboarding")
          setIsLoading(false)
          return
        }

        // Check role requirement
        if (requiredRole && parsedUser.role !== requiredRole) {
          router.push("/login")
          setIsLoading(false)
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("currentUser")
        if (requiredRole) {
          router.push("/login")
        }
        setIsLoading(false)
      }
    } else if (requiredRole) {
      router.push("/login")
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [state.currentUser, dispatch, router, requiredRole])

  const logout = () => {
    localStorage.removeItem("currentUser")
    dispatch({ type: "SET_CURRENT_USER", payload: null })
    router.push("/login")
  }

  return {
    user: state.currentUser,
    logout,
    isAuthenticated: !!state.currentUser,
    isLoading,
  }
}
