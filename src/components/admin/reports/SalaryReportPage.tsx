"use client";

import { useState, useEffect } from "react";
import { Search, ArrowLeft, Download, X, Filter, DollarSign } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import { CustomAlertDialog } from '@/components/ui/custom-dialogs';

export interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeNumber?: string;
  employeeName?: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances?: number;
  overtimeAmount?: number;
  deductions?: number;
  netSalary: number;
  status: string; // 'paid' or 'unpaid'
  paidDate?: string;
  createdAt?: string;
}

export default function SalaryReportPage() {
  const organizationId = getOrgId();
  const [salaryData, setSalaryData] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeMap, setEmployeeMap] = useState<{ [key: string]: any }>({});

  // Alert State
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

  // Selection states
  const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Export dropdown state
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Fetch employees for name mapping
  const fetchEmployees = async () => {
    if (!organizationId) return;
    try {
      const apiUrl = getApiUrl();
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/org/${organizationId}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const employees = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const mapping: { [key: string]: any } = {};
      employees.forEach((emp: any) => {
        const fullName = emp.fullName ||
          `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
          emp.name ||
          emp.email ||
          'Unknown';
        const id = emp.id || emp._id;
        if (id) {
          mapping[String(id)] = {
            ...emp,
            displayName: fullName,
            displayNumber: emp.employeeNumber || emp.employeeId || 'N/A'
          };
        }
      });
      setEmployeeMap(mapping);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Fetch salary data
  const fetchSalaryData = async () => {
    if (!organizationId) {
      setError("Organization ID not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = getApiUrl();
      const token = getAuthToken();

      console.log('Fetching from:', `${apiUrl}/org/${organizationId}/salaries`);

      // Fetch all salary records
      const response = await axios.get(`${apiUrl}/org/${organizationId}/salaries`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: 1,
          limit: 1000 // Get all records
        }
      });

      console.log('API Response:', response.data);

      let data = response.data;

      // Handle different response structures
      let salaries = [];

      if (data && typeof data === 'object') {
        if ('data' in data && Array.isArray(data.data)) {
          salaries = data.data;
        } else if ('records' in data && Array.isArray(data.records)) {
          salaries = data.records;
        } else if (Array.isArray(data)) {
          salaries = data;
        }
      } else if (Array.isArray(data)) {
        salaries = data;
      }

      console.log('Processed salaries:', salaries);
      console.log('Total salary records:', salaries.length);

      // Enrich with employee names
      const enrichedSalaries = salaries.map((salary: any) => {
        const employeeId = salary.employeeId || (salary.employee && (salary.employee.id || salary.employee._id));
        const empMapData = employeeId ? employeeMap[String(employeeId)] : null;
        const emp = salary.employee || empMapData || {};

        const employeeNumber = salary.employee?.employeeNumber || salary.employeeNumber || empMapData?.displayNumber || 'N/A';
        const employeeName = salary.employeeName ||
          emp.fullName ||
          emp.name ||
          (emp.firstName || emp.lastName ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : "") ||
          empMapData?.displayName ||
          'Unknown';

        // Extract month and year from payPeriodStart or createdAt
        const dateSource = salary.payPeriodStart || salary.createdAt || new Date();
        const date = new Date(dateSource);
        const basicSalary = parseFloat(salary.basicSalary || salary.basic_salary || emp.basicSalary || 0);
        let allowances = parseFloat(salary.allowances || salary.totalAllowances || salary.total_allowances || 0);
        let deductions = parseFloat(salary.deductions || salary.totalDeductions || salary.total_deductions || 0);

        // Fallback parsing if zeros
        if (allowances === 0 && emp.allowances) {
          const data = emp.allowances;
          if (Array.isArray(data)) {
            data.forEach((i: any) => {
              const v = Number(i.value || i.amount || 0);
              allowances += (i.type === 'percentage') ? (basicSalary * v / 100) : v;
            });
          } else if (typeof data === "object") {
            Object.values(data).forEach((val: any) => {
              if (val && val.enabled) {
                const amount = val.amount || (basicSalary * val.percentage) / 100 || 0;
                allowances += amount;
              }
            });
          }
        }

        if (deductions === 0 && emp.deductions) {
          const data = emp.deductions;
          if (Array.isArray(data)) {
            data.forEach((i: any) => {
              const v = Number(i.value || i.amount || 0);
              deductions += (i.type === 'percentage') ? (basicSalary * v / 100) : v;
            });
          } else if (typeof data === "object") {
            Object.values(data).forEach((val: any) => {
              if (val && val.enabled) {
                const amount = val.amount || (basicSalary * val.percentage) / 100 || 0;
                deductions += amount;
              }
            });
          }
        }

        const overtimeAmount = parseFloat(salary.overtimeAmount || salary.overtime_amount || salary.overtimePay || 0);
        const netSalary = basicSalary + allowances + overtimeAmount - deductions;

        return {
          id: salary.id,
          employeeId: salary.employeeId,
          employeeNumber: employeeNumber,
          employeeName: employeeName,
          month: salary.month || date.getMonth() + 1,
          year: salary.year || date.getFullYear(),
          basicSalary,
          allowances,
          overtimeAmount,
          deductions,
          netSalary,
          status: salary.status || 'unpaid',
          paidDate: salary.paidDate,
          createdAt: salary.createdAt
        } as SalaryRecord;
      });

      setSalaryData(enrichedSalaries);

      if (enrichedSalaries.length === 0) {
        console.warn('No salary records found');
      }
    } catch (err: any) {
      console.error('Error fetching salary data:', err);

      let errorMessage = "Failed to fetch salary report";
      if (err.response?.status === 404) {
        errorMessage = "Salary endpoint not found. Please check if the salary route is properly configured in your backend.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setSalaryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchEmployees();
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId && Object.keys(employeeMap).length > 0) {
      fetchSalaryData();
    } else if (organizationId) {
      fetchSalaryData();
    }
  }, [organizationId, employeeMap]);

  const handleBack = () => {
    window.history.back();
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecords(new Set());
    } else {
      const allIds = new Set(filteredSalaries.map((_, index) => index));
      setSelectedRecords(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRecord = (index: number) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRecords(newSelected);
    setSelectAll(newSelected.size === filteredSalaries.length);
  };

  const handleCancelSelection = () => {
    setSelectedRecords(new Set());
    setSelectAll(false);
  };

  const handleClearFilters = () => {
    setFilterStatus("");
    setFilterMonth("");
    setFilterYear("");
    setShowFilters(false);
  };

  const getMonthName = (month: number): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || 'Unknown';
  };

  const filteredSalaries = salaryData.filter((salary) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (salary.employeeName?.toLowerCase() || "").includes(term) ||
      salary.employeeId.toLowerCase().includes(term) ||
      getMonthName(salary.month).toLowerCase().includes(term) ||
      salary.year.toString().includes(term);

    const matchesStatus = !filterStatus || salary.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesMonth = !filterMonth || salary.month.toString() === filterMonth;
    const matchesYear = !filterYear || salary.year.toString() === filterYear;

    return matchesSearch && matchesStatus && matchesMonth && matchesYear;
  });

  const handleExportPDF = () => {
    const dataToExport = selectedRecords.size === 0
      ? filteredSalaries
      : Array.from(selectedRecords).map(index => filteredSalaries[index]);

    if (!dataToExport || dataToExport.length === 0) {
      showAlert("Info", "No records to export", "info");
      setShowExportDropdown(false);
      return;
    }

    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Salary Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Records: ${dataToExport.length}`, 14, 36);

      const tableData = dataToExport.map(record => {
        const gross = record.basicSalary + (record.allowances || 0) + (record.overtimeAmount || 0);
        const net = gross - (record.deductions || 0);
        return [
          record.employeeNumber || 'N/A',
          record.employeeName || 'N/A',
          `${getMonthName(record.month)} ${record.year}`,
          `AED ${record.basicSalary.toFixed(2)}`,
          `${(record.allowances || 0).toFixed(2)}`,
          `${(record.overtimeAmount || 0).toFixed(2)}`,
          `${gross.toFixed(2)}`,
          `${(record.deductions || 0).toFixed(2)}`,
          `AED ${net.toFixed(2)}`,
          record.status.charAt(0).toUpperCase() + record.status.slice(1)
        ];
      });

      autoTable(doc, {
        startY: 45,
        head: [['EMP ID', 'Employee', 'Period', 'Basic', 'Allowances', 'Overtime', 'Gross Salary', 'Deductions', 'Net Salary', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 25 },
          7: { cellWidth: 25 }
        }
      });

      doc.save(`salary-report-${new Date().toISOString().split('T')[0]}.pdf`);
      showAlert("Success", `Exported ${dataToExport.length} records to PDF.`, "success");
    } catch (err) {
      console.error('Error generating PDF:', err);
      showAlert("Error", "Failed to generate PDF", "error");
    } finally {
      setShowExportDropdown(false);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = selectedRecords.size === 0
      ? filteredSalaries
      : Array.from(selectedRecords).map(index => filteredSalaries[index]);

    if (dataToExport.length === 0) {
      showAlert("Info", "No records to export", "info");
      setShowExportDropdown(false);
      return;
    }

    const headers = ['Employee ID', 'Employee Name', 'Period', 'Basic Salary', 'Allowances', 'Overtime', 'Gross Salary', 'Deductions', 'Net Salary', 'Status'];
    const csvRows = [headers.join(',')];

    dataToExport.forEach(record => {
      const gross = record.basicSalary + (record.allowances || 0) + (record.overtimeAmount || 0);
      const net = gross - (record.deductions || 0);
      const row = [
        `"${record.employeeNumber || 'N/A'}"`,
        `"${record.employeeName || 'N/A'}"`,
        `"${getMonthName(record.month)} ${record.year}"`,
        `"${record.basicSalary.toFixed(2)}"`,
        `"${(record.allowances || 0).toFixed(2)}"`,
        `"${(record.overtimeAmount || 0).toFixed(2)}"`,
        `"${gross.toFixed(2)}"`,
        `"${(record.deductions || 0).toFixed(2)}"`,
        `"${net.toFixed(2)}"`,
        `"${record.status.charAt(0).toUpperCase() + record.status.slice(1)}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showAlert("Success", `Exported ${dataToExport.length} records to Excel (CSV format).`, "success");
    setShowExportDropdown(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const uniqueMonths = Array.from(new Set(salaryData.map(s => s.month))).sort((a, b) => a - b);
  const uniqueYears = Array.from(new Set(salaryData.map(s => s.year))).sort((a, b) => b - a);

  return (
    <div className="min-h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8">
        <div className="w-full mx-auto max-w-full">
          {/* Header */}
          <div className="mb-4 sm:mb-5 md:mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 mb-2 sm:mb-3 md:mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
              Salary Report
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500">
              View and download salary reports, payroll summaries, and compensation analysis
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by employee name, ID, month, year..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors flex-shrink-0"
                >
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Filters</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    disabled={filteredSalaries.length === 0}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Export</span>
                  </button>

                  {showExportDropdown && (
                    <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={handleExportPDF}
                        className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 text-left text-sm sm:text-base text-gray-700 font-medium transition-colors rounded-t-lg border-b border-gray-100"
                      >
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                        <span className="truncate">Export as PDF</span>
                      </button>
                      <button
                        onClick={handleExportExcel}
                        className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 text-left text-sm sm:text-base text-gray-700 font-medium transition-colors rounded-b-lg"
                      >
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                        <span className="truncate">Export as Excel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Statuses</option>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Months</option>
                      {uniqueMonths.map((month) => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Years</option>
                      {uniqueYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-2 sm:mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {showExportDropdown && (
            <div
              className="fixed inset-0 z-0"
              onClick={() => setShowExportDropdown(false)}
            />
          )}

          {selectedRecords.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 sm:gap-3">
              <p className="text-xs sm:text-sm font-medium text-blue-900">
                {selectedRecords.size} record{selectedRecords.size !== 1 ? 's' : ''} selected
              </p>
              <button
                onClick={handleCancelSelection}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors w-full xs:w-auto"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Cancel Selection
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base">
              <p className="font-medium">Error: {error}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto w-full">
              <div className="min-w-[1000px] sm:min-w-0">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          disabled={filteredSalaries.length === 0}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        EMP ID
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Employee
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Period
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Basic
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Allow.
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        O/T
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-slate-50">
                        Gross
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Deduct.
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-blue-50/50">
                        Net
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={11} className="px-2 sm:px-3 md:px-4 lg:px-6 py-8 sm:py-10 md:py-12 text-center text-gray-500">
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                            <span className="text-sm sm:text-base">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredSalaries.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-2 sm:px-3 md:px-4 lg:px-6 py-8 sm:py-10 md:py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 text-gray-400" />
                            <p className="text-base sm:text-lg md:text-lg font-medium">No salary records found</p>
                            <p className="text-xs sm:text-sm md:text-sm mt-1">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredSalaries.map((salary, index) => (
                        <tr
                          key={salary.id}
                          className={`hover:bg-gray-50 transition-colors ${selectedRecords.has(index) ? 'bg-blue-50' : ''
                            }`}
                        >
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedRecords.has(index)}
                              onChange={() => handleSelectRecord(index)}
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-medium truncate max-w-[60px] sm:max-w-[80px] md:max-w-none">
                            {salary.employeeNumber || "N/A"}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
                            {salary.employeeName || "N/A"}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {getMonthName(salary.month)} {salary.year}
                          </td>
                          {(() => {
                            const gross = salary.basicSalary + (salary.allowances || 0) + (salary.overtimeAmount || 0);
                            const net = gross - (salary.deductions || 0);
                            return (
                              <>
                                <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-semibold">
                                  {salary.basicSalary.toLocaleString()}
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-green-600 font-medium">
                                  {(salary.allowances || 0).toLocaleString()}
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-blue-600 font-medium">
                                  {(salary.overtimeAmount || 0).toLocaleString()}
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-bold bg-slate-50">
                                  {gross.toLocaleString()}
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-red-600 font-medium">
                                  {(salary.deductions || 0).toLocaleString()}
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-blue-600 bg-blue-50/50">
                                  {net.toLocaleString()}
                                </td>
                              </>
                            );
                          })()}
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                            <span
                              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                salary.status
                              )}`}
                            >
                              {salary.status.charAt(0).toUpperCase() + salary.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {!loading && filteredSalaries.length > 0 && (
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 text-center">
              Showing {filteredSalaries.length} of {salaryData.length} records
            </div>
          )}
        </div>

        <CustomAlertDialog
          open={alertState.open}
          onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}
          title={alertState.title}
          description={alertState.description}
          variant={alertState.variant}
        />
      </div>
    </div>
  );
}