"use client";
import { useEffect, useState } from "react"
import { Download, AlertCircle, Loader2 } from "lucide-react"
import axios from "axios"
import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth"

/* ================= TYPES ================= */

interface SIFEmployee {
  employeeName: string
  molId: string
  iban: string
  basic: number
  allowances: number
  deductions: number
}

interface SIFSummary {
  payrollMonth: string
  companyMolCode: string
}

/* ================= PAGE ================= */

export default function WPSSIFPage() {
  const [summary, setSummary] = useState<SIFSummary | null>(null)
  const [employees, setEmployees] = useState<SIFEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchSIFData()
  }, [])

  const fetchSIFData = async () => {
    setLoading(true)
    setError(null)

    const orgId = getOrgId()
    const token = getAuthToken()
    const apiUrl = getApiUrl()

    if (!orgId || !token) {
      setError("Authentication failed. Please log in again.")
      setLoading(false)
      return
    }

    try {
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch employees and salary records in parallel
      const [empRes, salaryRes] = await Promise.all([
        axios.get(`${apiUrl}/org/${orgId}/employees`, { headers }),
        axios.get(`${apiUrl}/org/${orgId}/salaries`, { headers })
      ])

      const empData = empRes.data.data || empRes.data || []
      const salaryRecords = salaryRes.data.data || salaryRes.data || []

      // Identify current month and year
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()

      // Set Summary
      setSummary({
        payrollMonth: `${currentMonth}-${currentYear}`,
        companyMolCode: (empData[0]?.organization?.molCode || "12345"), // Fallback if not in data
      })

      // Filter salary records for current month/year and "Paid" status
      const currentSalaries = salaryRecords.filter((r: any) =>
        r.month === currentMonth &&
        r.year === currentYear &&
        r.status?.toLowerCase() === "paid"
      )

      // Merge Employee details with Salary records
      const mergedData: SIFEmployee[] = currentSalaries.map((record: any) => {
        const empId = record.employeeId || record.employee?.id || record.employee?._id
        const employee = empData.find((e: any) => (e.id || e._id) === empId)

        return {
          employeeName: employee?.fullName || `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim() || "Unknown",
          molId: employee?.molId || "N/A",
          iban: employee?.iban || "N/A",
          basic: Number(record.basicSalary || 0),
          allowances: Number(record.allowanceTotal || record.totalAllowances || 0),
          deductions: Number(record.deductionTotal || record.totalDeductions || 0),
        }
      })

      setEmployees(mergedData)
    } catch (err: any) {
      console.error("Failed to fetch SIF data", err)
      setError("Failed to load SIF data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }


  /* ================= CSV EXPORT ================= */

  const exportSIFCSV = () => {
    if (!summary) return

    const headers = [
      "Company MOL Code",
      "Employee MOL ID",
      "Employee Name",
      "IBAN",
      "Basic",
      "Allowances",
      "Gross",
      "Deductions",
      "Net",
      "Payroll Month",
    ]

    const rows = employees.map(emp => {
      const gross = emp.basic + emp.allowances
      const net = gross - emp.deductions

      return [
        summary.companyMolCode,
        emp.molId,
        emp.employeeName,
        emp.iban,
        emp.basic,
        emp.allowances,
        gross,
        emp.deductions,
        net,
        summary.payrollMonth,
      ]
    })

    const csvContent =
      [headers, ...rows].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `WPS_SIF_${summary.payrollMonth}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <Loader2 className="w-12 h-12 mb-4 text-blue-600 animate-spin" />
        <p className="text-lg font-medium">Loading WPS SIF data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 bg-red-50 rounded-xl border border-red-100 p-8">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-lg font-bold">Error</p>
        <p className="text-sm text-center max-w-md">{error}</p>
        <button
          onClick={fetchSIFData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4">WPS SIF Export</h1>
        <button
          disabled={employees.length === 0}
          onClick={exportSIFCSV}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
        >
          <Download size={18} />
          Export SIF CSV
        </button>
      </div>


      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard label="Company MOL Code" value={summary?.companyMolCode} icon="Code" />
        <SummaryCard label="Payroll Month" value={summary?.payrollMonth} icon="Calendar" />
      </div>

      {/* TABLE PREVIEW */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <AlertCircle className="w-12 h-12 mb-4 text-slate-200" />
            <p className="text-lg font-medium">No paid salary records found</p>
            <p className="text-sm">Paid records for the current month will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Employee</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">MOL ID</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">IBAN</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-700">Basic</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-700">Allowances</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-700">Gross</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-700">Deductions</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-700">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp, index) => {
                const gross = emp.basic + emp.allowances
                const net = gross - emp.deductions

                return (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{emp.employeeName}</td>
                    <td className="px-6 py-4 text-slate-600">{emp.molId}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{emp.iban}</td>
                    <td className="px-6 py-4 text-right text-slate-900">₹{emp.basic.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-green-600">+₹{emp.allowances.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">₹{gross.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-red-600">-₹{emp.deductions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">₹{net.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

/* ================= COMPONENT ================= */

function SummaryCard({ label, value, icon }: { label: string; value?: string; icon: "Code" | "Calendar" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${icon === "Code" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
        }`}>
        {icon === "Code" ? <AlertCircle size={24} /> : <Loader2 size={24} className={icon === "Calendar" ? "" : "animate-spin"} />}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-900 mt-0.5">{value || "N/A"}</p>
      </div>
    </div>
  )
}

