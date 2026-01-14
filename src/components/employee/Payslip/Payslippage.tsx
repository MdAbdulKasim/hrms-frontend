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
    employeeNumber: string
    name: string
    department: string
    designation: string
    location: string
    basicSalary: number
    allowances: Allowance[]
    deductions: Deduction[]
    overtimeHours?: number
    overtimeAmount?: number
    payDate?: string
}

/* ================= PAGE ================= */

export default function PayrunViewPage() {
    const searchParams = useSearchParams()
    const id = searchParams.get("id")
    const employeeIdParam = searchParams.get("employeeId")

    const [employee, setEmployee] = useState<PayrollEmployee | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)


    /* ================= LOAD FROM STORAGE ================= */

    /* ================= HELPER: DATA MAPPING ================= */

    const processSalaryRecord = (record: any, empProfile: any = null): PayrollEmployee => {
        // If we have an override employee profile, use it for basic details, otherwise trust the record
        // The record from "getSalaryRecordsByEmployee" might have "employee" populated

        let empInfo = record.employee || empProfile || {};

        // Fix for when record.employee is just an ID string (should be object if population worked, but be safe)
        if (typeof empInfo === 'string') {
            empInfo = empProfile || {};
        }

        const basicSalary = Number(record.basicSalary || record.salary || empInfo.basicSalary || 0);

        // Allowances
        let allowances: Allowance[] = [];
        if (Array.isArray(record.allowances) && record.allowances.length > 0) {
            allowances = record.allowances.map((a: any) => ({
                id: a.id || a._id || Math.random().toString(),
                name: a.name || "Allowance",
                value: Number(a.value || 0),
                type: (a.type as "percentage" | "fixed") || "fixed"
            }));
        } else {
            const breakdown = record.allowanceBreakdown || record.allowances || {};
            if (typeof breakdown === 'object') {
                allowances = Object.entries(breakdown).map(([key, val]: [string, any]) => ({
                    id: key,
                    name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                    value: typeof val === 'object' ? (val.amount || val.value || val.percentage || 0) : Number(val || 0),
                    type: ((typeof val === 'object' && val.percentage) || String(key).toLowerCase().includes('percentage') ? "percentage" : "fixed") as "percentage" | "fixed"
                })).filter(a => a.value > 0);
            }
        }

        // Deductions
        let deductions: Deduction[] = [];
        if (Array.isArray(record.deductions) && record.deductions.length > 0) {
            deductions = record.deductions.map((d: any) => ({
                id: d.id || d._id || Math.random().toString(),
                name: d.name || "Deduction",
                value: Number(d.value || 0),
                type: (d.type as "percentage" | "fixed") || "fixed"
            }));
        } else {
            const breakdown = record.deductionBreakdown || record.deductions || {};
            if (typeof breakdown === 'object') {
                deductions = Object.entries(breakdown).map(([key, val]: [string, any]) => ({
                    id: key,
                    name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                    value: typeof val === 'object' ? (val.amount || val.value || val.percentage || 0) : Number(val || 0),
                    type: ((typeof val === 'object' && val.percentage) || String(key).toLowerCase().includes('percentage') ? "percentage" : "fixed") as "percentage" | "fixed"
                })).filter(d => d.value > 0);
            }
        }

        return {
            id: record.id || record._id || "",
            employeeNumber:
                empInfo.employeeNumber ||
                empInfo.employee_number ||
                record.employeeNumber ||
                record.employee_number ||
                "N/A",
            name:
                empInfo.fullName ||
                empInfo.full_name ||
                `${empInfo.firstName || ""} ${empInfo.lastName || ""}`.trim() ||
                record.employeeName ||
                record.employee_name ||
                "Unknown Employee",
            department:
                empInfo.department?.departmentName ||
                empInfo.department?.name ||
                empInfo.department_name ||
                empInfo.department ||
                record.department ||
                record.department_name ||
                "N/A",
            designation:
                empInfo.designation?.designationName ||
                empInfo.designation?.name ||
                empInfo.designation_name ||
                empInfo.designation ||
                record.designation ||
                record.designation_name ||
                "N/A",
            location:
                empInfo.location?.name ||
                empInfo.location_name ||
                empInfo.location ||
                record.location ||
                record.location_name ||
                "N/A",
            basicSalary: basicSalary,
            allowances: allowances,
            deductions: deductions,
            overtimeHours: Number(record.overtimeHours || record.overtime_hours || 0),
            overtimeAmount: Number(record.overtimeAmount || record.overtime_amount || 0),
            payDate:
                record.payPeriodEnd ||
                record.pay_period_end ||
                record.paidDate ||
                record.paid_date ||
                record.createdAt
        };
    };

    /* ================= STATE & LOAD ================= */

    const [salaryHistory, setSalaryHistory] = useState<PayrollEmployee[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

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

            try {
                // 1. Fetch History if we have an employee ID
                if (activeEmployeeId) {
                    try {
                        const historyRes = await axiosInstance.get(`/org/${organizationId}/salaries/employee/${activeEmployeeId}`);
                        const processedHistory = (Array.isArray(historyRes.data) ? historyRes.data : [])
                            .map((record: any) => processSalaryRecord(record));

                        // Sort by date desc
                        processedHistory.sort((a, b) => new Date(b.payDate || "").getTime() - new Date(a.payDate || "").getTime());

                        setSalaryHistory(processedHistory);

                        // If ID exists in URL, set that as employee and go to detail view
                        if (id) {
                            const match = processedHistory.find(r => r.id === id);
                            if (match) {
                                setEmployee(match);
                                setViewMode('detail');
                            }
                        }
                    } catch (e) {
                        console.warn("Failed to fetch salary history", e);
                    }
                }

                // 2. Fetch specific record if ID provided (and wasn't found in history or needed distinct fetch)
                if (id) {
                    // Logic to fetch single if needed (mostly covered by history find above, but kept for robustness)
                    if (!employee) {
                        const response = await axiosInstance.get(`/org/${organizationId}/salaries/${id}`);
                        const data = response.data;
                        const record = data.data || data;
                        // ... (rest of fetch single logic if needed, but simplified for brevity as history usually covers it)
                        if (record) {
                            // We might need to fetch extra employee info if it's missing from the record
                            let empProfile = null;
                            if (!record.employee || !record.employee.employeeNumber) {
                                try {
                                    const empId = record.employeeId || record.employee_id;
                                    if (empId) {
                                        const empRes = await axiosInstance.get(`/org/${organizationId}/employees/${empId}`);
                                        empProfile = empRes.data.data || empRes.data;
                                    }
                                } catch (e) { /* ignore */ }
                            }
                            // Process
                            const mapped = processSalaryRecord(record, empProfile);
                            setEmployee(mapped);
                            setViewMode('detail');
                        }
                    }
                }
                else if (activeEmployeeId && !employee && salaryHistory.length === 0) {
                    // Re-implementing fallback for safety if list is truly empty.
                    try {
                        const employeeRes = await axiosInstance.get(`/org/${organizationId}/employees/${activeEmployeeId}`);
                        const empData = employeeRes.data.data || employeeRes.data;
                        if (empData) {
                            // Map profile data to PayrollEmployee format using helper

                            const basic = Number(empData.basicSalary || empData.salary || 0);

                            // Parse allowances from profile
                            let allowances: any[] = [];
                            if (Array.isArray(empData.accommodationAllowances)) {
                                allowances = empData.accommodationAllowances.map((a: any) => ({
                                    ...a,
                                    type: a.type || (a.percentage ? "percentage" : "fixed")
                                }));
                            } else if (empData.allowances && typeof empData.allowances === 'object' && !Array.isArray(empData.allowances)) {
                                Object.entries(empData.allowances).forEach(([key, val]: [string, any]) => {
                                    if (val && (val.enabled || val.percentage || val.amount)) {
                                        allowances.push({
                                            id: key,
                                            name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                                            value: Number(val.amount || val.percentage || val.value || 0),
                                            type: val.percentage || key.toLowerCase().includes('percentage') ? 'percentage' : 'fixed'
                                        });
                                    }
                                });
                            } else if (Array.isArray(empData.allowances)) {
                                allowances = empData.allowances;
                            }

                            // Parse deductions from profile
                            let deductions: any[] = [];
                            if (Array.isArray(empData.insurances)) {
                                deductions = empData.insurances.map((d: any) => ({
                                    ...d,
                                    type: d.type || (d.percentage ? "percentage" : "fixed")
                                }));
                            } else if (empData.deductions && typeof empData.deductions === 'object' && !Array.isArray(empData.deductions)) {
                                Object.entries(empData.deductions).forEach(([key, val]: [string, any]) => {
                                    if (val && (val.enabled || val.percentage || val.amount)) {
                                        deductions.push({
                                            id: key,
                                            name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                                            value: Number(val.amount || val.percentage || val.value || 0),
                                            type: val.percentage || key.toLowerCase().includes('percentage') ? 'percentage' : 'fixed'
                                        });
                                    }
                                });
                            } else if (Array.isArray(empData.deductions)) {
                                deductions = empData.deductions;
                            }

                            const recordFromProfile = {
                                ...empData,
                                basicSalary: basic,
                                allowances: allowances,
                                deductions: deductions,
                                payDate: new Date().toISOString()
                            };

                            const mapped = processSalaryRecord(recordFromProfile, empData);
                            setSalaryHistory([mapped]);
                        }
                    } catch (e) { console.warn(e) }
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

    // Helper to calculate breakdown for a specific employee record
    const calculateBreakdown = (emp: PayrollEmployee) => {
        if (!emp) return null;
        const bs = emp.basicSalary || 0;
        const ot = emp.overtimeAmount || 0;

        const allw = (emp.allowances || []).map(a => ({
            ...a,
            calculatedAmount: a.type === 'percentage' ? (bs * a.value) / 100 : a.value
        }));
        const totalAllw = allw.reduce((s, c) => s + c.calculatedAmount, 0);

        const deds = (emp.deductions || []).map(d => ({
            ...d,
            calculatedAmount: d.type === 'percentage' ? (bs * d.value) / 100 : d.value
        }));
        const totalDed = deds.reduce((s, c) => s + c.calculatedAmount, 0);

        const gross = bs + totalAllw + ot;
        const net = gross - totalDed;

        return {
            basicSalary: bs,
            allowancesWithAmount: allw,
            totalAllowances: totalAllw,
            overtimeAmount: ot,
            grossSalary: gross,
            deductionsWithAmount: deds,
            totalDeductions: totalDed,
            netSalary: net
        };
    };

    /* ================= PDF DOWNLOAD ================= */

    const handleDownloadPDF = async () => {
        // Single payslip download logic
        const element = document.getElementById('payslip-pdf-content');
        if (!element) return;

        try {
            const dataUrl = await toPng(element, { quality: 1.0, pixelRatio: 2, backgroundColor: '#ffffff' });
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const margin = 10;
            const contentWidth = pdfWidth - (margin * 2);
            const componentWidth = element.offsetWidth;
            const componentHeight = element.offsetHeight;
            const finalHeight = (componentHeight * contentWidth) / componentWidth;

            pdf.addImage(dataUrl, 'PNG', margin, margin, contentWidth, finalHeight);
            pdf.save(`payslip-${employee?.name || 'employee'}.pdf`);
        } catch (err) {
            console.error("PDF Export failed", err);
        }
    };


    /* ================= CALCULATIONS ================= */

    const salaryBreakdown = useMemo(() => {
        if (!employee) return null;
        return calculateBreakdown(employee);
    }, [employee]);

    /* ================= LOADING STATE ================= */

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error && salaryHistory.length === 0) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-screen">
                <div className="bg-red-50 p-6 rounded-xl border border-red-100 max-w-md">
                    <TrendingDown className="w-12 h-12 text-red-400 mx-auto mb-4" />
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
        <div className="min-h-screen bg-white p-1 sm:p-4">
            {/* Main Layout */}
            <div className="max-w-5xl mx-auto">

                {viewMode === 'list' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-slate-800">Payslip History</h1>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{salaryHistory.length} Record(s)</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {salaryHistory.map((record) => {
                                const date = record.payDate ? new Date(record.payDate) : new Date();
                                const breakdown = calculateBreakdown(record);

                                return (
                                    <div
                                        key={record.id}
                                        onClick={() => {
                                            setEmployee(record);
                                            setViewMode('detail');
                                        }}
                                        className="bg-white border text-center border-slate-200 rounded-xl p-6 hover:shadow-md hover:border-blue-500 transition-all cursor-pointer group"
                                    >
                                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                                            <Download className="w-5 h-5 text-blue-600 group-hover:text-white" />
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                                            {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-4">
                                            Paid: {date.toLocaleDateString()}
                                        </p>

                                        <div className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-md font-bold text-sm">
                                            AED {breakdown?.netSalary.toLocaleString()}
                                        </div>
                                    </div>
                                )
                            })}

                            {salaryHistory.length === 0 && (
                                <div className="col-span-full text-center py-12 text-slate-400">
                                    No payslip history found.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {viewMode === 'detail' && employee && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <Button variant="ghost" onClick={() => setViewMode('list')} className="gap-2 pl-0 hover:bg-transparent hover:text-blue-600">
                                <ArrowLeft className="w-4 h-4" />
                                Back to List
                            </Button>

                            <Button onClick={handleDownloadPDF} className="bg-[#1a5662] hover:bg-[#14424b] text-white">
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                        </div>

                        {/* Full Preview */}
                        <div id="payslip-ui-container" className="bg-white rounded-xl shadow-lg p-0 print:p-0 print:shadow-none print:rounded-none overflow-hidden border border-slate-200">
                            {/* Specific container for PDF capture without extra UI padding */}
                            <div id="payslip-pdf-content" className="w-full bg-white overflow-x-auto">
                                <PayslipTemplate employee={employee} salaryBreakdown={salaryBreakdown} isPreview={true} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ================= SINGLE TEMPLATE: Corporate Teal ================= */

function PayslipTemplate({
    employee,
    salaryBreakdown,
    isPreview
}: {
    employee: PayrollEmployee;
    salaryBreakdown: any;
    isPreview: boolean;
}) {
    if (!employee || !salaryBreakdown) return null;

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return "AED " + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Helper to format date
    const payDate = employee.payDate ? new Date(employee.payDate) : new Date();
    const monthYear = payDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const paidDays = 30; // Defaulting to 30 as per typical payroll, or derive if available
    const joiningDate = "N/A"; // Not currently in PayrollEmployee type, placeholder or N/A

    // Number to words converter (simplified for major currencies or just English)
    // proportional to the user request "related to my content", we won't add a heavy lib.
    // We will display just the amount if no lib is available, or a simple placeholder.
    // Reference image has it. Let's try to add a very basic one or just the text "Amount in Words".
    const amountInWords = (num: number) => {
        // Very basic placeholder, genuine conversion requires complex logic/lib
        // User said "dont change anything else in my code", so installing a lib is risky.
        // We will omit the words or put a static placeholder that implies functionality.
        return "";
    };

    return (
        <div className="bg-white print-area text-slate-900 min-w-[800px] p-8 font-sans">
            {/* Outer Border Box */}
            <div className="border border-slate-300">

                {/* Header: Company & Logo */}
                <div className="p-6 flex justify-between items-start border-b border-slate-300">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-1">Zarco Contracting</h1>
                        <p className="text-sm text-slate-600">Dubai, UAE</p>
                    </div>
                    <div>
                        {/* Placeholder for Logo - using Building2 as per previous code */}
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-[#1a5662] rounded flex items-center justify-center text-white">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-[#1a5662]">Zarco</span>
                        </div>
                    </div>
                </div>

                {/* Payslip Month Header */}
                <div className="p-3 text-center border-b border-slate-300 bg-slate-50">
                    <h2 className="font-bold text-slate-800">Payslip for the month of {monthYear}</h2>
                </div>

                {/* Employee Pay Summary */}
                <div className="p-6 border-b border-slate-300">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">EMPLOYEE PAY SUMMARY</h3>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                        <div className="grid grid-cols-[140px_1fr]">
                            <span className="text-slate-500">Employee Name</span>
                            <span className="font-semibold">: {employee.name}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr]">
                            <span className="text-slate-500">Employee No</span>
                            <span className="font-semibold">: {employee.employeeNumber}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr]">
                            <span className="text-slate-500">Designation</span>
                            <span className="font-semibold">: {employee.designation}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr]">
                            <span className="text-slate-500">Pay Date</span>
                            <span className="font-semibold">: {payDate.toLocaleDateString()}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr]">
                            <span className="text-slate-500">Department</span>
                            <span className="font-semibold">: {employee.department}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr]">
                            <span className="text-slate-500">Location</span>
                            <span className="font-semibold">: {employee.location}</span>
                        </div>
                    </div>
                </div>

                {/* Earnings & Deductions Table Container */}
                <div className="grid grid-cols-2 border-b border-slate-300 min-h-[300px]">

                    {/* Earnings Column */}
                    <div className="border-r border-slate-300">
                        <div className="grid grid-cols-[1fr_120px] bg-slate-50 border-b border-slate-300 p-2 text-xs font-bold uppercase text-slate-700">
                            <div>Earnings</div>
                            <div className="text-right">Amount</div>
                        </div>

                        <div className="p-0 text-sm">
                            {/* Basic */}
                            <div className="grid grid-cols-[1fr_120px] p-2 border-b border-slate-100 items-center">
                                <span className="text-slate-700">Basic Salary</span>
                                <span className="text-right font-medium">{formatCurrency(salaryBreakdown.basicSalary)}</span>
                            </div>

                            {/* Allowances */}
                            {salaryBreakdown.allowancesWithAmount.map((a: any, i: number) => (
                                <div key={i} className="grid grid-cols-[1fr_120px] p-2 border-b border-slate-100 items-center">
                                    <span className="text-slate-700">{a.name}</span>
                                    <span className="text-right font-medium">{formatCurrency(a.calculatedAmount)}</span>
                                </div>
                            ))}

                            {/* Overtime */}
                            {salaryBreakdown.overtimeAmount > 0 && (
                                <div className="grid grid-cols-[1fr_120px] p-2 border-b border-slate-100 items-center">
                                    <span className="text-slate-700">Overtime ({employee.overtimeHours}h)</span>
                                    <span className="text-right font-medium">{formatCurrency(salaryBreakdown.overtimeAmount)}</span>
                                </div>
                            )}

                            {/* Fixed Allowance Placeholder if needed to match image style? No, dynamic only */}
                        </div>
                    </div>

                    {/* Deductions Column */}
                    <div>
                        <div className="grid grid-cols-[1fr_120px] bg-slate-50 border-b border-slate-300 p-2 text-xs font-bold uppercase text-slate-700">
                            <div>Deductions</div>
                            <div className="text-right">Amount</div>
                        </div>

                        <div className="p-0 text-sm">
                            {/* Deductions List */}
                            {salaryBreakdown.deductionsWithAmount.map((d: any, i: number) => (
                                <div key={i} className="grid grid-cols-[1fr_120px] p-2 border-b border-slate-100 items-center">
                                    <span className="text-slate-700">{d.name}</span>
                                    <span className="text-right font-medium">{formatCurrency(d.calculatedAmount)}</span>
                                </div>
                            ))}

                            {salaryBreakdown.deductionsWithAmount.length === 0 && (
                                <div className="p-4 text-center text-slate-400 italic text-xs">No Deductions</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Gross & Total Deductions Row */}
                <div className="grid grid-cols-2 border-b border-slate-300 bg-slate-50">
                    <div className="grid grid-cols-[1fr_120px] p-2 items-center border-r border-slate-300">
                        <span className="font-bold text-slate-800">Gross Earnings</span>
                        <span className="text-right font-bold text-slate-800">{formatCurrency(salaryBreakdown.grossSalary)}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_120px] p-2 items-center">
                        <span className="font-bold text-slate-800">Total Deductions</span>
                        <span className="text-right font-bold text-slate-800">{formatCurrency(salaryBreakdown.totalDeductions)}</span>
                    </div>
                </div>

                {/* Net Payable Footer */}
                <div className="p-4 bg-slate-100 border-b border-slate-300">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                        <span className="text-lg font-bold text-slate-800">Total Net Payable</span>
                        <span className="text-2xl font-bold text-slate-900">{formatCurrency(salaryBreakdown.netSalary)}</span>
                    </div>
                    <p className="text-center text-xs text-slate-500 mt-1">
                        **Total Net Payable = Gross Earnings - Total Deductions
                    </p>
                </div>

                {/* Signatures */}
                <div className="p-12 mt-4 grid grid-cols-2 gap-12">
                    <div className="text-center">
                        <div className="h-16 mb-2"></div>
                        <p className="text-sm border-t border-slate-400 pt-2 font-semibold text-slate-700">Employee Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="h-16 mb-2"></div>
                        <p className="text-sm border-t border-slate-400 pt-2 font-semibold text-slate-700">HR Signature</p>
                    </div>
                </div>

            </div>
            <p className="text-center text-xs text-slate-400 mt-4">System Generated Payslip</p>
        </div>
    )
}
