'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Coffee, Gift, Clock, Heart, Users, AlertCircle } from 'lucide-react';
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
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import { CustomAlertDialog } from '@/components/ui/custom-dialogs';

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
  id: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  dayType: 'full_day' | 'first_half' | 'second_half';
  isLWP: boolean;
}

const LeaveTracker = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [dayType, setDayType] = useState<'full_day' | 'first_half' | 'second_half'>('full_day');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

  // Loading state for API calls
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    title: '',
    description: '',
    variant: 'info'
  });

  const showAlert = (title: string, description: string, variant: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setAlertState({ open: true, title, description, variant });
  };

  // Leave types and history from API
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistory[]>([]);

  const organizationId = getOrgId();

  // Fetch leave types and history from API
  useEffect(() => {
    const fetchLeaveData = async () => {
      if (!organizationId) return;
      try {
        setLoading(true);
        const apiUrl = getApiUrl();
        const token = getAuthToken();

        // Fetch leave types
        const typesResponse = await axios.get(`${apiUrl}/org/${organizationId}/leaves/types`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const types = Array.isArray(typesResponse.data) ? typesResponse.data : (typesResponse.data.data || []);

        const iconMap: { [key: string]: React.ReactNode } = {
          'AL': <Calendar className="w-5 h-5" />,
          'SL_CL': <Heart className="w-5 h-5" />,
          'SL': <Heart className="w-5 h-5" />,
          'CL': <Heart className="w-5 h-5" />,
          'EL': <Gift className="w-5 h-5" />,
          'LWP': <Clock className="w-5 h-5" />,
          'PL': <Users className="w-5 h-5" />,
          'SBL': <Heart className="w-5 h-5" />,
        };
        const colorMap: { [key: string]: { color: string; bgColor: string; gradient: string } } = {
          'AL': { color: 'text-indigo-600', bgColor: 'bg-indigo-50', gradient: 'from-indigo-500 to-blue-600' },
          'SL_CL': { color: 'text-rose-600', bgColor: 'bg-rose-50', gradient: 'from-rose-500 to-pink-600' },
          'SL': { color: 'text-rose-600', bgColor: 'bg-rose-50', gradient: 'from-rose-500 to-pink-600' },
          'CL': { color: 'text-rose-600', bgColor: 'bg-rose-50', gradient: 'from-rose-500 to-pink-600' },
          'EL': { color: 'text-emerald-600', bgColor: 'bg-emerald-50', gradient: 'from-emerald-500 to-teal-600' },
          'LWP': { color: 'text-amber-600', bgColor: 'bg-amber-50', gradient: 'from-amber-500 to-orange-600' },
          'PL': { color: 'text-purple-600', bgColor: 'bg-purple-100', gradient: 'from-purple-500 to-violet-600' },
          'SBL': { color: 'text-pink-600', bgColor: 'bg-pink-100', gradient: 'from-pink-500 to-rose-600' },
        };

        const transformedTypes: LeaveType[] = types.map((type: any) => {
          const code = type.code || type.id;
          const usedDays = Number(type.usedDays) || 0;
          const pendingDays = Number(type.pendingDays) || 0;
          const totalDays = Number(type.defaultDays) || 0;

          // "Taken" shows only approved leaves
          const booked = usedDays;
          // "Available" only subtracts approved leaves; pending leaves remain available until approved
          const available = Math.max(0, totalDays - usedDays);

          return {
            id: code,
            name: code === 'SL_CL' || code === 'SL' || code === 'CL' ? 'SL/CL' : (type.name || 'Unknown'),
            total: totalDays,
            available: isNaN(available) ? 0 : available,
            booked: isNaN(booked) ? 0 : booked,
            icon: iconMap[code] || <Calendar className="w-5 h-5" />,
            color: colorMap[code]?.color || 'text-gray-600',
            bgColor: colorMap[code]?.bgColor || 'bg-gray-100',
          };
        });

        if (!transformedTypes.find(t => t.id === 'AL')) {
          transformedTypes.push({
            id: 'AL',
            name: 'Annual Leave',
            total: 30,
            available: 30,
            booked: 0,
            icon: <Calendar className="w-5 h-5" />,
            color: colorMap['AL'].color,
            bgColor: colorMap['AL'].bgColor
          });
        }
        setLeaveTypes(transformedTypes);

        // Fetch employee's leave history
        const historyResponse = await axios.get(`${apiUrl}/org/${organizationId}/leaves/my-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const requests = Array.isArray(historyResponse.data) ? historyResponse.data : (historyResponse.data.data || []);

        const transformedHistory: LeaveHistory[] = requests.map((request: any) => {
          const status = request.status?.toLowerCase() || 'pending';
          const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
          let statusFormatted: 'Approved' | 'Pending' | 'Rejected' = 'Pending';
          if (statusCapitalized === 'Approved') statusFormatted = 'Approved';
          else if (statusCapitalized === 'Rejected') statusFormatted = 'Rejected';

          return {
            id: request.id,
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
            days: request.numberOfDays || request.days || 1,
            reason: request.reason || 'No reason provided',
            status: statusFormatted,
            dayType: request.dayType || 'full_day',
            isLWP: !!request.isLWP
          };
        });
        setLeaveHistory(transformedHistory);
      } catch (error) {
        console.error('Error fetching leave data:', error);
        setLeaveTypes([]);
        setLeaveHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, [organizationId]);

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSelectedLeaveType('');
    setFromDate('');
    setToDate('');
    setReason('');
  };

  const handleSubmit = async () => {
    if (!organizationId) {
      showAlert('Error', 'Organization ID not found. Please login again.', 'error');
      return;
    }
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const token = getAuthToken();

      // Call API to apply for leave
      const response = await axios.post(
        `${apiUrl}/org/${organizationId}/leaves/apply`,
        {
          leaveTypeCode: selectedLeaveType,
          startDate: fromDate,
          endDate: toDate,
          reason: reason,
          dayType: dayType
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 210 || response.status === 201) {
        // Refresh leave types to update available/booked counts
        const typesResponse = await axios.get(`${apiUrl}/org/${organizationId}/leaves/types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const types = Array.isArray(typesResponse.data) ? typesResponse.data : (typesResponse.data.data || []);

        const iconMap: { [key: string]: React.ReactNode } = {
          'AL': <Calendar className="w-5 h-5" />,
          'SL_CL': <Heart className="w-5 h-5" />,
          'SL': <Heart className="w-5 h-5" />,
          'CL': <Heart className="w-5 h-5" />,
          'EL': <Gift className="w-5 h-5" />,
          'LWP': <Clock className="w-5 h-5" />,
          'PL': <Users className="w-5 h-5" />,
          'SBL': <Heart className="w-5 h-5" />,
        };
        const colorMap: { [key: string]: { color: string; bgColor: string } } = {
          'AL': { color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
          'SL_CL': { color: 'text-rose-600', bgColor: 'bg-rose-100' },
          'SL': { color: 'text-rose-600', bgColor: 'bg-rose-100' },
          'CL': { color: 'text-rose-600', bgColor: 'bg-rose-100' },
          'EL': { color: 'text-green-600', bgColor: 'bg-green-100' },
          'LWP': { color: 'text-gray-600', bgColor: 'bg-gray-100' },
          'PL': { color: 'text-purple-600', bgColor: 'bg-purple-100' },
          'SBL': { color: 'text-pink-600', bgColor: 'bg-pink-100' },
        };

        const transformedTypes: LeaveType[] = types.map((type: any) => {
          const code = type.code || type.id;
          // Ensure all values are numbers, handle null/undefined/NaN cases
          const usedDays = Number(type.usedDays) || 0;
          const pendingDays = Number(type.pendingDays) || 0;
          const totalDays = Number(type.defaultDays) || 0;

          // "Taken" shows only approved leaves
          const booked = usedDays;
          // "Available" only subtracts approved leaves; pending leaves remain available until approved
          const available = Math.max(0, totalDays - usedDays);

          return {
            id: code,
            name: type.name || 'Unknown',
            total: totalDays,
            available: isNaN(available) ? 0 : available,
            booked: isNaN(booked) ? 0 : booked,
            icon: iconMap[code] || <Calendar className="w-5 h-5" />,
            color: colorMap[code]?.color || 'text-gray-600',
            bgColor: colorMap[code]?.bgColor || 'bg-gray-100',
          };
        });
        setLeaveTypes(transformedTypes);

        // Refresh leave history
        const historyResponse = await axios.get(`${apiUrl}/org/${organizationId}/leaves/my-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const requests = Array.isArray(historyResponse.data) ? historyResponse.data : (historyResponse.data.data || []);
        const transformedHistory: LeaveHistory[] = requests.map((request: any) => {
          const status = request.status?.toLowerCase() || 'pending';
          const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
          let statusFormatted: 'Approved' | 'Pending' | 'Rejected' = 'Pending';
          if (statusCapitalized === 'Approved') statusFormatted = 'Approved';
          else if (statusCapitalized === 'Rejected') statusFormatted = 'Rejected';

          return {
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
            status: statusFormatted
          };
        });
        setLeaveHistory(transformedHistory);
      }

      setIsDialogOpen(false);
      setSelectedLeaveType('');
      setDayType('full_day');
      setFromDate('');
      setToDate('');
      setReason('');
    } catch (error: any) {
      console.error('Error applying for leave:', error);
      showAlert('Error', error.response?.data?.error || 'Failed to apply for leave. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Changed p-8 to p-4 md:p-8 to save space on mobile
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Changed to flex-col on mobile, row on sm+ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leave Tracker</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">Track your leaves and submit requests</p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Apply Leave
          </Button>
        </div>

        {/* Leave Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {leaveTypes.map((leave) => (
            <div key={leave.id} className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 group transition-all duration-300">
              <div className="flex items-center gap-4 mb-8 relative">
                <div className={`${leave.bgColor || 'bg-gray-50'} ${leave.color || 'text-gray-600'} w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm`}>
                  {leave.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-[#0F172A] text-lg leading-tight">{leave.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-wider">
                      {leave.id}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400">Total: {leave.total} days</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 relative">
                <div className="bg-[#F8FAFC] rounded-2xl p-4 text-center border border-[#F1F5F9] transition-colors">
                  <div className="text-3xl font-black text-[#0F172A]">{leave.available}</div>
                  <div className="text-[10px] uppercase tracking-widest font-black text-[#10B981] mt-1">Available</div>
                </div>
                <div className="bg-[#F8FAFC] rounded-2xl p-4 text-center border border-[#F1F5F9] transition-colors">
                  <div className="text-3xl font-black text-[#0F172A]">{leave.booked}</div>
                  <div className="text-[10px] uppercase tracking-widest font-black text-[#F97316] mt-1">Taken</div>
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
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{leave.type}</span>
                          <span className="text-[10px] uppercase font-bold text-gray-400">
                            {leave.dayType === 'full_day' ? 'Full Day' : leave.dayType === 'first_half' ? 'First Half' : 'Second Half'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 whitespace-nowrap">{leave.from}</td>
                      <td className="py-4 px-4 text-gray-600 whitespace-nowrap">{leave.to}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{leave.days}</span>
                          {leave.isLWP && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">LWP</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 whitespace-nowrap max-w-[200px] truncate" title={leave.reason}>{leave.reason}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${leave.status === 'Approved'
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

      {/* Apply Leave Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* Added overflow-y-auto and max-h for small height screens */}
        <DialogContent className="w-[95%] sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">Apply for Leave</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="leave-type" className="text-sm font-bold text-gray-700 block">
                  Leave Type
                </label>
                <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                  <SelectTrigger id="leave-type" className="w-full bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} ({type.available} left)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="day-type" className="text-sm font-bold text-gray-700 block">
                  Day Type
                </label>
                <Select
                  value={dayType}
                  onValueChange={(v: any) => setDayType(v)}
                  disabled={!!(fromDate !== toDate && fromDate && toDate)}
                >
                  <SelectTrigger id="day-type" className="w-full bg-gray-50 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_day">Full Day</SelectItem>
                    <SelectItem value="first_half">First Half</SelectItem>
                    <SelectItem value="second_half">Second Half</SelectItem>
                  </SelectContent>
                </Select>
                {fromDate !== toDate && fromDate && toDate && (
                  <p className="text-[10px] text-amber-600 font-medium">Half day selection only available for single day leave.</p>
                )}
              </div>
            </div>

            {/* Date Inputs - Stacked on mobile, side-by-side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <label htmlFor="from-date" className="text-sm font-bold text-gray-700 block">
                  From Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="to-date" className="text-sm font-bold text-gray-700 block">
                  To Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Reason Textarea */}
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm sm:text-base font-semibold block">
                Reason
              </label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
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