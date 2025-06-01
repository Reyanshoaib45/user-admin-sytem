"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "all-in-department"
  department?: string
  joinDate: string
  status: "active" | "inactive"
  disableMessage?: string
  personalWarning?: string
  timeShift?: "morning" | "evening" | "night" | "flexible"
  workingHours?: {
    start: string // "09:00"
    end: string // "17:00"
  }
  password?: string // For demo purposes - in real app this would be hashed
}

interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: string
  createdDate: string
  completedDate?: string
  progress: number
  createdBy: string
}

interface ProxyRequest {
  id: string
  userId: string
  userName: string
  date: string
  reason: string
  description: string
  status: "pending" | "approved" | "rejected"
  amount: number
  createdDate: string
  approvedBy?: string
  approvedDate?: string
  rejectionReason?: string
}

interface Payment {
  id: string
  userId: string
  userName: string
  amount: number
  type: "proxy" | "salary" | "bonus" | "overtime"
  status: "pending" | "processed" | "failed"
  description: string
  createdDate: string
  processedDate?: string
  paymentMethod?: "bank_transfer" | "cash" | "check"
  referenceNumber?: string
}

interface AttendanceRecord {
  id: string
  userId: string
  userName: string
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: "present" | "absent" | "late" | "half-day" | "leave"
  workingHours?: number
  notes?: string
  location?: string
  leaveType?: "sick" | "casual" | "vacation" | "emergency"
  approvedBy?: string
}

interface LeaveRequest {
  id: string
  userId: string
  userName: string
  startDate: string
  endDate: string
  leaveType: "sick" | "casual" | "vacation" | "emergency"
  reason: string
  status: "pending" | "approved" | "rejected"
  appliedDate: string
  approvedBy?: string
  approvedDate?: string
  totalDays: number
}

interface AppState {
  currentUser: User | null
  users: User[]
  tasks: Task[]
  proxyRequests: ProxyRequest[]
  payments: Payment[]
  attendanceRecords: AttendanceRecord[]
  leaveRequests: LeaveRequest[]
  proxyRate: number
  isLoading: boolean
  warningMessage: string
  attendanceSettings: {
    workingHours: { start: string; end: string }
    lateThreshold: number // minutes
    halfDayThreshold: number // hours
  }
}

type AppAction =
  | { type: "SET_CURRENT_USER"; payload: User | null }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "ADD_PROXY_REQUEST"; payload: ProxyRequest }
  | { type: "UPDATE_PROXY_REQUEST"; payload: ProxyRequest }
  | { type: "ADD_PAYMENT"; payload: Payment }
  | { type: "UPDATE_PAYMENT"; payload: Payment }
  | { type: "ADD_ATTENDANCE"; payload: AttendanceRecord }
  | { type: "UPDATE_ATTENDANCE"; payload: AttendanceRecord }
  | { type: "ADD_LEAVE_REQUEST"; payload: LeaveRequest }
  | { type: "UPDATE_LEAVE_REQUEST"; payload: LeaveRequest }
  | { type: "SET_PROXY_RATE"; payload: number }
  | { type: "SET_WARNING_MESSAGE"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_DATA"; payload: Partial<AppState> }

const initialState: AppState = {
  currentUser: null,
  users: [
    {
      id: "admin-1",
      name: "M Reyan Shoaib",
      email: "Reyanshoaib@admin.com",
      role: "admin",
      department: "Administration",
      joinDate: "2024-01-01",
      status: "active",
      workingHours: { start: "09:00", end: "17:00" },
      password: "Reyan123@",
    },
    {
      id: "admin-2",
      name: "Abdul Samad",
      email: "Abdulsamad@admin.com",
      role: "admin",
      department: "Administration",
      joinDate: "2024-01-01",
      status: "active",
      workingHours: { start: "09:00", end: "17:00" },
      password: "Samad123@",
    },
  ],
  tasks: [],
  proxyRequests: [],
  payments: [],
  attendanceRecords: [],
  leaveRequests: [],
  proxyRate: 50,
  isLoading: false,
  warningMessage: "",
  attendanceSettings: {
    workingHours: { start: "09:00", end: "17:00" },
    lateThreshold: 15, // 15 minutes
    halfDayThreshold: 4, // 4 hours
  },
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.payload }
    case "ADD_USER":
      return { ...state, users: [...state.users, action.payload] }
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((user) => (user.id === action.payload.id ? action.payload : user)),
      }
    case "DELETE_USER":
      return { ...state, users: state.users.filter((user) => user.id !== action.payload) }
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] }
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) => (task.id === action.payload.id ? action.payload : task)),
      }
    case "DELETE_TASK":
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.payload) }
    case "ADD_PROXY_REQUEST":
      return { ...state, proxyRequests: [...state.proxyRequests, action.payload] }
    case "UPDATE_PROXY_REQUEST":
      return {
        ...state,
        proxyRequests: state.proxyRequests.map((req) => (req.id === action.payload.id ? action.payload : req)),
      }
    case "ADD_PAYMENT":
      return { ...state, payments: [...state.payments, action.payload] }
    case "UPDATE_PAYMENT":
      return {
        ...state,
        payments: state.payments.map((payment) => (payment.id === action.payload.id ? action.payload : payment)),
      }
    case "ADD_ATTENDANCE":
      return { ...state, attendanceRecords: [...state.attendanceRecords, action.payload] }
    case "UPDATE_ATTENDANCE":
      return {
        ...state,
        attendanceRecords: state.attendanceRecords.map((att) => (att.id === action.payload.id ? action.payload : att)),
      }
    case "ADD_LEAVE_REQUEST":
      return { ...state, leaveRequests: [...state.leaveRequests, action.payload] }
    case "UPDATE_LEAVE_REQUEST":
      return {
        ...state,
        leaveRequests: state.leaveRequests.map((req) => (req.id === action.payload.id ? action.payload : req)),
      }
    case "SET_PROXY_RATE":
      return { ...state, proxyRate: action.payload }
    case "SET_WARNING_MESSAGE":
      return { ...state, warningMessage: action.payload }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "LOAD_DATA":
      return { ...state, ...action.payload }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("appData")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        dispatch({ type: "LOAD_DATA", payload: parsedData })
      } catch (error) {
        console.error("Error loading saved data:", error)
      }
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      users: state.users,
      tasks: state.tasks,
      proxyRequests: state.proxyRequests,
      payments: state.payments,
      attendanceRecords: state.attendanceRecords,
      leaveRequests: state.leaveRequests,
      proxyRate: state.proxyRate,
      warningMessage: state.warningMessage,
      attendanceSettings: state.attendanceSettings,
    }
    localStorage.setItem("appData", JSON.stringify(dataToSave))
  }, [
    state.users,
    state.tasks,
    state.proxyRequests,
    state.payments,
    state.attendanceRecords,
    state.leaveRequests,
    state.proxyRate,
    state.warningMessage,
    state.attendanceSettings,
  ])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export type { User, Task, ProxyRequest, Payment, AttendanceRecord, LeaveRequest }
