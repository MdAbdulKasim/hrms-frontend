'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Coffee, Gift, Clock, Heart, Users, AlertCircle, CheckCircle, XCircle, Settings, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import ViewLeaveDetails from './ViewLeaveDetails';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import { CustomAlertDialog } from '@/components/ui/custom-dialogs';

interface LeaveType {
  id: string;
  code: string;
  name: string;
  total: number;
  available: number;
  booked: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  defaultDays?: number;
}

interface LeaveRequest {
  id: string;
  leaveTypeCode: string;
  leaveType?: string;
  startDate: string;
  endDate: string;
  days: number;
  numberOfDays?: number;
  reason: string;
  status: 'approved' | 'pending' | 'rejected';
  employeeId?: string;
  employeeName?: string;
  employeeEmail?: string;
  locationId?: string;
  locationName?: string;
  departmentId?: string;
  departmentName?: string;
  rejectionReason?: string;
  approverId?: string;
  approverName?: string;
}

const LeaveTracker = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingLeave, setViewingLeave] = useState<LeaveRequest | null>(null);

  // Alert State
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

  // Loading state
  const [loading, setLoading] = useState(false);

  // Leave types and requests
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRequest[]>([]);

  // Filter states
  const [viewMode, setViewMode] = useState<'all' | 'pending'>('all');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  // Config state
  const [leaveConfigs, setLeaveConfigs] = useState<{ code: string; defaultDays: number }[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Compute pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterEmployee, filterLocation, filterDepartment, viewMode]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeaves = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  // Employee mapping for names
  const [employeeMap, setEmployeeMap] = useState<{ [key: string]: { name: string; email?: string } }>({});

  const organizationId = getOrgId();

  // Icon mapping for leave types
  const iconMap: { [key: string]: React.ReactNode } = {
    'CL': <Coffee className="w-5 h-5" />,
    'EL': <Gift className="w-5 h-5" />,
    'LWP': <Clock className="w-5 h-5" />,
    'PL': <Users className="w-5 h-5" />,
    'SBL': <Heart className="w-5 h-5" />,
    'SL': <AlertCircle className="w-5 h-5" />,
  };

  const colorMap: { [key: string]: { color: string; bgColor: string } } = {
    'CL': { color: 'text-blue-600', bgColor: 'bg-blue-100' },
    'EL': { color: 'text-green-600', bgColor: 'bg-green-100' },
    'LWP': { color: 'text-gray-600', bgColor: 'bg-gray-100' },
    'PL': { color: 'text-purple-600', bgColor: 'bg-purple-100' },
    'SBL': { color: 'text-pink-600', bgColor: 'bg-pink-100' },
    'SL': { color: 'text-red-600', bgColor: 'bg-red-100' },
  };

  // Fetch employees for name mapping
  const fetchEmployees = async () => {
    if (!organizationId) return;
    try {
      const apiUrl = getApiUrl();
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/org/${organizationId}/employees`, {
        params: { limit: 1000 },
        headers: { Authorization: `Bearer ${token}` },
      });
      const employees = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const mapping: { [key: string]: { name: string; email?: string } } = {};
      employees.forEach((emp: any) => {
        const empId = emp.id || emp._id;
        if (!empId) return;

        const fullName = emp.fullName ||
          `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
          emp.name ||
          emp.email
        mapping[empId] = {
          name: fullName,
          email: emp.email
        };
      });
      setEmployeeMap(mapping);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Helper function to calculate days between two dates (inclusive)
  const calculateDays = (startDate: string, endDate: string): number => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Set time to midnight to avoid timezone issues
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      // Calculate difference in milliseconds
      const diffTime = end.getTime() - start.getTime();
      // Convert to days and add 1 to include both start and end dates
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 1; // At least 1 day
    } catch (error) {
      console.error('Error calculating days:', error);
      return 1;
    }
  };

  // Helper function to enrich leave with employee name and calculate days
  const enrichLeaveWithEmployeeName = (leave: any): LeaveRequest => {
    const employeeId = leave.employeeId || leave.employee?.id || leave.employee?._id;
    const employeeInfo = employeeId ? employeeMap[employeeId] : null;

    // Calculate days if not present or invalid
    let days = leave.days || leave.numberOfDays;
    if (!days || Number(days) === 0 || isNaN(Number(days))) {
      days = calculateDays(leave.startDate, leave.endDate);
    }

    let resolvedName = leave.employeeName;
    if (!resolvedName && leave.employee) {
      resolvedName = leave.employee.fullName || leave.employee.name || `${leave.employee.firstName || ''} ${leave.employee.lastName || ''}`.trim();
    }
    if (!resolvedName) {
      resolvedName = employeeInfo?.name;
    }
    if (!resolvedName) {
      resolvedName = 'Unknown';
    }

    return {
      ...leave,
      employeeId: employeeId,
      employeeName: resolvedName,
      employeeEmail: leave.employeeEmail ||
        (leave.employee && leave.employee.email) ||
        employeeInfo?.email,
      days: days
    };
  };

  // Fetch leave types
  const fetchLeaveTypes = async () => {
    if (!organizationId) return;
    try {
      const apiUrl = getApiUrl();
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/org/${organizationId}/leaves/types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const types = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const transformedTypes: LeaveType[] = types.map((type: any) => {
        // Ensure all values are numbers, handle null/undefined/NaN cases
        const usedDays = Number(type.usedDays) || 0;
        const pendingDays = Number(type.pendingDays) || 0;
        const totalDays = Number(type.defaultDays) || 0;

        // Calculate available days, ensuring it's never negative or NaN
        const booked = usedDays + pendingDays;
        const available = Math.max(0, totalDays - booked);

        return {
          id: type.code || type.id,
          code: type.code,
          name: type.name || 'Unknown',
          total: totalDays,
          available: isNaN(available) ? 0 : available,
          booked: isNaN(booked) ? 0 : booked,
          icon: iconMap[type.code] || <Calendar className="w-5 h-5" />,
          color: colorMap[type.code]?.color || 'text-gray-600',
          bgColor: colorMap[type.code]?.bgColor || 'bg-gray-100',
          defaultDays: totalDays,
        };
      });
      setLeaveTypes(transformedTypes);
      setLeaveConfigs(types.map((type: any) => ({ code: type.code, defaultDays: type.defaultDays || 0 })));
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  // Fetch all leaves (admin)
  const fetchAllLeaves = async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/org/${organizationId}/leaves/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const leaves = Array.isArray(response.data) ? response.data : (response.data.data || []);
      // Enrich leaves with employee names
      const enrichedLeaves = leaves.map(enrichLeaveWithEmployeeName);
      setAllLeaves(enrichedLeaves);
      setFilteredLeaves(enrichedLeaves);
    } catch (error) {
      console.error('Error fetching all leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending leaves
  const fetchPendingLeaves = async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/org/${organizationId}/leaves/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const leaves = Array.isArray(response.data) ? response.data : (response.data.data || []);
      // Enrich leaves with employee names
      const enrichedLeaves = leaves.map(enrichLeaveWithEmployeeName);
      setPendingLeaves(enrichedLeaves);
      if (viewMode === 'pending') {
        setFilteredLeaves(enrichedLeaves);
      }
    } catch (error) {
      console.error('Error fetching pending leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leaves by employee
  const fetchLeavesByEmployee = async (employeeId: string) => {
    if (!organizationId || !employeeId) return;
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/org/${organizationId}/leaves/admin/employee/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const leaves = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const enrichedLeaves = leaves.map(enrichLeaveWithEmployeeName);
      setFilteredLeaves(enrichedLeaves);
    } catch (error) {
      console.error('Error fetching leaves by employee:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leaves by location
  const fetchLeavesByLocation = async (locationId: string) => {
    if (!organizationId || !locationId) return;
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/org/${organizationId}/leaves/admin/location/${locationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const leaves = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const enrichedLeaves = leaves.map(enrichLeaveWithEmployeeName);
      setFilteredLeaves(enrichedLeaves);
    } catch (error) {
      console.error('Error fetching leaves by location:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leaves by department
  const fetchLeavesByDepartment = async (departmentId: string) => {
    if (!organizationId || !departmentId) return;
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/org/${organizationId}/leaves/admin/department/${departmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const leaves = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const enrichedLeaves = leaves.map(enrichLeaveWithEmployeeName);
      setFilteredLeaves(enrichedLeaves);
    } catch (error) {
      console.error('Error fetching leaves by department:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = viewMode === 'pending' ? pendingLeaves : allLeaves;

    if (filterEmployee) {
      filtered = filtered.filter(leave => leave.employeeId === filterEmployee);
    }
    if (filterLocation) {
      filtered = filtered.filter(leave => leave.locationId === filterLocation);
    }
    if (filterDepartment) {
      filtered = filtered.filter(leave => leave.departmentId === filterDepartment);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(leave => leave.status === filterStatus);
    }

    setFilteredLeaves(filtered);
  }, [viewMode, filterEmployee, filterLocation, filterDepartment, filterStatus, allLeaves, pendingLeaves]);

  // Initial data fetch
  useEffect(() => {
    if (organizationId) {
      fetchEmployees();
      fetchLeaveTypes();
    }
  }, [organizationId]);

  // Fetch leaves after employees are loaded
  useEffect(() => {
    if (organizationId && Object.keys(employeeMap).length > 0) {
      fetchAllLeaves();
      fetchPendingLeaves();
    }
  }, [organizationId, employeeMap]);

  // Handle applying for leave
  const handleSubmit = async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const token = getAuthToken();

      const response = await axios.post(
        `${apiUrl}/org/${organizationId}/leaves/apply`,
        {
          leaveTypeCode: selectedLeaveType,
          startDate: fromDate,
          endDate: toDate,
          reason: reason,
          dayType: 'full_day'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 210 || response.status === 201) {
        await fetchLeaveTypes(); // Refresh leave types to update available/booked counts
        await fetchAllLeaves();
        await fetchPendingLeaves();
        setIsDialogOpen(false);
        setSelectedLeaveType('');
        setFromDate('');
        setToDate('');
        setReason('');
      }
    } catch (error: any) {
      console.error('Error applying for leave:', error);
      showAlert('Error', error.response?.data?.error || 'Failed to apply for leave. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle approve/reject
  const handleStatusUpdate = async () => {
    if (!organizationId || !selectedLeaveRequest) return;
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const token = getAuthToken();

      const response = await axios.put(
        `${apiUrl}/org/${organizationId}/leaves/${selectedLeaveRequest.id}/status`,
        {
          status: actionType === 'approve' ? 'approved' : 'rejected',
          rejectionReason: actionType === 'reject' ? rejectionReason : undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 200) {
        await fetchLeaveTypes(); // Refresh leave types to update available/booked counts
        await fetchAllLeaves();
        await fetchPendingLeaves();
        setIsApproveDialogOpen(false);
        setSelectedLeaveRequest(null);
        setRejectionReason('');
      }
    } catch (error: any) {
      console.error('Error updating leave status:', error);
      showAlert('Error', error.response?.data?.error || 'Failed to update leave status. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle config update
  const handleConfigUpdate = async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const token = getAuthToken();

      const updates = leaveConfigs.map(config => ({
        code: config.code,
        defaultDays: config.defaultDays
      }));

      const response = await axios.put(
        `${apiUrl}/org/${organizationId}/leaves/config`,
        { updates },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 200) {
        await fetchLeaveTypes();
        setIsConfigDialogOpen(false);
        showAlert('Success', 'Leave configuration updated successfully', 'success');
      }
    } catch (error: any) {
      console.error('Error updating leave config:', error);
      showAlert('Error', error.response?.data?.error || 'Failed to update leave configuration. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSelectedLeaveType('');
    setFromDate('');
    setToDate('');
    setReason('');
  };

  const openApproveDialog = (leave: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedLeaveRequest(leave);
    setActionType(action);
    setIsApproveDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') {
      return 'bg-green-100 text-green-700';
    } else if (statusLower === 'pending') {
      return 'bg-yellow-100 text-yellow-700';
    } else {
      return 'bg-red-100 text-red-700';
    }
  };

  // Get unique employees, locations, departments for filters
  const uniqueEmployees = Array.from(new Set(allLeaves.map(l => l.employeeId).filter(Boolean)));
  const uniqueLocations = Array.from(new Set(allLeaves.map(l => l.locationId).filter(Boolean)));
  const uniqueDepartments = Array.from(new Set(allLeaves.map(l => l.departmentId).filter(Boolean)));

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leave Tracker</h1>
            <p className="text-gray-600 mt-1">Manage and track all leaves</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setIsConfigDialogOpen(true)}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              Apply Leave
            </Button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={viewMode === 'all' ? 'default' : 'outline'}
            onClick={() => setViewMode('all')}
            className={viewMode === 'all' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
          >
            All Leaves
          </Button>
          <Button
            variant={viewMode === 'pending' ? 'default' : 'outline'}
            onClick={() => setViewMode('pending')}
            className={viewMode === 'pending' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
          >
            Pending ({pendingLeaves.length})
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-semibold mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filterEmployee && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterEmployee('');
                  fetchAllLeaves();
                }}
              >
                Clear Employee Filter
              </Button>
            )}
            {filterLocation && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterLocation('');
                  fetchAllLeaves();
                }}
              >
                Clear Location Filter
              </Button>
            )}
            {filterDepartment && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterDepartment('');
                  fetchAllLeaves();
                }}
              >
                Clear Department Filter
              </Button>
            )}
          </div>
        </div>

        {/* Leave Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {leaveTypes.map((leave) => (
            <div key={leave.id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${leave.bgColor} ${leave.color} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                  {leave.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{leave.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Total: {leave.total} days</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-green-50 rounded-lg p-2 sm:p-3 md:p-4 text-center min-w-0">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 break-words">{leave.available}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Available</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-2 sm:p-3 md:p-4 text-center min-w-0">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 break-words">{leave.booked}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Booked</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Leave History Table */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            {viewMode === 'pending' ? 'Pending Leave Requests' : 'All Leave Requests'}
          </h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[1000px] sm:min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-black whitespace-nowrap">Employee</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-black whitespace-nowrap">Type</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-black whitespace-nowrap">From</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-black whitespace-nowrap">To</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-black whitespace-nowrap">Days</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-black whitespace-nowrap">Reason</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-black whitespace-nowrap">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-black whitespace-nowrap text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={viewMode === 'pending' ? 8 : 7} className="py-8 text-center text-gray-500">
                      Loading leave requests...
                    </td>
                  </tr>
                ) : filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={viewMode === 'pending' ? 8 : 7} className="py-8 text-center text-gray-500">
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  currentLeaves.map((leave) => (
                    <tr key={leave.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-900 whitespace-nowrap">
                        {leave.employeeName || leave.employeeEmail || 'Unknown'}
                      </td>
                      <td className="py-4 px-4 text-gray-900 whitespace-nowrap">
                        {leave.leaveTypeCode || leave.leaveType || 'Unknown'}
                      </td>
                      <td className="py-4 px-4 text-gray-600 whitespace-nowrap">{formatDate(leave.startDate)}</td>
                      <td className="py-4 px-4 text-gray-600 whitespace-nowrap">{formatDate(leave.endDate)}</td>
                      <td className="py-4 px-4 text-gray-900 whitespace-nowrap">{leave.days}</td>
                      <td className="py-4 px-4 text-gray-600 whitespace-nowrap max-w-[200px] truncate" title={leave.reason}>
                        {leave.reason || 'No reason provided'}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(leave.status)}`}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setViewingLeave(leave);
                              setIsViewDialogOpen(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {viewMode === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 h-8 px-2"
                                onClick={() => openApproveDialog(leave, 'approve')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 h-8 px-2"
                                onClick={() => openApproveDialog(leave, 'reject')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredLeaves.length > 0 && (
            <div className="px-4 py-4 mt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredLeaves.length)}</span> of <span className="font-medium">{filteredLeaves.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 h-8"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                        if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                      }
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-md text-sm font-medium transition-colors
                        ${currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 sm:px-3 h-8"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Details Dialog */}
      {isViewDialogOpen && viewingLeave && (
        <ViewLeaveDetails
          leave={viewingLeave}
          onClose={() => {
            setIsViewDialogOpen(false);
            setViewingLeave(null);
          }}
        />
      )}

      {/* Apply Leave Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95%] sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">Apply for Leave</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="leave-type" className="text-sm sm:text-base font-semibold block">
                Leave Type
              </label>
              <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                <SelectTrigger id="leave-type" className="w-full">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map(type => (
                    <SelectItem key={type.id} value={type.code}>
                      {type.name} ({type.available} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="from-date" className="text-sm sm:text-base font-semibold block">
                  From Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="to-date" className="text-sm sm:text-base font-semibold block">
                  To Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm sm:text-base font-semibold block">
                Reason
              </label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                placeholder="Enter reason for leave..."
                rows={5}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="w-[95%] sm:max-w-[500px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </DialogTitle>
          </DialogHeader>

          {selectedLeaveRequest && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Employee:</strong> {selectedLeaveRequest.employeeName || selectedLeaveRequest.employeeEmail || 'N/A'}</p>
                <p><strong>Type:</strong> {selectedLeaveRequest.leaveTypeCode || selectedLeaveRequest.leaveType}</p>
                <p><strong>From:</strong> {formatDate(selectedLeaveRequest.startDate)}</p>
                <p><strong>To:</strong> {formatDate(selectedLeaveRequest.endDate)}</p>
                <p><strong>Days:</strong> {selectedLeaveRequest.days}</p>
                <p><strong>Reason:</strong> {selectedLeaveRequest.reason}</p>
              </div>

              {actionType === 'reject' && (
                <div className="space-y-2">
                  <label htmlFor="rejection-reason" className="text-sm sm:text-base font-semibold block">
                    Rejection Reason
                  </label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsApproveDialogOpen(false);
                setRejectionReason('');
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleStatusUpdate}
              className={`w-full sm:w-auto ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              disabled={loading || (actionType === 'reject' && !rejectionReason.trim())}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Config Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="w-[95%] sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">Configure Leave Types</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {leaveConfigs.map((config, index) => (
              <div key={config.code} className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold block mb-1">
                    {leaveTypes.find(t => t.code === config.code)?.name || config.code}
                  </label>
                  <Input
                    type="number"
                    value={config.defaultDays}
                    onChange={(e) => {
                      const newConfigs = [...leaveConfigs];
                      newConfigs[index].defaultDays = parseInt(e.target.value) || 0;
                      setLeaveConfigs(newConfigs);
                    }}
                    min="0"
                  />
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfigDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfigUpdate}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CustomAlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}
        title={alertState.title}
        description={alertState.description}
        variant={alertState.variant}
      />
    </div>
  );
};

export default LeaveTracker;
