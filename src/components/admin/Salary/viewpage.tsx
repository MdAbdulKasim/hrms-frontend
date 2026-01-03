"use client"

import { useEffect, useMemo, useState } from "react"
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
  ArrowLeft,
  User,
  Building,
  Briefcase,
  MapPin,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calculator,
  Printer,
} from "lucide-react"

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

/* ================= PAGE ================= */

export default function PayrunViewPage() {
  const [employee, setEmployee] = useState<PayrollEmployee | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /* ================= LOAD FROM STORAGE ================= */

  useEffect(() => {
    const stored = sessionStorage.getItem("payrun-view-employee")
    if (!stored) {
      // Redirect logic would go here
      window.location.href = "/admin/salary"
      return
    }
    try {
      setEmployee(JSON.parse(stored))
    } catch (error) {
      console.error("Failed to parse employee data", error)
      window.location.href = "/admin/salary"
    } finally {
      setIsLoading(false)
    }
  }, [])

  /* ================= CALCULATIONS ================= */

  const salaryBreakdown = useMemo(() => {
    if (!employee) return null

    const basicSalary = employee.basicSalary || 0

    // Calculate each allowance with its amount
    const allowancesWithAmount = (employee.allowances || []).map((allowance) => {
      const amount =
        allowance.type === "percentage"
          ? (basicSalary * allowance.value) / 100
          : allowance.value
      return {
        ...allowance,
        calculatedAmount: amount,
      }
    })

    const totalAllowances = allowancesWithAmount.reduce(
      (sum, a) => sum + a.calculatedAmount,
      0
    )

    const grossSalary = basicSalary + totalAllowances

    // Calculate each deduction with its amount
    const deductionsWithAmount = (employee.deductions || []).map((deduction) => {
      const amount =
        deduction.type === "percentage"
          ? (basicSalary * deduction.value) / 100
          : deduction.value
      return {
        ...deduction,
        calculatedAmount: amount,
      }
    })

    const totalDeductions = deductionsWithAmount.reduce(
      (sum, d) => sum + d.calculatedAmount,
      0
    )

    const netSalary = grossSalary - totalDeductions

    return {
      basicSalary,
      allowancesWithAmount,
      totalAllowances,
      grossSalary,
      deductionsWithAmount,
      totalDeductions,
      netSalary,
    }
  }, [employee])

  /* ================= LOADING STATE ================= */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!employee || !salaryBreakdown) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">No employee data found</p>
        <Button onClick={() => window.history.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  /* ================= RENDER ================= */

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-white">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="hover:bg-slate-100 flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {employee.name}
                </h1>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <InfoBadge icon={<Briefcase className="w-4 h-4" />} label="Designation" value={employee.designation} />
              <InfoBadge icon={<Building className="w-4 h-4" />} label="Department" value={employee.department} />
              <InfoBadge icon={<MapPin className="w-4 h-4" />} label="Location" value={employee.location} />
            </div>
          </div>
        </div>
      </div>

      {/* SALARY SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Basic Salary"
          value={salaryBreakdown.basicSalary}
          icon={<DollarSign className="w-5 h-5" />}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <SummaryCard
          title="Total Allowances"
          value={salaryBreakdown.totalAllowances}
          icon={<TrendingUp className="w-5 h-5" />}
          bgColor="bg-green-100"
          iconColor="text-green-600"
          prefix="+"
        />
        <SummaryCard
          title="Total Deductions"
          value={salaryBreakdown.totalDeductions}
          icon={<TrendingDown className="w-5 h-5" />}
          bgColor="bg-red-100"
          iconColor="text-red-600"
          prefix="-"
        />
        <SummaryCard
          title="Net Salary"
          value={salaryBreakdown.netSalary}
          icon={<Wallet className="w-5 h-5" />}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
          highlight
        />
      </div>

      {/* SALARY BREAKDOWN */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-5 h-5 text-slate-700" />
          <h2 className="text-xl font-bold text-slate-900">Salary Breakdown</h2>
        </div>

        <div className="space-y-4">
          {/* Basic Salary Row */}
          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="font-medium text-slate-700">Basic Salary</span>
            <span className="text-lg font-bold text-slate-900">
              ₹{salaryBreakdown.basicSalary.toLocaleString()}
            </span>
          </div>

          {/* Allowances Total */}
          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="font-medium text-green-700">Total Allowances</span>
            <span className="text-lg font-bold text-green-600">
              +₹{salaryBreakdown.totalAllowances.toLocaleString()}
            </span>
          </div>

          {/* Gross Salary */}
          <div className="flex justify-between items-center py-3 border-b border-slate-200 bg-slate-50 px-4 -mx-6 rounded-lg">
            <span className="font-semibold text-slate-800">Gross Salary</span>
            <span className="text-xl font-bold text-slate-900">
              ₹{salaryBreakdown.grossSalary.toLocaleString()}
            </span>
          </div>

          {/* Deductions Total */}
          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="font-medium text-red-700">Total Deductions</span>
            <span className="text-lg font-bold text-red-600">
              -₹{salaryBreakdown.totalDeductions.toLocaleString()}
            </span>
          </div>

          {/* Net Salary */}
          <div className="flex justify-between items-center py-4 bg-gradient-to-r from-purple-50 to-blue-50 px-4 -mx-6 rounded-lg">
            <span className="font-bold text-slate-800 text-lg">Net Salary (Take Home)</span>
            <span className="text-2xl font-bold text-purple-600">
              ₹{salaryBreakdown.netSalary.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ALLOWANCES SECTION */}
      {salaryBreakdown.allowancesWithAmount.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-green-50 border-b border-green-100 p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-green-900">Allowances</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">ALLOWANCE NAME</TableHead>
                  <TableHead className="font-semibold text-slate-700">TYPE</TableHead>
                  <TableHead className="font-semibold text-slate-700">VALUE</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">AMOUNT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryBreakdown.allowancesWithAmount.map((allowance, index) => (
                  <TableRow key={allowance.id || index} className="hover:bg-green-50">
                    <TableCell className="font-medium text-slate-900">
                      {allowance.name}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                        {allowance.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {allowance.type === "percentage"
                        ? `${allowance.value}%`
                        : `₹${allowance.value.toLocaleString()}`}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      ₹{allowance.calculatedAmount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-green-50 hover:bg-green-50">
                  <TableCell colSpan={3} className="font-bold text-slate-900">
                    TOTAL ALLOWANCES
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600 text-lg">
                    ₹{salaryBreakdown.totalAllowances.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* DEDUCTIONS SECTION */}
      {salaryBreakdown.deductionsWithAmount.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-red-50 border-b border-red-100 p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">Deductions</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">DEDUCTION NAME</TableHead>
                  <TableHead className="font-semibold text-slate-700">TYPE</TableHead>
                  <TableHead className="font-semibold text-slate-700">VALUE</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">AMOUNT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryBreakdown.deductionsWithAmount.map((deduction, index) => (
                  <TableRow key={deduction.id || index} className="hover:bg-red-50">
                    <TableCell className="font-medium text-slate-900">
                      {deduction.name}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                        {deduction.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {deduction.type === "percentage"
                        ? `${deduction.value}%`
                        : `₹${deduction.value.toLocaleString()}`}
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-600">
                      ₹{deduction.calculatedAmount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-red-50 hover:bg-red-50">
                  <TableCell colSpan={3} className="font-bold text-slate-900">
                    TOTAL DEDUCTIONS
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-600 text-lg">
                    ₹{salaryBreakdown.totalDeductions.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 print:hidden">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="border-slate-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        <Button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Payslip
        </Button>
      </div>
    </div>
  )
}

/* ================= HELPER COMPONENTS ================= */

function InfoBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-medium text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon,
  bgColor,
  iconColor,
  prefix = "",
  highlight = false,
}: {
  title: string
  value: number
  icon: React.ReactNode
  bgColor: string
  iconColor: string
  prefix?: string
  highlight?: boolean
}) {
  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border ${highlight ? "border-purple-200 ring-2 ring-purple-100" : "border-slate-200"
        } hover:shadow-md transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold ${highlight ? "text-purple-600" : "text-slate-900"}`}>
        {prefix}₹{value.toLocaleString()}
      </p>
    </div>
  )
}