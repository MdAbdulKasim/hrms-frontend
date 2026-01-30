// "use client";
// import { useEffect, useState } from "react"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { Download, AlertCircle, Loader2, Filter } from "lucide-react"
// import axios from "axios"
// import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth"

// /* ================= TYPES ================= */

// interface SIFEmployee {
//   employeeName: string
//   molId: string
//   iban: string
//   basic: number
//   allowances: number
//   overtimeAmount: number
//   deductions: number
// }

// interface SIFSummary {
//   payrollMonth: string
//   companyMolCode: string
// }

// /* ================= PAGE ================= */

// export default function WPSSIFPage() {
//   const [summary, setSummary] = useState<SIFSummary | null>(null)
//   const [employees, setEmployees] = useState<SIFEmployee[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

//   /* ================= FETCH DATA ================= */

//   useEffect(() => {
//     fetchSIFData()
//   }, [selectedMonth, selectedYear])

//   const fetchSIFData = async () => {
//     setLoading(true)
//     setError(null)

//     const orgId = getOrgId()
//     const token = getAuthToken()
//     const apiUrl = getApiUrl()

//     if (!orgId || !token) {
//       setError("Authentication failed. Please log in again.")
//       setLoading(false)
//       return
//     }

//     try {
//       const headers = { Authorization: `Bearer ${token}` }

//       // Fetch organization, employees and salary records in parallel
//       const [orgRes, empRes, salaryRes] = await Promise.all([
//         axios.get(`${apiUrl}/org/${orgId}`, { headers }),
//         axios.get(`${apiUrl}/org/${orgId}/employees`, { headers }),
//         axios.get(`${apiUrl}/org/${orgId}/salaries`, { headers })
//       ])

//       const orgData = orgRes.data.data || orgRes.data || {}
//       const empData = empRes.data.data || empRes.data || []
//       const salaryRecords = salaryRes.data.data || salaryRes.data || []

//       // Use selected month and year
//       const currentMonth = selectedMonth
//       const currentYear = selectedYear

//       // Set Summary from organization data
//       setSummary({
//         payrollMonth: `${String(currentMonth).padStart(2, '0')}-${currentYear}`,
//         companyMolCode: orgData?.molCode || "N/A",
//       })

//       // Filter salary records for current month/year and "Paid" status
//       const currentSalaries = salaryRecords.filter((r: any) => {
//         if (r.status?.toLowerCase() !== "paid") return false
//         const payDate = new Date(r.payPeriodEnd || r.paidDate)
//         return payDate.getMonth() + 1 === currentMonth && payDate.getFullYear() === currentYear
//       })

//       // Merge Employee details with Salary records
//       const mergedData: SIFEmployee[] = currentSalaries.map((record: any) => {
//         let empId = record.employeeId;
//         if (empId && typeof empId === 'object') {
//           empId = empId.id || empId._id;
//         }
//         if (!empId) {
//           empId = record.employee?.id || record.employee?._id;
//         }

//         const employee = record.employee || empData.find((e: any) => (e.id || e._id) === empId)

//         const basic = Number(record.basicSalary || record.basic_salary || employee?.basicSalary || 0);
//         let allowances = Number(record.totalAllowances || record.total_allowances || 0);
//         let deductions = Number(record.totalDeductions || record.total_deductions || 0);

//         if (allowances === 0 && employee?.allowances) {
//           const data = employee.allowances;
//           if (Array.isArray(data)) {
//             data.forEach((i: any) => {
//               const v = Number(i.value || i.amount || 0);
//               allowances += (i.type === 'percentage') ? (basic * v / 100) : v;
//             });
//           } else if (typeof data === "object") {
//             Object.values(data).forEach((val: any) => {
//               if (val && val.enabled) {
//                 const amount = val.amount || (basic * val.percentage) / 100 || 0;
//                 allowances += amount;
//               }
//             });
//           }
//         }

//         if (deductions === 0 && employee?.deductions) {
//           const data = employee.deductions;
//           if (Array.isArray(data)) {
//             data.forEach((i: any) => {
//               const v = Number(i.value || i.amount || 0);
//               deductions += (i.type === 'percentage') ? (basic * v / 100) : v;
//             });
//           } else if (typeof data === "object") {
//             Object.values(data).forEach((val: any) => {
//               if (val && val.enabled) {
//                 const amount = val.amount || (basic * val.percentage) / 100 || 0;
//                 deductions += amount;
//               }
//             });
//           }
//         }

//         const employeeName = record.employeeName ||
//           employee?.fullName ||
//           employee?.name ||
//           (employee ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim() : "") ||
//           "Unknown";

//         return {
//           employeeName,
//           molId: employee?.molId || record.molId || "N/A",
//           iban: employee?.iban || record.iban || "N/A",
//           basic,
//           allowances,
//           overtimeAmount: Number(record.overtimeAmount || record.overtimePay || record.overtime_amount || 0),
//           deductions,
//         }
//       })

//       setEmployees(mergedData)
//     } catch (err: any) {
//       console.error("Failed to fetch SIF data", err)
//       setError("Failed to load SIF data. Please try again later.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   /* ================= CSV EXPORT (Frontend Generation) ================= */

//   const exportSIFCSV = () => {
//     if (employees.length === 0 || !summary) return

//     // Header: Company,Employee,Employee,IBAN,Basic,Allowance,Overtime,Gross,Deduction,Net,Payroll Month
//     const header = "Company,Employee,Employee,IBAN,Basic,Allowance,Overtime,Gross,Deduction,Net,Payroll Month\n"

