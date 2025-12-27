'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Coffee, Gift, Clock, Heart, Users, AlertCircle } from 'lucide-react';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

  // Loading state for API calls
  const [loading, setLoading] = useState(false);

  // Converted leaveHistory to state for API integration
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistory[]>([]);

  const leaveTypes: LeaveType[] = [
    {
      id: 'casual',
      name: 'Casual Leave',
      total: 12,
      available: 8,
      booked: 4,
      icon: <Coffee className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'earned',
      name: 'Earned Leave',
      total: 20,
      available: 15,
      booked: 5,
      icon: <Gift className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'lwp',
      name: 'Leave Without Pay',
      total: 0,
      available: 0,
      booked: 2,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    },
    {
      id: 'paternity',
      name: 'Paternity Leave',
      total: 5,
      available: 5,
      booked: 0,
      icon: <Users className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'sabbatical',
      name: 'Sabbatical',
      total: 30,
      available: 30,
      booked: 0,
      icon: <Heart className="w-5 h-5" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    },
    {
      id: 'sick',
      name: 'Sick Leave',
      total: 12,
      available: 10,
      booked: 2,
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

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
        // Fallback to mock data if API fails
        setLeaveHistory([
          {
            type: 'Casual Leave',
            from: 'Jan 15, 2024',
            to: 'Jan 16, 2024',
            days: 2,
            reason: 'Personal work',
            status: 'Approved'
          },
          {
            type: 'Sick Leave',
            from: 'Feb 10, 2024',
            to: 'Feb 11, 2024',
            days: 2,
            reason: 'Fever',
            status: 'Approved'
          },
          {
            type: 'Earned Leave',
            from: 'Mar 20, 2024',
            to: 'Mar 25, 2024',
            days: 5,
            reason: 'Family vacation',
            status: 'Pending'
          },
          {
            type: 'Casual Leave',
            from: 'Apr 05, 2024',
            to: 'Apr 06, 2024',
            days: 2,
            reason: 'Personal work',
            status: 'Rejected'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  const handleSubmit = () => {
    console.log({ selectedLeaveType, fromDate, toDate, reason });
    setIsDialogOpen(false);
    setSelectedLeaveType('');
    setFromDate('');
    setToDate('');
    setReason('');
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSelectedLeaveType('');
    setFromDate('');
    setToDate('');
    setReason('');
  };

  return (
    // Changed p-8 to p-4 md:p-8 to save space on mobile
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Changed to flex-col on mobile, row on sm+ */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leave Tracker</h1>
            <p className="text-gray-600 mt-1">Manage and track your leaves</p>
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
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            leave.status === 'Approved'
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
            {/* Leave Type Select */}
            <div className="space-y-2">
              <label htmlFor="leave-type" className="text-sm sm:text-base font-semibold block">
                Leave Type
              </label>
              <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                <SelectTrigger id="leave-type" className="w-full">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual Leave (8 available)</SelectItem>
                  <SelectItem value="earned">Earned Leave (15 available)</SelectItem>
                  <SelectItem value="lwp">Leave Without Pay (0 available)</SelectItem>
                  <SelectItem value="paternity">Paternity Leave (5 available)</SelectItem>
                  <SelectItem value="sabbatical">Sabbatical (30 available)</SelectItem>
                  <SelectItem value="sick">Sick Leave (10 available)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Inputs - Stacked on mobile, side-by-side on sm+ */}
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
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveTracker;