"use client"

import { useState } from "react"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { SalaryEmployee } from "./Mainpage"
import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  employees: SalaryEmployee[]
  onClose: () => void
  onConfirm: (date: Date) => void
}

interface DeductionBreakdown {
  homeDeduction: number
  foodDeduction: number
  travelDeduction: number
  insuranceDeduction: number
}

interface SalaryRecordResponse {
  id: string
  employeeId: string
  employeeName: string
  organizationId: string
  grossSalary: string
  totalDeductions: string
  netSalary: string
  status: "unpaid" | "paid"
  payPeriodStart: string
  payPeriodEnd: string
  paidDate: string | null
  deductionBreakdown: DeductionBreakdown
}

export default function PayRunDialog({
  open,
  employees,
  onClose,
  onConfirm,
}: Props) {
  const [paidDate, setPaidDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalAmount = employees.reduce((sum, e) => sum + e.salary, 0)

  /* ================= PROCESS PAYMENT ================= */

  const handlePayment = async () => {
    if (!paidDate) return

    setLoading(true)
    setError(null)

    const orgId = getOrgId()
    const token = getAuthToken()
    const apiUrl = getApiUrl()

    if (!orgId || !token) {
      setError("Authentication required")
      return
    }

    try {
      // Calculate pay period from selected date
      const payPeriodStart = format(startOfMonth(paidDate), 'yyyy-MM-dd')
      const payPeriodEnd = format(endOfMonth(paidDate), 'yyyy-MM-dd')
      const paidDateStr = format(paidDate, 'yyyy-MM-dd')

      console.log('Processing salary for period:', { payPeriodStart, payPeriodEnd })

      // Step 1: Process salary for each selected employee
      const processedSalaries = await Promise.all(
        employees.map(async (emp) => {
          try {
            // POST /org/:organizationId/salaries/process
            const processPayload = {
              employeeId: emp.id,
              payPeriodStart,
              payPeriodEnd,
            }

            const processRes = await axios.post<SalaryRecordResponse>(
              `${apiUrl}/org/${orgId}/salaries/process`,
              processPayload,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            )

            const salaryRecord = processRes.data
            console.log(`Processed salary for ${emp.name}:`, salaryRecord)

            return { success: true, salaryRecord, employee: emp }
          } catch (err: any) {
            console.error(`Failed to process salary for ${emp.name}:`, err)
            return {
              success: false,
              error: err.response?.data?.error || err.message,
              employee: emp
            }
          }
        })
      )

      // Step 2: Check for process failures
      const failures = processedSalaries.filter(result => !result.success)

      if (failures.length > 0) {
        const failedNames = failures.map(f => f.employee.name).join(', ')
        setError(`Failed to process salary for: ${failedNames}`)
        return
      }

      // Step 3: Mark all processed salaries as paid
      // PATCH /org/:organizationId/salaries/:id/mark-paid
      const markPaidResults = await Promise.all(
        processedSalaries
          .filter(result => result.success && result.salaryRecord)
          .map(async (result) => {
            try {
              const salaryId = result.salaryRecord!.id
              await axios.patch(
                `${apiUrl}/org/${orgId}/salaries/${salaryId}/mark-paid`,
                { paidDate: paidDateStr },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              )
              return { success: true, employee: result.employee }
            } catch (err: any) {
              console.error(`Failed to mark as paid for ${result.employee.name}:`, err)
              return {
                success: false,
                error: err.response?.data?.error || err.message,
                employee: result.employee
              }
            }
          })
      )

      const markPaidFailures = markPaidResults.filter(result => !result.success)

      if (markPaidFailures.length > 0) {
        const failedNames = markPaidFailures.map(f => f.employee.name).join(', ')
        setError(`Salary processed but failed to mark as paid for: ${failedNames}`)
        return
      }

      // Success
      console.log('All salaries processed and marked as paid successfully')
      onConfirm(paidDate)

    } catch (err: any) {
      console.error("Payment processing error:", err)
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to process payment. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  /* ================= RESET ON CLOSE ================= */

  const handleClose = () => {
    setPaidDate(new Date())
    setError(null)
    onClose()
  }

  /* ================= UI ================= */

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirm Pay Run</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* SUMMARY SECTION */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Employees Selected</p>
              <p className="text-3xl font-bold text-blue-600">{employees.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-green-600">
                ₹{totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* EMPLOYEE LIST */}
          <div>
            <h3 className="font-semibold mb-3">Selected Employees:</h3>
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Department</th>
                    <th className="text-right p-3 font-medium">Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-t">
                      <td className="p-3">{emp.name}</td>
                      <td className="p-3">{emp.department}</td>
                      <td className="p-3 text-right font-medium">
                        ₹{emp.salary.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAYMENT DATE PICKER */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !paidDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paidDate ? format(paidDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paidDate}
                  onSelect={setPaidDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!paidDate || loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Mark as Paid"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
