"use client";

import { useState, useEffect } from "react";
import { Search, ArrowLeft, Download, X, Filter, User } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import { CustomAlertDialog } from '@/components/ui/custom-dialogs';

export interface EmployeeRecord {
  id: string;
  employeeId?: string;
  employeeNumber?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  department?: any;
  departmentId?: string;
  designation?: any;
  designationId?: string;
  location?: any;
  locationId?: string;
  dateOfJoining?: string;
  status?: string;
}

export default function EmployeeReportPage() {
  const organizationId = getOrgId();
  const [employeeData, setEmployeeData] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Alert State
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

  // Lookup maps
  const [departmentsMap, setDepartmentsMap] = useState<{ [key: string]: string }>({});
  const [designationsMap, setDesignationsMap] = useState<{ [key: string]: string }>({});
  const [locationsMap, setLocationsMap] = useState<{ [key: string]: string }>({});

  // Selection states
  const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Export dropdown state
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch lookup data
  const fetchLookups = async () => {
    if (!organizationId) return;
    try {
      const apiUrl = getApiUrl();
      const token = getAuthToken();

      const [deptRes, desigRes, locRes] = await Promise.all([
        axios.get(`${apiUrl}/org/${organizationId}/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/org/${organizationId}/designations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/org/${organizationId}/locations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Build department map
      const depts = Array.isArray(deptRes.data) ? deptRes.data : (deptRes.data.data || []);
      const deptMap: { [key: string]: string } = {};
      depts.forEach((d: any) => {
        const id = d.id || d._id || d.departmentId;
        if (id) {
          const name = d.name || d.title || d.departmentName || 'Unknown';
          deptMap[String(id)] = name;
        }
      });
      setDepartmentsMap(deptMap);

      // Build designation map
      const desigs = Array.isArray(desigRes.data) ? desigRes.data : (desigRes.data.data || []);
      const desigMap: { [key: string]: string } = {};
      desigs.forEach((d: any) => {
        const id = d.id || d._id || d.designationId;
        if (id) desigMap[String(id)] = d.name || d.title || d.designationName || 'Unknown';
      });
      setDesignationsMap(desigMap);

      // Build location map
      const locs = Array.isArray(locRes.data) ? locRes.data : (locRes.data.data || []);
      const locMap: { [key: string]: string } = {};
      locs.forEach((l: any) => {
        const id = l.id || l._id || l.locationId;
        if (id) locMap[String(id)] = l.name || l.title || l.locationName || 'Unknown';
      });
      setLocationsMap(locMap);
    } catch (error) {
      console.error('Error fetching lookups:', error);
    }
  };

  // Helper to get full name
  const getFullName = (emp: any): string => {
    if (emp.fullName) return emp.fullName;
    const first = emp.firstName || '';
    const last = emp.lastName || '';
    return `${first} ${last}`.trim() || emp.email || 'Unknown';
  };

  // Helper to resolve department name
  const getDepartmentName = (emp: any): string => {
    if (emp.department && typeof emp.department === 'object') {
      if (emp.department.name) return emp.department.name;
      if (emp.department.title) return emp.department.title;
      if (emp.department.departmentName) return emp.department.departmentName;
    }

    const deptId = emp.departmentId ||
      (typeof emp.department === 'string' ? emp.department : null) ||
      (emp.department && (emp.department.id || emp.department._id));

    if (deptId && departmentsMap[String(deptId)]) {
      return departmentsMap[String(deptId)];
    }

    if (deptId && !departmentsMap[String(deptId)]) {
      fetchMissingDepartment(String(deptId));
      return 'Loading...';
    }

    return '';
  };

  // Fetch a missing department by ID
  const fetchMissingDepartment = async (deptId: string) => {
    if (!organizationId || departmentsMap[deptId]) return;

    try {
      const apiUrl = getApiUrl();
      const token = getAuthToken();

      const response = await axios.get(`${apiUrl}/org/${organizationId}/departments/${deptId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const dept = response.data.data || response.data;
      const name = dept.name || dept.title || dept.departmentName || 'Unknown';

      setDepartmentsMap(prev => ({ ...prev, [deptId]: name }));
    } catch (error) {
      console.error(`Failed to fetch department ${deptId}:`, error);
      setDepartmentsMap(prev => ({ ...prev, [deptId]: 'Not Found' }));
    }
  };

  // Helper to resolve designation name
  const getDesignationName = (emp: any): string => {
    if (emp.designation && typeof emp.designation === 'object') {
      if (emp.designation.name) return emp.designation.name;
      if (emp.designation.title) return emp.designation.title;
      if (emp.designation.designationName) return emp.designation.designationName;
    }

    const desigId = emp.designationId ||
      (typeof emp.designation === 'string' ? emp.designation : null) ||
      (emp.designation && (emp.designation.id || emp.designation._id));

    if (desigId && designationsMap[String(desigId)]) {
      return designationsMap[String(desigId)];
    }

    return '';
  };

  // Helper to resolve location name
  const getLocationName = (emp: any): string => {
    if (emp.location && typeof emp.location === 'object') {
      if (emp.location.name) return emp.location.name;
      if (emp.location.title) return emp.location.title;
      if (emp.location.locationName) return emp.location.locationName;
    }

    const locId = emp.locationId ||
      (typeof emp.location === 'string' ? emp.location : null) ||
      (emp.location && (emp.location.id || emp.location._id));

    if (locId && locationsMap[String(locId)]) {
      return locationsMap[String(locId)];
    }

    return '';
  };

  // Helper to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  // Fetch employee data
  const fetchEmployeeData = async () => {
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

      const response = await axios.get(`${apiUrl}/org/${organizationId}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('API Response:', response.data);

      let data = response.data;

      if (data && typeof data === 'object' && 'data' in data) {
        data = data.data;
      }

      const employees = Array.isArray(data) ? data : [];

      const formattedEmployees = employees.map((emp: any) => {
        return {
          ...emp,
          id: emp.id || emp._id,
          employeeNumber: emp.employeeNumber || emp.employeeId || 'N/A',
          fullName: getFullName(emp)
        } as EmployeeRecord;
      });

      setEmployeeData(formattedEmployees);

      if (employees.length === 0) {
        console.warn('No employee records found');
      }
    } catch (err: any) {
      console.error('Error fetching employee data:', err);
      setError(err.response?.data?.error || err.message || "Failed to fetch employee data");
      setEmployeeData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchLookups();
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId && Object.keys(departmentsMap).length > 0) {
      fetchEmployeeData();
    } else if (organizationId) {
      fetchEmployeeData();
    }
  }, [organizationId, departmentsMap]);

  const handleBack = () => {
    window.history.back();
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecords(new Set());
    } else {
      const allIds = new Set(filteredEmployees.map((_, index) => index));
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
    setSelectAll(newSelected.size === filteredEmployees.length);
  };

  const handleCancelSelection = () => {
    setSelectedRecords(new Set());
    setSelectAll(false);
  };

  const handleClearFilters = () => {
    setFilterDepartment("");
    setFilterDesignation("");
    setFilterStatus("");
    setShowFilters(false);
  };

  const filteredEmployees = employeeData.filter((emp) => {
    const term = searchTerm.toLowerCase();
    const fullName = getFullName(emp).toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const phone = (emp.phoneNumber || '').toLowerCase();
    const dept = getDepartmentName(emp).toLowerCase();
    const desig = getDesignationName(emp).toLowerCase();

    const matchesSearch = fullName.includes(term) ||
      email.includes(term) ||
      phone.includes(term) ||
      dept.includes(term) ||
      desig.includes(term);

    const matchesDepartment = !filterDepartment || dept.includes(filterDepartment.toLowerCase());
    const matchesDesignation = !filterDesignation || desig.includes(filterDesignation.toLowerCase());
    const matchesStatus = !filterStatus || (emp.status || 'active').toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesDepartment && matchesDesignation && matchesStatus;
  });

  const handleExportPDF = () => {
    const dataToExport = selectedRecords.size === 0
      ? filteredEmployees
      : Array.from(selectedRecords).map(index => filteredEmployees[index]);

    if (!dataToExport || dataToExport.length === 0) {
      showAlert("Info", "No records to export", "info");
      setShowExportDropdown(false);
      return;
    }

    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Employee Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Records: ${dataToExport.length}`, 14, 36);

      const tableData = dataToExport.map(emp => [
        emp.employeeNumber || 'N/A',
        getFullName(emp),
        emp.email || 'N/A',
        emp.phoneNumber || 'N/A',
        getDepartmentName(emp) || 'N/A',
        getDesignationName(emp) || 'N/A',
        getLocationName(emp) || 'N/A',
        formatDate(emp.dateOfJoining)
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['EMP ID', 'Full Name', 'Email', 'Phone', 'Department', 'Designation', 'Location', 'Joined']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 25 }
        }
      });

      doc.save(`employee-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
      ? filteredEmployees
      : Array.from(selectedRecords).map(index => filteredEmployees[index]);

    if (dataToExport.length === 0) {
      showAlert("Info", "No records to export", "info");
      setShowExportDropdown(false);
      return;
    }

    const headers = ['Employee ID', 'Full Name', 'Email', 'Phone', 'Department', 'Designation', 'Location', 'Joined'];
    const csvRows = [headers.join(',')];

    dataToExport.forEach(emp => {
      const row = [
        `"${emp.employeeNumber || 'N/A'}"`,
        `"${getFullName(emp)}"`,
        `"${emp.email || 'N/A'}"`,
        `"${emp.phoneNumber || 'N/A'}"`,
        `"${getDepartmentName(emp) || 'N/A'}"`,
        `"${getDesignationName(emp) || 'N/A'}"`,
        `"${getLocationName(emp) || 'N/A'}"`,
        `"${formatDate(emp.dateOfJoining)}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showAlert("Success", `Exported ${dataToExport.length} records to Excel (CSV format).`, "success");
    setShowExportDropdown(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "on leave":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const uniqueDepartments = Array.from(new Set(employeeData.map(e => getDepartmentName(e)).filter(Boolean)));
  const uniqueDesignations = Array.from(new Set(employeeData.map(e => getDesignationName(e)).filter(Boolean)));

  return (
    <div className="min-h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8">
        <div className="w-full mx-auto max-w-full">
          <div className="mb-4 sm:mb-5 md:mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 mb-2 sm:mb-3 md:mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
              Employee Report
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500">
              Access employee data, demographics, and workforce analytics
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, department..."
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
                    disabled={filteredEmployees.length === 0}
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
                      Department
                    </label>
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Departments</option>
                      {uniqueDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Designation
                    </label>
                    <select
                      value={filterDesignation}
                      onChange={(e) => setFilterDesignation(e.target.value)}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Designations</option>
                      {uniqueDesignations.map((desig) => (
                        <option key={desig} value={desig}>
                          {desig}
                        </option>
                      ))}
                    </select>
                  </div>
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
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on leave">On Leave</option>
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
              <div className="min-w-[800px] sm:min-w-0">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          disabled={filteredEmployees.length === 0}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        EMP ID
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Full Name
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Email
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Phone
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Department
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Designation
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Location
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="px-2 sm:px-3 md:px-4 lg:px-6 py-8 sm:py-10 md:py-12 text-center text-gray-500">
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                            <span className="text-sm sm:text-base">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-2 sm:px-3 md:px-4 lg:px-6 py-8 sm:py-10 md:py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <User className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 text-gray-400" />
                            <p className="text-base sm:text-lg md:text-lg font-medium">No employees found</p>
                            <p className="text-xs sm:text-sm md:text-sm mt-1">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee, index) => (
                        <tr
                          key={employee.id || index}
                          className={`hover:bg-gray-50 transition-colors ${selectedRecords.has(index) ? 'bg-blue-50' : ''}`}
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
                            {employee.employeeNumber || "N/A"}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
                            {getFullName(employee)}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">
                            {employee.email || "N/A"}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {employee.phoneNumber || "—"}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
                            {getDepartmentName(employee) || "—"}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
                            {getDesignationName(employee) || "—"}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
                            {getLocationName(employee) || "—"}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {formatDate(employee.dateOfJoining)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {!loading && filteredEmployees.length > 0 && (
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 text-center">
              Showing {filteredEmployees.length} of {employeeData.length} records
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