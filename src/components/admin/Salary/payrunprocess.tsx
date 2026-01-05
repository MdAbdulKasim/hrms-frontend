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
} from "lucide-react"
import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth"

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
        }))

        setEmployees(formatted)
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

  const calculateEmployeeSalary = (employee: PayrollEmployee) => {
    const basicSalary = employee.basicSalary || 0

    // Calculate allowances
    const totalAllowances = (employee.allowances || []).reduce((sum, allowance) => {
      const amount =
        allowance.type === "percentage"
          ? (basicSalary * allowance.value) / 100
          : allowance.value
      return sum + amount
    }, 0)

    const grossSalary = basicSalary + totalAllowances

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
    let totalDeductions = 0
    let totalNet = 0

    employees.forEach(emp => {
      const calc = calculateEmployeeSalary(emp)
      totalBasic += calc.basicSalary
      totalAllowances += calc.totalAllowances
      totalDeductions += calc.totalDeductions
      totalNet += calc.netSalary
    })

    return { totalEmployees, totalBasic, totalAllowances, totalDeductions, totalNet }
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
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-white min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/salary")}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl md:text-2xl font-bold text-slate-900">
                Pay Run Preview
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Review and process payroll for employees
              </p>
            </div>
          </div>
        </div>

        {paymentStatus === "success" && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Payment Processed Successfully</span>
          </div>
        )}
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Employees Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Employees</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats.totalEmployees}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Basic Salary Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Basic Salary</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                ₹{stats.totalBasic.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Allowances Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Allowances</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ₹{stats.totalAllowances.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Deductions Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Deductions</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                ₹{stats.totalDeductions.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Total Net Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Net Amount</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                ₹{stats.totalNet.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* EMPLOYEE TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Users className="w-16 h-16 mb-4 text-slate-300" />
            <p className="text-lg font-medium">No employees found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">NAME</TableHead>
                  <TableHead className="font-semibold text-slate-700">DEPARTMENT</TableHead>
                  <TableHead className="font-semibold text-slate-700">DESIGNATION</TableHead>
                  <TableHead className="font-semibold text-slate-700">LOCATION</TableHead>
                  <TableHead className="font-semibold text-slate-700">BASIC SALARY</TableHead>
                  <TableHead className="font-semibold text-slate-700">ALLOWANCES</TableHead>
                  <TableHead className="font-semibold text-slate-700">DEDUCTIONS</TableHead>
                  <TableHead className="font-semibold text-slate-700">NET SALARY</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">ACTION</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {employees.map((emp) => {
                  const calc = calculateEmployeeSalary(emp)
                  return (
                    <TableRow key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-slate-900">{emp.name}</TableCell>
                      <TableCell className="text-slate-600">{emp.department}</TableCell>
                      <TableCell className="text-slate-600">{emp.designation}</TableCell>
                      <TableCell className="text-slate-600">{emp.location}</TableCell>
                      <TableCell className="font-semibold text-slate-900">
                        ₹{calc.basicSalary.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        +₹{calc.totalAllowances.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium text-red-600">
                        -₹{calc.totalDeductions.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-bold text-blue-600">
                        ₹{calc.netSalary.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Ready to Process Payment?
              </h3>
              <p className="text-sm text-slate-600">
                Total of ₹{stats.totalNet.toLocaleString()} will be disbursed to{" "}
                {stats.totalEmployees} employee{stats.totalEmployees !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Button
            size="lg"
            disabled={isProcessing || paymentStatus === "success" || employees.length === 0}
            onClick={() => setShowConfirmDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : paymentStatus === "success" ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Completed
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Process Payment
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ENHANCED CONFIRMATION DIALOG */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              Confirm Payment Processing
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-3">
              <p className="text-slate-700">
                You are about to process payroll for{" "}
                <span className="font-semibold text-slate-900">
                  {stats.totalEmployees} employee{stats.totalEmployees !== 1 ? "s" : ""}
                </span>
                .
              </p>

              {/* Enhanced Payment Summary Card */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Payment Summary</p>
                </div>

                <div className="space-y-3">
                  {/* Total Employees */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">Total Employees</span>
                    </div>
                    <span className="font-semibold text-slate-900">{stats.totalEmployees}</span>
                  </div>

                  {/* Basic Salary */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm text-slate-600">Basic Salary</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      ₹{stats.totalBasic.toLocaleString()}
                    </span>
                  </div>

                  {/* Total Allowances */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-600">Total Allowances</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      +₹{stats.totalAllowances.toLocaleString()}
                    </span>
                  </div>

                  {/* Total Deductions */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-slate-600">Total Deductions</span>
                    </div>
                    <span className="font-semibold text-red-600">
                      -₹{stats.totalDeductions.toLocaleString()}
                    </span>
                  </div>

                  {/* Net Amount - Highlighted */}
                  <div className="flex items-center justify-between py-3 bg-blue-600 -mx-5 px-5 -mb-5 rounded-b-xl mt-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-100" />
                      <span className="text-sm font-semibold text-white">Net Amount</span>
                    </div>
                    <span className="font-bold text-lg text-white">
                      ₹{stats.totalNet.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  This action cannot be undone. Please verify all details before proceeding.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProcessPayment}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm & Process
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}