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
} from "lucide-react"
import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth"
import PayRunDialog from "./payrundialog"
import { CustomAlertDialog } from "@/components/ui/custom-dialogs"

/* ================= TYPES ================= */

export interface SalaryEmployee {
  id: string
  name: string
  department: string
  designation: string
  location: string
  salary: number
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
  const [openPayRun, setOpenPayRun] = useState(false)

  // Alert State
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

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
    const orgId = getOrgId()
    const token = getAuthToken()
    const apiUrl = getApiUrl()

    if (!orgId || !token) {
      console.error("Missing authentication credentials")
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
      const deptMap = new Map<string, string>(departmentsData.map((d: any) => [d.id || d._id, d.departmentName || d.name]))
      const desigMap = new Map<string, string>(designationsData.map((d: any) => [d.id || d._id, d.designationName || d.name]))
      const locMap = new Map<string, string>(locationsData.map((d: any) => [d.id || d._id, d.locationName || d.name]))

      // Process Employees
      const empData = empRes.data.data || empRes.data || []
      const formatted: SalaryEmployee[] = empData.map((emp: any) => {
        // Resolve Department
        let deptName = emp.department?.departmentName || emp.department?.name || emp.departmentName || ""
        if (!deptName && (emp.department || emp.departmentId)) {
          const id = typeof emp.department === 'object' ? (emp.department.id || emp.department._id) : (emp.department || emp.departmentId)
          deptName = deptMap.get(id) || ""
        }

        // Resolve Designation
        let desigName = emp.designation?.designationName || emp.designation?.name || emp.designationName || ""
        if (!desigName && (emp.designation || emp.designationId)) {
          const id = typeof emp.designation === 'object' ? (emp.designation.id || emp.designation._id) : (emp.designation || emp.designationId)
          desigName = desigMap.get(id) || ""
        }

        // Resolve Location
        let locName = emp.location?.locationName || emp.location?.name || emp.locationName || ""
        if (!locName && (emp.location || emp.locationId)) {
          const id = typeof emp.location === 'object' ? (emp.location.id || emp.location._id) : (emp.location || emp.locationId)
          locName = locMap.get(id) || ""
        }

        return {
          id: emp.id || emp._id,
          name: emp.fullName || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "",
          department: deptName || "N/A",
          designation: desigName || "N/A",
          location: locName || "N/A",
          salary: Number(emp.salary || emp.ctc || emp.baseSalary || 0),
          status: "Pending", // Default to Pending, will be updated after payment
          selected: false,
        }
      })

      setEmployees(formatted)

    } catch (error: any) {
      console.error("Failed to fetch data", error)
      if (error.response?.status === 401) {
        showAlert("Authentication Failed", "Authentication failed. Please log in again.", "error")
      }
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

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(
    filteredEmployees.length / ITEMS_PER_PAGE
  )

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

  /* ================= PAY RUN CONFIRM ================= */

  const handlePayConfirm = (paidDate: Date) => {
    // Refresh the unpaid salary list after successful payment
    fetchData()
    setOpenPayRun(false)
  }

  /* ================= EXPORT ================= */

  const handleExportCSV = () => {
    const csv = [
      [
        "NAME",
        "DEPARTMENT",
        "DESIGNATION",
        "LOCATION",
        "SALARY",
        "STATUS",
      ],
      ...employees.map((e) => [
        e.name,
        e.department,
        e.designation,
        e.location,
        e.salary,
        e.status,
      ]),
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
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Salary</h1>
          <p className="text-sm text-muted-foreground">
            Manage employee payroll
          </p>
        </div>

        <div className="flex w-full sm:w-auto gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/salary/history')}
            className="flex-1 sm:flex-none"
          >
            <History className="w-4 h-4 mr-2" />
            Pay History
          </Button>

          <Button
            disabled={selectedCount === 0}
            onClick={() => setOpenPayRun(true)}
            className="flex-1 sm:flex-none bg-blue-600 text-white hover:bg-blue-700"
          >
            Pay Run ({selectedCount})
          </Button>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 lg:flex-none">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                Export CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex flex-wrap -ml-px w-full lg:w-auto">
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-grow lg:flex-grow-0 rounded-none first:rounded-l-md border-r-0 lg:border-l lg:border-r-0">
                  <Filter className="w-4 h-4 mr-2" />
                  Status: {statusFilter === 'all' ? 'All' : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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
                <Button variant="outline" className="flex-grow lg:flex-grow-0 rounded-none border-l lg:border-l">
                  Dept: {deptFilter === 'all' ? 'All' : deptFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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
                <Button variant="outline" className="flex-grow lg:flex-grow-0 rounded-none border-l">
                  Desig: {desigFilter === 'all' ? 'All' : desigFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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
                <Button variant="outline" className="flex-grow lg:flex-grow-0 rounded-none rounded-r-md border-l">
                  Loc: {locFilter === 'all' ? 'All' : locFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(v) =>
                      toggleSelectAll(Boolean(v))
                    }
                  />
                </TableHead>
                <TableHead className="min-w-[150px]">NAME</TableHead>
                <TableHead className="min-w-[150px]">DEPARTMENT</TableHead>
                <TableHead className="min-w-[150px]">DESIGNATION</TableHead>
                <TableHead className="min-w-[120px]">LOCATION</TableHead>
                <TableHead className="min-w-[120px]">SALARY</TableHead>
                <TableHead className="min-w-[100px]">STATUS</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedEmployees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <Checkbox
                      checked={e.selected}
                      onCheckedChange={(v) =>
                        toggleSelectOne(e.id, Boolean(v))
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{e.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{e.department}</TableCell>
                  <TableCell className="whitespace-nowrap">{e.designation}</TableCell>
                  <TableCell className="whitespace-nowrap">{e.location}</TableCell>
                  <TableCell className="whitespace-nowrap">AED {e.salary.toLocaleString()}</TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${e.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {e.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-end items-center gap-2">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      {/* PAY RUN DIALOG */}
      <PayRunDialog
        open={openPayRun}
        employees={selectedEmployees}
        onClose={() => setOpenPayRun(false)}
        onConfirm={handlePayConfirm}
      />

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