//     const rows = employees.map(emp => {
//       const gross = emp.basic + emp.allowances + emp.overtimeAmount
//       const net = gross - emp.deductions
//       return [
//         summary.companyMolCode,
//         emp.molId,
//         emp.employeeName,
//         emp.iban,
//         emp.basic,
//         emp.allowances,
//         emp.overtimeAmount,
//         gross,
//         emp.deductions,
//         net,
//         summary.payrollMonth
//       ].join(",")
//     }).join("\n")

//     const csvContent = header + rows
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
//     const url = URL.createObjectURL(blob)
//     const link = document.createElement("a")
//     link.href = url
//     link.download = `WPS_SIF_${summary.payrollMonth}.csv`
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//     URL.revokeObjectURL(url)
//   }

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 text-slate-500">
//         <Loader2 className="w-12 h-12 mb-4 text-blue-600 animate-spin" />
//         <p className="text-lg font-medium">Loading WPS SIF data...</p>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 text-red-500 bg-red-50 rounded-xl border border-red-100 p-8">
//         <AlertCircle className="w-12 h-12 mb-4" />
//         <p className="text-lg font-bold">Error</p>
//         <p className="text-sm text-center max-w-md">{error}</p>
//         <button
//           onClick={fetchSIFData}
//           className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//         >
//           Try Again
//         </button>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <h1 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4">WPS SIF Export</h1>
//         <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
//           <Select
//             value={selectedMonth.toString()}
//             onValueChange={(val) => setSelectedMonth(parseInt(val))}
//           >
//             <SelectTrigger className="w-32 border-slate-200">
//               <SelectValue placeholder="Month" />
//             </SelectTrigger>
//             <SelectContent>
//               {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
//                 <SelectItem key={i + 1} value={(i + 1).toString()}>{m}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select
//             value={selectedYear.toString()}
//             onValueChange={(val) => setSelectedYear(parseInt(val))}
//           >
//             <SelectTrigger className="w-32 border-slate-200">
//               <SelectValue placeholder="Year" />
//             </SelectTrigger>
//             <SelectContent>
//               {[2024, 2025, 2026].map(y => (
//                 <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <button
//             disabled={employees.length === 0}
//             onClick={exportSIFCSV}
//             className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hidden md:flex"
//           >
//             <Download size={18} />
//             Export SIF CSV
//           </button>
//         </div>
//       </div>

//       {/* Mobile Export Button */}
//       <button
//         disabled={employees.length === 0}
//         onClick={exportSIFCSV}
//         className="flex md:hidden items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
//       >
//         <Download size={18} />
//         Export SIF CSV
//       </button>


//       {/* SUMMARY */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <SummaryCard label="Company MOL Code" value={summary?.companyMolCode} />
//         <SummaryCard label="Payroll Month" value={summary?.payrollMonth} />
//       </div>

//       {/* TABLE PREVIEW */}
//       <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
//         {employees.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-16 text-slate-500">
//             <AlertCircle className="w-12 h-12 mb-4 text-slate-200" />
//             <p className="text-lg font-medium">No paid salary records found</p>
//             <p className="text-sm">Paid records for the current month will appear here.</p>
//           </div>
//         ) : (
//           <table className="w-full text-sm">
//             <thead className="bg-slate-50 border-b border-slate-200">
//               <tr>
//                 <th className="px-6 py-4 text-left font-semibold text-slate-700">Employee</th>
//                 <th className="px-6 py-4 text-left font-semibold text-slate-700">MOL ID</th>
//                 <th className="px-6 py-4 text-left font-semibold text-slate-700">IBAN</th>
//                 <th className="px-6 py-4 text-center font-semibold text-slate-700">Basic</th>
//                 <th className="px-6 py-4 text-center font-semibold text-slate-700">Allowances</th>
//                 <th className="px-6 py-4 text-center font-semibold text-slate-700">Overtime</th>
//                 <th className="px-6 py-4 text-center font-semibold text-slate-700 bg-slate-100/50">Gross</th>
//                 <th className="px-6 py-4 text-center font-semibold text-slate-700">Deductions</th>
//                 <th className="px-6 py-4 text-center font-semibold text-slate-700 bg-blue-50/50">Net</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {employees.map((emp, index) => {
//                 const gross = emp.basic + emp.allowances + emp.overtimeAmount
//                 const net = gross - emp.deductions

//                 return (
//                   <tr key={index} className="hover:bg-slate-50/50 transition-colors">
//                     <td className="px-6 py-4 font-medium text-slate-900">{emp.employeeName}</td>
//                     <td className="px-6 py-4 text-slate-600">{emp.molId}</td>
//                     <td className="px-6 py-4 text-slate-600 font-mono text-xs">{emp.iban}</td>
//                     <td className="px-6 py-4 text-center text-slate-900">AED {emp.basic.toLocaleString()}</td>
//                     <td className="px-6 py-4 text-center text-green-600 font-medium">{emp.allowances.toLocaleString()}</td>
//                     <td className="px-6 py-4 text-center text-blue-600 font-medium">{emp.overtimeAmount.toLocaleString()}</td>
//                     <td className="px-6 py-4 text-center text-slate-900 font-bold bg-slate-100/30">{gross.toLocaleString()}</td>
//                     <td className="px-6 py-4 text-center text-red-600 font-medium">{emp.deductions.toLocaleString()}</td>
//                     <td className="px-6 py-4 text-center font-bold text-blue-600 bg-blue-50/30">{net.toLocaleString()}</td>
//                   </tr>
//                 )
//               })}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   )
// }

// /* ================= COMPONENT ================= */

// function SummaryCard({ label, value }: { label: string; value?: string }) {
//   return (
//     <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
//       <p className="text-sm font-medium text-slate-400 mb-2">{label}</p>
//       <p className="text-2xl font-bold text-slate-900">{value || "N/A"}</p>
//     </div>
//   )
// }

