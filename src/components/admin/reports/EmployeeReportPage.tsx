"use client";

import { useState, useEffect } from "react";
import { Search, ArrowLeft, Download, X, Filter, User } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';

export interface EmployeeRecord {
  id: string;
  employeeId?: string;
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
    // First check if department is an object with a name
    if (emp.department && typeof emp.department === 'object') {
      if (emp.department.name) return emp.department.name;
      if (emp.department.title) return emp.department.title;
      if (emp.department.departmentName) return emp.department.departmentName;
    }
    
    // Get the department ID (could be in multiple places)
    const deptId = emp.departmentId || 
                   (typeof emp.department === 'string' ? emp.department : null) ||
                   (emp.department && (emp.department.id || emp.department._id));
    
    // Look up in the map
    if (deptId && departmentsMap[String(deptId)]) {
      return departmentsMap[String(deptId)];
    }
    
    // If we have an ID but no mapping, try to fetch it individually
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
    // First check if designation is an object with a name
    if (emp.designation && typeof emp.designation === 'object') {
      if (emp.designation.name) return emp.designation.name;
      if (emp.designation.title) return emp.designation.title;
      if (emp.designation.designationName) return emp.designation.designationName;
    }
    
    // Get the designation ID
    const desigId = emp.designationId || 
                    (typeof emp.designation === 'string' ? emp.designation : null) ||
                    (emp.designation && (emp.designation.id || emp.designation._id));
    
    // Look up in the map
    if (desigId && designationsMap[String(desigId)]) {
      return designationsMap[String(desigId)];
    }
    
    return '';
  };

  // Helper to resolve location name
  const getLocationName = (emp: any): string => {
    // First check if location is an object with a name
    if (emp.location && typeof emp.location === 'object') {
      if (emp.location.name) return emp.location.name;
      if (emp.location.title) return emp.location.title;
      if (emp.location.locationName) return emp.location.locationName;
    }
    
    // Get the location ID
    const locId = emp.locationId || 
                  (typeof emp.location === 'string' ? emp.location : null) ||
                  (emp.location && (emp.location.id || emp.location._id));
    
    // Look up in the map
    if (locId && locationsMap[String(locId)]) {
      return locationsMap[String(locId)];
    }
    
    return '';
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

      setEmployeeData(employees);
      
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
      alert("No records to export");
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
        getFullName(emp),
        emp.email || 'N/A',
        emp.phoneNumber || 'N/A',
        getDepartmentName(emp) || 'N/A',
        getDesignationName(emp) || 'N/A',
        getLocationName(emp) || 'N/A',
        emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : 'N/A'
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Full Name', 'Email', 'Phone', 'Department', 'Designation', 'Location', 'Joined']],
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
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert("Failed to generate PDF");
    } finally {
      setShowExportDropdown(false);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = selectedRecords.size === 0 
      ? filteredEmployees 
      : Array.from(selectedRecords).map(index => filteredEmployees[index]);

    if (dataToExport.length === 0) {
      alert("No records to export");
      setShowExportDropdown(false);
      return;
    }

    const headers = ['Full Name', 'Email', 'Phone', 'Department', 'Designation', 'Location', 'Joined'];
    const csvRows = [headers.join(',')];

    dataToExport.forEach(emp => {
      const row = [
        `"${getFullName(emp)}"`,
        `"${emp.email || 'N/A'}"`,
        `"${emp.phoneNumber || 'N/A'}"`,
        `"${getDepartmentName(emp) || 'N/A'}"`,
        `"${getDesignationName(emp) || 'N/A'}"`,
        `"${getLocationName(emp) || 'N/A'}"`,
        `"${emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : 'N/A'}"`
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

    alert(`Exported ${dataToExport.length} records to Excel (CSV format).`);
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
            Employee Report
          </h1>
          <p className="text-sm md:text-base text-gray-500">
            Access employee data, demographics, and workforce analytics
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, department..."
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
                    Department
                  </label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Departments</option>
                    {uniqueDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <select
                    value={filterDesignation}
                    onChange={(e) => setFilterDesignation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Designations</option>
                    {uniqueDesignations.map((desig) => (
                      <option key={desig} value={desig}>
                        {desig}
                      </option>
                    ))}
                  </select>
                </div>
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on leave">On Leave</option>
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
                      disabled={filteredEmployees.length === 0}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
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
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">No employees found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee, index) => (
                    <tr 
                      key={employee.id || index} 
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
                        {getFullName(employee)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.email || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.phoneNumber || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getDepartmentName(employee) || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getDesignationName(employee) || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getLocationName(employee) || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && filteredEmployees.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredEmployees.length} of {employeeData.length} records
          </div>
        )}
      </div>
    </div>
  );
}