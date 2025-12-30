'use client';
import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, Sun, TrendingUp, Briefcase } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId, getUserDetails } from '@/lib/auth';
import AnnouncementsSection from '@/components/admin/myspace/dashboard/announcement';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [onLeaveToday, setOnLeaveToday] = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    checkIn: '---',
    status: 'Not Checked In',
    workHours: '0h 0m'
  });

  const { fullName } = getUserDetails();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const apiUrl = getApiUrl();
        const orgId = getOrgId();

        if (!orgId) return;

        const today = new Date();

        // Fetch on leave today
        const attendanceRes = await axios.get(`${apiUrl}/org/${orgId}/attendance`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { date: today.toISOString().split('T')[0] }
        });
        const attendanceRecords = attendanceRes.data?.data || attendanceRes.data || [];
        setOnLeaveToday(attendanceRecords.filter((record: any) =>
          record.status?.toLowerCase() === 'leave'
        ));

        // Fetch current day attendance status for summary
        try {
          const statusRes = await axios.get(`${apiUrl}/org/${orgId}/attendance/my-status`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (statusRes.data && !statusRes.data.message) {
            const record = statusRes.data;
            let checkInTime = '---';
            let workHours = '0h 0m';

            if (record.checkIn) {
              const date = new Date(record.checkIn);
              checkInTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              // Only calculate work hours if they are not already provided by backend or if we want to do it here
              // For now, let's use the backend value if available
              if (record.totalHours) {
                const hours = Math.floor(record.totalHours);
                const minutes = Math.round((record.totalHours - hours) * 60);
                workHours = `${hours}h ${minutes}m`;
              }
            }

            setAttendanceSummary({
              checkIn: checkInTime,
              status: record.status || 'Active',
              workHours: workHours
            });
          }
        } catch (statusError) {
          console.error('Error fetching attendance status:', statusError);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Check In</p>
              <p className="text-lg font-bold text-slate-900">{attendanceSummary.checkIn}</p>
            </div>
          </div>
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
              <p className="text-lg font-bold text-slate-900">Regular</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <AnnouncementsSection />
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">On Leave Today</h2>
              </div>
              <div className="space-y-4">
                {onLeaveToday.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Everyone is in today!</p>
                ) : (
                  onLeaveToday.map((record: any) => (
                    <div key={record.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 font-bold text-xs ring-2 ring-slate-100">
                        {record.employeeName?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{record.employeeName}</p>
                        <p className="text-[10px] text-red-600 font-medium uppercase tracking-tight">{record.leaveType || 'Leave'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;