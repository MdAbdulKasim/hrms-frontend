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

interface AllowanceBreakdown {
  homeAllowance: number
  foodAllowance: number
  travelAllowance: number
  overtimePay: number
}

interface DeductionBreakdown {
  homeDeduction: number
  foodDeduction: number
  travelDeduction: number
  insuranceDeduction: number
}

interface PayHistoryRecord {
  id: string
  employeeId: string
  employeeNumber: string
  employeeName: string
  department: string
  designation: string
  basicSalary: number
  totalAllowances: number
  grossSalary: number
  totalDeductions: number
  netPay: number
  payPeriodStart: string
  payPeriodEnd: string
  paidDate: Date
  paymentMethod: string
  transactionId?: string
  allowanceBreakdown: AllowanceBreakdown
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
  const [totalPages, setTotalPages] = useState(2)
  const ITEMS_PER_PAGE = 10

  /* ================= METADATA ================= */
  const [departments, setDepartments] = useState<any[]>([])
  const [designations, setDesignations] = useState<any[]>([])
  const [employeeMap, setEmployeeMap] = useState<{ [key: string]: any }>({})

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchMetadata()
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [currentPage, employeeMap, departments, designations])

  const fetchMetadata = async () => {
    const orgId = getOrgId()
    const token = getAuthToken()
    const apiUrl = getApiUrl()
    if (!orgId || !token) return

    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [deptRes, desigRes, empRes] = await Promise.all([
        axios.get(`${apiUrl}/org/${orgId}/departments`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${apiUrl}/org/${orgId}/designations`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${apiUrl}/org/${orgId}/employees`, { headers }).catch(() => ({ data: { data: [] } }))
      ])

      const deptData = Array.isArray(deptRes.data?.data) ? deptRes.data.data : (Array.isArray(deptRes.data) ? deptRes.data : [])
      const desigData = Array.isArray(desigRes.data?.data) ? desigRes.data.data : (Array.isArray(desigRes.data) ? desigRes.data : [])
      const empData = Array.isArray(empRes.data?.data) ? empRes.data.data : (Array.isArray(empRes.data) ? empRes.data : [])

      setDepartments(deptData)
      setDesignations(desigData)

      const eMap: { [key: string]: any } = {}
      empData.forEach((emp: any) => {
        const id = emp.id || emp._id
        if (id) {
          eMap[String(id)] = emp
        }
      })
      setEmployeeMap(eMap)
    } catch (err) {
      console.error("Metadata fetch failed", err)
    }
  }

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

      const deptMap = new Map(departments.map((d: any) => [String(d.id || d._id), d.departmentName || d.name]))
      const desigMap = new Map(designations.map((d: any) => [String(d.id || d._id), d.designationName || d.name]))

      // Filter for paid records only and format
      const formatted: PayHistoryRecord[] = rows
        .map((r: any) => {
          const employeeId = r.employeeId || (r.employee && (r.employee.id || r.employee._id));
          const empMapData = employeeId ? employeeMap[String(employeeId)] : null;
          const emp = r.employee || empMapData || {};

          const basicSalary = Number(r.basicSalary || r.basic_salary || emp.basicSalary || 0);
          let totalAllowances = Number(r.allowances || r.totalAllowances || r.total_allowances || 0);
          let totalDeductions = Number(r.deductions || r.totalDeductions || r.total_deductions || 0);

          // Robust fallback logic for allowances and deductions
          if (totalAllowances === 0 && emp.allowances) {
            const data = emp.allowances;
            if (Array.isArray(data)) {
              data.forEach((i: any) => {
                const v = Number(i.value || i.amount || 0);
                totalAllowances += (i.type === 'percentage') ? (basicSalary * v / 100) : v;
              });
            } else if (typeof data === "object") {
              Object.values(data).forEach((val: any) => {
                if (val && val.enabled) {
                  const amount = val.amount || (basicSalary * (val.percentage || 0)) / 100 || 0;
                  totalAllowances += amount;
                }
              });
            }
          }

          if (totalDeductions === 0 && emp.deductions) {
            const data = emp.deductions;
            if (Array.isArray(data)) {
              data.forEach((i: any) => {
                const v = Number(i.value || i.amount || 0);
                totalDeductions += (i.type === 'percentage') ? (basicSalary * v / 100) : v;
              });
            } else if (typeof data === "object") {
              Object.values(data).forEach((val: any) => {
                if (val && val.enabled) {
                  const amount = val.amount || (basicSalary * (val.percentage || 0)) / 100 || 0;
                  totalDeductions += amount;
                }
              });
            }
          }

          const overtimeAmount = Number(r.overtimeAmount || r.overtimePay || r.overtime_amount || 0);
          const grossSalary = basicSalary + totalAllowances + overtimeAmount;
          const netSalary = grossSalary - totalDeductions;

          const getDeptName = () => {
            if (emp.department && typeof emp.department === 'object') {
              return emp.department.departmentName || emp.department.name || "N/A";
            }
            const dId = emp.departmentId || emp.department || r.departmentId || r.department;
            if (dId) {
              const mapped = deptMap.get(String(dId));
              if (mapped) return mapped;
              // If it's not in map, it might be the name already if it's not a hex ID
              if (typeof dId === 'string' && dId.length > 0 && !/^[0-9a-fA-F]{24}$/.test(dId)) return dId;
            }
            return "N/A";
          }

          const getDesigName = () => {
            if (emp.designation && typeof emp.designation === 'object') {
              return emp.designation.designationName || emp.designation.name || "N/A";
            }
            const desId = emp.designationId || emp.designation || r.designationId || r.designation;
            if (desId) {
              const mapped = desigMap.get(String(desId));
              if (mapped) return mapped;
              if (typeof desId === 'string' && desId.length > 0 && !/^[0-9a-fA-F]{24}$/.test(desId)) return desId;
            }
            return "N/A";
          }

          return {
            id: r.id || r._id,
            employeeId: String(employeeId || ""),
            employeeNumber: emp.employeeNumber || emp.employeeId || "N/A",
            employeeName: r.employeeName || emp.fullName || emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Unknown",
            department: getDeptName(),
            designation: getDesigName(),
            basicSalary,
            totalAllowances,
            grossSalary,
            totalDeductions,
            netPay: netSalary,
            payPeriodStart: r.payPeriodStart || "",
            payPeriodEnd: r.payPeriodEnd || "",
            paidDate: r.paidDate ? new Date(r.paidDate) : new Date(),
            paymentMethod: r.paymentMethod || "Bank Transfer",
            transactionId: r.transactionId,
            allowanceBreakdown: r.allowanceBreakdown || {},
            deductionBreakdown: r.deductionBreakdown || {},
            status: r.status || "unpaid"
          };
        })
        .filter((r: any) => (r.status || "").toLowerCase() === "paid");

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
        "EMP ID",
        "Employee",
        "Department",
        "Gross Salary",
        "Net Pay",
        "Paid Date",
        "Pay Period",
      ],
      ...filteredHistory.map((r) => [
        r.employeeNumber,
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
    <div className="p-1 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 bg-white min-h-screen">
      <style jsx>{`
        @media (max-width: 480px) {
          .responsive-text { font-size: 11px; }
          .responsive-title { font-size: 18px; }
          .responsive-label { font-size: 10px; }
          .responsive-stat-value { font-size: 16px; }
          .responsive-button { height: 32px; font-size: 10px; padding: 0 8px; }
          .responsive-input { height: 32px; font-size: 11px; }
          .responsive-table-text { font-size: 10px; }
        }
        @media (max-width: 300px) {
          .responsive-text { font-size: 9px; }
          .responsive-title { font-size: 14px; }
          .responsive-label { font-size: 9px; }
          .responsive-stat-value { font-size: 14px; }
          .responsive-button { height: 28px; font-size: 8px; padding: 0 4px; }
          .responsive-input { height: 28px; font-size: 9px; }
          .responsive-table-text { font-size: 9px; }
          .responsive-icon { width: 12px; height: 12px; }
        }
      `}</style>
      {/* HEADER */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-white hover:shadow-sm transition-all h-8 w-8 sm:h-10 sm:w-10"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 responsive-icon" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold responsive-title">
            Pay History
          </h1>
          <p className="text-[10px] sm:text-sm text-slate-600 mt-0.5 sm:mt-1 responsive-text">
            View completed salary payments and transaction details
          </p>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-slate-600 responsive-label">Total Payments</p>
              <p className="text-lg sm:text-3xl font-bold text-slate-900 mt-0.5 sm:mt-2 responsive-stat-value">{stats.totalPayments}</p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Receipt className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 responsive-icon" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-slate-600 responsive-label">Total Amount Paid</p>
              <p className="text-lg sm:text-3xl font-bold text-green-600 mt-0.5 sm:mt-2 responsive-stat-value">AED {stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 responsive-icon" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-slate-600 responsive-label">Average Payment</p>
              <p className="text-lg sm:text-3xl font-bold text-indigo-600 mt-0.5 sm:mt-2 responsive-stat-value">AED {Math.round(stats.avgPayment).toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600 responsive-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl p-2 sm:p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 responsive-icon" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 sm:pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-9 sm:h-11 responsive-input"
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-none border-slate-200 hover:bg-slate-50 h-9 sm:h-11 responsive-button">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 responsive-icon" />
                  <span className="responsive-text">
                    {dateFilter === 'all' ? 'All' :
                      dateFilter === 'month' ? 'Month' :
                        dateFilter === 'quarter' ? 'Quarter' : 'Year'}
                  </span>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 responsive-icon" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setDateFilter("all")}>All Time</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("month")}>This Month</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("quarter")}>This Quarter</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("year")}>This Year</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              onClick={exportCSV}
              className="flex-1 sm:flex-none border-slate-200 hover:bg-slate-50 h-9 sm:h-11 responsive-button"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 responsive-icon" />
              <span className="responsive-text">Export</span>
            </Button>
          </div>
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
                  <TableHead className="font-semibold text-slate-700 py-2 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-[10px] sm:text-sm responsive-table-text">EMP ID</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-2 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                      Employee
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 py-2 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Building2 className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                      Department
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text whitespace-nowrap">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                      Period
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                      Basic
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                      Allow.
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 bg-slate-50 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                      Gross
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                      Deduc.
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 bg-blue-50/50 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text font-bold">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                      Net Pay
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text whitespace-nowrap">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                      Paid Date
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredHistory.map((r, index) => (
                  <TableRow key={r.id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <TableCell className="py-2 sm:py-4 px-2 sm:px-4 font-medium text-slate-900 whitespace-nowrap text-[10px] sm:text-sm responsive-table-text">
                      {r.employeeNumber}
                    </TableCell>
                    <TableCell className="py-2 sm:py-4 px-2 sm:px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 text-[10px] sm:text-sm responsive-table-text">{r.employeeName}</span>
                        <span className="text-[9px] sm:text-xs text-slate-500 whitespace-nowrap">{r.designation}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text whitespace-nowrap">{r.department}</TableCell>
                    <TableCell className="text-slate-600 px-2 sm:px-4 text-[9px] sm:text-sm responsive-table-text whitespace-nowrap">
                      {r.payPeriodStart} to {r.payPeriodEnd}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text whitespace-nowrap">
                      {r.basicSalary.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-green-600 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text whitespace-nowrap">
                      {r.totalAllowances.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 bg-slate-50 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text whitespace-nowrap">
                      {r.grossSalary.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-red-600 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text whitespace-nowrap">
                      {r.totalDeductions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-blue-600 font-bold bg-blue-50/50 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text whitespace-nowrap">
                      {r.netPay.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-slate-600 px-2 sm:px-4 text-[10px] sm:text-sm responsive-table-text whitespace-nowrap">
                      {r.paidDate.toLocaleDateString()}
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
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 gap-3">
          <div className="text-[10px] sm:text-sm text-slate-600 responsive-text">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="flex-1 sm:flex-none border-slate-200 hover:bg-slate-50 disabled:opacity-50 h-8 sm:h-10 responsive-button"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="flex-1 sm:flex-none border-slate-200 hover:bg-slate-50 disabled:opacity-50 h-8 sm:h-10 responsive-button"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {viewDetails && (
        <Dialog open onOpenChange={() => setViewDetails(null)}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full p-3 sm:p-6 overflow-y-auto max-h-[90vh]">
            <DialogHeader className="border-b pb-2 sm:pb-4">
              <DialogTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent responsive-title">
                Payment Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              {/* Employee Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-5 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-base">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 responsive-icon" />
                  Employee Info
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-[10px] sm:text-sm">
                  <div>
                    <p className="text-blue-600 font-medium mb-0.5 sm:mb-1 responsive-label">Name</p>
                    <p className="text-blue-900 font-semibold truncate">{viewDetails.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium mb-0.5 sm:mb-1 responsive-label">Dept</p>
                    <p className="text-blue-900 truncate">{viewDetails.department}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium mb-0.5 sm:mb-1 responsive-label">Desig</p>
                    <p className="text-blue-900 truncate">{viewDetails.designation}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium mb-0.5 sm:mb-1 responsive-label">Period</p>
                    <p className="text-blue-900 text-[9px] sm:text-sm">{viewDetails.payPeriodStart} - {viewDetails.payPeriodEnd}</p>
                  </div>
                </div>
              </div>

              {/* Payment Summary Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-5 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-base">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 responsive-icon" />
                  Summary
                </h3>
                <div className="space-y-2 sm:space-y-3 text-[10px] sm:text-sm">
                  <div className="flex justify-between items-center pb-1 sm:pb-2 border-b border-green-200">
                    <span className="text-green-700 font-medium responsive-label">Basic</span>
                    <span className="text-green-900 font-bold responsive-stat-value">{viewDetails.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1 sm:pb-2 border-b border-green-200">
                    <span className="text-green-700 font-medium responsive-label">Allow.</span>
                    <span className="text-blue-600 font-bold responsive-stat-value">{viewDetails.totalAllowances.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1 sm:pb-2 border-b border-green-200">
                    <span className="text-green-700 font-medium responsive-label">Gross</span>
                    <span className="text-slate-900 font-bold responsive-stat-value">{viewDetails.grossSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1 sm:pb-2 border-b border-green-200">
                    <span className="text-green-700 font-medium responsive-label">Deduc.</span>
                    <span className="text-red-600 font-bold responsive-stat-value">{viewDetails.totalDeductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 sm:pt-2">
                    <span className="text-green-700 font-semibold text-xs sm:text-lg">Net Pay</span>
                    <span className="text-blue-700 font-bold text-sm sm:text-2xl">AED {viewDetails.netPay.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Allowance Breakdown Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-5 border border-indigo-200">
                <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Allowance Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-indigo-700 text-sm font-medium">Home</span>
                    <span className="text-indigo-900 font-semibold">AED {viewDetails.allowanceBreakdown.homeAllowance?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-indigo-700 text-sm font-medium">Food</span>
                    <span className="text-indigo-900 font-semibold">AED {viewDetails.allowanceBreakdown.foodAllowance?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-indigo-700 text-sm font-medium">Travel</span>
                    <span className="text-indigo-900 font-semibold">AED {viewDetails.allowanceBreakdown.travelAllowance?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-indigo-700 text-sm font-medium">Overtime</span>
                    <span className="text-indigo-900 font-semibold">AED {viewDetails.allowanceBreakdown.overtimePay?.toLocaleString() || 0}</span>
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
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 sm:p-5 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-base">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 responsive-icon" />
                  Transaction
                </h3>
                <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 responsive-label">Method</span>
                    <span className="text-slate-900 font-semibold">{viewDetails.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-600 responsive-label">ID</span>
                    <span className="text-slate-900 font-mono text-[9px] sm:text-xs bg-slate-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded truncate max-w-[120px] sm:max-w-none">
                      {viewDetails.transactionId || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 responsive-label">Date</span>
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
