"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Users,
  DollarSign,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  TrendingUp,
  TrendingDown,
  Wallet,
  ChevronRight,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react"
import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth"
import { eosbService } from "@/lib/eosbService"

/* ================= TYPES ================= */

interface Allowance {
  id: string
  name: string
  value: number
  type: "percentage" | "fixed"
}

interface Deduction {
  id: string
  name: string
  value: number
  type: "percentage" | "fixed"
}

interface PayrollEmployee {
  id: string
  name: string
  department: string
  designation: string
  location: string
  basicSalary: number
  allowances: Allowance[]
  deductions: Deduction[]
  overtimeHours: number
  overtimeAmount: number
  joiningDate?: string
  employmentStatus?: string
  exitDate?: string
  eosbAmount?: number // Stored EOSB amount from backend
}

/* ================= COMPONENT ================= */

export default function PayRunProcess() {
  const router = useRouter()
  const [employees, setEmployees] = useState<PayrollEmployee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchPayrollData()
  }, [])

  const fetchPayrollData = async () => {
    setIsLoading(true)

    try {
      // Get selected employees from sessionStorage
      const storedData = sessionStorage.getItem('payrollPreviewData')
      if (storedData) {
        setEmployees(JSON.parse(storedData))
      } else {
        // Fallback or fresh fetch if session storage is empty
        const orgId = getOrgId()
        const token = getAuthToken()
        const apiUrl = getApiUrl()

        if (!orgId || !token) {
          console.error("Missing authentication credentials")
          setIsLoading(false)
          router.push("/admin/salary")
          return
        }

        const headers = { Authorization: `Bearer ${token}` }
        const empRes = await axios.get(`${apiUrl}/org/${orgId}/employees`, { headers })
        const empData = empRes.data.data || empRes.data || []

        const formatted: PayrollEmployee[] = empData.map((emp: any) => ({
          id: emp.id || emp._id,
          name: emp.fullName || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "",
          department: emp.department?.departmentName || emp.department?.name || "N/A",
          designation: emp.designation?.designationName || emp.designation?.name || "N/A",
          location: emp.location?.locationName || emp.location?.name || "N/A",
          basicSalary: Number(emp.basicSalary || emp.salary || emp.ctc || emp.baseSalary || 0),
          allowances: (emp.accommodationAllowances || emp.allowances || []).map((a: any, idx: number) => ({
            id: a.id || a._id || `allowance-${idx}`,
            name: a.type || a.name || "Allowance",
            value: Number(a.percentage || a.value || 0),
            type: a.percentage !== undefined ? "percentage" : (a.type === "percentage" ? "percentage" : "fixed")
          })),
          deductions: (emp.insurances || emp.deductions || []).map((d: any, idx: number) => ({
            id: d.id || d._id || `deduction-${idx}`,
            name: d.type || d.name || "Deduction",
            value: Number(d.percentage || d.value || 0),
            type: d.percentage !== undefined ? "percentage" : (d.type === "percentage" ? "percentage" : "fixed")
          })),
          overtimeHours: 0, // Default for fresh fetch, as overtime calculation is complex and done in Mainpage
          overtimeAmount: 0,
          joiningDate: emp.joiningDate || emp.dateOfJoining || emp.startDate,
          employmentStatus: emp.status || emp.employeeStatus || "Active",
          exitDate: emp.exitDate || emp.relievingDate || emp.terminationDate || emp.resignationDate,
          eosbAmount: emp.eosbAmount // Preserve if passed from preview page
        }))

        // Fetch EOSB for relevant employees if not already present (fresh fetch scenario)
        const employeesWithEosb = await Promise.all(formatted.map(async (emp) => {
          if (emp.eosbAmount !== undefined) return emp;

          const statusLower = (emp.employmentStatus || "").toLowerCase();
          if (statusLower.includes('terminat') || statusLower.includes('resign')) {
            const eosbRes = await eosbService.getByEmployeeId(orgId as string, emp.id);
            if (eosbRes.data) {
              return { ...emp, eosbAmount: eosbRes.data.amount }; // Use backend value
            }
          }
          return emp;
        }));

        setEmployees(employeesWithEosb)
      }
    } catch (error: any) {
      console.error("Failed to fetch payroll data", error)
      if (error.response?.status === 401) {
        router.push("/admin/salary")
      }
    } finally {
      setIsLoading(false)
    }
  }

  /* ================= CALCULATIONS ================= */

  const calculateEOSB = (employee: PayrollEmployee) => {
    // If backend has a stored EOSB value, prioritize it
    if (employee.eosbAmount !== undefined) {
      return employee.eosbAmount;
    }

    const { joiningDate, exitDate, basicSalary, employmentStatus: status } = employee;

    if (!joiningDate || !status) return 0;

    // Only calculate for Terminated or Resigned
    const statusLower = status.toLowerCase();
    if (!statusLower.includes('terminat') && !statusLower.includes('resign')) return 0;

    // Use current date if exit date is missing (assuming immediate processing)
    const end = exitDate ? new Date(exitDate) : new Date();
    const start = new Date(joiningDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

    // Calculate years of service
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = diffDays / 365;

    if (years < 1) return 0;

    // Daily basic salary (30-day month rule)
    const dailyBasic = basicSalary / 30;

    let gratuity = 0;

    // Base Gratuity Calculation (Same for both, multiplier differs for resignation)
    // First 5 years: 21 days
    // Above 5 years: 30 days
    let baseGratuity = 0;
    if (years <= 5) {
      baseGratuity = years * 21 * dailyBasic;
    } else {
      baseGratuity = (5 * 21 * dailyBasic) + ((years - 5) * 30 * dailyBasic);
    }

    if (statusLower.includes('terminat')) {
      // Termination Logic: Full Gratuity
      gratuity = baseGratuity;
    } else if (statusLower.includes('resign')) {
      // Resignation Logic (UAE Standard / SME Friendly)
      // 1-3 years: 1/3
      // 3-5 years: 2/3
      // > 5 years: Full

      if (years < 1) gratuity = 0;
      else if (years < 3) gratuity = baseGratuity * (1 / 3);
      else if (years < 5) gratuity = baseGratuity * (2 / 3);
      else gratuity = baseGratuity;
    }

    return Math.round(gratuity);
  }

  const calculateEmployeeSalary = (employee: PayrollEmployee) => {
    const basicSalary = employee.basicSalary || 0

    // Calculate allowances
    let totalAllowances = (employee.allowances || []).reduce((sum, allowance) => {
      const amount =
        allowance.type === "percentage"
          ? (basicSalary * allowance.value) / 100
          : allowance.value
      return sum + amount
    }, 0)

    const eosbAmount = calculateEOSB(employee);
    totalAllowances += eosbAmount;

    const grossSalary = basicSalary + totalAllowances + (employee.overtimeAmount || 0)

    // Calculate deductions
    const totalDeductions = (employee.deductions || []).reduce((sum, deduction) => {
      const amount =
        deduction.type === "percentage"
          ? (basicSalary * deduction.value) / 100
          : deduction.value
      return sum + amount
    }, 0)

    const netSalary = grossSalary - totalDeductions

    return {
      basicSalary,
      totalAllowances,
      overtimeAmount: employee.overtimeAmount || 0,
      grossSalary,
      totalDeductions,
      netSalary,
    }
  }

  /* ================= SUMMARY STATS ================= */

  const stats = useMemo(() => {
    const totalEmployees = employees.length
    let totalBasic = 0
    let totalAllowances = 0
    let totalOvertime = 0
    let totalDeductions = 0
    let totalNet = 0

    employees.forEach(emp => {
      const calc = calculateEmployeeSalary(emp)
      totalBasic += calc.basicSalary
      totalAllowances += calc.totalAllowances
      totalOvertime += calc.overtimeAmount
      totalDeductions += calc.totalDeductions
      totalNet += calc.netSalary
    })

    return { totalEmployees, totalBasic, totalAllowances, totalOvertime, totalDeductions, totalNet }
  }, [employees])

  /* ================= PAYMENT PROCESSING ================= */

  const handleProcessPayment = async () => {
    setShowConfirmDialog(false)
    setIsProcessing(true)
    setPaymentStatus("processing")

    const orgId = getOrgId()
    const token = getAuthToken()
    const apiUrl = getApiUrl()

    if (!orgId || !token) {
      console.error("Missing authentication credentials")
      setIsProcessing(false)
      setPaymentStatus("error")
      return
    }

    try {
      // We'll process each employee one by one as per the backend controller
      // The backend has /salary-report/process which takes organizationId and body
      // Looking at the backend code: const result = await usecase.exec({ ...req.body, organizationId });

      const headers = { Authorization: `Bearer ${token}` }

      const payload = {
        employeeIds: employees.map(emp => emp.id),
        salaryDetails: employees.map(emp => ({
          employeeId: emp.id,
          overtimeHours: emp.overtimeHours || 0,
          overtimeAmount: emp.overtimeAmount || 0
        })),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      }

      await axios.post(`${apiUrl}/org/${orgId}/salaries/process`, payload, { headers })

      setPaymentStatus("success")

      // Clear session storage after success
      sessionStorage.removeItem('payrollPreviewData')

      // Redirect back after 3 seconds
      setTimeout(() => {
        router.push("/admin/salary")
      }, 3000)
    } catch (error: any) {
      console.error("Payment processing failed", error)
      if (error.response?.status === 401) {
        // Handle unauthorized error - redirect to login
        router.push("/")
        return
      }
      setPaymentStatus("error")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewEmployee = (employee: PayrollEmployee) => {
    sessionStorage.setItem("payrun-view-employee", JSON.stringify(employee))
    router.push("/admin/salary/view")
  }

  /* ================= RENDER ================= */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6 bg-white min-h-screen w-full overflow-x-hidden max-w-[100vw]">
      {/* HEADER */}
      <div className="flex flex-col gap-2 xs:gap-3 sm:gap-4">
        <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/salary")}
            className="hover:bg-slate-100 p-1 xs:p-1.5 sm:p-2 h-7 xs:h-8 sm:h-9 md:h-10 w-7 xs:w-8 sm:w-9 md:w-10 flex-shrink-0"
          >
            <ArrowLeft className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 truncate leading-tight">
              Pay Run Preview
            </h1>
            <p className="text-xs xs:text-xs sm:text-sm text-slate-600 mt-0.5 xs:mt-1 truncate">
              Review and process payroll for employees
            </p>
          </div>
        </div>

        {paymentStatus === "success" && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 rounded-lg border border-green-200 w-full">
            <CheckCircle2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-xs xs:text-sm sm:text-base font-medium truncate">
              Payment Processed Successfully
            </span>
          </div>
        )}
      </div>

      {/* SUMMARY CARDS - Ultra Responsive Grid */}
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-1.5 xs:gap-2 sm:gap-3 md:gap-4">
        {/* Total Employees Card */}
        <div className="bg-white rounded-lg xs:rounded-lg sm:rounded-xl p-2 xs:p-3 sm:p-4 md:p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] xs:text-xs sm:text-sm font-medium text-slate-600 truncate">Total Employees</p>
              <p className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mt-0.5 xs:mt-1">
                {stats.totalEmployees}
              </p>
            </div>
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 ml-1 xs:ml-2">
              <Users className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Basic Salary Card */}
        <div className="bg-white rounded-lg xs:rounded-lg sm:rounded-xl p-2 xs:p-3 sm:p-4 md:p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] xs:text-xs sm:text-sm font-medium text-slate-600 truncate">Basic Salary</p>
              <p className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mt-0.5 xs:mt-1 truncate">
                AED {(stats.totalBasic).toLocaleString()}
              </p>
            </div>
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 ml-1 xs:ml-2">
              <Wallet className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Allowances Card */}
        <div className="bg-white rounded-lg xs:rounded-lg sm:rounded-xl p-2 xs:p-3 sm:p-4 md:p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] xs:text-xs sm:text-sm font-medium text-slate-600 truncate">Total Allowances</p>
              <p className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-green-600 mt-0.5 xs:mt-1 truncate">
                AED {(stats.totalAllowances).toLocaleString()}
              </p>
            </div>
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 ml-1 xs:ml-2">
              <TrendingUp className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Overtime Card */}
        <div className="bg-white rounded-lg xs:rounded-lg sm:rounded-xl p-2 xs:p-3 sm:p-4 md:p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] xs:text-xs sm:text-sm font-medium text-slate-600 truncate">Total Overtime</p>
              <p className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-blue-500 mt-0.5 xs:mt-1 truncate">
                AED {(stats.totalOvertime).toLocaleString()}
              </p>
            </div>
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 ml-1 xs:ml-2">
              <TrendingUp className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Deductions Card */}
        <div className="bg-white rounded-lg xs:rounded-lg sm:rounded-xl p-2 xs:p-3 sm:p-4 md:p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] xs:text-xs sm:text-sm font-medium text-slate-600 truncate">Total Deductions</p>
              <p className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-red-600 mt-0.5 xs:mt-1 truncate">
                AED {(stats.totalDeductions).toLocaleString()}
              </p>
            </div>
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 ml-1 xs:ml-2">
              <TrendingDown className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-600" />
            </div>
          </div>
        </div>

        {/* Total Net Card */}
        <div className="bg-white rounded-lg xs:rounded-lg sm:rounded-xl p-2 xs:p-3 sm:p-4 md:p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow min-w-0 overflow-hidden col-span-2 xs:col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] xs:text-xs sm:text-sm font-medium text-slate-600 truncate">Total Net Amount</p>
              <p className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mt-0.5 xs:mt-1 truncate">
                AED {(stats.totalNet).toLocaleString()}
              </p>
            </div>
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 ml-1 xs:ml-2">
              <DollarSign className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* EMPLOYEE LIST - RESPONSIVE SWITCHING */}

      {/* MOBILE/TABLET VIEW: Card List (Visible below lg breakpoint) */}
      <div className="block lg:hidden space-y-3 xs:space-y-4">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 xs:h-48 text-slate-500 p-4 bg-white rounded-lg border border-slate-200">
            <Users className="w-10 h-10 xs:w-12 xs:h-12 mb-3 text-slate-300" />
            <p className="text-sm xs:text-base font-medium">No employees found</p>
          </div>
        ) : (
          employees.map((emp) => {
            const calc = calculateEmployeeSalary(emp)
            return (
              <div key={emp.id} className="bg-white border border-slate-200 rounded-lg xs:rounded-xl p-3 xs:p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3 xs:mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm xs:text-base truncate">{emp.name}</h3>
                    <div className="flex flex-wrap gap-1 xs:gap-2 mt-1 xs:mt-1.5">
                      <span className="text-[10px] xs:text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 xs:px-2.5 xs:py-1 rounded-full truncate max-w-[100px] xs:max-w-none">
                        {emp.department}
                      </span>
                      <span className="text-[10px] xs:text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 xs:px-2.5 xs:py-1 rounded-full truncate max-w-[100px] xs:max-w-none">
                        {emp.designation}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewEmployee(emp)}
                    className="ml-1 xs:ml-2 h-7 xs:h-8 w-7 xs:w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex-shrink-0"
                  >
                    <Eye className="w-4 h-4 xs:w-5 xs:h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-y-3 xs:gap-y-4 gap-x-2 xs:gap-x-4">
                  <div className="min-w-0">
                    <p className="text-[10px] xs:text-xs text-slate-500 mb-0.5 truncate">Basic Salary</p>
                    <p className="font-semibold text-slate-900 text-xs xs:text-sm truncate">AED {calc.basicSalary.toLocaleString()}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] xs:text-xs text-slate-500 mb-0.5 truncate">Allowances</p>
                    <p className="font-medium text-green-600 text-xs xs:text-sm truncate">+AED {calc.totalAllowances.toLocaleString()}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] xs:text-xs text-slate-500 mb-0.5 truncate">Overtime ({emp.overtimeHours}hrs)</p>
                    <p className="font-medium text-blue-600 text-xs xs:text-sm truncate">+AED {calc.overtimeAmount.toLocaleString()}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] xs:text-xs text-slate-500 mb-0.5 truncate">Deductions</p>
                    <p className="font-medium text-red-600 text-xs xs:text-sm truncate">-AED {calc.totalDeductions.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-3 xs:mt-4 pt-2 xs:pt-3 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-xs xs:text-sm font-medium text-slate-600">Net Salary</p>
                  <p className="font-bold text-blue-600 text-sm xs:text-lg truncate">AED {calc.netSalary.toLocaleString()}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* DESKTOP VIEW: Full Table (Visible lg and above) */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 p-4">
            <Users className="w-16 h-16 mb-4 text-slate-300" />
            <p className="text-lg font-medium">No employees found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700 py-4 px-4 min-w-[150px]">NAME</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4 px-4 min-w-[120px]">DEPARTMENT</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4 px-4 min-w-[120px]">DESIGNATION</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4 px-4 min-w-[120px]">LOCATION</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4 px-4 min-w-[130px]">BASIC SALARY</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4 px-4 min-w-[130px]">ALLOWANCES</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4 px-4 min-w-[130px]">OVERTIME</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4 px-4 min-w-[130px]">DEDUCTIONS</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4 px-4 min-w-[130px]">NET SALARY</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4 px-4 text-right min-w-[100px]">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => {
                  const calc = calculateEmployeeSalary(emp)
                  return (
                    <TableRow key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="py-4 px-4 font-medium text-slate-900 truncate max-w-[150px]">{emp.name}</TableCell>
                      <TableCell className="py-4 px-4 text-slate-600 truncate max-w-[120px]">{emp.department}</TableCell>
                      <TableCell className="py-4 px-4 text-slate-600 truncate max-w-[120px]">{emp.designation}</TableCell>
                      <TableCell className="py-4 px-4 text-slate-600 truncate max-w-[120px]">{emp.location}</TableCell>
                      <TableCell className="py-4 px-4 font-semibold text-slate-900 truncate">
                        AED {calc.basicSalary.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-4 px-4 font-medium text-green-600 truncate">
                        +AED {calc.totalAllowances.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-blue-600">+AED {calc.overtimeAmount.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-500">{emp.overtimeHours} hrs</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4 font-medium text-red-600 truncate">
                        -AED {calc.totalDeductions.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-4 px-4 font-bold text-blue-600 truncate">
                        AED {calc.netSalary.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEmployee(emp)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* PROCESS PAYMENT SECTION */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg xs:rounded-lg sm:rounded-xl p-3 xs:p-4 sm:p-5 md:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
          <div className="flex items-start gap-3 xs:gap-3 sm:gap-4 w-full lg:w-auto">
            <div className="w-10 h-10 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base xs:text-base sm:text-lg font-semibold text-slate-900 mb-1 truncate">
                Ready to Process Payment?
              </h3>
              <p className="text-xs xs:text-xs sm:text-sm text-slate-600 leading-tight">
                Total of AED {stats.totalNet.toLocaleString()} will be disbursed to{" "}
                {stats.totalEmployees} employee{stats.totalEmployees !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Button
            size="lg"
            disabled={isProcessing || paymentStatus === "success" || employees.length === 0}
            onClick={() => setShowConfirmDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full lg:w-auto min-w-[140px] px-6"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-2 animate-spin" />
                <span className="truncate">Processing...</span>
              </>
            ) : paymentStatus === "success" ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-2" />
                <span className="truncate">Completed</span>
              </>
            ) : (
              <>
                <CreditCard className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-2" />
                <span className="truncate">Process Payment</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ENHANCED CONFIRMATION DIALOG */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-[95vw] xs:max-w-[95vw] sm:max-w-md mx-1 xs:mx-2 sm:mx-auto p-4 xs:p-5 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-sm xs:text-base sm:text-lg">
              <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <span className="truncate">Confirm Payment Processing</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 xs:space-y-4 pt-3 text-slate-500 text-sm">
                <p className="text-slate-700 text-xs xs:text-sm sm:text-base leading-relaxed">
                  You are about to process payroll for{" "}
                  <span className="font-semibold text-slate-900">
                    {stats.totalEmployees} employee{stats.totalEmployees !== 1 ? "s" : ""}
                  </span>
                  .
                </p>

                {/* Enhanced Payment Summary Card */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg xs:rounded-lg sm:rounded-xl p-3 xs:p-4 sm:p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 xs:mb-3 sm:mb-4">
                    <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <p className="text-xs xs:text-xs sm:text-sm font-semibold text-slate-900 truncate">Payment Summary</p>
                  </div>

                  <div className="space-y-1.5 xs:space-y-2 sm:space-y-3">
                    {/* Total Employees */}
                    <div className="flex items-center justify-between py-1 xs:py-1.5 sm:py-2 border-b border-slate-200">
                      <div className="flex items-center gap-1 xs:gap-2">
                        <Users className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="text-[10px] xs:text-xs sm:text-sm text-slate-600 truncate">Total Employees</span>
                      </div>
                      <span className="font-semibold text-slate-900 text-xs xs:text-sm sm:text-base ml-1">{stats.totalEmployees}</span>
                    </div>

                    {/* Basic Salary */}
                    <div className="flex items-center justify-between py-1 xs:py-1.5 sm:py-2 border-b border-slate-200">
                      <div className="flex items-center gap-1 xs:gap-2">
                        <Wallet className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-indigo-500 flex-shrink-0" />
                        <span className="text-[10px] xs:text-xs sm:text-sm text-slate-600 truncate">Basic Salary</span>
                      </div>
                      <span className="font-semibold text-slate-900 text-xs xs:text-sm sm:text-base ml-1 truncate">
                        AED {stats.totalBasic.toLocaleString()}
                      </span>
                    </div>

                    {/* Total Allowances */}
                    <div className="flex items-center justify-between py-1 xs:py-1.5 sm:py-2 border-b border-slate-200">
                      <div className="flex items-center gap-1 xs:gap-2">
                        <TrendingUp className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-green-500 flex-shrink-0" />
                        <span className="text-[10px] xs:text-xs sm:text-sm text-slate-600 truncate">Total Allowances</span>
                      </div>
                      <span className="font-semibold text-green-600 text-xs xs:text-sm sm:text-base ml-1 truncate">
                        +AED {stats.totalAllowances.toLocaleString()}
                      </span>
                    </div>

                    {/* Total Overtime */}
                    <div className="flex items-center justify-between py-1 xs:py-1.5 sm:py-2 border-b border-slate-200">
                      <div className="flex items-center gap-1 xs:gap-2">
                        <TrendingUp className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-blue-500 flex-shrink-0" />
                        <span className="text-[10px] xs:text-xs sm:text-sm text-slate-600 truncate">Total Overtime</span>
                      </div>
                      <span className="font-semibold text-blue-600 text-xs xs:text-sm sm:text-base ml-1 truncate">
                        +AED {stats.totalOvertime.toLocaleString()}
                      </span>
                    </div>

                    {/* Total Deductions */}
                    <div className="flex items-center justify-between py-1 xs:py-1.5 sm:py-2 border-b border-slate-200">
                      <div className="flex items-center gap-1 xs:gap-2">
                        <TrendingDown className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-red-500 flex-shrink-0" />
                        <span className="text-[10px] xs:text-xs sm:text-sm text-slate-600 truncate">Total Deductions</span>
                      </div>
                      <span className="font-semibold text-red-600 text-xs xs:text-sm sm:text-base ml-1 truncate">
                        -AED {stats.totalDeductions.toLocaleString()}
                      </span>
                    </div>

                    {/* Net Amount - Highlighted */}
                    <div className="flex items-center justify-between py-2 xs:py-2.5 sm:py-3 bg-blue-600 -mx-3 xs:-mx-4 sm:-mx-5 px-3 xs:px-4 sm:px-5 -mb-3 xs:-mb-4 sm:-mb-5 rounded-b-lg xs:rounded-b-lg sm:rounded-b-xl mt-2 xs:mt-2 sm:mt-3">
                      <div className="flex items-center gap-1 xs:gap-2">
                        <CreditCard className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-blue-100 flex-shrink-0" />
                        <span className="text-[10px] xs:text-xs sm:text-sm font-semibold text-white truncate">Net Amount</span>
                      </div>
                      <span className="font-bold text-xs xs:text-sm sm:text-lg text-white truncate ml-1">
                        AED {stats.totalNet.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 xs:gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2 xs:p-2.5 sm:p-3">
                  <AlertCircle className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] xs:text-xs text-amber-800 leading-relaxed">
                    This action cannot be undone. Please verify all details before proceeding.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-1.5 xs:gap-2 sm:gap-2 flex-col xs:flex-col sm:flex-row mt-2 xs:mt-3">
            <AlertDialogCancel className="mt-0 w-full sm:w-auto h-9 xs:h-10 sm:h-10 text-xs xs:text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProcessPayment}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md w-full sm:w-auto h-9 xs:h-10 sm:h-10 text-xs xs:text-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4 mr-1 xs:mr-2" />
              Confirm & Process
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}