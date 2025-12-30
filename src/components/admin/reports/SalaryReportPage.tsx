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
  employeeName?: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances?: number;
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
  const [employeeMap, setEmployeeMap] = useState<{ [key: string]: string }>({});

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
      const mapping: { [key: string]: string } = {};
      employees.forEach((emp: any) => {
        const fullName = emp.fullName ||
          `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
          emp.name ||
          emp.email ||
          'Unknown';
        mapping[emp.id] = fullName;
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

      // Fetch all sal.ary records - FIXED ENDPOINT
      const response = await axios.get(`${apiUrl}/org/${organizationId}/salaries`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: 1,
          limit: 1000 // Get all records
        }
      });

      console.log('API Response:', response.data);
      console.log('Response structure:', {
        isArray: Array.isArray(response.data),
        hasData: 'data' in response.data,
        hasRecords: 'records' in response.data,
        keys: Object.keys(response.data),
        fullResponse: JSON.stringify(response.data, null, 2)
      });

      let data = response.data;

      // Handle different response structures based on API documentation
      // Expected structure: { data: [...], total: number, page: number, limit: number, totalPages: number }
      let salaries = [];

      if (data && typeof data === 'object') {
        if ('data' in data && Array.isArray(data.data)) {
          // Paginated response structure
          salaries = data.data;
          console.log('Found paginated data:', data);
        } else if ('records' in data && Array.isArray(data.records)) {
          // Alternative records structure
          salaries = data.records;
        } else if (Array.isArray(data)) {
          // Direct array response
          salaries = data;
        }
      } else if (Array.isArray(data)) {
        salaries = data;
      }

      console.log('Processed salaries:', salaries);
      console.log('Total salary records:', salaries.length);

      // Enrich with employee names
      const enrichedSalaries = salaries.map((salary: any) => {
        const employeeName = salary.employeeName ||
          (salary.employee && (salary.employee.fullName || salary.employee.name || `${salary.employee.firstName || ''} ${salary.employee.lastName || ''}`.trim())) ||
          employeeMap[salary.employeeId] ||
          'Unknown';

        // Extract month and year from payPeriodStart or createdAt
        const dateSource = salary.payPeriodStart || salary.createdAt || new Date();
        const date = new Date(dateSource);

        return {
          id: salary.id,
          employeeId: salary.employeeId,
          employeeName: employeeName,
          month: salary.month || date.getMonth() + 1,
          year: salary.year || date.getFullYear(),
          basicSalary: parseFloat(salary.basicSalary || salary.grossSalary || 0),
          allowances: parseFloat(salary.allowances || 0),
          deductions: parseFloat(salary.deductions || salary.totalDeductions || 0),
          netSalary: parseFloat(salary.netSalary || 0),
          status: salary.status || 'unpaid',
          paidDate: salary.paidDate,
          createdAt: salary.createdAt
        } as SalaryRecord;
      });

      console.log('Enriched salaries sample:', enrichedSalaries[0]);

      setSalaryData(enrichedSalaries);

      if (enrichedSalaries.length === 0) {
        console.warn('No salary records found');
      }
    } catch (err: any) {
      console.error('Error fetching salary data:', err);
      console.error('Error response:', err.response);

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

      const tableData = dataToExport.map(record => [
        record.employeeName || 'N/A',
        `${getMonthName(record.month)} ${record.year}`,
        `$${record.basicSalary.toFixed(2)}`,
        `$${(record.allowances || 0).toFixed(2)}`,
        `$${(record.deductions || 0).toFixed(2)}`,
        `$${record.netSalary.toFixed(2)}`,
        record.status.charAt(0).toUpperCase() + record.status.slice(1)
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Employee', 'Period', 'Basic', 'Allowances', 'Deductions', 'Net Salary', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 20 }
        }
      });

      doc.save(`salary-report-${new Date().toISOString().split('T')[0]}.pdf`);
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

    const headers = ['Employee Name', 'Period', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status'];
    const csvRows = [headers.join(',')];

    dataToExport.forEach(record => {
      const row = [
        `"${record.employeeName || 'N/A'}"`,
        `"${getMonthName(record.month)} ${record.year}"`,
        `"${record.basicSalary.toFixed(2)}"`,
        `"${(record.allowances || 0).toFixed(2)}"`,
        `"${(record.deductions || 0).toFixed(2)}"`,
        `"${record.netSalary.toFixed(2)}"`,
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Salary Report
          </h1>
          <p className="text-sm md:text-base text-gray-500">
            View and download salary reports, payroll summaries, and compensation analysis
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name, ID, month, year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Months</option>
                    {uniqueMonths.map((month) => (
                      <option key={month} value={month}>
                        {getMonthName(month)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedRecords.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900">
              {selectedRecords.size} record{selectedRecords.size !== 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelSelection}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>

                {showExportDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleExportPDF}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-gray-700 font-medium transition-colors rounded-t-lg border-b border-gray-100"
                    >
                      <Download className="w-4 h-4 text-red-600" />
                      Export as PDF
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-gray-700 font-medium transition-colors rounded-b-lg"
                    >
                      <Download className="w-4 h-4 text-green-600" />
                      Export as Excel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showExportDropdown && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowExportDropdown(false)}
          />
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      disabled={filteredSalaries.length === 0}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Basic Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allowances
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSalaries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">No salary records found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredSalaries.map((salary, index) => (
                    <tr
                      key={salary.id}
                      className={`hover:bg-gray-50 transition-colors ${selectedRecords.has(index) ? 'bg-blue-50' : ''
                        }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRecords.has(index)}
                          onChange={() => handleSelectRecord(index)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {salary.employeeName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getMonthName(salary.month)} {salary.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${salary.basicSalary.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(salary.allowances || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        ${(salary.deductions || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${salary.netSalary.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
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

        {!loading && filteredSalaries.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
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
  );
}