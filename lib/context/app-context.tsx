"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: "admin" | "user" | "hr" | "all-in-department"
  department?: string
  joinDate: string
  status: "active" | "inactive" | "pending"
  disableMessage?: string
  personalWarning?: string
  timeShift?: "morning" | "evening" | "night" | "flexible"
  workingHours?: {
    start: string // "09:00"
    end: string // "17:00"
  }
  password?: string
  isOnboarded?: boolean
  workPreferences?: {
    dailyHours: number
    dailyTaskTarget: number
  }
  managerId?: string
  referredBy?: string // ID of user who referred this user
  referralCode?: string // Unique referral code for this user
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
  estimatedHours?: number
  actualHours?: number
  bonusEarned?: number
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
  type: "proxy" | "salary" | "bonus" | "overtime" | "task_bonus" | "referral_bonus"
  status: "pending" | "processed" | "failed"
  description: string
  createdDate: string
  processedDate?: string
  paymentMethod?: "bank_transfer" | "cash" | "check"
  referenceNumber?: string
  taskId?: string
  referralId?: string
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

interface SignupRequest {
  id: string
  email: string
  phone: string
  status: "pending" | "approved" | "rejected"
  submittedDate: string
  processedBy?: string
  processedDate?: string
  rejectionReason?: string
  referralCode?: string // Code used during signup
  referredBy?: string // ID of referring user
}

interface TrainingRequest {
  id: string
  userId: string
  userName: string
  type: "online" | "physical"
  topic: string
  description: string
  preferredDate: string
  preferredTime: string
  status: "pending" | "approved" | "rejected" | "completed"
  managerId?: string
  managerName?: string
  requestDate: string
  approvedDate?: string
  meetingLink?: string
  location?: string
  notes?: string
}

interface Referral {
  id: string
  referrerId: string // User who made the referral
  referrerName: string
  referredUserId?: string // User who was referred (after signup approval)
  referredEmail: string
  referralCode: string
  status: "pending" | "signed_up" | "activated" | "bonus_paid"
  signupDate?: string
  activationDate?: string
  bonusPaidDate?: string
  bonusAmount?: number
}

interface BonusSettings {
  taskCompletionBonus: number
  earlyCompletionMultiplier: number
  qualityBonusMultiplier: number
  isEnabled: boolean
}

interface ReferralSettings {
  isEnabled: boolean
  bonusAmount: number // Amount paid for successful referral
  minimumActiveDays: number // Days new user must be active before bonus is paid
  maxReferralsPerUser: number // Maximum referrals per user per month
}

