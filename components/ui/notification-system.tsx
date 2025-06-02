"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Bell, CheckCircle, AlertTriangle, Info, Clock } from "lucide-react"
import { useApp } from "@/lib/context/app-context"

interface Notification {
  id: string
  type: "success" | "warning" | "info" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
  userId?: string
}

export function NotificationSystem() {
  const { state } = useApp()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Generate notifications based on system events
  useEffect(() => {
    const newNotifications: Notification[] = []

    // Check for pending signup requests
    const pendingSignups = state.signupRequests.filter((req) => req.status === "pending")
    if (pendingSignups.length > 0) {
      newNotifications.push({
        id: `signup-${Date.now()}`,
        type: "info",
        title: "New Signup Requests",
        message: `${pendingSignups.length} new signup requests awaiting approval`,
        timestamp: new Date(),
        read: false,
      })
    }

    // Check for pending proxy requests
    const pendingProxies = state.proxyRequests.filter((req) => req.status === "pending")
    if (pendingProxies.length > 0) {
      newNotifications.push({
        id: `proxy-${Date.now()}`,
        type: "warning",
        title: "Pending Proxy Requests",
        message: `${pendingProxies.length} proxy requests need approval`,
        timestamp: new Date(),
        read: false,
      })
    }

    // Check for pending payments
    const pendingPayments = state.payments.filter((payment) => payment.status === "pending")
    if (pendingPayments.length > 0) {
      newNotifications.push({
        id: `payment-${Date.now()}`,
        type: "info",
        title: "Pending Payments",
        message: `${pendingPayments.length} payments awaiting processing`,
        timestamp: new Date(),
        read: false,
      })
    }

    // Check for overdue tasks
    const today = new Date().toISOString().split("T")[0]
    const overdueTasks = state.tasks.filter((task) => task.dueDate < today && task.status !== "completed")
    if (overdueTasks.length > 0) {
      newNotifications.push({
        id: `overdue-${Date.now()}`,
        type: "error",
        title: "Overdue Tasks",
        message: `${overdueTasks.length} tasks are overdue`,
        timestamp: new Date(),
        read: false,
      })
    }

    setNotifications(newNotifications)
  }, [state])

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-blue-50 hover:border-blue-200"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-500">{notification.message}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {notification.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
