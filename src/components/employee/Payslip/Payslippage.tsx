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
    TrendingUp,
    TrendingDown,
    Printer,
    Building2,
    Download,
} from "lucide-react"
import jsPDF from "jspdf"
import { toPng } from 'html-to-image'
import axiosInstance from "@/lib/axios"
import { getOrgId, getEmployeeId, getUserRole } from "@/lib/auth"
import { useSearchParams } from "next/navigation"

/* ================= TYPES ================= */

type TemplateId = "corporate-teal" | "professional-brown" | "minimal-clean" | "modern-gradient"

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
    overtimeHours?: number
    overtimeAmount?: number
}

/* ================= PAGE ================= */

export default function PayrunViewPage() {
    const searchParams = useSearchParams()
    const id = searchParams.get("id")
    const employeeIdParam = searchParams.get("employeeId")

    const [employee, setEmployee] = useState<PayrollEmployee | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTemplate, setActiveTemplate] = useState<TemplateId>("corporate-teal")

    const templates = [
        { id: "corporate-teal" as TemplateId, name: "Corporate Teal" },
        { id: "professional-brown" as TemplateId, name: "Professional Brown" },
        { id: "minimal-clean" as TemplateId, name: "Minimal Clean" },
        { id: "modern-gradient" as TemplateId, name: "Modern Gradient" },
    ]

    /* ================= LOAD FROM STORAGE ================= */

    useEffect(() => {
        const fetchSalaryData = async (paramEmployeeId?: string) => {
            setIsLoading(true);
            setError(null);

            const organizationId = getOrgId();
            const activeEmployeeId = paramEmployeeId || getEmployeeId();

            if (!organizationId) {
                setError("Organization ID not found");
                setIsLoading(false);
                return;
            }

            // Check session storage first for preview data (Admin Flow - specifically when coming from PayRun)
            const storedData = sessionStorage.getItem("payrun-view-employee");
            if (storedData && !id) {
                try {
                    const parsedData = JSON.parse(storedData);
                    // Verify if the stored data belongs to the requested employee if we have an ID context
                    if (!activeEmployeeId || parsedData.id === activeEmployeeId) {
                        console.log("Using session storage data for preview");
                        setEmployee(parsedData);
                        setIsLoading(false);
                        return;
                    }
                } catch (e) {
                    console.error("Failed to parse stored salary data", e);
                }
            }

            try {
                let salaryRecord: any = null;

                // Priority 1: If a specific salary ID is in the URL (admin view), fetch that specific record
                if (id) {
                    console.log("Fetching specific salary record:", id);
                    try {
                        const response = await axiosInstance.get(`/org/${organizationId}/salaries/${id}`);
                        const data = response.data;
                        salaryRecord = data.data || data;

                        if (salaryRecord) {
                            // Valid record found, map it
                            const empInfo = salaryRecord.employee || {};
                            const mappedEmployee: PayrollEmployee = {
                                id: empInfo.id || empInfo._id || salaryRecord.employeeId || "",
                                name: empInfo.fullName || `${empInfo.firstName || ""} ${empInfo.lastName || ""}`.trim() || salaryRecord.employeeName || "Unknown Employee",
                                department: empInfo.department?.name || empInfo.department?.departmentName || salaryRecord.department || "N/A",
                                designation: empInfo.designation?.name || empInfo.designation?.designationName || salaryRecord.designation || "N/A",
                                location: empInfo.location?.name || empInfo.location?.locationName || salaryRecord.location || "N/A",
                                basicSalary: Number(salaryRecord.basicSalary || salaryRecord.salary || 0),
                                allowances: (salaryRecord.allowances || []).map((a: any) => ({
                                    id: a.id || a._id || Math.random().toString(),
                                    name: a.name || "Allowance",
                                    value: Number(a.value || 0),
                                    type: a.type || "fixed"
                                })),
                                deductions: (salaryRecord.deductions || []).map((d: any) => ({
                                    id: d.id || d._id || Math.random().toString(),
                                    name: d.name || "Deduction",
                                    value: Number(d.value || 0),
                                    type: d.type || "fixed"
                                })),
                                overtimeHours: Number(salaryRecord.overtimeHours || 0),
                                overtimeAmount: Number(salaryRecord.overtimeAmount || 0),
                            };
                            setEmployee(mappedEmployee);
                            setIsLoading(false);
                            return;
                        }
                    } catch (err: any) {
                        console.warn("Failed to fetch specific salary record:", err.message);
                    }
                }

                // Priority 2: Fetch Employee Profile for current/estimated view
                // This is the fallback for Employees or if specific salary record fetch failed
                if (activeEmployeeId) {
                    console.log("Fetching employee profile for salary structure:", activeEmployeeId);
                    const employeeRes = await axiosInstance.get(`/org/${organizationId}/employees/${activeEmployeeId}`);
                    const empData = employeeRes.data.data || employeeRes.data;

                    if (empData) {
                        const basic = Number(empData.basicSalary || empData.salary || 0);

                        // Parse allowances
                        const allowances: Allowance[] = (empData.accommodationAllowances || empData.allowances || []).map((a: any) => {
                            const val = Number(a.value || a.percentage || 0);
                            const type = a.type || (a.percentage ? "percentage" : "fixed");
                            return {
                                id: a.id || a._id || Math.random().toString(),
                                name: a.name || a.type || "Allowance",
                                value: val,
                                type: type
                            };
                        });

                        // Parse deductions
                        const deductions: Deduction[] = (empData.insurances || empData.deductions || []).map((d: any) => {
                            const val = Number(d.value || d.percentage || 0);
                            const type = d.type || (d.percentage ? "percentage" : "fixed");
                            return {
                                id: d.id || d._id || Math.random().toString(),
                                name: d.name || d.type || "Deduction",
                                value: val,
                                type: type
                            };
                        });

                        // Construct a PayrollEmployee object
                        const mappedEmployee: PayrollEmployee = {
                            id: empData.id || empData._id || "",
                            name: empData.fullName || `${empData.firstName || ""} ${empData.lastName || ""}`.trim() || "Unknown Employee",
                            department: empData.department?.name || empData.department?.departmentName || "N/A",
                            designation: empData.designation?.name || empData.designation?.designationName || "N/A",
                            location: empData.location?.name || empData.location?.locationName || "N/A",
                            basicSalary: basic,
                            allowances: allowances,
                            deductions: deductions,
                            overtimeHours: 0,
                            overtimeAmount: 0,
                        };

                        setEmployee(mappedEmployee);
                    } else {
                        throw new Error("Employee profile not found");
                    }
                } else {
                    throw new Error("No employee ID provided");
                }

            } catch (err: any) {
                console.error("Error fetching salary data:", err);
                setError(err.response?.data?.error || err.message || "Failed to load salary record");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSalaryData();
    }, [id, employeeIdParam]);

    /* ================= PDF DOWNLOAD ================= */

    const handleDownloadPDF = async () => {
        const element = document.getElementById('payslip-pdf-content'); // Changed to inner ID
        if (!element) return;

        try {
            // High quality capture
            const dataUrl = await toPng(element, {
                quality: 1.0,
                pixelRatio: 3, // Better resolution
                backgroundColor: '#ffffff'
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Add margins (10mm)
            const margin = 10;
            const contentWidth = pdfWidth - (margin * 2);

            const componentWidth = element.offsetWidth;
            const componentHeight = element.offsetHeight;

            // Calculate height maintaining aspect ratio based on content width
            const finalHeight = (componentHeight * contentWidth) / componentWidth;

            pdf.addImage(dataUrl, 'PNG', margin, margin, contentWidth, finalHeight);
            pdf.save(`payslip-${employee?.name || 'employee'}.pdf`);
        } catch (err) {
            console.error("PDF Export failed", err);
        }
    };

    /* ================= CALCULATIONS ================= */

    const salaryBreakdown = useMemo(() => {
        if (!employee) return null

        const basicSalary = employee.basicSalary || 0
        const overtimeAmount = employee.overtimeAmount || 0

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

        const grossSalary = basicSalary + totalAllowances + overtimeAmount

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
            overtimeAmount,
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

    if (error || !employee || !salaryBreakdown) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-screen">
                <div className="bg-red-50 p-6 rounded-xl border border-red-100 max-w-md">
                    <TrendingDown className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-900 mb-2">Oops! Something went wrong</h2>
                    <p className="text-red-700 mb-6">{error || "No employee data found"}</p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => window.history.back()} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                            Go Back
                        </Button>
                        <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    /* ================= RENDER ================= */

    return (
        <div className="min-h-screen bg-white p-2 sm:p-4 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-4 sm:mb-8 print:hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Choose Payslip Template</h1>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-700 transition-colors flex-1 sm:flex-initial font-medium shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download PDF</span>
                        </button>
                    </div>
                </div>

                {/* Template Thumbnails */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            onClick={() => setActiveTemplate(template.id)}
                            className={`bg-white rounded-lg border-2 cursor-pointer overflow-hidden transition-all hover:shadow-lg ${activeTemplate === template.id ? "border-blue-600 shadow-md" : "border-slate-200 hover:border-slate-400"
                                }`}
                        >
                            <div className="p-2 border-b bg-slate-50">
                                <p className="text-xs sm:text-sm font-medium text-center text-slate-700">{template.name}</p>
                            </div>
                            <div className="p-2 sm:p-3 overflow-hidden bg-white">
                                <div className="origin-top-left scale-[0.12] sm:scale-[0.18] w-[800%] sm:w-[550%] h-[200px] sm:h-[250px] shadow-sm pointer-events-none">
                                    <PayslipTemplate variant={template.id} employee={employee} salaryBreakdown={salaryBreakdown} isPreview={false} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Full Preview */}
            <div id="payslip-ui-container" className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-4 sm:p-8 md:p-12 print:p-0 print:shadow-none print:rounded-none">
                {/* Specific container for PDF capture without extra UI padding */}
                <div id="payslip-pdf-content" className="w-full bg-white">
                    <PayslipTemplate variant={activeTemplate} employee={employee} salaryBreakdown={salaryBreakdown} isPreview={true} />
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
        </div>
    )
}

/* ================= TEMPLATE SELECTOR ================= */

function PayslipTemplate({
    variant,
    employee,
    salaryBreakdown,
    isPreview
}: {
    variant: TemplateId;
    employee: PayrollEmployee;
    salaryBreakdown: any;
    isPreview: boolean;
}) {
    const props = { employee, salaryBreakdown, isPreview };
    switch (variant) {
        case "corporate-teal":
            return <CorporateTealTemplate {...props} />
        case "professional-brown":
            return <ProfessionalBrownTemplate {...props} />
        case "minimal-clean":
            return <MinimalCleanTemplate {...props} />
        case "modern-gradient":
            return <ModernGradientTemplate {...props} />
        default:
            return <CorporateTealTemplate {...props} />
    }
}

/* ================= INDIVIDUAL TEMPLATES ================= */

// Template 1: Corporate Teal
function CorporateTealTemplate({ employee, salaryBreakdown }: { employee: PayrollEmployee; salaryBreakdown: any; isPreview: boolean }) {
    return (
        <div className="bg-white print-area text-slate-900 border border-slate-200">
            <div className="p-6">
                {/* Header content */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-4 border-[#1a5662] flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-[#1a5662]" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Employee Payroll</p>
                            <h1 className="text-xl font-bold">Zarco Contracting</h1>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-[#1a5662] text-white px-8 py-2 text-xl font-bold tracking-wider inline-block">PAYSLIP</div>
                        <p className="mt-2 text-sm text-slate-600">Company ID: ORG-772-100</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="bg-[#1a5662] text-white px-4 py-1.5 text-xs font-bold mb-4">EMPLOYEE INFORMATION</div>
                <div className="grid grid-cols-3 gap-6 mb-8 text-sm">
                    <div>
                        <p className="text-xs text-slate-500">Name</p>
                        <p className="font-bold">{employee.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Employee ID</p>
                        <p className="font-bold">{employee.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Department</p>
                        <p className="font-bold">{employee.department}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Designation</p>
                        <p className="font-bold">{employee.designation}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Location</p>
                        <p className="font-bold">{employee.location}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Pay Date</p>
                        <p className="font-bold">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Tables */}
                <div className="border border-slate-300 mb-8">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#1a5662] text-white">
                                <th className="text-left px-4 py-2 font-bold text-xs uppercase">Description</th>
                                <th className="text-right px-4 py-2 font-bold text-xs uppercase">Earnings</th>
                                <th className="text-right px-4 py-2 font-bold text-xs uppercase border-l-2 border-white">Deductions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            <tr>
                                <td className="px-4 py-2">Basic Salary</td>
                                <td className="text-right px-4 py-2">AED {salaryBreakdown.basicSalary.toLocaleString()}</td>
                                <td className="text-right px-4 py-2 border-l"></td>
                            </tr>
                            {salaryBreakdown.allowancesWithAmount.map((a: any, i: number) => (
                                <tr key={i}>
                                    <td className="px-4 py-2">{a.name}</td>
                                    <td className="text-right px-4 py-2">AED {a.calculatedAmount.toLocaleString()}</td>
                                    <td className="text-right px-4 py-2 border-l"></td>
                                </tr>
                            ))}
                            {salaryBreakdown.overtimeAmount > 0 && (
                                <tr>
                                    <td className="px-4 py-2">Overtime ({employee.overtimeHours} hrs)</td>
                                    <td className="text-right px-4 py-2">AED {salaryBreakdown.overtimeAmount.toLocaleString()}</td>
                                    <td className="text-right px-4 py-2 border-l"></td>
                                </tr>
                            )}
                            {salaryBreakdown.deductionsWithAmount.map((d: any, i: number) => (
                                <tr key={i}>
                                    <td className="px-4 py-2">{d.name}</td>
                                    <td className="text-right px-4 py-2"></td>
                                    <td className="text-right px-4 py-2 border-l">AED {d.calculatedAmount.toLocaleString()}</td>
                                </tr>
                            ))}
                            {/* Padding rows if needed */}
                            <tr className="bg-[#1a5662] text-white font-bold">
                                <td className="px-4 py-2 text-xs">TOTALS</td>
                                <td className="text-right px-4 py-2">AED {salaryBreakdown.grossSalary.toLocaleString()}</td>
                                <td className="text-right px-4 py-2 border-l-2 border-white">AED {salaryBreakdown.totalDeductions.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="bg-[#1a5662] text-white p-4 flex justify-between items-center mb-8">
                    <span className="font-bold">NET PAYABLE AMOUNT</span>
                    <span className="text-2xl font-black">AED {salaryBreakdown.netSalary.toLocaleString()}</span>
                </div>

                {/* Footer */}
                <div className="grid grid-cols-2 gap-12 pt-12">
                    <div className="text-center">
                        <div className="border-b border-slate-400 h-8 mb-2"></div>
                        <p className="text-xs font-bold">Employer Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-slate-400 h-8 mb-2"></div>
                        <p className="text-xs font-bold">Employee Signature</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Template 2: Professional Brown
function ProfessionalBrownTemplate({ employee, salaryBreakdown }: { employee: PayrollEmployee; salaryBreakdown: any; isPreview: boolean }) {
    return (
        <div className="bg-white print-area text-slate-900 shadow-sm border border-slate-100">
            <div className="p-8">
                <div className="flex justify-between items-center mb-10 pb-4 border-b-2 border-[#8B6F47]">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#8B6F47] rounded-lg flex items-center justify-center">
                            <Building2 className="w-9 h-9 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Zarco Contracting</h1>
                            <p className="text-xs font-bold text-[#8B6F47] tracking-[0.2em] uppercase">Private Limited</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-[#8B6F47] text-white px-6 py-1.5 text-sm font-black tracking-widest inline-block mb-2">P A Y S L I P</div>
                        <p className="text-xs font-bold text-slate-500 italic">Statement Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-10 mb-10">
                    <div className="space-y-4">
                        <div className="bg-[#8B6F47] text-white px-3 py-1 text-[10px] font-black tracking-widest">EMPLOYEE PROFILE</div>
                        <div className="space-y-2.5 text-sm">
                            <p className="flex justify-between border-b border-slate-100 pb-1">
                                <span className="text-slate-500 font-medium">Name:</span>
                                <span className="font-bold text-slate-800">{employee.name}</span>
                            </p>
                            <p className="flex justify-between border-b border-slate-100 pb-1">
                                <span className="text-slate-500 font-medium">Employee ID:</span>
                                <span className="font-bold text-slate-800">{employee.id.substring(0, 6).toUpperCase()}</span>
                            </p>
                            <p className="flex justify-between border-b border-slate-100 pb-1">
                                <span className="text-slate-500 font-medium">Designation:</span>
                                <span className="font-bold text-slate-800">{employee.designation}</span>
                            </p>
                            <p className="flex justify-between border-b border-slate-100 pb-1">
                                <span className="text-slate-500 font-medium">Department:</span>
                                <span className="font-bold text-slate-800">{employee.department}</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-6 flex flex-col justify-center items-center rounded-sm">
                        <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] mb-2 uppercase">Total Net Payment</p>
                        <p className="text-4xl font-black text-[#8B6F47]">AED {salaryBreakdown.netSalary.toLocaleString()}</p>
                        <div className="w-full h-px bg-slate-200 my-4"></div>
                        <div className="text-[10px] font-bold text-slate-500 flex gap-4">
                            <span>GROSS: AED {salaryBreakdown.grossSalary.toLocaleString()}</span>
                            <span className="text-red-400">DED: AED {salaryBreakdown.totalDeductions.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="bg-[#8B6F47] text-white px-3 py-1.5 text-[10px] font-black tracking-widest mb-3">EARNINGS BREAKDOWN</div>
                    <table className="w-full text-sm">
                        <thead className="text-slate-400 border-b border-slate-200">
                            <tr>
                                <th className="text-left py-2 font-black text-[10px] tracking-widest">DESCRIPTION</th>
                                <th className="text-right py-2 font-black text-[10px] tracking-widest">AMOUNT (AED)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="py-3 font-medium">Basic Component</td>
                                <td className="py-3 text-right font-bold">AED {salaryBreakdown.basicSalary.toLocaleString()}</td>
                            </tr>
                            {salaryBreakdown.allowancesWithAmount.map((a: any, i: number) => (
                                <tr key={i}>
                                    <td className="py-3 font-medium">{a.name}</td>
                                    <td className="py-3 text-right font-bold">AED {a.calculatedAmount.toLocaleString()}</td>
                                </tr>
                            ))}
                            {salaryBreakdown.overtimeAmount > 0 && (
                                <tr>
                                    <td className="py-3 font-medium">Overtime ({employee.overtimeHours} hrs)</td>
                                    <td className="py-3 text-right font-bold">AED {salaryBreakdown.overtimeAmount.toLocaleString()}</td>
                                </tr>
                            )}
                            <tr className="bg-slate-50 font-black border-t border-slate-300">
                                <td className="py-3 px-2">GROSS EARNINGS</td>
                                <td className="py-3 px-2 text-right">AED {salaryBreakdown.grossSalary.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mb-10">
                    <div className="bg-slate-700 text-white px-3 py-1.5 text-[10px] font-black tracking-widest mb-3">DEDUCTIONS & TAXES</div>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-slate-100">
                            {salaryBreakdown.deductionsWithAmount.map((d: any, i: number) => (
                                <tr key={i}>
                                    <td className="py-3 font-medium text-slate-600">{d.name}</td>
                                    <td className="py-3 text-right font-bold text-red-500">-AED {d.calculatedAmount.toLocaleString()}</td>
                                </tr>
                            ))}
                            {salaryBreakdown.deductionsWithAmount.length === 0 && (
                                <tr>
                                    <td className="py-3 font-medium text-slate-400 italic">No deductions applied</td>
                                    <td className="py-3 text-right font-bold">AED 0</td>
                                </tr>
                            )}
                            <tr className="bg-slate-50 font-black border-t border-slate-300">
                                <td className="py-3 px-2">TOTAL DEDUCTIONS</td>
                                <td className="py-3 px-2 text-right text-red-500">-AED {salaryBreakdown.totalDeductions.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="bg-[#8B6F47] text-white p-6 rounded-sm flex justify-between items-center group">
                    <div>
                        <p className="text-xs font-black tracking-widest mb-1 opacity-80 uppercase">Net Amount Payable</p>
                        <p className="text-[10px] font-bold opacity-60">Verified Statement - Online Payroll System</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-black italic tracking-tight">AED {salaryBreakdown.netSalary.toLocaleString()}</p>
                    </div>
                </div>

                <p className="text-center text-[9px] font-bold text-slate-300 mt-10 uppercase tracking-[0.5em]">Computer Generated Document - No Signature Required</p>
            </div>
        </div>
    )
}

// Template 3: Minimal Clean
function MinimalCleanTemplate({ employee, salaryBreakdown }: { employee: PayrollEmployee; salaryBreakdown: any; isPreview: boolean }) {
    return (
        <div className="bg-white print-area text-slate-900 border-2 border-slate-100 max-w-3xl mx-auto shadow-sm">
            <div className="p-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-1">Zarco Contracting</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">Corporate Solutions</p>
                </div>

                <div className="border-y-2 border-slate-100 py-6 mb-10 flex justify-between items-center px-4">
                    <div className="text-sm">
                        <p className="text-slate-400 font-bold text-[10px] uppercase mb-1">Pay Period Status</p>
                        <p className="font-bold">JAN 01 - JAN 15, 2025</p>
                    </div>
                    <div className="w-px h-10 bg-slate-100"></div>
                    <div className="text-sm">
                        <p className="text-slate-400 font-bold text-[10px] uppercase mb-1">Statement Date</p>
                        <p className="font-bold">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-100"></div>
                    <div className="text-right">
                        <p className="text-slate-400 font-bold text-[10px] uppercase mb-1">Document Status</p>
                        <p className="font-bold text-green-500 uppercase">FINALIZED</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-10 px-4">
                    <div className="space-y-4">
                        <h3 className="text-xs font-black border-l-4 border-blue-600 pl-3 uppercase tracking-widest">Personnel</h3>
                        <div className="space-y-1 text-sm">
                            <p className="font-bold text-slate-800">{employee.name}</p>
                            <p className="text-slate-500 font-medium">#{employee.id.substring(0, 5).toUpperCase()} | {employee.designation}</p>
                            <p className="text-slate-500 font-medium">{employee.department} Dept.</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xs font-black border-l-4 border-slate-800 pl-3 uppercase tracking-widest">Calculations</h3>
                        <div className="space-y-1 text-sm">
                            <p className="flex justify-between"><span className="text-slate-500">Gross:</span> <span className="font-bold">AED {salaryBreakdown.grossSalary.toLocaleString()}</span></p>
                            <p className="flex justify-between"><span className="text-slate-500">Tax/Ded:</span> <span className="font-bold text-red-500">-AED {salaryBreakdown.totalDeductions.toLocaleString()}</span></p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 mb-12">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-slate-100 text-[10px] font-black tracking-widest text-slate-400">
                                    <th className="text-left py-3 px-4 uppercase">Item Description</th>
                                    <th className="text-right py-3 px-4 uppercase">Credit</th>
                                    <th className="text-right py-3 px-4 uppercase">Debit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <tr>
                                    <td className="py-4 px-4 font-bold">Standard Base Pay</td>
                                    <td className="py-4 px-4 text-right font-bold text-slate-800">AED {salaryBreakdown.basicSalary.toLocaleString()}</td>
                                    <td className="py-4 px-4 text-right">-</td>
                                </tr>
                                {salaryBreakdown.allowancesWithAmount.map((a: any, i: number) => (
                                    <tr key={i}>
                                        <td className="py-4 px-4 font-medium text-slate-600">{a.name}</td>
                                        <td className="py-4 px-4 text-right font-bold text-slate-800">AED {a.calculatedAmount.toLocaleString()}</td>
                                        <td className="py-4 px-4 text-right">-</td>
                                    </tr>
                                ))}
                                {salaryBreakdown.overtimeAmount > 0 && (
                                    <tr>
                                        <td className="py-4 px-4 font-medium text-slate-600">Overtime Pay ({employee.overtimeHours} hrs)</td>
                                        <td className="py-4 px-4 text-right font-bold text-slate-800">AED {salaryBreakdown.overtimeAmount.toLocaleString()}</td>
                                        <td className="py-4 px-4 text-right">-</td>
                                    </tr>
                                )}
                                {salaryBreakdown.deductionsWithAmount.map((d: any, i: number) => (
                                    <tr key={i}>
                                        <td className="py-4 px-4 font-medium text-slate-600">{d.name}</td>
                                        <td className="py-4 px-4 text-right">-</td>
                                        <td className="py-4 px-4 text-right font-bold text-red-500">AED {d.calculatedAmount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl p-8 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black tracking-[0.3em] opacity-40 uppercase mb-1">Net Disposable Income</p>
                        <p className="text-sm font-bold opacity-80">Paid via Bank Transfer</p>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-black tracking-tight">AED {salaryBreakdown.netSalary.toLocaleString()}</p>
                    </div>
                </div>

                <div className="mt-12 flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest px-4">
                    <p>© 2025 Zarco Contracting</p>
                    <p>INTERNAL DOCUMENT ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                </div>
            </div>
        </div>
    )
}

// Template 4: Modern Gradient
function ModernGradientTemplate({ employee, salaryBreakdown }: { employee: PayrollEmployee; salaryBreakdown: any; isPreview: boolean }) {
    return (
        <div className="bg-white print-area text-slate-900 border border-purple-100 shadow-xl overflow-hidden rounded-xl">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                                <Building2 className="w-7 h-7" />
                            </div>
                            <p className="text-xl font-black tracking-tight uppercase">Zarco Contracting</p>
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter">P A Y S L I P</h1>
                        <p className="text-blue-100/70 text-sm font-bold mt-1 uppercase tracking-widest">January 2025 Statement</p>
                    </div>
                    <div className="text-right">
                        <div className="bg-black/20 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
                            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Payable Net</p>
                            <p className="text-3xl font-black">AED {salaryBreakdown.netSalary.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Employee Details</h3>
                        <p className="text-xl font-black text-slate-800 mb-1">{employee.name}</p>
                        <p className="text-sm font-bold text-purple-600 mb-3">{employee.designation}</p>
                        <div className="flex gap-4 text-xs font-bold text-slate-500 uppercase">
                            <span>ID: {employee.id.substring(0, 6).toUpperCase()}</span>
                            <span>•</span>
                            <span>{employee.department}</span>
                        </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col justify-center">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Gross Credit</span>
                                <span className="text-lg font-black text-slate-800">AED {salaryBreakdown.grossSalary.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Total Debit</span>
                                <span className="text-lg font-black text-red-500">AED {salaryBreakdown.totalDeductions.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-slate-200"></div>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Final Net</span>
                                <span className="text-xl font-black text-blue-600">AED {salaryBreakdown.netSalary.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10">
                    <div>
                        <h3 className="text-xs font-black text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Earnings
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm group">
                                <span className="font-bold text-slate-600">Base Component</span>
                                <span className="font-black text-slate-800">AED {salaryBreakdown.basicSalary.toLocaleString()}</span>
                            </div>
                            {salaryBreakdown.allowancesWithAmount.map((a: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="font-bold text-slate-600">{a.name}</span>
                                    <span className="font-black text-slate-800">AED {a.calculatedAmount.toLocaleString()}</span>
                                </div>
                            ))}
                            {salaryBreakdown.overtimeAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-slate-600">Overtime ({employee.overtimeHours} hrs)</span>
                                    <span className="font-black text-slate-800">AED {salaryBreakdown.overtimeAmount.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Deductions
                        </h3>
                        <div className="space-y-4">
                            {salaryBreakdown.deductionsWithAmount.map((d: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="font-bold text-slate-600">{d.name}</span>
                                    <span className="font-black text-red-500">AED {d.calculatedAmount.toLocaleString()}</span>
                                </div>
                            ))}
                            {salaryBreakdown.deductionsWithAmount.length === 0 && (
                                <p className="text-xs italic text-slate-400 font-bold">Comprehensive zero deductions</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-black tracking-widest mb-1 opacity-40 uppercase">Statement of Earnings</p>
                            <p className="text-lg font-black tracking-tight">Net Payable Amount</p>
                        </div>
                        <p className="text-5xl font-black italic tracking-tighter">AED {salaryBreakdown.netSalary.toLocaleString()}</p>
                    </div>
                </div>

                <div className="mt-12 text-center border-t border-slate-100 pt-8">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">Secure Payroll Document • Zarco Contracting</p>
                </div>
            </div>
        </div>
    )
}