interface AppState {
  currentUser: User | null
  users: User[]
  tasks: Task[]
  proxyRequests: ProxyRequest[]
  payments: Payment[]
  attendanceRecords: AttendanceRecord[]
  leaveRequests: LeaveRequest[]
  signupRequests: SignupRequest[]
  trainingRequests: TrainingRequest[]
  referrals: Referral[]
  bonusSettings: BonusSettings
  referralSettings: ReferralSettings
  proxyRate: number
  isLoading: boolean
  warningMessage: string
  attendanceSettings: {
    workingHours: { start: string; end: string }
    lateThreshold: number
    halfDayThreshold: number
  }
  paymentInfo: {
    baseSalary: number
    hourlyRate: number
    overtimeRate: number
    taskCompletionRate: number
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
  | { type: "ADD_SIGNUP_REQUEST"; payload: SignupRequest }
  | { type: "UPDATE_SIGNUP_REQUEST"; payload: SignupRequest }
  | { type: "ADD_TRAINING_REQUEST"; payload: TrainingRequest }
  | { type: "UPDATE_TRAINING_REQUEST"; payload: TrainingRequest }
  | { type: "ADD_REFERRAL"; payload: Referral }
  | { type: "UPDATE_REFERRAL"; payload: Referral }
  | { type: "UPDATE_BONUS_SETTINGS"; payload: BonusSettings }
  | { type: "UPDATE_REFERRAL_SETTINGS"; payload: ReferralSettings }
  | { type: "SET_PROXY_RATE"; payload: number }
  | { type: "SET_WARNING_MESSAGE"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_DATA"; payload: Partial<AppState> }

// Generate unique referral code
function generateReferralCode(name: string): string {
  const cleanName = name.replace(/\s+/g, "").toUpperCase()
  const randomNum = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0")
  return `${cleanName.slice(0, 4)}${randomNum}`
}

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
      isOnboarded: true,
      referralCode: "REYA0001",
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
      isOnboarded: true,
      referralCode: "ABDU0002",
    },
    {
      id: "hr-1",
      name: "HR Manager",
      email: "hr@company.com",
      phone: "03199759407",
      role: "hr",
      department: "Human Resources",
      joinDate: "2024-01-01",
      status: "active",
      workingHours: { start: "09:00", end: "17:00" },
      password: "HR123@",
      isOnboarded: true,
      referralCode: "HRMA0003",
    },
  ],
  tasks: [],
  proxyRequests: [],
  payments: [],
  attendanceRecords: [],
  leaveRequests: [],
  signupRequests: [],
  trainingRequests: [],
  referrals: [],
  bonusSettings: {
    taskCompletionBonus: 100,
    earlyCompletionMultiplier: 1.5,
    qualityBonusMultiplier: 2.0,
    isEnabled: true,
  },
  referralSettings: {
    isEnabled: true,
    bonusAmount: 500,
    minimumActiveDays: 30,
    maxReferralsPerUser: 5,
  },
  proxyRate: 50,
  isLoading: false,
  warningMessage: "",
  attendanceSettings: {
    workingHours: { start: "09:00", end: "17:00" },
    lateThreshold: 15,
    halfDayThreshold: 4,
  },
  paymentInfo: {
    baseSalary: 50000,
    hourlyRate: 300,
    overtimeRate: 450,
    taskCompletionRate: 500,
  },
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.payload }
    case "ADD_USER":
      const newUser = {
        ...action.payload,
        referralCode: action.payload.referralCode || generateReferralCode(action.payload.name),
      }
      return { ...state, users: [...state.users, newUser] }
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((user) => (user.id === action.payload.id ? action.payload : user)),
        currentUser: state.currentUser?.id === action.payload.id ? action.payload : state.currentUser,
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
    case "ADD_SIGNUP_REQUEST":
      return { ...state, signupRequests: [...state.signupRequests, action.payload] }
    case "UPDATE_SIGNUP_REQUEST":
      return {
        ...state,
        signupRequests: state.signupRequests.map((req) => (req.id === action.payload.id ? action.payload : req)),
      }
    case "ADD_TRAINING_REQUEST":
      return { ...state, trainingRequests: [...state.trainingRequests, action.payload] }
    case "UPDATE_TRAINING_REQUEST":
      return {
        ...state,
        trainingRequests: state.trainingRequests.map((req) => (req.id === action.payload.id ? action.payload : req)),
      }
    case "ADD_REFERRAL":
      return { ...state, referrals: [...state.referrals, action.payload] }
    case "UPDATE_REFERRAL":
      return {
        ...state,
        referrals: state.referrals.map((ref) => (ref.id === action.payload.id ? action.payload : ref)),
      }
    case "UPDATE_BONUS_SETTINGS":
      return { ...state, bonusSettings: action.payload }
    case "UPDATE_REFERRAL_SETTINGS":
      return { ...state, referralSettings: action.payload }
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
      signupRequests: state.signupRequests,
      trainingRequests: state.trainingRequests,
      referrals: state.referrals,
      bonusSettings: state.bonusSettings,
      referralSettings: state.referralSettings,
      proxyRate: state.proxyRate,
      warningMessage: state.warningMessage,
      attendanceSettings: state.attendanceSettings,
      paymentInfo: state.paymentInfo,
    }
    localStorage.setItem("appData", JSON.stringify(dataToSave))
  }, [
    state.users,
    state.tasks,
    state.proxyRequests,
    state.payments,
    state.attendanceRecords,
    state.leaveRequests,
    state.signupRequests,
    state.trainingRequests,
    state.referrals,
    state.bonusSettings,
    state.referralSettings,
    state.proxyRate,
    state.warningMessage,
    state.attendanceSettings,
    state.paymentInfo,
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

export type {
  User,
  Task,
  ProxyRequest,
  Payment,
  AttendanceRecord,
  LeaveRequest,
  SignupRequest,
  TrainingRequest,
  Referral,
  BonusSettings,
  ReferralSettings,
}
