"use client";

import { useState, useEffect } from "react";
import { Download, Search, X, Filter, ArrowLeft } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from "next/navigation";
import { getOrgId } from '@/lib/auth';
import { CustomAlertDialog } from '@/components/ui/custom-dialogs';
import attendanceService from '@/lib/attendanceService';
import { format, isSameDay, parse } from 'date-fns';

export default function AttendanceReportPage() {
  const organizationId = getOrgId();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [employeeMap, setEmployeeMap] = useState<{ [key: string]: any }>({});
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Selection states
  const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Export dropdown state
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Alert State
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

  const fetchEmployees = async () => {
    if (!organizationId) return;
    try {
      const { getApiUrl, getAuthToken } = await import('@/lib/auth');
      const apiUrl = getApiUrl();
      const token = getAuthToken();
      const axios = (await import('axios')).default;
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

  // Fetch data using the existing attendanceService
  const fetchData = async () => {
    if (!organizationId) {
      setError("Organization ID not found. Please log in again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await attendanceService.searchAttendance(
        organizationId,
        searchQuery || undefined,
        startDate || undefined,
        endDate || undefined
      );

      console.log('API response:', result);
      console.log('Is array?:', Array.isArray(result));
      console.log('result type:', typeof result);

      // Handle if result is directly an array
      if (Array.isArray(result)) {
        console.log('Direct array, length:', result.length);
        setAttendanceData(result);
        setSelectedRecords(new Set());
        setSelectAll(false);
        return;
      }

      // Handle if result is an object with success/error properties
      if (result && typeof result === 'object') {
        if (result.error || result.success === false) {
          setError(result.error || 'Failed to fetch attendance data');
          setAttendanceData([]);
          return;
        }

        // Extract data from response - handle multiple possible structures
        let data: any[] = [];
        const responseData: any = result.data || result;

        if (Array.isArray(responseData)) {
          data = responseData;
        } else if (responseData && typeof responseData === 'object') {
          // Check for nested array properties
          if (Array.isArray(responseData.records)) {
            data = responseData.records;
          } else if (Array.isArray(responseData.attendance)) {
            data = responseData.attendance;
          } else if (Array.isArray(responseData.items)) {
            data = responseData.items;
          } else if (Array.isArray(responseData.data)) {
            data = responseData.data;
          } else {
            // Single object response
            data = [responseData];
          }
        }

        console.log('Extracted data:', data);
        console.log('Data length:', data.length);
        setAttendanceData(data);
        setSelectedRecords(new Set());
        setSelectAll(false);
      } else {
        setError('Invalid response format from server');
        setAttendanceData([]);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'An unexpected error occurred');
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // Live search effect - triggers whenever search parameters change
  useEffect(() => {
    if (organizationId) {
      fetchEmployees();
    }
  }, [organizationId]);

  // Live search effect - triggers whenever search parameters change
  useEffect(() => {
    if (!organizationId) return;

    const debounceTimer = setTimeout(() => {
      fetchData();
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [organizationId, searchQuery, startDate, endDate, employeeMap]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecords(new Set());
    } else {
      const allIds = new Set(attendanceData.map((_, index) => index));
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
    setSelectAll(newSelected.size === attendanceData.length);
  };

  const formatDateTime = (dateTimeString: string | undefined) => {
    if (!dateTimeString) return 'N/A';
    try {
      return format(new Date(dateTimeString), 'hh:mm a');
    } catch {
      return dateTimeString || 'N/A';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = dateString.includes('T') ? new Date(dateString) : parse(dateString, 'yyyy-MM-dd', new Date());
      return format(date, 'yyyy-MM-dd');
    } catch {
      return dateString;
    }
  };

  const calculateStatus = (record: any) => {
    const rawStatus = record.status?.toLowerCase();
    const hasCheckedIn = !!(record.checkInTime || record.checkIn);
    const hasCheckedOut = !!(record.checkOutTime || record.checkOut);

    // Determine the date string for this record
    let recordDateStr = '';
    if (record.date) {
      if (typeof record.date === 'string' && record.date.includes('T')) {
        recordDateStr = format(new Date(record.date), 'yyyy-MM-dd');
      } else {
        recordDateStr = record.date;
      }
    }

    const isToday = recordDateStr ? isSameDay(new Date(), parse(recordDateStr, 'yyyy-MM-dd', new Date())) : false;

    let status = 'Absent';
    if (hasCheckedIn) {
      if (hasCheckedOut) {
        status = 'Present';
        if (rawStatus === 'late') status = 'Late';
      } else {
        status = isToday ? 'Present' : 'Absent';
      }
    } else {
      if (rawStatus === 'late') status = 'Late';
      else if (rawStatus === 'present') status = 'Present';
    }

    if (rawStatus === 'holiday') status = 'Holiday';
    else if (rawStatus === 'leave') status = 'Leave';
    else if (rawStatus === 'weekend') status = 'Weekend';
    else if (rawStatus === 'absent') status = 'Absent';

    return status;
  };

  const handleExportPDF = () => {
    // If no record selected, export all visible data
    const selectedData = selectedRecords.size === 0 ? attendanceData : Array.from(selectedRecords).map(index => attendanceData[index]);

    if (!selectedData || selectedData.length === 0) {
      showAlert("Info", "No records to export", "info");
      setShowExportDropdown(false);
      return;
    }

    try {
      const doc = new jsPDF();

      // Title and metadata
      doc.setFontSize(18);
      doc.text('Attendance Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Records: ${selectedData.length}`, 14, 36);

      // Table body
      autoTable(doc, {
        startY: 45,
        head: [['Employee ID', 'Employee Name', 'Date', 'Check In', 'Check Out', 'Hours', 'Status']],
        body: selectedData.map(record => [
          record.employeeNumber || record.employee?.employeeNumber || 'N/A',
          record.employeeName || record.employee?.fullName || record.employee?.name || 'N/A',
          formatDate(record.date),
          record.checkInTime ? formatDateTime(record.checkInTime) : (record.checkIn || 'N/A'),
          record.checkOutTime ? formatDateTime(record.checkOutTime) : (record.checkOut || 'N/A'),
          record.totalHours ? `${record.totalHours}h` : (record.hoursWorked || 'N/A'),
          calculateStatus(record)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 15 },
          5: { cellWidth: 25 }
        }
      });

      // Save PDF (will trigger download)
      doc.save(`attendance-report-${new Date().toISOString().split('T')[0]}.pdf`);
      showAlert("Success", `Exported ${selectedData.length} records to PDF.`, "success");
    } catch (err) {
      console.error('Error generating PDF:', err);
      showAlert("Error", "Failed to generate PDF", "error");
    } finally {
      setShowExportDropdown(false);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = selectedRecords.size === 0
      ? attendanceData
      : Array.from(selectedRecords).map(index => attendanceData[index]);

    if (dataToExport.length === 0) {
      showAlert("Info", "No records to export", "info");
      setShowExportDropdown(false);
      return;
    }

    // Create CSV content with wider headers
    const headers = ['Employee ID', 'Employee Name', 'Date', 'Check In Time', 'Check Out Time', 'Hours Worked', 'Status'];
    const csvRows = [headers.join(',')];

    dataToExport.forEach(record => {
      const employeeId = record.employeeNumber || record.employee?.employeeNumber || 'N/A';
      const employeeName = record.employeeName || record.employee?.fullName || record.employee?.name || 'N/A';
      const date = formatDate(record.date);
      const checkIn = (record.checkInTime ? formatDateTime(record.checkInTime) : (record.checkIn || 'N/A')).toString();
      const checkOut = (record.checkOutTime ? formatDateTime(record.checkOutTime) : (record.checkOut || 'N/A')).toString();
      const hours = record.totalHours ? `${record.totalHours}h` : (record.hoursWorked || 'N/A');
      const status = calculateStatus(record);

      const row = [
        `"${employeeId}"`,
        `"${employeeName}"`,
        `"${date}"`,
        `"${checkIn}"`,
        `"${checkOut}"`,
        `"${hours}"`,
        `"${status}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showAlert("Success", `Exported ${dataToExport.length} records to Excel (CSV format).`, "success");
    setShowExportDropdown(false);
  };

  const handleCancelSelection = () => {
    setSelectedRecords(new Set());
    setSelectAll(false);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setShowFilters(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "Late":
        return "bg-yellow-100 text-yellow-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "Leave":
        return "bg-blue-100 text-blue-800";
      case "Weekend":
        return "bg-gray-100 text-gray-800";
      case "Holiday":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8">
        <div className="w-full mx-auto max-w-full">
          {/* Header */}
          <div className="mb-4 sm:mb-5 md:mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 mb-2 sm:mb-3 md:mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
              Attendance Report
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500">
              Search and export attendance records
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by employee ID, name, or status..."
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {loading && (
                  <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
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
                    disabled={attendanceData.length === 0}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Export</span>
                  </button>

                  {showExportDropdown && (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Filters Dropdown */}
            {showFilters && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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

          {/* Click outside to close dropdown */}
          {showExportDropdown && (
            <div
              className="fixed inset-0 z-0"
              onClick={() => setShowExportDropdown(false)}
            />
          )}

          {/* Selection Actions */}
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base">
              <p className="font-medium">Error: {error}</p>
            </div>
          )}

          {/* Data Table - Responsive Container */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto w-full">
              <div className="min-w-[600px] sm:min-w-0">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          disabled={attendanceData.length === 0}
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
                        Date
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Check In
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Check Out
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Hours
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-2 sm:px-3 md:px-4 lg:px-6 py-8 sm:py-10 md:py-12 text-center text-gray-500">
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                            <span className="text-sm sm:text-base">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : attendanceData.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-2 sm:px-3 md:px-4 lg:px-6 py-8 sm:py-10 md:py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <Search className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 text-gray-400" />
                            <p className="text-base sm:text-lg md:text-lg font-medium">No attendance records found</p>
                            <p className="text-xs sm:text-sm md:text-sm mt-1">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      attendanceData.map((record, index) => (
                        <tr
                          key={record.id || index}
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
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-bold truncate max-w-[60px] sm:max-w-[80px] md:max-w-none">
                            {record.employeeNumber || record.employee?.employeeNumber || employeeMap[String(record.employeeId)]?.displayNumber || "N/A"}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
                            {record.employeeName || record.employee?.fullName || record.employee?.name || employeeMap[String(record.employeeId)]?.displayName || record.employeeId || "N/A"}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {record.checkInTime ? formatDateTime(record.checkInTime) : (record.checkIn || "N/A")}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {record.checkOutTime ? formatDateTime(record.checkOutTime) : (record.checkOut || "N/A")}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {record.totalHours ? `${record.totalHours}h` : record.hoursWorked || "N/A"}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                calculateStatus(record)
                              )}`}
                            >
                              {calculateStatus(record)}
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

          {/* Results Count */}
          {!loading && attendanceData.length > 0 && (
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 text-center">
              Showing {attendanceData.length} result{attendanceData.length !== 1 ? 's' : ''}
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