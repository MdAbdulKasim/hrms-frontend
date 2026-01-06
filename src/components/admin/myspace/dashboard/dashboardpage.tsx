'use client';
import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId, getUserDetails } from '@/lib/auth';
// import QuickLinksSection from './quicklink';
import AnnouncementsSection from './announcement';
import UpcomingHolidaysSection from './holidays';
import ManageSection from './ManageSection';



const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [user, setUser] = useState<{ fullName: string; firstName: string } | null>(null);



  useEffect(() => {
    setUser(getUserDetails());
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const apiUrl = getApiUrl();
        const orgId = getOrgId();

        if (!orgId) {
          console.error('No organization ID found');
          setLoading(false);
          return;
        }

        // Fetch employee count
        try {
          const employeesRes = await axios.get(`${apiUrl}/org/${orgId}/employees?limit=1`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          console.log('Employee count response:', employeesRes.data);

          // Extract total count from response metadata
          // Try different possible response structures
          let total = 0;
          if (employeesRes.data?.total !== undefined) {
            total = employeesRes.data.total;
          } else if (employeesRes.data?.count !== undefined) {
            total = employeesRes.data.count;
          } else if (employeesRes.data?.data && Array.isArray(employeesRes.data.data)) {
            // If the API returns all employees in data array, count them
            total = employeesRes.data.data.length;
          } else if (Array.isArray(employeesRes.data)) {
            total = employeesRes.data.length;
          }

          console.log('Extracted employee count:', total);
          setEmployeeCount(total);
        } catch (error: any) {
          if (error.response?.status !== 404) {
            console.error('Error fetching employee count:', error);
          }
          setEmployeeCount(0);
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
    <div className="min-h-screen bg-white p-4 sm:p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner and Employee Count Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Welcome Banner */}
          <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-16 sm:-mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.firstName || 'Admin'}!
              </h1>
              <p className="text-blue-100/90 text-sm sm:base">
                Here's what's happening in your organization today.
              </p>
            </div>
          </div>

          {/* Total Employees Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Total Employees</h3>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{loading ? '...' : employeeCount}</div>
              <p className="text-[10px] sm:text-xs text-green-600 mt-1 flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Active Staff
              </p>
            </div>
          </div>
        </div>

        {/* Widgets Row: Announcements and Holidays */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Announcements */}
          <AnnouncementsSection />

          {/* Holidays */}
          <UpcomingHolidaysSection />
        </div>



        {/* Manage Organization Section */}
        <ManageSection />
      </div>
    </div>
  );
};

export default Dashboard;