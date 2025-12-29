"use client";

import { useState, useEffect } from "react";
import { Download, Search, X, Filter } from "lucide-react";
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';

// API Service using your existing utilities
const attendanceAdminService = {
  async searchAttendance(organizationId: string, query?: string, startDate?: string, endDate?: string) {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(
        `${getApiUrl()}/org/${organizationId}/attendance/admin/search?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to search attendance');
      return await response.json();
    } catch (error: any) {
      console.error('Error:', error);
      return { error: error.message };
    }
  },
};

export default function AttendanceReportPage() {
  // Get organizationId from your auth utility
  const organizationId = getOrgId();
  
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

  // Fetch data
  const fetchData = async () => {
    if (!organizationId) {
      setError("Organization ID not found. Please log in again.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await attendanceAdminService.searchAttendance(
        organizationId,
        searchQuery,
        startDate,
        endDate
      );

      if (result.error) {
        setError(result.error);
        setAttendanceData([]);
      } else {
        const data = Array.isArray(result) ? result : (result.data || []);
        setAttendanceData(data);
        setSelectedRecords(new Set());
        setSelectAll(false);
      }
    } catch (err: any) {
      setError(err.message);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (!organizationId) {
      setError("Organization ID not found. Please log in again.");
      return;
    }
    fetchData();
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecords(new Set());
    } else {
      const allIds = new Set(attendanceData.map((_, index) => index));
      setSelectedRecords(allIds);
    }
    setSelectAll(!selectAll);
  };

  // Handle individual checkbox
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

  // Export selected records as PDF
  const handleExportPDF = () => {
    if (selectedRecords.size === 0) {
      alert("Please select at least one record to export");
      return;
    }

    const selectedData = Array.from(selectedRecords).map(index => attendanceData[index]);

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: 600; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
          .status-present { background-color: #d1fae5; color: #065f46; }
          .status-late { background-color: #fef3c7; color: #92400e; }
          .status-absent { background-color: #fee2e2; color: #991b1b; }
          .status-leave { background-color: #dbeafe; color: #1e40af; }
        </style>
      </head>
      <body>
        <h1>Attendance Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Records:</strong> ${selectedData.length}</p>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours Worked</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${selectedData.map(record => `
              <tr>
                <td>${record.employeeId || 'N/A'}</td>
                <td>${record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</td>
                <td>${record.checkIn || '—'}</td>
                <td>${record.checkOut || '—'}</td>
                <td>${record.hoursWorked || '—'}</td>
                <td><span class="status status-${(record.status || '').toLowerCase()}">${record.status || 'Unknown'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    window.URL.revokeObjectURL(url);

    // Note: For actual PDF generation, you would need a library like jsPDF or html2pdf
    alert(`Exported ${selectedData.length} records. Open the HTML file and print to PDF from your browser (Ctrl/Cmd + P).`);
  };

  // Cancel selection
  const handleCancelSelection = () => {
    setSelectedRecords(new Set());
    setSelectAll(false);
  };

  // Clear filters
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
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
                onKeyPress={handleKeyPress}
                placeholder="Search by employee ID, name, or status..."
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
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? "Searching..." : "Search"}
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
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Export as PDF
              </button>
            </div>
          </div>
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
                    Employee ID
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
                        {record.employeeId || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.date ? new Date(record.date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.checkIn || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.checkOut || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.hoursWorked || "—"}
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