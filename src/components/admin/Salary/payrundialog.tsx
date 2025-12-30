"use client"

import { useState } from "react"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { SalaryEmployee } from "./Mainpage"
import { getApiUrl, getOrgId, getAuthToken } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  employees: SalaryEmployee[]
  onClose: () => void
  onConfirm: (date: Date) => void
}

export default function PayRunDialog({
  open,
  employees,
  onClose,
  onConfirm,
}: Props) {
  const [paidDate, setPaidDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string[] | null>(null)

  const totalAmount = employees.reduce((sum, e) => sum + e.salary, 0)

  /* ================= PROCESS PAYMENT ================= */

  /**
   * Two-step payment process:
   * 1. POST /salaries/process - Creates salary record (status: unpaid)
   * 2. PATCH /salaries/:id/mark-paid - Changes status to paid
   */
  const handlePayment = async () => {
    if (!paidDate) return

    const orgId = getOrgId()
    const apiUrl = getApiUrl()
    const token = getAuthToken()

    if (!orgId || !token) {
      setErrorDetails([
        "Authentication required. Please log in again."
      ])
      return
    }

    setLoading(true)
    setErrorDetails(null)

    const payPeriodStart = format(startOfMonth(paidDate), "yyyy-MM-dd")
    const payPeriodEnd = format(endOfMonth(paidDate), "yyyy-MM-dd")
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }

    const failedEmployees: { name: string; error: string }[] = []
    const successCount = { value: 0 }

    // Process each employee sequentially to handle the 2-step flow
    for (const employee of employees) {
      try {
        console.log(`Step 1: Processing salary for ${employee.name}...`)

        // Step 1: Create salary record (this uses employee's salary from database)
        const processPayload = {
          employeeId: employee.id,
          payPeriodStart: payPeriodStart,
          payPeriodEnd: payPeriodEnd,
        }

        const processResponse = await axios.post(
          `${apiUrl}/org/${orgId}/salaries/process`,
          processPayload,
          { headers }
        )

        const salaryRecordId = processResponse.data?.id || processResponse.data?._id
        console.log(`Salary record created with ID: ${salaryRecordId}`)

        if (!salaryRecordId) {
          throw new Error("No salary record ID returned from server")
        }

        // Step 2: Mark as paid
        console.log(`Step 2: Marking salary ${salaryRecordId} as paid...`)

        await axios.patch(
          `${apiUrl}/org/${orgId}/salaries/${salaryRecordId}/mark-paid`,
          { paidDate: format(paidDate, "yyyy-MM-dd") },
          { headers }
        )

        console.log(`✅ Successfully processed and paid ${employee.name}`)
        successCount.value++

      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Unknown error"

        console.error(`❌ Failed for ${employee.name}:`, {
          status: err?.response?.status,
          error: errorMessage,
          data: err?.response?.data
        })

        // Provide helpful message for common errors
        let displayError = errorMessage
        if (errorMessage === "Employee salary not set") {
          displayError = "Salary not configured in database"
        }

        failedEmployees.push({ name: employee.name, error: displayError })
      }
    }

    setLoading(false)

    if (failedEmployees.length > 0 && successCount.value > 0) {
      // Partial success
      setErrorDetails([
        `✅ ${successCount.value} employee(s) paid successfully`,
        `❌ ${failedEmployees.length} employee(s) failed:`,
        ...failedEmployees.map(emp => `• ${emp.name}: ${emp.error}`)
      ])
      // Still call onConfirm to refresh the list
      onConfirm(paidDate)
    } else if (failedEmployees.length > 0) {
      // All failed
      setErrorDetails([
        `Failed to process payments for ${failedEmployees.length} employee(s):`,
        ...failedEmployees.map(emp => `• ${emp.name}: ${emp.error}`),
        "",
        "💡 Tip: Employees must have salary configured in the system first."
      ])
    } else {
      // All success
      onConfirm(paidDate)
    }
  }

  const handleClose = () => {
    setPaidDate(new Date())
    setErrorDetails(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirm Pay Run</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
                      <td className="p-3 font-medium">{emp.name}</td>
                      <td className="p-3 text-gray-500">{emp.department}</td>
                      <td className="p-3 text-right font-medium">
                        ₹{emp.salary.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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

          {errorDetails && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="text-sm">
                {errorDetails.map((line, i) => (
                  <p key={i} className={i === 0 ? "font-semibold mb-1" : ""}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

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