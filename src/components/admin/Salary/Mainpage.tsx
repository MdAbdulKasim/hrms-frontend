"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
} from "lucide-react"
import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth"
import { CustomAlertDialog } from "@/components/ui/custom-dialogs"
import WPSSIFPage from "./SIFfile"


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
        axios.get(`${apiUrl}/org/${orgId}/employees`, { headers }),
        axios.get(`${apiUrl}/org/${orgId}/departments`, { headers }),
        axios.get(`${apiUrl}/org/${orgId}/designations`, { headers }),
        axios.get(`${apiUrl}/org/${orgId}/locations`, { headers })
      ])

      // Parse metadata
      const departmentsData = deptRes.data.data || deptRes.data || []
      const designationsData = desigRes.data.data || desigRes.data || []
      const locationsData = locRes.data.data || locRes.data || []

      setDepartments(departmentsData)
      setDesignations(designationsData)
      setLocations(locationsData)

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
      const empData = empRes.data.data || empRes.data || []

      // Fetch salary records to determine real-time status
      let salaryRecords: any[] = []
      try {
        const salaryRes = await axios.get(`${apiUrl}/org/${orgId}/salaries`, { headers })
        salaryRecords = salaryRes.data.data || salaryRes.data || []
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

        // Parse allowances and deductions from employee data
        const allowances: Allowance[] = (emp.accommodationAllowances || emp.allowances || []).map((a: any, idx: number) => ({
          id: a.id || a._id || `allowance-${idx}`,
          name: a.type || a.name || "Allowance",
          value: Number(a.percentage || a.value || 0),
          type: a.percentage !== undefined ? "percentage" : (a.type === "percentage" ? "percentage" : "fixed")
        }))

        const deductions: Deduction[] = (emp.insurances || emp.deductions || []).map((d: any, idx: number) => ({
          id: d.id || d._id || `deduction-${idx}`,
          name: d.type || d.name || "Deduction",
          value: Number(d.percentage || d.value || 0),
          type: d.percentage !== undefined ? "percentage" : (d.type === "percentage" ? "percentage" : "fixed")
        }))

        // Determine status from salary records (real-time)
        // Check if there's a record for this employee marked as paid in the current month/year
        const currentMonth = new Date().getMonth() + 1
        const currentYear = new Date().getFullYear()

        const salaryRecord = salaryRecords.find((r: any) =>
          (r.employeeId === empId || r.employee?.id === empId || r.employee?._id === empId) &&
          r.status?.toLowerCase() === "paid" &&
          r.month === currentMonth &&
          r.year === currentYear
        )

        return {
          id: empId,
          name: emp.fullName || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "",
          department: deptName || "N/A",
          designation: desigName || "N/A",
          location: locName || "N/A",
          basicSalary: Number(emp.basicSalary || emp.salary || emp.ctc || emp.baseSalary || 0),
          allowances,
          deductions,
          status: salaryRecord ? "Paid" : "Pending",
          selected: false,
          paidDate: salaryRecord?.paidDate ? new Date(salaryRecord.paidDate) : undefined
        }
      })

      setEmployees(formatted)

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

  const calculateEmployeeSalary = (employee: SalaryEmployee) => {
    const basicSalary = employee.basicSalary

    // Calculate allowances
    const totalAllowances = employee.allowances.reduce((sum, allowance) => {
      const amount = allowance.type === "percentage"
        ? (basicSalary * allowance.value) / 100
        : allowance.value
      return sum + amount
    }, 0)

    const grossSalary = basicSalary + totalAllowances

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
      grossSalary,
      totalDeductions,
      netSalary
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
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-white min-h-screen">
      {/* TABS */}
      <div className="flex flex-wrap gap-4 items-center">
        <button
          onClick={() => setActiveTab("Payrun")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === "Payrun"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
            }`}
        >
          Payrun
        </button>
        <button
          onClick={() => setActiveTab("SIF")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === "SIF"
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-bold px-2 py-1 rounded-md inline-block">
                PayRun Salary
              </h1>

              <p className="text-sm text-slate-600">
                Manage employee payroll and compensation
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/salary/history')}
                className="bg-white hover:bg-slate-50 border-slate-200 shadow-sm transition-all hover:shadow-md"
              >
                <History className="w-4 h-4 mr-2" />
                Pay History
              </Button>

              <Button
                disabled={selectedCount === 0}
                onClick={handlePayRunClick}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Pay Run ({selectedCount})
              </Button>
            </div>
          </div>

          {/* STATISTICS CARDS */}


          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Employees</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending Payments</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending Amount</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    ₹{stats.totalPending.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Selected Amount</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    ₹{stats.totalSelected.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by name or department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50 h-11">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={handleExportCSV}>
                      Export CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50 h-11">
                      <Filter className="w-4 h-4 mr-2" />
                      Status: {statusFilter === 'all' ? 'All' : statusFilter}
                      <ChevronDown className="w-4 h-4 ml-2" />
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

                {/* Department Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50 h-11">
                      Department: {deptFilter === 'all' ? 'All' : deptFilter.length > 10 ? deptFilter.substring(0, 10) + '...' : deptFilter}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-64 overflow-y-auto">
                    <DropdownMenuItem onClick={() => setDeptFilter("all")}>All</DropdownMenuItem>
                    {departments.map((dept) => (
                      <DropdownMenuItem
                        key={dept.id || dept._id}
                        onClick={() => setDeptFilter(dept.departmentName || dept.name)}
                      >
                        {dept.departmentName || dept.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Designation Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50 h-11">
                      Designation: {desigFilter === 'all' ? 'All' : desigFilter.length > 10 ? desigFilter.substring(0, 10) + '...' : desigFilter}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-64 overflow-y-auto">
                    <DropdownMenuItem onClick={() => setDesigFilter("all")}>All</DropdownMenuItem>
                    {designations.map((desig) => (
                      <DropdownMenuItem
                        key={desig.id || desig._id}
                        onClick={() => setDesigFilter(desig.designationName || desig.name)}
                      >
                        {desig.designationName || desig.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Location Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50 h-11">
                      Location: {locFilter === 'all' ? 'All' : locFilter.length > 10 ? locFilter.substring(0, 10) + '...' : locFilter}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-64 overflow-y-auto">
                    <DropdownMenuItem onClick={() => setLocFilter("all")}>All</DropdownMenuItem>
                    {locations.map((loc) => (
                      <DropdownMenuItem
                        key={loc.id || loc._id}
                        onClick={() => setLocFilter(loc.locationName || loc.name)}
                      >
                        {loc.locationName || loc.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : paginatedEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <Users className="w-16 h-16 mb-4 text-slate-300" />
                <p className="text-lg font-medium">No employees found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
                        className="border-slate-300"
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">NAME</TableHead>
                    <TableHead className="font-semibold text-slate-700">DEPARTMENT</TableHead>
                    <TableHead className="font-semibold text-slate-700">DESIGNATION</TableHead>
                    <TableHead className="font-semibold text-slate-700">LOCATION</TableHead>
                    <TableHead className="font-semibold text-slate-700">BASIC SALARY</TableHead>
                    <TableHead className="font-semibold text-slate-700">ALLOWANCES</TableHead>
                    <TableHead className="font-semibold text-slate-700">DEDUCTIONS</TableHead>
                    <TableHead className="font-semibold text-slate-700">NET SALARY</TableHead>
                    <TableHead className="font-semibold text-slate-700">STATUS</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedEmployees.map((e) => {
                    const calc = calculateEmployeeSalary(e)
                    return (
                      <TableRow key={e.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <Checkbox
                            checked={e.selected}
                            onCheckedChange={(v) => toggleSelectOne(e.id, Boolean(v))}
                            className="border-slate-300"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">{e.name}</TableCell>
                        <TableCell className="text-slate-600">{e.department}</TableCell>
                        <TableCell className="text-slate-600">{e.designation}</TableCell>
                        <TableCell className="text-slate-600">{e.location}</TableCell>
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
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${e.status === "Paid"
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

          {/* PAGINATION */}
          {!isLoading && paginatedEmployees.length > 0 && (
            <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="text-sm text-slate-600">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filteredEmployees.length)} of {filteredEmployees.length} employees
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </Button>
                <span className="text-sm font-medium text-slate-700 px-4">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <WPSSIFPage />
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