
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
  FileText,
  Search,
} from "lucide-react"
import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth"

/* ================= TYPES ================= */

interface PayHistoryRecord {
  id: string
  employeeId: string
  employeeName: string
  department: string
  designation: string
  grossSalary: number
  deductions: number
  netPay: number
  payPeriod: string
  paidDate: Date
  paymentMethod: string
  transactionId?: string
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

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    const orgId = getOrgId()
    const token = getAuthToken()
    const apiUrl = getApiUrl()

    if (!orgId || !token) return

    setLoading(true)
    try {
      const res = await axios.get(
        `${apiUrl}/org/${orgId}/payroll/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const rows = res.data?.data || []

      const formatted: PayHistoryRecord[] = rows.map((r: any) => ({
        id: r.id || r._id,
        employeeId: r.employee?.id,
        employeeName: r.employee?.fullName || "",
        department: r.employee?.department?.name || "",
        designation: r.employee?.designation?.name || "",
        grossSalary: Number(r.grossSalary || 0),
        deductions: Number(r.deductions || 0),
        netPay: Number(r.netPay || 0),
        payPeriod: r.payPeriod,
        paidDate: new Date(r.paidDate),
        paymentMethod: r.paymentMethod || "Bank Transfer",
        transactionId: r.transactionId,
      }))

      setHistory(formatted)
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
          r.payPeriod

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
        r.payPeriod,
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
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
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
                  <TableCell>{r.payPeriod}</TableCell>
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
              <p><b>Pay Period:</b> {viewDetails.payPeriod}</p>
              <p><b>Gross:</b> ₹{viewDetails.grossSalary.toLocaleString()}</p>
              <p><b>Deductions:</b> ₹{viewDetails.deductions.toLocaleString()}</p>
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

