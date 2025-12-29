"use client";

import { useState, useEffect } from "react";
import { Download, Search, X, Filter, ArrowLeft } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from "next/navigation";
import { getOrgId } from '@/lib/auth';
import attendanceService from '@/lib/attendanceService';

export default function AttendanceReportPage() {
  const organizationId = getOrgId();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
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
    if (!organizationId) return;

    const debounceTimer = setTimeout(() => {
      fetchData();
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [organizationId, searchQuery, startDate, endDate]);

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
    if (!dateTimeString) return '—';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateTimeString;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      if (dateString.includes('T')) {
        return new Date(dateString).toLocaleDateString();
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const handleExportPDF = () => {
    // If no record selected, export all visible data
    const selectedData = selectedRecords.size === 0 ? attendanceData : Array.from(selectedRecords).map(index => attendanceData[index]);

    if (!selectedData || selectedData.length === 0) {
      // Nothing to export
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
      const tableData = selectedData.map(record => [
        record.employeeName || record.employee?.fullName || record.employee?.name || record.employeeId || 'N/A',
        formatDate(record.date),
        formatDateTime(record.checkInTime) || record.checkIn || '—',
        formatDateTime(record.checkOutTime) || record.checkOut || '—',
        record.totalHours ? `${record.totalHours}h` : (record.hoursWorked || '—'),
        record.status || 'Unknown'
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Employee', 'Date', 'Check In', 'Check Out', 'Hours', 'Status']],
        body: tableData,
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
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setShowExportDropdown(false);
    }
  };

  const handleExportExcel = () => {
    if (selectedRecords.size === 0) {
      alert("Please select at least one record to export");
      return;
    }

    const selectedData = Array.from(selectedRecords).map(index => attendanceData[index]);

    // Create CSV content
    const headers = ['Employee', 'Date', 'Check In', 'Check Out', 'Hours', 'Status'];
    const csvRows = [headers.join(',')];

    selectedData.forEach(record => {
      const employeeName = record.employeeName || record.employee?.fullName || record.employee?.name || record.employeeId || 'N/A';
      const date = formatDate(record.date);
      const checkIn = formatDateTime(record.checkInTime) || record.checkIn || '—';
      const checkOut = formatDateTime(record.checkOutTime) || record.checkOut || '—';
      const hours = record.totalHours ? `${record.totalHours}h` : (record.hoursWorked || '—');
      const status = record.status || 'Unknown';

      const row = [
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

    alert(`Exported ${selectedData.length} records to Excel (CSV format).`);
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
    switch (status?.toLowerCase()) {
      case "present":
        return "bg-green-100 text-green-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "leave":
        return "bg-blue-100 text-blue-800";
      case "weekend":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Attendance Report
          </h1>
          <p className="text-sm md:text-base text-gray-500">
            Search and export attendance records
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by employee ID, name, or status..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
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

          {/* Filters Dropdown */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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

        {/* Selection Actions */}
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

        {/* Click outside to close dropdown */}
        {showExportDropdown && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setShowExportDropdown(false)}
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Data Table */}
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
                      disabled={attendanceData.length === 0}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : attendanceData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">No attendance records found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  attendanceData.map((record, index) => (
                    <tr 
                      key={record.id || index} 
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedRecords.has(index) ? 'bg-blue-50' : ''
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
                        {record.employeeName || record.employee?.fullName || record.employee?.name || record.employeeId || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(record.checkInTime) || record.checkIn || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(record.checkOutTime) || record.checkOut || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.totalHours ? `${record.totalHours}h` : record.hoursWorked || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Count */}
        {!loading && attendanceData.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {attendanceData.length} result{attendanceData.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}