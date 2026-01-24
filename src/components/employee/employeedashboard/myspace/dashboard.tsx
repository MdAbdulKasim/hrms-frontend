'use client';
import React, { useState, useEffect } from 'react';
import { UserCheck, Sun, TrendingUp, Briefcase } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId, getUserDetails, getEmployeeId } from '@/lib/auth';
import AnnouncementsSection from '@/components/admin/myspace/dashboard/announcement';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState({
    checkIn: '---',
    checkOut: '---',
    status: 'Not Checked In',
    workHours: '0h 0m',
    shift: 'Regular'
  });
  const [rawCheckIn, setRawCheckIn] = useState<Date | null>(null);
  const [rawCheckOut, setRawCheckOut] = useState<Date | null>(null);

  const { fullName } = getUserDetails();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const apiUrl = getApiUrl();
        const orgId = getOrgId();
        const employeeId = getEmployeeId();

        if (!orgId) return;

        // Fetch employee details for shift
        if (employeeId) {
          try {
            const empRes = await axios.get(`${apiUrl}/org/${orgId}/employees/${employeeId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const empData = empRes.data?.data || empRes.data;
            if (empData?.shiftType) {
              setAttendanceSummary(prev => ({ ...prev, shift: empData.shiftType }));
            }
          } catch (empError) {
            console.error('Error fetching employee shift:', empError);
          }
        }

        // Fetch current day attendance status
        try {
          const statusRes = await axios.get(`${apiUrl}/org/${orgId}/attendence/my-status`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (statusRes.data && !statusRes.data.message) {
            const record = statusRes.data;
            let checkInTime = '---';
            let checkOutTime = '---';

            const cin = record.checkInTime || record.checkIn;
            const cout = record.checkOutTime || record.checkOut;

            if (cin) {
              const cinDate = new Date(cin);
              setRawCheckIn(cinDate);
              checkInTime = cinDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            if (cout) {
              const coutDate = new Date(cout);
              setRawCheckOut(coutDate);
              checkOutTime = coutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            setAttendanceSummary(prev => ({
              ...prev,
              checkIn: checkInTime,
              checkOut: checkOutTime,
              status: record.status || 'Active'
            }));
          }
        } catch (statusError: any) {
          if (statusError.response?.status !== 404) {
            console.error('Error fetching attendance status:', statusError);
          }
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Timer for dynamic work hours
  useEffect(() => {
    const updateWorkHours = () => {
      if (!rawCheckIn) {
        setAttendanceSummary(prev => ({ ...prev, workHours: '0h 0m' }));
        return;
      }

      const endTime = rawCheckOut || new Date();
      const diffMs = endTime.getTime() - rawCheckIn.getTime();

      if (diffMs < 0) {
        setAttendanceSummary(prev => ({ ...prev, workHours: '0h 0m' }));
        return;
      }

      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      setAttendanceSummary(prev => ({ ...prev, workHours: `${hours}h ${minutes}m` }));
    };

    updateWorkHours();
    const interval = setInterval(updateWorkHours, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [rawCheckIn, rawCheckOut]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {fullName}! 👋</h1>
            <p className="text-slate-500 mt-1">Here's what's happening in your workspace today.</p>
          </div>
          <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
            <Sun className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</p>
              <p className="text-lg font-bold text-slate-900">{attendanceSummary.status}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Work Hours</p>
              <p className="text-lg font-bold text-slate-900">{attendanceSummary.workHours}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shift</p>
              <p className="text-lg font-bold text-slate-900">{attendanceSummary.shift}</p>
            </div>
          </div>
        </div>

        {/* Announcements Section - Full Width */}
        <AnnouncementsSection />

      </div>
    </div>
  );
};

export default Dashboard;