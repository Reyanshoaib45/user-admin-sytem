import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function AdminSignupRequestsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}
