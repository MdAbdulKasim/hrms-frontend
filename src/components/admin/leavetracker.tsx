'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Coffee, Gift, Clock, Heart, Users, AlertCircle, Settings } from 'lucide-react';
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
import axios from 'axios';
import { getApiUrl, getAuthToken } from '@/lib/auth';


interface LeaveType {
  id: string;
  name: string;
  total: number;
  available: number;
  booked: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface LeaveHistory {
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

const LeaveTracker = () => {
  // Existing State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

  // NEW: State for "Create Leave Type" Dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newLeaveData, setNewLeaveData] = useState({
    name: '',
    total: '',
    booked: '',
    available: ''
  });

  // Role state
  const [userRole, setUserRole] = useState<string>('');

  // Loading state for API calls
  const [loading, setLoading] = useState(false);

  // Leave types - fetched from API
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

  // Converted leaveHistory to state for API integration
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistory[]>([]);

  // Get user role from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('role') || '';
      setUserRole(role);
    }
  }, []);

  // Fetch leave requests from API
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        const apiUrl = getApiUrl();
        const token = getAuthToken();

        const response = await axios.get(`${apiUrl}/leave-requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const leaveRequests = response.data.data || response.data || [];

        // Transform API data to match component interface
        const transformedData: LeaveHistory[] = leaveRequests.map((request: any) => ({
          type: request.leaveType || 'Unknown',
          from: new Date(request.startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }),
          to: new Date(request.endDate).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }),
          days: request.days || 1,
          reason: request.reason || 'No reason provided',
          status: request.status || 'Pending'
        }));

        setLeaveHistory(transformedData);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
        setLeaveHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  // Handle applying for leave
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const token = getAuthToken();

      // Call API to apply for leave
      const response = await axios.post(
        `${apiUrl}/leave-requests/apply`,
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
        // Refresh leave history
        const historyResponse = await axios.get(`${apiUrl}/leave-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const requests = historyResponse.data || historyResponse.data.data || [];
        const transformedHistory: LeaveHistory[] = requests.map((request: any) => ({
          type: request.leaveTypeCode || request.leaveType || 'Unknown',
          from: new Date(request.startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }),
          to: new Date(request.endDate).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }),
          days: request.days || 1,
          reason: request.reason || 'No reason provided',
          status: request.status?.charAt(0).toUpperCase() + request.status?.slice(1) || 'Pending'
        }));
        setLeaveHistory(transformedHistory);
      }

      setIsDialogOpen(false);
      setSelectedLeaveType('');
      setFromDate('');
      setToDate('');
      setReason('');
    } catch (error) {
      console.error('Error applying for leave:', error);
      alert('Failed to apply for leave. Please try again.');
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

  // Handle creating a new leave type (admin only)
  const handleCreateLeaveSubmit = async () => {
    if (!newLeaveData.name || !newLeaveData.total) return;

    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const token = getAuthToken();

      // Call API to update leave configuration
      await axios.put(
        `${apiUrl}/leave-requests/config`,
        {
          updates: {
            name: newLeaveData.name,
            defaultDays: Number(newLeaveData.total),
            isPaid: true,
            isCarryForward: false,
            maxCarryForwardDays: 0
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Refresh leave types
      const typesResponse = await axios.get(`${apiUrl}/leave-requests/types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const types = typesResponse.data || typesResponse.data.data || [];

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

      const transformedTypes: LeaveType[] = types.map((type: any) => ({
        id: type.code || type.id,
        name: type.name || 'Unknown',
        total: type.defaultDays || 0,
        available: (type.defaultDays || 0) - (type.usedDays || 0),
        booked: type.usedDays || 0,
        icon: iconMap[type.code] || <Calendar className="w-5 h-5" />,
        color: colorMap[type.code]?.color || 'text-gray-600',
        bgColor: colorMap[type.code]?.bgColor || 'bg-gray-100',
      }));
      setLeaveTypes(transformedTypes);

      // Reset and Close
      setNewLeaveData({ name: '', total: '', booked: '', available: '' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating leave type:', error);
      alert('Failed to create leave type. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leave Tracker</h1>
            <p className="text-gray-600 mt-1">Manage and track your leaves</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* NEW: Create Leave Type Button - Only for Admin */}
            {userRole === 'admin' && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-600"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Leave
              </Button>
            )}

            <Button
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              Apply Leave
            </Button>
          </div>
        </div>

        {/* Leave Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {leaveTypes.map((leave) => (
            <div key={leave.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${leave.bgColor} ${leave.color} p-3 rounded-lg`}>
                  {leave.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{leave.name}</h3>
                  <p className="text-sm text-gray-600">Total: {leave.total} days</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">{leave.available}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Available</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600">{leave.booked}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Booked</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Leave History */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Leave History</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[800px] sm:min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Type</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">From</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">To</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Days</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Reason</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Loading leave history...
                    </td>
                  </tr>
                ) : leaveHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No leave history found
                    </td>
                  </tr>
                ) : (
                  leaveHistory.map((leave, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-900 whitespace-nowrap">{leave.type}</td>
                      <td className="py-4 px-4 text-gray-600 whitespace-nowrap">{leave.from}</td>
                      <td className="py-4 px-4 text-gray-600 whitespace-nowrap">{leave.to}</td>
                      <td className="py-4 px-4 text-gray-900 whitespace-nowrap">{leave.days}</td>
                      <td className="py-4 px-4 text-gray-600 whitespace-nowrap max-w-[200px] truncate" title={leave.reason}>{leave.reason}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${leave.status === 'Approved'
                              ? 'bg-green-100 text-green-700'
                              : leave.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {leave.status}
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

      {/* Existing Apply Leave Dialog */}
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
                  {/* Dynamically render options based on state */}
                  {leaveTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name} ({type.available} available)</SelectItem>
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
                    placeholder="Pick date"
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
                    placeholder="Pick date"
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
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW: Create Leave Type Dialog - Only for Admin */}
      {userRole === 'admin' && (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="w-[95%] sm:max-w-[500px] rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Leave Type</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold block">Leave Type Name</label>
                <input
                  type="text"
                  value={newLeaveData.name}
                  onChange={(e) => setNewLeaveData({ ...newLeaveData, name: e.target.value })}
                  placeholder="e.g. Remote Work"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold block">Total Days</label>
                <input
                  type="number"
                  value={newLeaveData.total}
                  onChange={(e) => setNewLeaveData({ ...newLeaveData, total: e.target.value })}
                  placeholder="0"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold block">Booked Days</label>
                  <input
                    type="number"
                    value={newLeaveData.booked}
                    onChange={(e) => setNewLeaveData({ ...newLeaveData, booked: e.target.value })}
                    placeholder="0"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold block">Available Days</label>
                  <input
                    type="number"
                    value={newLeaveData.available}
                    onChange={(e) => setNewLeaveData({ ...newLeaveData, available: e.target.value })}
                    placeholder="0"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateLeaveSubmit}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                Create Leave Type
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LeaveTracker;