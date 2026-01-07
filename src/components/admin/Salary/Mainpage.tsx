"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import attendanceService from "@/lib/attendanceService"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Download,
  Filter,
  Search,
  History,
  ChevronDown,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Menu,
  X,
} from "lucide-react"
import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth"
import { CustomAlertDialog } from "@/components/ui/custom-dialogs"
import WPSSIFPage from "./SIFfile"
import { eosbService } from "@/lib/eosbService"

/* ================= TYPES ================= */

export interface Allowance {
  id: string
  name: string
  value: number
  type: "percentage" | "fixed"
}

export interface Deduction {
  id: string
  name: string
  value: number
  type: "percentage" | "fixed"
}

export interface SalaryEmployee {
  id: string
  name: string
  department: string
  designation: string
  location: string
  basicSalary: number
  allowances: Allowance[]
  deductions: Deduction[]
  status: "Pending" | "Paid"
  selected: boolean
  paidDate?: Date
  overtimeHours: number
  overtimeAmount: number
  joiningDate?: string
  employmentStatus?: string
  exitDate?: string
  eosbAmount?: number // Stored EOSB amount from backend
}

/* ================= PAGE ================= */

export default function SalaryPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<SalaryEmployee[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "Paid" | "Pending">("all")
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"Payrun" | "SIF">("Payrun")
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Alert State
  const [alertState, setAlertState] = useState<{
    open: boolean
    title: string
    description: string
    variant: "success" | "error" | "info" | "warning"
  }>({
    open: false,
    title: "",
    description: "",
    variant: "info"
  })

  const showAlert = (
    title: string,
    description: string,
    variant: "success" | "error" | "info" | "warning" = "info"
  ) => {
    setAlertState({ open: true, title, description, variant })
  }

  // Filters state
  const [departments, setDepartments] = useState<any[]>([])
  const [designations, setDesignations] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [deptFilter, setDeptFilter] = useState("all")
  const [desigFilter, setDesigFilter] = useState("all")
  const [locFilter, setLocFilter] = useState("all")

  const ITEMS_PER_PAGE = 5

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    const orgId = getOrgId()
    const token = getAuthToken()
    const apiUrl = getApiUrl()

    if (!orgId || !token) {
      console.error("Missing authentication credentials")
      setIsLoading(false)
      return
    }

    try {
      const headers = { Authorization: `Bearer ${token}` }

      const [empRes, deptRes, desigRes, locRes] = await Promise.all([
        axios.get(`${apiUrl}/org/${orgId}/employees?limit=1000`, { headers }).catch(err => { console.error("Emp fetch fail", err); return { data: { data: [] } } }),
        axios.get(`${apiUrl}/org/${orgId}/departments`, { headers }).catch(err => { console.error("Dept fetch fail", err); return { data: { data: [] } } }),
        axios.get(`${apiUrl}/org/${orgId}/designations`, { headers }).catch(err => { console.error("Desig fetch fail", err); return { data: { data: [] } } }),
        axios.get(`${apiUrl}/org/${orgId}/locations`, { headers }).catch(err => { console.error("Loc fetch fail", err); return { data: { data: [] } } })
      ])

      // Parse metadata with robust array checks
      const departmentsData = Array.isArray(deptRes.data?.data) ? deptRes.data.data : (Array.isArray(deptRes.data) ? deptRes.data : [])
      const designationsData = Array.isArray(desigRes.data?.data) ? desigRes.data.data : (Array.isArray(desigRes.data) ? desigRes.data : [])
      const locationsData = Array.isArray(locRes.data?.data) ? locRes.data.data : (Array.isArray(locRes.data) ? locRes.data : [])

      setDepartments(departmentsData)
      setDesignations(designationsData)
      setLocations(locationsData)

      // Fetch Attendance for Overtime Calculation
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

      let attendanceRecords: any[] = [];
      try {
        const attRes = await attendanceService.searchAttendance(orgId, undefined, firstDay, lastDay);
        // Handle various response structures as seen in AttendanceReportPage
        if (attRes && typeof attRes === 'object') {
          const responseData: any = attRes.data || attRes;
          if (Array.isArray(responseData)) {
            attendanceRecords = responseData;
          } else if (responseData && typeof responseData === 'object') {
            if (Array.isArray(responseData.records)) attendanceRecords = responseData.records;
            else if (Array.isArray(responseData.attendance)) attendanceRecords = responseData.attendance;
            else if (Array.isArray(responseData.items)) attendanceRecords = responseData.items;
            else if (Array.isArray(responseData.data)) attendanceRecords = responseData.data;
            else attendanceRecords = [responseData];
          }
        }
      } catch (attErr) {
        console.error("Failed to fetch attendance for overtime", attErr);
      }

      // Create Lookups for ID -> Name
      const deptMap = new Map<string, string>(
        departmentsData.map((d: any) => [d.id || d._id, d.departmentName || d.name])
      )
      const desigMap = new Map<string, string>(
        designationsData.map((d: any) => [d.id || d._id, d.designationName || d.name])
      )
      const locMap = new Map<string, string>(
        locationsData.map((d: any) => [d.id || d._id, d.locationName || d.name])
      )

      // Process Employees
      const empData = Array.isArray(empRes.data?.data) ? empRes.data.data : (Array.isArray(empRes.data) ? empRes.data : [])

      // Fetch salary records to determine real-time status
      let salaryRecords: any[] = []
      try {
        const salaryRes = await axios.get(`${apiUrl}/org/${orgId}/salaries`, { headers })
        salaryRecords = Array.isArray(salaryRes.data?.data) ? salaryRes.data.data : (Array.isArray(salaryRes.data) ? salaryRes.data : [])
      } catch (err) {
        console.error("Failed to fetch salary records", err)
      }

      const formatted: SalaryEmployee[] = empData.map((emp: any) => {
        const empId = emp.id || emp._id

        // Resolve Department
        let deptName = emp.department?.departmentName || emp.department?.name || emp.departmentName || ""
        if (!deptName && (emp.department || emp.departmentId)) {
          const id = typeof emp.department === 'object'
            ? (emp.department.id || emp.department._id)
            : (emp.department || emp.departmentId)
          deptName = deptMap.get(id) || ""
        }

        // Resolve Designation
        let desigName = emp.designation?.designationName || emp.designation?.name || emp.designationName || ""
        if (!desigName && (emp.designation || emp.designationId)) {
          const id = typeof emp.designation === 'object'
            ? (emp.designation.id || emp.designation._id)
            : (emp.designation || emp.designationId)
          desigName = desigMap.get(id) || ""
        }

        // Resolve Location
        let locName = emp.location?.locationName || emp.location?.name || emp.locationName || ""
        if (!locName && (emp.location || emp.locationId)) {
          const id = typeof emp.location === 'object'
            ? (emp.location.id || emp.location._id)
            : (emp.location || emp.locationId)
          locName = locMap.get(id) || ""
        }

        // Parse allowances and deductions from employee data (supports multiple formats)
        const allowances: Allowance[] = [];
        const deductions: Deduction[] = [];
        const empAllowances = emp.allowances;
        const empDeductions = emp.deductions;

        // 1. Handle Allowances
        if (empAllowances && typeof empAllowances === 'object' && !Array.isArray(empAllowances)) {
          // Handle flattened structure (from onboarding)
          const flatMap = [
            { key: 'homeClaimed', perc: 'homeAllowancePercentage', name: 'Home' },
            { key: 'foodClaimed', perc: 'foodAllowancePercentage', name: 'Food' },
            { key: 'travelClaimed', perc: 'travelAllowancePercentage', name: 'Travel' }
          ];

          flatMap.forEach(m => {
            if (empAllowances[m.key] === true || empAllowances[m.key] === 'true') {
              allowances.push({
                id: `allowance-${m.name.toLowerCase()}`,
                name: m.name,
                value: Number(empAllowances[m.perc] || 0),
                type: "percentage"
              });
            }
          });

          // Handle nested structure (if any)
          Object.entries(empAllowances).forEach(([key, val]: [string, any]) => {
            if (val && typeof val === 'object' && val.enabled && !allowances.some(a => a.name.toLowerCase() === key.toLowerCase())) {
              allowances.push({
                id: `allowance-${key}`,
                name: key.charAt(0).toUpperCase() + key.slice(1),
                value: Number(val.amount || val.percentage || 0),
                type: val.percentage > 0 ? "percentage" : "fixed"
              });
            }
          });
        } else if (Array.isArray(empAllowances)) {
          empAllowances.forEach((a: any, idx: number) => {
            allowances.push({
              id: a.id || `allowance-${idx}`,
              name: a.name || a.type || "Allowance",
              value: Number(a.value || a.amount || a.percentage || 0),
              type: a.type === "percentage" || a.percentage > 0 ? "percentage" : "fixed"
            });
          });
        }

        // Final fallback for purely legacy field names
        if (allowances.length === 0 && Array.isArray(emp.accommodationAllowances)) {
          emp.accommodationAllowances.forEach((a: any, idx: number) => {
            allowances.push({
              id: a.id || `allowance-${idx}`,
              name: a.name || a.type || "Allowance",
              value: Number(a.value || a.amount || a.percentage || 0),
              type: a.type === "percentage" || (a.percentage && a.percentage > 0) ? "percentage" : "fixed"
            });
          });
        }

        // 2. Handle Deductions
        if (empDeductions && typeof empDeductions === 'object' && !Array.isArray(empDeductions)) {
          // Handle flattened structure (insuranceDeductionPercentage)
          if (empDeductions.insuranceDeductionPercentage) {
            deductions.push({
              id: 'deduction-insurance',
              name: 'Insurance',
              value: Number(empDeductions.insuranceDeductionPercentage),
              type: 'percentage'
            });
          }

          // Handle nested structure (if any)
          Object.entries(empDeductions).forEach(([key, val]: [string, any]) => {
            if (val && typeof val === 'object' && val.enabled && !deductions.some(d => d.name.toLowerCase() === key.toLowerCase())) {
              deductions.push({
                id: `deduction-${key}`,
                name: key.charAt(0).toUpperCase() + key.slice(1),
                value: Number(val.amount || val.percentage || 0),
                type: val.percentage > 0 ? "percentage" : "fixed"
              });
            }
          });
        } else if (Array.isArray(empDeductions)) {
          empDeductions.forEach((d: any, idx: number) => {
            deductions.push({
              id: d.id || `deduction-${idx}`,
              name: d.name || d.type || "Deduction",
              value: Number(d.value || d.amount || d.percentage || 0),
              type: d.type === "percentage" || d.percentage > 0 ? "percentage" : "fixed"
            });
          });
        }

        if (deductions.length === 0 && Array.isArray(emp.insurances)) {
          emp.insurances.forEach((d: any, idx: number) => {
            deductions.push({
              id: d.id || `deduction-${idx}`,
              name: d.name || d.type || "Deduction",
              value: Number(d.value || d.amount || d.percentage || 0),
              type: d.type === "percentage" || (d.percentage && d.percentage > 0) ? "percentage" : "fixed"
            });
          });
        }

        // Determine status from salary records (real-time)
        // Check if there's a record for this employee marked as paid in the current month/year
        const currentMonth = new Date().getMonth() + 1
        const currentYear = new Date().getFullYear()

        const salaryRecord = salaryRecords.find((r: any) => {
          const isSameEmployee = r.employeeId === empId || r.employee?.id === empId || r.employee?._id === empId
          const isPaid = r.status?.toLowerCase() === "paid"
          const payDate = new Date(r.payPeriodEnd || r.paidDate)
          const isSameMonth = payDate.getMonth() + 1 === currentMonth && payDate.getFullYear() === currentYear
          return isSameEmployee && isPaid && isSameMonth
        })

        // Calculate Overtime
        const basicSalary = Number(emp.basicSalary || emp.salary || emp.ctc || emp.baseSalary || 0);
        let overtimeHours = 0;

        // Filter attendance records for this employee
        const empAttendance = attendanceRecords.filter((r: any) =>
          r.employeeId === empId || r.employee?.id === empId || r.employee?._id === empId
        );

        empAttendance.forEach((record: any) => {
          // Parse total hours. Assuming format "9h 30m" or just number
          let hours = 0;
          if (typeof record.totalHours === 'string') {
            // Extract hours part
            const match = record.totalHours.match(/(\d+(\.\d+)?)h?/);
            if (match) hours = parseFloat(match[1]);
          } else if (typeof record.totalHours === 'number') {
            hours = record.totalHours;
          } else if (record.hoursWorked) {
            const match = String(record.hoursWorked).match(/(\d+(\.\d+)?)h?/);
            if (match) hours = parseFloat(match[1]);
          }

          if (hours > 9) {
            overtimeHours += (hours - 9);
          }
        });

        // Calculate Overtime Amount
        // Annual / 12 / 30 / 9 = Hourly rate (Approx)
        // Or Basic / 30 / 9
        const dailyRate = basicSalary / 30;
        const hourlyRate = dailyRate / 9;
        const overtimeAmount = overtimeHours * hourlyRate;

        // Fetch EOSB from backend if applicable (Terminated or Resigned)
        // We can't await inside map properly without Promise.all, so we'll do a separate pass or just fetch for all relevant ones.
        // For simplicity and performance, we will fetch EOSB concurrently after mapping initial data.

        return {
          id: empId,
          name: emp.fullName || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "",
          department: deptName || "N/A",
          designation: desigName || "N/A",
          location: locName || "N/A",
          basicSalary,
          allowances,
          deductions,
          status: salaryRecord ? "Paid" : "Pending",
          selected: false,
          paidDate: salaryRecord?.paidDate ? new Date(salaryRecord.paidDate) : undefined,
          overtimeHours: parseFloat(overtimeHours.toFixed(2)),
          overtimeAmount: Math.round(overtimeAmount),
          joiningDate: emp.joiningDate || emp.dateOfJoining || emp.startDate,
          employmentStatus: emp.status || emp.employeeStatus || "Active",
          exitDate: emp.exitDate || emp.relievingDate || emp.terminationDate || emp.resignationDate
        }
      })

      // Set employees immediately to show the list
      setEmployees(formatted)

      // Fetch EOSB in the background so it doesn't block the UI if the backend has errors
      Promise.all(formatted.map(async (emp) => {
        const statusLower = (emp.employmentStatus || "").toLowerCase();
        if (statusLower.includes('terminat') || statusLower.includes('resign')) {
          try {
            const eosbRes = await eosbService.getByEmployeeId(orgId as string, emp.id);
            if (eosbRes.data) return { id: emp.id, amount: eosbRes.data.amount };
          } catch (e) {
            console.warn(`Failed to fetch EOSB for ${emp.name}`, e);
          }
        }
        return null;
      })).then(results => {
        const updates = results.filter((r): r is { id: string, amount: number } => r !== null);
        if (updates.length > 0) {
          setEmployees(prev => prev.map(e => {
            const up = updates.find(u => u.id === e.id);
            return up ? { ...e, eosbAmount: up.amount } : e;
          }));
        }
      });

    } catch (error: any) {
      console.error("Failed to fetch data", error)
      if (error.response?.status === 401) {
        showAlert("Authentication Failed", "Authentication failed. Please log in again.", "error")
      }
    } finally {
      setIsLoading(false)
    }
  }

  /* ================= SALARY CALCULATIONS ================= */

  const calculateEOSB = (employee: SalaryEmployee) => {
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

  const calculateEmployeeSalary = (employee: SalaryEmployee) => {
    const basicSalary = employee.basicSalary

    // Calculate Allowances
    let totalAllowances = employee.allowances.reduce((sum, allowance) => {
      const amount = allowance.type === "percentage"
        ? (basicSalary * allowance.value) / 100
        : allowance.value
      return sum + amount
    }, 0)

    const eosbAmount = calculateEOSB(employee);
    totalAllowances += eosbAmount;

    const grossSalary = basicSalary + totalAllowances + employee.overtimeAmount

    // Calculate deductions
    const totalDeductions = employee.deductions.reduce((sum, deduction) => {
      const amount = deduction.type === "percentage"
        ? (basicSalary * deduction.value) / 100
        : deduction.value
      return sum + amount
    }, 0)

    const netSalary = grossSalary - totalDeductions

    return {
      basicSalary,
      totalAllowances,
      overtimeAmount: employee.overtimeAmount,
      grossSalary,
      totalDeductions,
      netSalary,
      eosbAmount // Exposed for potential display if needed, but aggregated into allowances as requested
    }
  }

  /* ================= FILTER ================= */

  const filteredEmployees = useMemo(() => {
    return employees
      .filter((e) =>
        statusFilter === "all" ? true : e.status === statusFilter
      )
      .filter((e) =>
        deptFilter === "all" ? true : e.department === deptFilter
      )
      .filter((e) =>
        desigFilter === "all" ? true : e.designation === desigFilter
      )
      .filter((e) =>
        locFilter === "all" ? true : e.location === locFilter
      )
      .filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.department.toLowerCase().includes(search.toLowerCase())
      )
  }, [employees, search, statusFilter, deptFilter, desigFilter, locFilter])

  /* ================= STATISTICS ================= */

  const stats = useMemo(() => {
    const total = employees.length
    const pending = employees.filter(e => e.status === "Pending").length

    // Calculate total pending based on net salary
    const totalPending = employees
      .filter(e => e.status === "Pending")
      .reduce((sum, e) => sum + calculateEmployeeSalary(e).netSalary, 0)

    // Calculate selected employees stats
    const selectedEmployees = employees.filter(e => e.selected)
    const totalSelected = selectedEmployees.reduce(
      (sum, e) => sum + calculateEmployeeSalary(e).netSalary,
      0
    )

    return { total, pending, totalPending, selectedCount: selectedEmployees.length, totalSelected }
  }, [employees])

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE)

  const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  /* ================= SELECTION ================= */

  const selectedEmployees = employees.filter((e) => e.selected)
  const selectedCount = selectedEmployees.length

  const allSelected =
    paginatedEmployees.length > 0 &&
    paginatedEmployees.every((e) => e.selected)

  const toggleSelectAll = (checked: boolean) => {
    setEmployees((prev) =>
      prev.map((e) => ({ ...e, selected: checked }))
    )
  }

  const toggleSelectOne = (id: string, checked: boolean) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, selected: checked } : e
      )
    )
  }

  /* ================= NAVIGATION TO PREVIEW ================= */

  const handlePayRunClick = () => {
    // Store selected employees in sessionStorage for preview page
    const selectedEmployeesData = employees.filter(e => e.selected)
    sessionStorage.setItem('payrollPreviewData', JSON.stringify(selectedEmployeesData))

    // Navigate to preview page
    router.push('/admin/salary/add')
  }

  /* ================= EXPORT ================= */

  const handleExportCSV = () => {
    const csv = [
      [
        "NAME",
        "DEPARTMENT",
        "DESIGNATION",
        "LOCATION",
        "BASIC SALARY",
        "ALLOWANCES",
        "OVERTIME",
        "DEDUCTIONS",
        "NET SALARY",
        "STATUS",
      ],
      ...employees.map((e) => {
        const calc = calculateEmployeeSalary(e)
        return [
          e.name,
          e.department,
          e.designation,
          e.location,
          calc.basicSalary,
          calc.totalAllowances,
          calc.overtimeAmount,
          calc.totalDeductions,
          calc.netSalary,
          e.status,
        ]
      }),
    ]
      .map((r) => r.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "salary.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ================= UI ================= */

  return (
    <div className="p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 xs:space-y-6 bg-white min-h-screen max-w-full overflow-x-hidden">
      {/* TABS */}
      <div className="flex flex-wrap gap-2 xs:gap-3 sm:gap-4 items-center">
        <button
          onClick={() => setActiveTab("Payrun")}
          className={`px-4 xs:px-5 sm:px-6 py-1.5 xs:py-2 rounded-full text-xs xs:text-sm font-medium transition-all ${activeTab === "Payrun"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
            }`}
        >
          Payrun
        </button>
        <button
          onClick={() => setActiveTab("SIF")}
          className={`px-4 xs:px-5 sm:px-6 py-1.5 xs:py-2 rounded-full text-xs xs:text-sm font-medium transition-all ${activeTab === "SIF"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
            }`}
        >
          SIF
        </button>
      </div>

      {activeTab === "Payrun" ? (
        <>
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 xs:gap-4">
            <div className="space-y-0.5 xs:space-y-1">
              <h1 className="text-lg xs:text-xl md:text-2xl font-bold px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md inline-block">
                PayRun Salary
              </h1>
              <p className="text-xs xs:text-sm text-slate-600 max-w-full break-words">
                Manage employee payroll and compensation
              </p>
            </div>

            <div className="flex flex-wrap gap-2 xs:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/salary/history')}
                className="bg-white hover:bg-slate-50 border-slate-200 shadow-sm transition-all hover:shadow-md text-xs xs:text-sm h-9 xs:h-10 px-3 xs:px-4 flex-1 sm:flex-none"
              >
                <History className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-1.5 xs:mr-2" />
                <span className="whitespace-nowrap">Pay History</span>
              </Button>

              <Button
                disabled={selectedCount === 0}
                onClick={handlePayRunClick}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs xs:text-sm h-9 xs:h-10 px-3 xs:px-4 flex-1 sm:flex-none"
              >
                <DollarSign className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-1.5 xs:mr-2" />
                <span className="whitespace-nowrap">Pay Run ({selectedCount})</span>
              </Button>
            </div>
          </div>

          {/* STATISTICS CARDS */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
            <div className="bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs xs:text-sm font-medium text-slate-600 truncate">Total Employees</p>
                  <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-slate-900 mt-1 xs:mt-2 truncate">{stats.total}</p>
                </div>
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                  <Users className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs xs:text-sm font-medium text-slate-600 truncate">Pending Payments</p>
                  <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-orange-600 mt-1 xs:mt-2 truncate">{stats.pending}</p>
                </div>
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                  <TrendingUp className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs xs:text-sm font-medium text-slate-600 truncate">Pending Amount</p>
                  <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-green-600 mt-1 xs:mt-2 truncate">
                    AED {stats.totalPending.toLocaleString()}
                  </p>
                </div>
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                  <DollarSign className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs xs:text-sm font-medium text-slate-600 truncate">Selected Amount</p>
                  <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-purple-600 mt-1 xs:mt-2 truncate">
                    AED {stats.totalSelected.toLocaleString()}
                  </p>
                </div>
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                  <TrendingDown className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 shadow-sm border border-slate-200">
            <div className="flex flex-col gap-3 xs:gap-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-slate-400" />
                <Input
                  placeholder="Search by name or department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 xs:pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-9 xs:h-10 text-sm xs:text-base"
                />
              </div>

              {/* Mobile Filters Toggle */}
              <div className="sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="w-full border-slate-200 hover:bg-slate-50 h-9 xs:h-10"
                >
                  {showMobileFilters ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Hide Filters
                    </>
                  ) : (
                    <>
                      <Menu className="w-4 h-4 mr-2" />
                      Show Filters ({statusFilter !== 'all' ? 1 : 0}{deptFilter !== 'all' ? 1 : 0}{desigFilter !== 'all' ? 1 : 0}{locFilter !== 'all' ? 1 : 0})
                    </>
                  )}
                </Button>
              </div>

              {/* Filters Grid - Hidden on mobile unless toggled */}
              <div className={`${showMobileFilters ? 'grid' : 'hidden sm:grid'} grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 gap-2 xs:gap-3`}>
                <div className="lg:col-span-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 h-9 xs:h-10 text-xs xs:text-sm justify-start">
                        <Download className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-1.5 xs:mr-2" />
                        <span className="truncate">Export</span>
                        <ChevronDown className="w-3.5 h-3.5 xs:w-4 xs:h-4 ml-auto" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                      <DropdownMenuItem onClick={handleExportCSV}>
                        Export CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="lg:col-span-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 h-9 xs:h-10 text-xs xs:text-sm justify-start">
                        <Filter className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-1.5 xs:mr-2" />
                        <span className="truncate">Status: {statusFilter === 'all' ? 'All' : statusFilter}</span>
                        <ChevronDown className="w-3.5 h-3.5 xs:w-4 xs:h-4 ml-auto" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40">
                      <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                        All
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("Paid")}>
                        Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("Pending")}>
                        Unpaid
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="lg:col-span-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 h-9 xs:h-10 text-xs xs:text-sm justify-start">
                        <span className="truncate">Dept: {deptFilter === 'all' ? 'All' : deptFilter}</span>
                        <ChevronDown className="w-3.5 h-3.5 xs:w-4 xs:h-4 ml-auto" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-64 overflow-y-auto w-48">
                      <DropdownMenuItem onClick={() => setDeptFilter("all")}>All</DropdownMenuItem>
                      {departments.map((dept) => (
                        <DropdownMenuItem
                          key={dept.id || dept._id}
                          onClick={() => setDeptFilter(dept.departmentName || dept.name)}
                        >
                          <span className="truncate">{dept.departmentName || dept.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="lg:col-span-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 h-9 xs:h-10 text-xs xs:text-sm justify-start">
                        <span className="truncate">Desig: {desigFilter === 'all' ? 'All' : desigFilter}</span>
                        <ChevronDown className="w-3.5 h-3.5 xs:w-4 xs:h-4 ml-auto" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-64 overflow-y-auto w-48">
                      <DropdownMenuItem onClick={() => setDesigFilter("all")}>All</DropdownMenuItem>
                      {designations.map((desig) => (
                        <DropdownMenuItem
                          key={desig.id || desig._id}
                          onClick={() => setDesigFilter(desig.designationName || desig.name)}
                        >
                          <span className="truncate">{desig.designationName || desig.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="lg:col-span-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 h-9 xs:h-10 text-xs xs:text-sm justify-start">
                        <span className="truncate">Location: {locFilter === 'all' ? 'All' : locFilter}</span>
                        <ChevronDown className="w-3.5 h-3.5 xs:w-4 xs:h-4 ml-auto" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-64 overflow-y-auto w-48">
                      <DropdownMenuItem onClick={() => setLocFilter("all")}>All</DropdownMenuItem>
                      {locations.map((loc) => (
                        <DropdownMenuItem
                          key={loc.id || loc._id}
                          onClick={() => setLocFilter(loc.locationName || loc.name)}
                        >
                          <span className="truncate">{loc.locationName || loc.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-48 xs:h-64">
                  <div className="animate-spin rounded-full h-8 w-8 xs:h-12 xs:w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : paginatedEmployees.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 xs:h-64 text-slate-500 p-4">
                  <Users className="w-12 h-12 xs:w-16 xs:h-16 mb-3 xs:mb-4 text-slate-300" />
                  <p className="text-base xs:text-lg font-medium text-center">No employees found</p>
                  <p className="text-xs xs:text-sm text-center mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="w-10 xs:w-12 px-2 xs:px-4">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
                          className="border-slate-300"
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 px-2 xs:px-4 text-xs xs:text-sm">NAME</TableHead>
                      <TableHead className="font-semibold text-slate-700 px-2 xs:px-4 text-xs xs:text-sm hidden sm:table-cell">DEPT</TableHead>
                      <TableHead className="font-semibold text-slate-700 px-2 xs:px-4 text-xs xs:text-sm hidden lg:table-cell">DESIGNATION</TableHead>
                      <TableHead className="font-semibold text-slate-700 px-2 xs:px-4 text-xs xs:text-sm hidden xl:table-cell">LOCATION</TableHead>
                      <TableHead className="font-semibold text-slate-700 px-2 xs:px-4 text-xs xs:text-sm">BASIC</TableHead>
                      <TableHead className="font-semibold text-slate-700 px-2 xs:px-4 text-xs xs:text-sm">ALLOWANCES</TableHead>
                      <TableHead className="font-semibold text-slate-700 px-2 xs:px-4 text-xs xs:text-sm">OVERTIME</TableHead>
                      <TableHead className="font-semibold text-slate-700 px-2 xs:px-4 text-xs xs:text-sm bg-slate-100/50">GROSS SALARY</TableHead>
                      <TableHead className="font-semibold text-slate-700 px-2 xs:px-4 text-xs xs:text-sm">DEDUCTIONS</TableHead>
                      <TableHead className="font-semibold text-slate-700 px-2 xs:px-4 text-xs xs:text-sm bg-blue-50/50">NET SALARY</TableHead>
                      <TableHead className="font-semibold text-slate-700 px-2 xs:px-4 text-xs xs:text-sm">STATUS</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedEmployees.map((e) => {
                      const calc = calculateEmployeeSalary(e)
                      return (
                        <TableRow key={e.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell className="px-2 xs:px-4">
                            <Checkbox
                              checked={e.selected}
                              onCheckedChange={(v) => toggleSelectOne(e.id, Boolean(v))}
                              className="border-slate-300"
                            />
                          </TableCell>
                          <TableCell className="font-medium text-slate-900 px-2 xs:px-4 text-xs xs:text-sm truncate max-w-[120px]">
                            <div className="flex flex-col">
                              <span className="truncate">{e.name}</span>
                              <span className="text-xs text-slate-500 sm:hidden mt-0.5">
                                {e.department} • {e.designation}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 px-2 xs:px-4 text-xs xs:text-sm hidden sm:table-cell truncate max-w-[100px]">
                            {e.department}
                          </TableCell>
                          <TableCell className="text-slate-600 px-2 xs:px-4 text-xs xs:text-sm hidden lg:table-cell truncate max-w-[120px]">
                            {e.designation}
                          </TableCell>
                          <TableCell className="text-slate-600 px-2 xs:px-4 text-xs xs:text-sm hidden xl:table-cell truncate max-w-[100px]">
                            {e.location}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900 px-2 xs:px-4 text-xs xs:text-sm whitespace-nowrap">
                            AED {calc.basicSalary.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium text-green-600 px-2 xs:px-4 text-xs xs:text-sm whitespace-nowrap">
                            + {calc.totalAllowances.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium text-blue-600 px-2 xs:px-4 text-xs xs:text-sm whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span>+</span>
                              <div className="flex flex-col">
                                <span>{calc.overtimeAmount.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-500">{e.overtimeHours} hrs</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-slate-900 px-2 xs:px-4 text-xs xs:text-sm whitespace-nowrap bg-slate-100/30">
                            = {calc.grossSalary.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium text-red-600 px-2 xs:px-4 text-xs xs:text-sm whitespace-nowrap">
                            - {calc.totalDeductions.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-bold text-blue-600 px-2 xs:px-4 text-xs xs:text-sm whitespace-nowrap bg-blue-50/30">
                            = AED {calc.netSalary.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-2 xs:px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 xs:px-3 xs:py-1 rounded-full text-xs font-medium ${e.status === "Paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                                }`}
                            >
                              {e.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* PAGINATION */}
          {!isLoading && paginatedEmployees.length > 0 && (
            <div className="flex flex-col xs:flex-row justify-between items-center gap-3 xs:gap-4 bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 shadow-sm border border-slate-200">
              <div className="text-xs xs:text-sm text-slate-600 text-center xs:text-left">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filteredEmployees.length)} of {filteredEmployees.length} employees
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="border-slate-200 hover:bg-slate-50 disabled:opacity-50 h-8 xs:h-9 px-3 text-xs xs:text-sm"
                >
                  Previous
                </Button>
                <span className="text-xs xs:text-sm font-medium text-slate-700 px-2 xs:px-4 whitespace-nowrap">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-slate-200 hover:bg-slate-50 disabled:opacity-50 h-8 xs:h-9 px-3 text-xs xs:text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full overflow-x-auto">
          <WPSSIFPage />
        </div>
      )}

      <CustomAlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}
        title={alertState.title}
        description={alertState.description}
        variant={alertState.variant}
      />
    </div>
  )
}