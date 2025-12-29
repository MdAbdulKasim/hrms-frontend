"use client";

import { useState, useEffect } from "react";
import { Download, Search, X, Filter, User, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Employee Service
const employeeService = {
  async getAll(organizationId: string, params?: { page?: number; limit?: number; q?: string }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.q) queryParams.append('q', params.q);
      
      const response = await fetch(
        `${getApiUrl()}/org/${organizationId}/employees${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch employees');
      return await response.json();
    } catch (error: any) {
      console.error('Error:', error);
      return { error: error.message };
    }
  },
};

export default function EmployeeReportPage() {
  const organizationId = getOrgId();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Search and pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Selection states
  const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  // Export dropdown state
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Lookup maps for department/designation/location id -> name
  const [departmentsMap, setDepartmentsMap] = useState<Record<string, string>>({});
  const [designationsMap, setDesignationsMap] = useState<Record<string, string>>({});
  const [locationsMap, setLocationsMap] = useState<Record<string, string>>({});

  // Fetch data
  const fetchData = async () => {
    if (!organizationId) {
      setError("Organization ID not found. Please log in again.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await employeeService.getAll(organizationId, {
        page: currentPage,
        limit: 50,
        q: searchQuery,
      });

      if (result.error) {
        setError(result.error);
        setEmployeeData([]);
      } else {
        const data = result.data || result.employees || result;
        const employees = Array.isArray(data) ? data : (data.data || []);
        
        // Apply local filters
        let filteredEmployees = employees;
        if (departmentFilter) {
          const f = departmentFilter.toLowerCase().trim();
          filteredEmployees = filteredEmployees.filter((emp: any) => {
            const deptNameFromObj = emp.department?.name?.toLowerCase?.() || '';
            const deptFromMapById = emp.departmentId && departmentsMap[emp.departmentId] ? departmentsMap[emp.departmentId].toLowerCase() : '';
            const deptFromMapByField = emp.department && typeof emp.department === 'string' && departmentsMap[emp.department] ? departmentsMap[emp.department].toLowerCase() : '';
            const deptFromMapByObjId = emp.department && typeof emp.department === 'object' && (departmentsMap[emp.department.id] || departmentsMap[emp.department._id]) ? (departmentsMap[emp.department.id] || departmentsMap[emp.department._id]).toLowerCase() : '';
            return (
              emp.departmentId === departmentFilter ||
              emp.department?.id === departmentFilter ||
              deptNameFromObj.includes(f) ||
              deptFromMapById.includes(f) ||
              deptFromMapByField.includes(f) ||
              deptFromMapByObjId.includes(f)
            );
          });
        }
        if (designationFilter) {
          const f = designationFilter.toLowerCase().trim();
          filteredEmployees = filteredEmployees.filter((emp: any) => {
            const desNameFromObj = emp.designation?.name?.toLowerCase?.() || '';
            const desFromMapById = emp.designationId && designationsMap[emp.designationId] ? designationsMap[emp.designationId].toLowerCase() : '';
            const desFromMapByField = emp.designation && typeof emp.designation === 'string' && designationsMap[emp.designation] ? designationsMap[emp.designation].toLowerCase() : '';
            const desFromMapByObjId = emp.designation && typeof emp.designation === 'object' && (designationsMap[emp.designation.id] || designationsMap[emp.designation._id]) ? (designationsMap[emp.designation.id] || designationsMap[emp.designation._id]).toLowerCase() : '';
            return (
              emp.designationId === designationFilter ||
              emp.designation?.id === designationFilter ||
              desNameFromObj.includes(f) ||
              desFromMapById.includes(f) ||
              desFromMapByField.includes(f) ||
              desFromMapByObjId.includes(f)
            );
          });
        }
        if (statusFilter) {
          filteredEmployees = filteredEmployees.filter((emp: any) => 
            emp.status === statusFilter
          );
        }

        setEmployeeData(filteredEmployees);
        setTotalEmployees(result.total || filteredEmployees.length);
        setTotalPages(result.totalPages || 1);
        setSelectedRecords(new Set());
        setSelectAll(false);
      }
    } catch (err: any) {
      setError(err.message);
      setEmployeeData([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when searchQuery, filters, or page changes
  useEffect(() => {
    if (organizationId) {
      const timeoutId = setTimeout(() => {
        fetchData();
      }, 300); // 300ms debounce - waits for user to stop typing

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, currentPage, departmentFilter, designationFilter, statusFilter, organizationId]);

  // Fetch lookup lists (departments, designations, locations) so we can show names when only ids are present
  useEffect(() => {
    if (!organizationId) return;

    const parseJson = async (res: Response) => {
      if (!res.ok) return [];
      const body = await res.json();
      return body?.data || body || [];
    };

    const fetchLookups = async () => {
      try {
        const defaultHeaders = {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        };

        const [deptRes, desigRes, locRes] = await Promise.all([
          fetch(`${getApiUrl()}/org/${organizationId}/departments`, { headers: defaultHeaders }),
          fetch(`${getApiUrl()}/org/${organizationId}/designations`, { headers: defaultHeaders }),
          fetch(`${getApiUrl()}/org/${organizationId}/locations`, { headers: defaultHeaders }),
        ]);

        const [depts, desigs, locs] = await Promise.all([
          parseJson(deptRes),
          parseJson(desigRes),
          parseJson(locRes),
        ]);

        const dMap: Record<string, string> = {};
        (depts || []).forEach((d: any) => {
          const id = d.id || d._id || d.departmentId || String(d.id);
          if (id) dMap[id] = d.name || d.title || d.department || d.name || '';
        });

        const desMap: Record<string, string> = {};
        (desigs || []).forEach((d: any) => {
          const id = d.id || d._id || d.designationId || String(d.id);
          if (id) desMap[id] = d.name || d.title || d.designation || d.name || '';
        });

        const locMap: Record<string, string> = {};
        (locs || []).forEach((l: any) => {
          const id = l.id || l._id || l.locationId || String(l.id);
          if (id) locMap[id] = l.name || l.title || l.location || l.name || '';
        });

        setDepartmentsMap(dMap);
        setDesignationsMap(desMap);
        setLocationsMap(locMap);
      } catch (err) {
        console.error('Failed fetching lookup lists:', err);
      }
    };

    fetchLookups();
  }, [organizationId]);

  // When employeeData changes, try to resolve any missing lookup names by fetching individual entries
  useEffect(() => {
    if (!organizationId || !employeeData || employeeData.length === 0) return;

    const missingDeptIds = new Set<string>();
    const missingDesigIds = new Set<string>();
    const missingLocIds = new Set<string>();

    employeeData.forEach(emp => {
      const deptId = emp.departmentId || (emp.department && (emp.department.id || emp.department._id)) || (typeof emp.department === 'string' ? emp.department : null);
      if (deptId && !departmentsMap[deptId]) missingDeptIds.add(String(deptId));

      const desigId = emp.designationId || (emp.designation && (emp.designation.id || emp.designation._id)) || (typeof emp.designation === 'string' ? emp.designation : null);
      if (desigId && !designationsMap[desigId]) missingDesigIds.add(String(desigId));

      const locId = emp.locationId || (emp.location && (emp.location.id || emp.location._id)) || (typeof emp.location === 'string' ? emp.location : null);
      if (locId && !locationsMap[locId]) missingLocIds.add(String(locId));
    });

    const fetchMissing = async () => {
      try {
        console.debug('EmployeeReportPage: checking missing lookups', {
          missingDeptIds: Array.from(missingDeptIds),
          missingDesigIds: Array.from(missingDesigIds),
          missingLocIds: Array.from(missingLocIds),
          departmentsMapKeys: Object.keys(departmentsMap).slice(0,50)
        });

        // Log first 3 employees for debugging
        console.debug('EmployeeReportPage: sample employees', employeeData.slice(0,3).map(emp => ({
          id: emp.id || emp.employeeId,
          department: emp.department,
          departmentId: emp.departmentId,
          designation: emp.designation,
          designationId: emp.designationId,
          location: emp.location,
          locationId: emp.locationId
        })));

        // Fetch departments by id
        if (missingDeptIds.size) {
          await Promise.all(Array.from(missingDeptIds).map(async (id) => {
            try {
              // try two URL patterns in case API differs
              const urls = [
                `${getApiUrl()}/org/${organizationId}/departments/${id}`,
                `${getApiUrl()}/departments/${id}`
              ];
              for (const url of urls) {
                try {
                  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${getAuthToken()}`, 'Content-Type': 'application/json' } });
                  if (!res.ok) continue;
                  const body = await res.json();
                  const item = body?.data || body;
                  const name = item?.name || item?.title || item?.department || '';
                  if (name) {
                    setDepartmentsMap(prev => ({ ...prev, [id]: name }));
                    break;
                  }
                } catch (err) {
                  console.error('Failed fetch dept (url)', url, err);
                }
              }
            } catch (err) { console.error('Failed fetch dept', id, err); }
          }));
        }

        // Fetch designations by id
        if (missingDesigIds.size) {
          await Promise.all(Array.from(missingDesigIds).map(async (id) => {
            try {
              const urls = [
                `${getApiUrl()}/org/${organizationId}/designations/${id}`,
                `${getApiUrl()}/designations/${id}`
              ];
              for (const url of urls) {
                try {
                  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${getAuthToken()}`, 'Content-Type': 'application/json' } });
                  if (!res.ok) continue;
                  const body = await res.json();
                  const item = body?.data || body;
                  const name = item?.name || item?.title || item?.designation || '';
                  if (name) {
                    setDesignationsMap(prev => ({ ...prev, [id]: name }));
                    break;
                  }
                } catch (err) {
                  console.error('Failed fetch desig (url)', url, err);
                }
              }
            } catch (err) { console.error('Failed fetch desig', id, err); }
          }));
        }

        // Fetch locations by id
        if (missingLocIds.size) {
          await Promise.all(Array.from(missingLocIds).map(async (id) => {
            try {
              const urls = [
                `${getApiUrl()}/org/${organizationId}/locations/${id}`,
                `${getApiUrl()}/locations/${id}`
              ];
              for (const url of urls) {
                try {
                  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${getAuthToken()}`, 'Content-Type': 'application/json' } });
                  if (!res.ok) continue;
                  const body = await res.json();
                  const item = body?.data || body;
                  const name = item?.name || item?.title || item?.location || '';
                  if (name) {
                    setLocationsMap(prev => ({ ...prev, [id]: name }));
                    break;
                  }
                } catch (err) {
                  console.error('Failed fetch loc (url)', url, err);
                }
              }
            } catch (err) { console.error('Failed fetch loc', id, err); }
          }));
        }
      } catch (err) {
        console.error('Error fetching missing lookups', err);
      }
    };

    fetchMissing();
  }, [organizationId, employeeData, departmentsMap, designationsMap, locationsMap]);

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecords(new Set());
    } else {
      const allIds = new Set(employeeData.map((_, index) => index));
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
    setSelectAll(newSelected.size === employeeData.length);
  };

  // Export selected records as PDF (or all if none selected)
  const handleExportPDF = () => {
    const selectedData = selectedRecords.size === 0 ? employeeData : Array.from(selectedRecords).map(index => employeeData[index]);

    if (!selectedData || selectedData.length === 0) {
      setShowExportDropdown(false);
      return;
    }

    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text('Employee Report', 14, 20);

      // Add metadata
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Employees: ${selectedData.length}`, 14, 36);

      // Prepare table data (Full Name, Email, Phone, Department, Designation, Location, Joined)
      const tableData = selectedData.map(emp => [
        emp.fullName || 'N/A',
        emp.email || 'N/A',
        emp.phoneNumber || 'N/A',
        resolveDepartmentName(emp) || 'N/A',
        resolveDesignationName(emp) || 'N/A',
        resolveLocationName(emp) || 'N/A',
        emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : 'N/A'
      ]);

      // Add table using autoTable
      autoTable(doc, {
        startY: 45,
        head: [['Full Name', 'Email', 'Phone', 'Department', 'Designation', 'Location', 'Joined']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 30 },
          6: { cellWidth: 20 }
        }
      });

      // Save the PDF
      doc.save(`employee-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setShowExportDropdown(false);
    }
  };

  // Export selected records as Excel (CSV format) - exports all if none selected
  const handleExportExcel = () => {
    const selectedData = selectedRecords.size === 0 ? employeeData : Array.from(selectedRecords).map(index => employeeData[index]);

    if (!selectedData || selectedData.length === 0) {
      setShowExportDropdown(false);
      return;
    }

    const headers = ['Full Name', 'Email', 'Phone', 'Department', 'Designation', 'Location', 'Joined'];
    const csvRows = [headers.join(',')];

    selectedData.forEach(emp => {
      const row = [
        `"${emp.fullName || 'N/A'}"`,
        `"${emp.email || 'N/A'}"`,
        `"${emp.phoneNumber || 'N/A'}"`,
        `"${resolveDepartmentName(emp) || 'N/A'}"`,
        `"${resolveDesignationName(emp) || 'N/A'}"`,
        `"${resolveLocationName(emp) || 'N/A'}"`,
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

    setShowExportDropdown(false);
  };

  // Cancel selection
  const handleCancelSelection = () => {
    setSelectedRecords(new Set());
    setSelectAll(false);
  };

  // Clear filters
  const handleClearFilters = () => {
    setDepartmentFilter("");
    setDesignationFilter("");
    setStatusFilter("");
    setShowFilters(false);
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

  // Resolve name helpers (handles multiple possible id/name shapes)
  const resolveDepartmentName = (emp: any) => {
    if (!emp) return '';
    // Direct object with name
    if (emp.department && typeof emp.department === 'object' && (emp.department.name || emp.department.title)) {
      return emp.department.name || emp.department.title;
    }
    // department may be a string id
    const deptIdCandidate = emp.departmentId || emp.department || (emp.department && (emp.department.id || emp.department._id));
    if (deptIdCandidate && departmentsMap[deptIdCandidate]) return departmentsMap[deptIdCandidate];
    // fallback: return the id string so user can still see something
    return deptIdCandidate ? String(deptIdCandidate) : '';
  };

  const resolveDesignationName = (emp: any) => {
    if (!emp) return '';
    if (emp.designation && typeof emp.designation === 'object' && (emp.designation.name || emp.designation.title)) {
      return emp.designation.name || emp.designation.title;
    }
    const desIdCandidate = emp.designationId || emp.designation || (emp.designation && (emp.designation.id || emp.designation._id));
    if (desIdCandidate && designationsMap[desIdCandidate]) return designationsMap[desIdCandidate];
    return desIdCandidate ? String(desIdCandidate) : '';
  };

  const resolveLocationName = (emp: any) => {
    if (!emp) return '';
    if (emp.location && typeof emp.location === 'object' && (emp.location.name || emp.location.title)) {
      return emp.location.name || emp.location.title;
    }
    const locIdCandidate = emp.locationId || emp.location || (emp.location && (emp.location.id || emp.location._id));
    if (locIdCandidate && locationsMap[locIdCandidate]) return locationsMap[locIdCandidate];
    return locIdCandidate ? String(locIdCandidate) : '';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="mb-6">
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or phone..."
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

          {/* Filters Dropdown */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    placeholder="Filter by department (name)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={designationFilter}
                    onChange={(e) => setDesignationFilter(e.target.value)}
                    placeholder="Filter by designation (name)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
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

        {/* Selection Actions */}
        {selectedRecords.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900">
              {selectedRecords.size} employee{selectedRecords.size !== 1 ? 's' : ''} selected
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
                      disabled={employeeData.length === 0}
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
                ) : employeeData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">No employees found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  employeeData.map((employee, index) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.fullName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.email || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.phoneNumber || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resolveDepartmentName(employee) || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resolveDesignationName(employee) || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resolveLocationName(employee) || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination & Results Count */}
        {!loading && employeeData.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {employeeData.length} of {totalEmployees} employee{totalEmployees !== 1 ? 's' : ''}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}