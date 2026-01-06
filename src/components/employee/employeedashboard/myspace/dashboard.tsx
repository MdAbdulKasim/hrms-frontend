'use client';
import React, { useState, useEffect } from 'react';
import { UserCheck, Sun, TrendingUp, Briefcase } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId, getUserDetails } from '@/lib/auth';
import AnnouncementsSection from '@/components/admin/myspace/dashboard/announcement';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
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

        // Fetch current day attendance status for summary
        try {
          const statusRes = await axios.get(`${apiUrl}/org/${orgId}/attendance/my-status`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (statusRes.data && !statusRes.data.message) {
            const record = statusRes.data;
            let checkInTime = '---';
            let workHours = '0h 0m';

            const hasCheckIn = record.checkInTime || record.checkIn;
            if (hasCheckIn) {
              const date = new Date(hasCheckIn);
              checkInTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              // Handle both totalHours and hoursWorked variations
              const hoursValue = record.totalHours || record.hoursWorked;
              if (hoursValue) {
                const hours = Math.floor(hoursValue);
                const minutes = Math.round((hoursValue - hours) * 60);
                workHours = `${hours}h ${minutes}m`;
              }
            }

            setAttendanceSummary({
              checkIn: checkInTime,
              status: record.status || 'Active',
              workHours: workHours
            });
          }
        } catch (statusError: any) {
          // If 404, it just means no attendance record for today, which is fine
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
              <p className="text-lg font-bold text-slate-900">Regular</p>
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