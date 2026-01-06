"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Download,
  Eye,
  Search,
  DollarSign,
  Users,
  TrendingUp,
  Receipt,
  Building2,
  Briefcase,
  CreditCard,
} from "lucide-react"
import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth"

/* ================= TYPES ================= */

interface DeductionBreakdown {
  homeDeduction: number
  foodDeduction: number
  travelDeduction: number
  insuranceDeduction: number
}

interface PayHistoryRecord {
  id: string
  employeeId: string
  employeeName: string
  department: string
  designation: string
  grossSalary: number
  totalDeductions: number
  netPay: number
  payPeriodStart: string
  payPeriodEnd: string
  paidDate: Date
  paymentMethod: string
  transactionId?: string
  deductionBreakdown: DeductionBreakdown
}

/* ================= PAGE ================= */

export default function PayHistoryPage() {
  const router = useRouter()

  const [history, setHistory] = useState<PayHistoryRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] =
    useState<"all" | "month" | "quarter" | "year">("all")
  const [viewDetails, setViewDetails] =
    useState<PayHistoryRecord | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const ITEMS_PER_PAGE = 10

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchHistory()
  }, [currentPage])

  const fetchHistory = async () => {
    setLoading(true)
    const orgId = getOrgId()
    const token = getAuthToken()
    const apiUrl = getApiUrl()

    if (!orgId || !token) return

    try {
      const response = await axios.get(
        `${apiUrl}/org/${orgId}/salaries`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: currentPage,
            limit: ITEMS_PER_PAGE,
          },
        }
      )

      console.log('Salary history response:', response.data)

      const rows = response.data?.data || []
      const apiTotalPages = response.data?.totalPages || 1

      // Filter for paid records only and format
      const formatted: PayHistoryRecord[] = rows
        .filter((r: any) => r.status === "paid")
        .map((r: any) => ({
          id: r.id || r._id,
          employeeId: r.employeeId,
          employeeName: r.employeeName || "",
          department: r.department || "",
          designation: r.designation || "",
          grossSalary: Number(r.grossSalary || 0),
          totalDeductions: Number(r.totalDeductions || 0),
          netPay: Number(r.netSalary || 0),
          payPeriodStart: r.payPeriodStart || "",
          payPeriodEnd: r.payPeriodEnd || "",
          paidDate: new Date(r.paidDate),
          paymentMethod: r.paymentMethod || "Bank Transfer",
          transactionId: r.transactionId,
          deductionBreakdown: r.deductionBreakdown || {
            homeDeduction: 0,
            foodDeduction: 0,
            travelDeduction: 0,
            insuranceDeduction: 0,
          },
        }))

      setHistory(formatted)
      setTotalPages(apiTotalPages)
    } catch (err) {
      console.error("Pay history fetch failed", err)
    } finally {
      setLoading(false)
    }
  }

  /* ================= FILTER ================= */

  const filteredHistory = useMemo(() => {
    const now = new Date()

    return history
      .filter((r) => {
        const text =
          r.employeeName +
          r.department +
          r.designation +
          r.payPeriodStart +
          r.payPeriodEnd

        if (!text.toLowerCase().includes(search.toLowerCase()))
          return false

        if (dateFilter === "month") {
          return (
            r.paidDate.getMonth() === now.getMonth() &&
            r.paidDate.getFullYear() === now.getFullYear()
          )
        }

        if (dateFilter === "quarter") {
          return (
            Math.floor(r.paidDate.getMonth() / 3) ===
            Math.floor(now.getMonth() / 3) &&
            r.paidDate.getFullYear() === now.getFullYear()
          )
        }

        if (dateFilter === "year") {
          return r.paidDate.getFullYear() === now.getFullYear()
        }

        return true
      })
      .sort((a, b) => b.paidDate.getTime() - a.paidDate.getTime())
  }, [history, search, dateFilter])

  /* ================= STATISTICS ================= */

  const stats = useMemo(() => {
    const totalPayments = filteredHistory.length
    const totalAmount = filteredHistory.reduce((sum, r) => sum + r.netPay, 0)
    const avgPayment = totalPayments > 0 ? totalAmount / totalPayments : 0

    return { totalPayments, totalAmount, avgPayment }
  }, [filteredHistory])

  /* ================= EXPORT ================= */

  const exportCSV = () => {
    const csv = [
      [
        "Employee",
        "Department",
        "Designation",
        "Gross Salary",
        "Net Pay",
        "Paid Date",
        "Pay Period",
      ],
      ...filteredHistory.map((r) => [
        r.employeeName,
        r.department,
        r.designation,
        r.grossSalary,
        r.netPay,
        r.paidDate.toLocaleDateString(),
        `${r.payPeriodStart} to ${r.payPeriodEnd}`,
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pay-history.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ================= UI ================= */

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-white ">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-white hover:shadow-sm transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl md:text-3xl font-bold ">
            Pay History
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            View completed salary payments and transaction details
          </p>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Payments</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalPayments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Amount Paid</p>
              <p className="text-3xl font-bold text-green-600 mt-2">AED {stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Average Payment</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">AED {Math.round(stats.avgPayment).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search employee, department, period..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-slate-200 hover:bg-slate-50 h-11">
                <Calendar className="w-4 h-4 mr-2" />
                {dateFilter === 'all' ? 'All Time' :
                  dateFilter === 'month' ? 'This Month' :
                    dateFilter === 'quarter' ? 'This Quarter' : 'This Year'}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setDateFilter("all")}>
                All Time
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("month")}>
                This Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("quarter")}>
                This Quarter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("year")}>
                This Year
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            onClick={exportCSV}
            className="border-slate-200 hover:bg-slate-50 h-11"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Receipt className="w-16 h-16 mb-4 text-slate-300" />
            <p className="text-lg font-medium">No payment records found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Employee
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Department
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Pay Period
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Gross
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Net Pay
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Paid Date
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredHistory.map((r, index) => (
                  <TableRow key={r.id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}>
                    <TableCell className="font-medium text-slate-900">
                      {r.employeeName}
                    </TableCell>
                    <TableCell className="text-slate-600">{r.department}</TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {r.payPeriodStart} to {r.payPeriodEnd}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      AED {r.grossSalary.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-green-600 font-bold">
                      AED {r.netPay.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {r.paidDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewDetails(r)}
                        className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {!loading && filteredHistory.length > 0 && (
        <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="text-sm text-slate-600">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </Button>
            <span className="text-sm font-medium text-slate-700 px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {viewDetails && (
        <Dialog open onOpenChange={() => setViewDetails(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Payment Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              {/* Employee Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Employee Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-600 font-medium mb-1">Name</p>
                    <p className="text-blue-900 font-semibold">{viewDetails.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium mb-1">Department</p>
                    <p className="text-blue-900">{viewDetails.department}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium mb-1">Designation</p>
                    <p className="text-blue-900">{viewDetails.designation}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium mb-1">Pay Period</p>
                    <p className="text-blue-900">{viewDetails.payPeriodStart} to {viewDetails.payPeriodEnd}</p>
                  </div>
                </div>
              </div>

              {/* Payment Summary Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Payment Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-green-200">
                    <span className="text-green-700 font-medium">Gross Salary</span>
                    <span className="text-green-900 font-bold text-lg">AED {viewDetails.grossSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-green-200">
                    <span className="text-green-700 font-medium">Total Deductions</span>
                    <span className="text-red-600 font-bold">-AED {viewDetails.totalDeductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-green-700 font-semibold text-lg">Net Pay</span>
                    <span className="text-green-700 font-bold text-2xl">AED {viewDetails.netPay.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deduction Breakdown Card */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-200">
                <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Deduction Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-orange-700 text-sm font-medium">Home</span>
                    <span className="text-orange-900 font-semibold">AED {viewDetails.deductionBreakdown.homeDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-orange-700 text-sm font-medium">Food</span>
                    <span className="text-orange-900 font-semibold">AED {viewDetails.deductionBreakdown.foodDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-orange-700 text-sm font-medium">Travel</span>
                    <span className="text-orange-900 font-semibold">AED {viewDetails.deductionBreakdown.travelDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-orange-700 text-sm font-medium">Insurance</span>
                    <span className="text-orange-900 font-semibold">AED {viewDetails.deductionBreakdown.insuranceDeduction.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Transaction Info Card */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Transaction Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Payment Method</span>
                    <span className="text-slate-900 font-semibold">{viewDetails.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Transaction ID</span>
                    <span className="text-slate-900 font-mono text-xs bg-slate-200 px-2 py-1 rounded">
                      {viewDetails.transactionId || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Payment Date</span>
                    <span className="text-slate-900 font-semibold">{viewDetails.paidDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
