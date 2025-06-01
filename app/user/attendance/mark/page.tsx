"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Clock, CheckCircle, Loader2, LogOut } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import type { AttendanceRecord } from "@/lib/context/app-context"

function MarkAttendancePageContent() {
  const { state, dispatch } = useApp()
  const { user } = useAuth("user")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isMarking, setIsMarking] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isMarked, setIsMarked] = useState(false)
  const router = useRouter()
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | undefined>(undefined)

  if (!user) return null

  // Check if already marked today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    const record = state.attendanceRecords.find((record) => record.userId === user.id && record.date === today)
    setTodayRecord(record)
  }, [state.attendanceRecords, user.id])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const calculateWorkingHours = (checkIn: string, checkOut: string) => {
    const [inHour, inMinute] = checkIn.split(":").map(Number)
    const [outHour, outMinute] = checkOut.split(":").map(Number)

    const inTime = inHour * 60 + inMinute
    const outTime = outHour * 60 + outMinute

    return ((outTime - inTime) / 60).toFixed(2)
  }

  const handleCheckIn = async () => {
    setIsMarking(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const now = new Date()
    const timeString = now.toTimeString().slice(0, 5) // HH:MM format

    // Determine status based on time (assuming 9:00 AM is on time)
    const hour = now.getHours()
    const minute = now.getMinutes()
    const totalMinutes = hour * 60 + minute
    const workStartTime = 9 * 60 // 9:00 AM in minutes
    const lateThreshold = state.attendanceSettings.lateThreshold

    let status: "present" | "late" = "present"
    if (totalMinutes > workStartTime + lateThreshold) {
      status = "late"
    }

    const today = new Date().toISOString().split("T")[0]

    const newAttendance: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      date: today,
      checkInTime: timeString,
      status: status,
      location: "Office - Main Campus",
    }

    dispatch({ type: "ADD_ATTENDANCE", payload: newAttendance })
    setIsMarking(false)
    setIsMarked(true)

    // Auto redirect after 3 seconds
    setTimeout(() => {
      router.push("/user")
    }, 3000)
  }

  const handleCheckOut = async () => {
    if (!todayRecord) return

    setIsCheckingOut(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const now = new Date()
    const timeString = now.toTimeString().slice(0, 5) // HH:MM format

    const workingHours = todayRecord.checkInTime
      ? Number.parseFloat(calculateWorkingHours(todayRecord.checkInTime, timeString))
      : 0

    const updatedRecord: AttendanceRecord = {
      ...todayRecord,
      checkOutTime: timeString,
      workingHours: workingHours,
    }

    dispatch({ type: "UPDATE_ATTENDANCE", payload: updatedRecord })
    setIsCheckingOut(false)
    setIsMarked(true)

    // Auto redirect after 3 seconds
    setTimeout(() => {
      router.push("/user")
    }, 3000)
  }

  if (isMarked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md text-center shadow-xl border-0">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {todayRecord?.checkOutTime ? "Checked Out Successfully!" : "Attendance Marked!"}
            </h2>
            <p className="text-gray-600">
              {todayRecord?.checkOutTime
                ? `Checked out at ${currentTime.toLocaleTimeString()}`
                : `Checked in at ${currentTime.toLocaleTimeString()}`}
            </p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
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
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">
              {todayRecord?.checkInTime && !todayRecord?.checkOutTime ? "Check Out" : "Mark Attendance"}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardTitle className="text-white flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              {todayRecord?.checkInTime && !todayRecord?.checkOutTime ? "Check Out" : "Attendance Check-in"}
            </CardTitle>
            <CardDescription className="text-green-100">
              {todayRecord?.checkInTime && !todayRecord?.checkOutTime
                ? "Complete your work day by checking out"
                : "Mark your attendance for today"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 space-y-6">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-lg text-gray-600">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg space-y-3">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Current Time</div>
                  <div className="text-sm text-gray-600">{currentTime.toLocaleTimeString()}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-sm text-gray-600">Office Building - Main Campus</div>
                </div>
              </div>
              {todayRecord?.checkInTime && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Check-in Time</div>
                    <div className="text-sm text-gray-600">{todayRecord.checkInTime}</div>
                  </div>
                </div>
              )}
            </div>

            {todayRecord?.checkInTime && !todayRecord?.checkOutTime ? (
              // Check Out Button
              <Button
                onClick={handleCheckOut}
                disabled={isCheckingOut}
                className="w-full py-6 text-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all duration-300"
                size="lg"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Checking Out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-5 w-5" />
                    Check Out
                  </>
                )}
              </Button>
            ) : todayRecord?.checkInTime && todayRecord?.checkOutTime ? (
              // Already completed for the day
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-green-800 font-medium mb-2">Attendance Complete for Today</div>
                <div className="text-green-600 text-sm space-y-1">
                  <p>Check-in: {todayRecord.checkInTime}</p>
                  <p>Check-out: {todayRecord.checkOutTime}</p>
                  <p>Working hours: {todayRecord.workingHours}h</p>
                </div>
                <Link href="/user">
                  <Button variant="outline" className="mt-4">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              // Check In Button
              <Button
                onClick={handleCheckIn}
                disabled={isMarking}
                className="w-full py-6 text-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transition-all duration-300"
                size="lg"
              >
                {isMarking ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Marking Attendance...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Check In
                  </>
                )}
              </Button>
            )}

            {/* Working Hours Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Working Hours Information</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  Standard working hours: {state.attendanceSettings.workingHours.start} -{" "}
                  {state.attendanceSettings.workingHours.end}
                </p>
                <p>Late threshold: {state.attendanceSettings.lateThreshold} minutes</p>
                <p>Half-day threshold: {state.attendanceSettings.halfDayThreshold} hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function MarkAttendancePage() {
  return (
    <ProtectedRoute requiredRole="user">
      <MarkAttendancePageContent />
    </ProtectedRoute>
  )
}
