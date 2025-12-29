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
  const [statusFilter, setStatusFilter] =
    useState<"all" | "Paid" | "Pending">("all")
  const [page, setPage] = useState(1)
  const [openPayRun, setOpenPayRun] = useState(false)

  const ITEMS_PER_PAGE = 5

  /* ================= FETCH EMPLOYEES ================= */

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    const orgId = getOrgId()
    const token = getAuthToken()
    const apiUrl = getApiUrl()

    if (!orgId || !token) return

    try {
      const res = await axios.get(
        `${apiUrl}/org/${orgId}/employees`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = res.data.data || res.data || []

      const formatted: SalaryEmployee[] = data.map((emp: any) => ({
        id: emp.id || emp._id,
        name:
          emp.fullName ||
          `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
        department:
          emp.department?.departmentName ||
          emp.department?.name ||
          "",
        designation:
          emp.designation?.designationName ||
          emp.designation?.name ||
          "",
        location:
          emp.location?.locationName ||
          emp.location?.name ||
          "",
        salary: Number(emp.salary || emp.ctc || 0),
        status: emp.salaryStatus === "Paid" ? "Paid" : "Pending",
        selected: false,
      }))

      setEmployees(formatted)
    } catch (error) {
      console.error("Failed to fetch salary employees", error)
    }
  }

  /* ================= FILTER ================= */

  const filteredEmployees = useMemo(() => {
    return employees
      .filter((e) =>
        statusFilter === "all" ? true : e.status === statusFilter
      )
      .filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.department.toLowerCase().includes(search.toLowerCase())
      )
  }, [employees, search, statusFilter])

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
    setEmployees((prev) =>
      prev.map((e) =>
        e.selected
          ? {
              ...e,
              status: "Paid",
              selected: false,
              paidDate,
            }
          : e
      )
    )
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
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Salary</h1>
          <p className="text-sm text-muted-foreground">
            Manage employee payroll
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/salary/history')}
          >
            <History className="w-4 h-4 mr-2" />
            Pay History
          </Button>

          <Button
            disabled={selectedCount === 0}
            onClick={() => setOpenPayRun(true)}
            className="bg-blue-600 text-white"
          >
            Pay Run ({selectedCount})
          </Button>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="inline-flex rounded-md border overflow-hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-none">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-none border-l">
                <Filter className="w-4 h-4 mr-2" />
                Filter
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
        </div>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg bg-white">
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
              <TableHead>NAME</TableHead>
              <TableHead>DEPARTMENT</TableHead>
              <TableHead>DESIGNATION</TableHead>
              <TableHead>LOCATION</TableHead>
              <TableHead>SALARY</TableHead>
              <TableHead>STATUS</TableHead>
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
                <TableCell className="font-medium">{e.name}</TableCell>
                <TableCell>{e.department}</TableCell>
                <TableCell>{e.designation}</TableCell>
                <TableCell>{e.location}</TableCell>
                <TableCell>₹{e.salary.toLocaleString()}</TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      e.status === "Paid"
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
    </div>
  )
}

