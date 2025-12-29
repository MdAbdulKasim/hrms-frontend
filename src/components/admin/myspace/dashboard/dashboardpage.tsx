'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, Users, List, UserCheck } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
// import QuickLinksSection from './quicklink';
import AnnouncementsSection from './announcement';
import UpcomingHolidaysSection from './holidays';
 
 
 
const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [newHires, setNewHires] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [onLeaveToday, setOnLeaveToday] = useState<any[]>([]);

  useEffect(() => {
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

        // Fetch employees for birthdays and new hires
        try {
          const employeesRes = await axios.get(`${apiUrl}/org/${orgId}/employees`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const employees = employeesRes.data?.data || employeesRes.data || [];
          
          // Get current month for birthdays
          const today = new Date();
          const currentMonth = today.getMonth();
          
          // Filter birthdays for current month
          const birthdayEmployees = employees.filter((emp: any) => {
            if (emp.dateOfBirth) {
              const birthDate = new Date(emp.dateOfBirth);
              return birthDate.getMonth() === currentMonth;
            }
            return false;
          });
          setBirthdays(birthdayEmployees);

          // Filter new hires (joined in last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const recentHires = employees.filter((emp: any) => {
            if (emp.joiningDate) {
              const joinDate = new Date(emp.joiningDate);
              return joinDate >= thirtyDaysAgo;
            }
            return false;
          });
          setNewHires(recentHires);
        } catch (error) {
          console.error('Error fetching employees:', error);
          setBirthdays([]);
          setNewHires([]);
        }

        // Fetch pending tasks (leave requests that need approval)
        try {
          const leaveRequestsRes = await axios.get(`${apiUrl}/org/${orgId}/leave-requests`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const leaveRequests = leaveRequestsRes.data?.data || leaveRequestsRes.data || [];
          
          // Filter pending approvals
          const pendingApprovals = leaveRequests.filter((request: any) => 
            request.status === 'pending' || request.status === 'Pending'
          );
          
          // Convert to task format
          const tasks = pendingApprovals.map((request: any) => ({
            id: request.id,
            title: `Approve leave request from ${request.employeeName || 'Employee'}`,
            priority: 'high',
            type: 'leave_approval'
          }));
          
          // Add some default tasks if needed
          const defaultTasks = [
            { id: 'review_timesheet', title: 'Review timesheet', priority: 'high', type: 'timesheet' },
            { id: 'complete_training', title: 'Complete training', priority: 'low', type: 'training' }
          ];
          
          setPendingTasks([...tasks, ...defaultTasks]);
        } catch (error) {
          console.error('Error fetching leave requests:', error);
          setPendingTasks([
            { id: 'review_timesheet', title: 'Review timesheet', priority: 'high', type: 'timesheet' },
            { id: 'complete_training', title: 'Complete training', priority: 'low', type: 'training' }
          ]);
        }

        // Fetch employees on leave today
        try {
          const attendanceRes = await axios.get(`${apiUrl}/org/${orgId}/attendance`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { date: new Date().toISOString().split('T')[0] }
          });
          const attendanceRecords = attendanceRes.data?.data || attendanceRes.data || [];
          
          // Filter employees on leave
          const onLeaveEmployees = attendanceRecords.filter((record: any) => 
            record.status === 'leave' || record.status === 'Leave'
          );
          
          setOnLeaveToday(onLeaveEmployees);
        } catch (error) {
          console.error('Error fetching attendance:', error);
          setOnLeaveToday([]);
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
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Row - Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Birthdays */}
          {/* <div className="bg-white rounded-lg shadow p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-pink-600" />
              </div>
              <h2 className="text-lg font-semibold truncate">Birthdays</h2>
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : birthdays.length === 0 ? (
                <p className="text-sm text-gray-500">No birthdays this month</p>
              ) : (
                birthdays.slice(0, 3).map((employee: any) => (
                  <div key={employee.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-medium shrink-0">
                      {employee.firstName?.charAt(0) || employee.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'Today'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div> */}
 
          {/* New Hires */}
          {/* <div className="bg-white rounded-lg shadow p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold truncate">New Hires</h2>
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : newHires.length === 0 ? (
                <p className="text-sm text-gray-500">No new hires recently</p>
              ) : (
                newHires.slice(0, 3).map((employee: any) => (
                  <div key={employee.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium shrink-0">
                      {employee.firstName?.charAt(0) || employee.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {employee.designation || 'Employee'} · {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div> */}
 
          {/* Quick Links - Extracted Component */}
          {/* Note: Passing grid classes here to maintain layout */}
          {/* <QuickLinksSection className="sm:col-span-2 lg:col-span-1" /> */}
        </div>
 
        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Announcements - Extracted Component */}
          <AnnouncementsSection />
 
          {/* Upcoming Holidays - Extracted Component */}
          <UpcomingHolidaysSection />
        </div>
 
        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* My Pending Tasks */}
          {/* <div className="bg-white rounded-lg shadow p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <List className="w-4 h-4 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold truncate">My Pending Tasks</h2>
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : pendingTasks.length === 0 ? (
                <p className="text-sm text-gray-500">No pending tasks</p>
              ) : (
                pendingTasks.slice(0, 5).map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm truncate">{task.title}</span>
                    <span className={`px-2 py-1 text-white text-xs rounded shrink-0 ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-gray-800' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div> */}
 
          {/* On Leave Today */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold truncate">On Leave Today</h2>
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : onLeaveToday.length === 0 ? (
                <p className="text-sm text-gray-500">No employees on leave today</p>
              ) : (
                onLeaveToday.slice(0, 3).map((record: any) => (
                  <div key={record.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium shrink-0">
                      {record.employeeName?.charAt(0) || record.employee?.firstName?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">
                        {record.employeeName || `${record.employee?.firstName} ${record.employee?.lastName}`}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {record.leaveType || 'Leave'} · {record.endDate ? `Until ${new Date(record.endDate).toLocaleDateString()}` : 'Today'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Dashboard;