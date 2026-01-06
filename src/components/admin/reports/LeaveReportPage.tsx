"use client";

import { useState, useEffect } from "react";
import { Search, ArrowLeft, Download, X, Filter } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import { CustomAlertDialog } from '@/components/ui/custom-dialogs';

export interface LeaveRecord {
  id: string;
  employeeName?: string;
  employeeId?: string;
  leaveTypeCode: string;
  leaveType?: string;
  startDate: string;
  endDate: string;
  totalDays?: number;
  days?: number;
  status: string;
  reason?: string;
}

export default function LeaveReportPage() {
  const organizationId = getOrgId();
  const [leaveData, setLeaveData] = useState<LeaveRecord[]>([]);
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
  const [filterLeaveType, setFilterLeaveType] = useState("");

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

  // Helper function to calculate days between two dates
  const calculateDays = (startDate: string, endDate: string): number => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 1;
    } catch (error) {
      return 1;
    }
  };

  // Fetch leave data
  const fetchLeaveData = async () => {
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

      // Use the same endpoint as LeaveTracker
      const response = await axios.get(`${apiUrl}/org/${organizationId}/leaves/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('API Response:', response.data);

      // Handle different response structures
      let data = response.data;

      // If response has a data property, use that
      if (data && typeof data === 'object' && 'data' in data) {
        data = data.data;
      }

      // Ensure we have an array
      const leaves = Array.isArray(data) ? data : [];

      console.log('Processed leaves:', leaves);

      // Transform and enrich the data
      const enrichedLeaves = leaves.map((leave: any) => {
        const employeeId = leave.employeeId || leave.employee?.id;
        const employeeName = leave.employeeName ||
          (leave.employee && (leave.employee.fullName || leave.employee.name || `${leave.employee.firstName || ''} ${leave.employee.lastName || ''}`.trim())) ||
          employeeMap[employeeId] ||
          'Unknown';

        // Calculate days if not present
        const days = leave.totalDays || leave.days || calculateDays(leave.startDate, leave.endDate);

        return {
          id: leave.id,
          employeeId: employeeId,
          employeeName: employeeName,
          leaveTypeCode: leave.leaveTypeCode || leave.leaveType || 'Unknown',
          startDate: leave.startDate,
          endDate: leave.endDate,
          totalDays: days,
          status: leave.status || 'pending',
          reason: leave.reason || ''
        } as LeaveRecord;
      });

      setLeaveData(enrichedLeaves);

      if (enrichedLeaves.length === 0) {
        console.warn('No leave records found after processing');
      }
    } catch (err: any) {
      console.error('Error fetching leave data:', err);
      setError(err.response?.data?.error || err.message || "Failed to fetch leave report");
      setLeaveData([]);
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
      fetchLeaveData();
    } else if (organizationId) {
      // Fetch anyway if no employees (might be a small org or data issue)
      fetchLeaveData();
    }
  }, [organizationId, employeeMap]);

  const handleBack = () => {
    window.history.back();
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecords(new Set());
    } else {
      const allIds = new Set(filteredLeaves.map((_, index) => index));
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
    setSelectAll(newSelected.size === filteredLeaves.length);
  };

  const handleCancelSelection = () => {
    setSelectedRecords(new Set());
    setSelectAll(false);
  };

  const handleClearFilters = () => {
    setFilterStatus("");
    setFilterLeaveType("");
    setShowFilters(false);
  };

  const filteredLeaves = leaveData.filter((leave) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (leave.employeeName?.toLowerCase() || "").includes(term) ||
      leave.leaveTypeCode.toLowerCase().includes(term) ||
      (leave.status?.toLowerCase() || "").includes(term) ||
      (leave.reason?.toLowerCase() || "").includes(term);

    const matchesStatus = !filterStatus || leave.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesLeaveType = !filterLeaveType || leave.leaveTypeCode === filterLeaveType;

    return matchesSearch && matchesStatus && matchesLeaveType;
  });

  const handleExportPDF = () => {
    const dataToExport = selectedRecords.size === 0
      ? filteredLeaves
      : Array.from(selectedRecords).map(index => filteredLeaves[index]);

    if (!dataToExport || dataToExport.length === 0) {
      showAlert("Info", "No records to export", "info");
      setShowExportDropdown(false);
      return;
    }

    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Leave Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Records: ${dataToExport.length}`, 14, 36);

      const tableData = dataToExport.map(record => [
        record.employeeName || 'N/A',
        record.leaveTypeCode,
        new Date(record.startDate).toLocaleDateString(),
        new Date(record.endDate).toLocaleDateString(),
        (record.totalDays || 0).toString(),
        record.status,
        record.reason || '-'
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Employee', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reason']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 15 },
          5: { cellWidth: 20 },
          6: { cellWidth: 35 }
        }
      });

      doc.save(`leave-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
      ? filteredLeaves
      : Array.from(selectedRecords).map(index => filteredLeaves[index]);

    if (dataToExport.length === 0) {
      showAlert("Info", "No records to export", "info");
      setShowExportDropdown(false);
      return;
    }

    const headers = ['Employee', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reason'];
    const csvRows = [headers.join(',')];

    dataToExport.forEach(record => {
      const row = [
        `"${record.employeeName || 'N/A'}"`,
        `"${record.leaveTypeCode}"`,
        `"${new Date(record.startDate).toLocaleDateString()}"`,
        `"${new Date(record.endDate).toLocaleDateString()}"`,
        `"${record.totalDays || 0}"`,
        `"${record.status}"`,
        `"${record.reason || '-'}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showAlert("Success", `Exported ${dataToExport.length} records to Excel (CSV format).`, "success");
    setShowExportDropdown(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const uniqueLeaveTypes = Array.from(new Set(leaveData.map(l => l.leaveTypeCode)));

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
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
              Leave Report
            </h1>
            <p className="text-sm md:text-base text-gray-500">
              Monitor leave balances, absences, and time-off patterns
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by employee, type, status, reason..."
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
              <div className="relative">
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  disabled={filteredLeaves.length === 0}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Leave Type
                    </label>
                    <select
                      value={filterLeaveType}
                      onChange={(e) => setFilterLeaveType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Types</option>
                      {uniqueLeaveTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
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
              <button
                onClick={handleCancelSelection}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel Selection
              </button>
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
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        disabled={filteredLeaves.length === 0}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
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
                  ) : filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-lg font-medium">No leave records found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((leave, index) => (
                      <tr
                        key={leave.id}
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
                          {leave.employeeName || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {leave.leaveTypeCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(leave.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {leave.totalDays || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              leave.status
                            )}`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {leave.reason || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && filteredLeaves.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing {filteredLeaves.length} of {leaveData.length} records
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