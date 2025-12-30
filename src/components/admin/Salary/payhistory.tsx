
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
      // Fetch paginated salary records
      // GET /org/:organizationId/salaries
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
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold">Pay History</h1>
          <p className="text-sm text-muted-foreground">
            Completed salary payments
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex gap-3 bg-white p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employee, department, period..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              {dateFilter.toUpperCase()}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setDateFilter("all")}>
              All
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

        <Button variant="outline" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Pay Period</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>Net Pay</TableHead>
              <TableHead>Paid Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.employeeName}
                  </TableCell>
                  <TableCell>{r.department}</TableCell>
                  <TableCell>{r.payPeriodStart} to {r.payPeriodEnd}</TableCell>
                  <TableCell>₹{r.grossSalary.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    ₹{r.netPay.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {r.paidDate.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setViewDetails(r)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-end items-center gap-2">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      {/* DETAILS MODAL */}
      {viewDetails && (
        <Dialog open onOpenChange={() => setViewDetails(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <p><b>Employee:</b> {viewDetails.employeeName}</p>
              <p><b>Department:</b> {viewDetails.department}</p>
              <p><b>Designation:</b> {viewDetails.designation}</p>
              <p><b>Pay Period:</b> {viewDetails.payPeriodStart} to {viewDetails.payPeriodEnd}</p>
              <p><b>Gross:</b> ₹{viewDetails.grossSalary.toLocaleString()}</p>
              <p><b>Total Deductions:</b> ₹{viewDetails.totalDeductions.toLocaleString()}</p>
              <div className="mt-3">
                <p className="font-semibold mb-2">Deduction Breakdown:</p>
                <div className="ml-4 space-y-1 text-sm">
                  <p>• Home: ₹{viewDetails.deductionBreakdown.homeDeduction.toLocaleString()}</p>
                  <p>• Food: ₹{viewDetails.deductionBreakdown.foodDeduction.toLocaleString()}</p>
                  <p>• Travel: ₹{viewDetails.deductionBreakdown.travelDeduction.toLocaleString()}</p>
                  <p>• Insurance: ₹{viewDetails.deductionBreakdown.insuranceDeduction.toLocaleString()}</p>
                </div>
              </div>
              <p className="font-bold text-green-600">
                Net Pay: ₹{viewDetails.netPay.toLocaleString()}
              </p>
              <p><b>Transaction:</b> {viewDetails.transactionId || "N/A"}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

