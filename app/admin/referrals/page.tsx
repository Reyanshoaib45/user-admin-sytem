"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Gift, Users, DollarSign, Search, CheckCircle, Clock, TrendingUp, Eye, Award } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import type { Referral, Payment } from "@/lib/context/app-context"

function ReferralsManagementContent() {
  const { state, dispatch } = useApp()
  const { user } = useAuth("admin")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!user) return null

  const filteredReferrals = state.referrals.filter(
    (referral) =>
      referral.referrerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referredEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referralCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalReferrals = state.referrals.length
  const activeReferrals = state.referrals.filter((r) => r.status === "activated").length
  const pendingReferrals = state.referrals.filter((r) => r.status === "pending").length
  const totalBonusPaid = state.payments
    .filter((p) => p.type === "referral_bonus" && p.status === "processed")
    .reduce((sum, p) => sum + p.amount, 0)

  const handlePayBonus = async (referral: Referral) => {
    if (referral.status !== "activated") return

    // Create bonus payment
    const bonusPayment: Payment = {
      id: `payment-${Date.now()}`,
      userId: referral.referrerId,
      userName: referral.referrerName,
      amount: state.referralSettings.bonusAmount,
      type: "referral_bonus",
      status: "processed",
      description: `Referral bonus for ${referral.referredEmail}`,
      createdDate: new Date().toISOString().split("T")[0],
      processedDate: new Date().toISOString().split("T")[0],
      paymentMethod: "bank_transfer",
      referenceNumber: `REF-${referral.id}`,
      referralId: referral.id,
    }

    // Update referral status
    const updatedReferral: Referral = {
      ...referral,
      status: "bonus_paid",
      bonusPaidDate: new Date().toISOString().split("T")[0],
      bonusAmount: state.referralSettings.bonusAmount,
    }

    dispatch({ type: "ADD_PAYMENT", payload: bonusPayment })
    dispatch({ type: "UPDATE_REFERRAL", payload: updatedReferral })
  }

  const viewReferralDetails = (referral: Referral) => {
    setSelectedReferral(referral)
    setIsDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 lg:py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:border-purple-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Referral Management</h1>
            </div>
            <Link href="/admin/referral-settings">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <Gift className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{totalReferrals}</div>
                <div className="text-sm text-gray-600">Total Referrals</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{activeReferrals}</div>
                <div className="text-sm text-gray-600">Active Referrals</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{pendingReferrals}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">${totalBonusPaid}</div>
                <div className="text-sm text-gray-600">Bonuses Paid</div>
              </CardContent>
            </Card>
          </div>

          {/* Referrals Table */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                All Referrals ({filteredReferrals.length})
              </CardTitle>
              <CardDescription className="text-purple-100">Manage and track all referral activities</CardDescription>
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2 mt-4">
                <Search className="h-4 w-4 text-white" />
                <Input
                  placeholder="Search referrals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 bg-transparent text-white placeholder:text-purple-200 focus:ring-0"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Referrer</TableHead>
                      <TableHead className="font-semibold">Referred Email</TableHead>
                      <TableHead className="font-semibold">Code</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Signup Date</TableHead>
                      <TableHead className="font-semibold">Bonus</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReferrals.map((referral) => (
                      <TableRow key={referral.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{referral.referrerName}</TableCell>
                        <TableCell>{referral.referredEmail}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{referral.referralCode}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              referral.status === "bonus_paid"
                                ? "bg-green-500"
                                : referral.status === "activated"
                                  ? "bg-blue-500"
                                  : referral.status === "signed_up"
                                    ? "bg-yellow-500"
                                    : "bg-gray-500"
                            } text-white border-0 capitalize`}
                          >
                            {referral.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{referral.signupDate || "Not yet"}</TableCell>
                        <TableCell>
                          {referral.bonusAmount ? (
                            <span className="text-green-600 font-medium">${referral.bonusAmount}</span>
                          ) : referral.status === "activated" ? (
                            <span className="text-blue-600 font-medium">Ready to pay</span>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewReferralDetails(referral)}
                              className="hover:bg-blue-50 hover:border-blue-200"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {referral.status === "activated" && !referral.bonusAmount && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePayBonus(referral)}
                                className="hover:bg-green-50 hover:border-green-200"
                              >
                                <Award className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredReferrals.length === 0 && (
                <div className="text-center py-12">
                  <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No referrals found matching your search.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Referral Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2 text-purple-500" />
                Referral Details
              </DialogTitle>
              <DialogDescription>Complete information about this referral</DialogDescription>
            </DialogHeader>
            {selectedReferral && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Referrer:</span>
                    <p className="text-gray-900">{selectedReferral.referrerName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Referred Email:</span>
                    <p className="text-gray-900">{selectedReferral.referredEmail}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Referral Code:</span>
                    <p className="text-gray-900">{selectedReferral.referralCode}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <Badge
                      className={`${
                        selectedReferral.status === "bonus_paid"
                          ? "bg-green-500"
                          : selectedReferral.status === "activated"
                            ? "bg-blue-500"
                            : selectedReferral.status === "signed_up"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                      } text-white border-0 capitalize mt-1`}
                    >
                      {selectedReferral.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Signup Date:</span>
                    <p className="text-gray-900">{selectedReferral.signupDate || "Not yet"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Activation Date:</span>
                    <p className="text-gray-900">{selectedReferral.activationDate || "Not yet"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Bonus Paid Date:</span>
                    <p className="text-gray-900">{selectedReferral.bonusPaidDate || "Not yet"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Bonus Amount:</span>
                    <p className="text-gray-900">
                      {selectedReferral.bonusAmount ? `$${selectedReferral.bonusAmount}` : "Not paid"}
                    </p>
                  </div>
                </div>
                {selectedReferral.status === "activated" && !selectedReferral.bonusAmount && (
                  <Button
                    onClick={() => {
                      handlePayBonus(selectedReferral)
                      setIsDialogOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Pay Bonus (${state.referralSettings.bonusAmount})
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default function ReferralsManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ReferralsManagementContent />
    </ProtectedRoute>
  )
}
