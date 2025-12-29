'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
  TrendingUp,
  Timer,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  User
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  subDays,
  addDays,
  subWeeks,
  addWeeks,
  subMonths,
  addMonths,
  subYears,
  addYears,
  parse,
  isSameDay
} from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import attendanceService from '@/lib/attendanceService';
import employeeService from '@/lib/employeeService';

interface AttendanceRecord {
  employeeName?: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: string;
  status: 'Present' | 'Late' | 'Leave' | 'Weekend' | 'Absent' | string;
}

interface PersonalAttendanceRecord {
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  status?: string;
}

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

const AttendanceTracker: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Loading state for API calls
  const [loading, setLoading] = useState(false);

  // Attendance data from API
  const [allEmployeesRecords, setAllEmployeesRecords] = useState<AttendanceRecord[]>([]);
  const [adminRecords, setAdminRecords] = useState<PersonalAttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<{ id: string, fullName: string }[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch employees for dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      const orgId = getOrgId();
      if (!orgId) return;
      const res = await employeeService.getAll(orgId);
      if (res && !res.error) {
        setEmployees(Array.isArray(res.data) ? res.data : []);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch both all employees and admin's own attendance data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const orgId = getOrgId();
        if (!orgId) return;

        let startDateStr = '';
        let endDateStr = '';

        const start = viewMode === 'daily' ? currentDate :
          viewMode === 'weekly' ? startOfWeek(currentDate, { weekStartsOn: 1 }) :
            viewMode === 'monthly' ? startOfMonth(currentDate) :
              startOfYear(currentDate);

        const end = viewMode === 'daily' ? currentDate :
          viewMode === 'weekly' ? endOfWeek(currentDate, { weekStartsOn: 1 }) :
            viewMode === 'monthly' ? endOfMonth(currentDate) :
              endOfYear(currentDate);

        startDateStr = format(start, 'yyyy-MM-dd');
        endDateStr = format(end, 'yyyy-MM-dd');

        // 1. Fetch Admin's Personal History
        const adminHistoryRes = await attendanceService.getMyHistory(orgId, startDateStr, endDateStr);
        if (adminHistoryRes && !adminHistoryRes.error) {
          // Robust extraction: check .attendance, .data.attendance, .data, or direct array
          const rawData = adminHistoryRes as any;
          const records = rawData.attendance ||
            (rawData.data && rawData.data.attendance) ||
            (Array.isArray(rawData.data) ? rawData.data : (Array.isArray(rawData) ? rawData : []));
          setAdminRecords(records);
        }

        // 2. Fetch All Employees Attendance
        let employeeRecords: AttendanceRecord[] = [];
        const qParam = selectedEmployee !== 'all' ? selectedEmployee : searchQuery;

        if (viewMode === 'daily' && !qParam) {
          const dailyRes = await attendanceService.getDailyAttendance(orgId, startDateStr);
          if (dailyRes && !dailyRes.error) {
            const rawDaily = dailyRes as any;
            const data = Array.isArray(rawDaily) ? rawDaily :
              (rawDaily.data && Array.isArray(rawDaily.data) ? rawDaily.data :
                (rawDaily.data && Array.isArray(rawDaily.data.attendance) ? rawDaily.data.attendance : []));

            employeeRecords = data.map((r: any) => ({
              employeeName: r.employeeName || (r.employee && (r.employee.fullName || r.employee.name)) || 'Unknown',
              date: startDateStr,
              checkIn: r.checkInTime ? format(new Date(r.checkInTime), 'hh:mm a') : '-',
              checkOut: r.checkOutTime ? format(new Date(r.checkOutTime), 'hh:mm a') : '-',
              hoursWorked: r.totalHours ? `${r.totalHours}h` : '-',
              status: r.status || (r.checkInTime ? 'Present' : 'Absent')
            }));
          }
        } else {
          // For weekly/monthly/yearly or if there's a search query, use search
          const searchRes = await attendanceService.searchAttendance(orgId, qParam, startDateStr, endDateStr);
          if (searchRes && !searchRes.error) {
            const rawSearch = searchRes as any;
            const data = (rawSearch.data && Array.isArray(rawSearch.data)) ? rawSearch.data :
              (Array.isArray(rawSearch) ? rawSearch : []);

            employeeRecords = data.map((r: any) => ({
              employeeName: r.employeeName || (r.employee && (r.employee.fullName || r.employee.name)) || 'Unknown',
              date: r.date ? (typeof r.date === 'string' && r.date.includes('T') ? format(new Date(r.date), 'yyyy-MM-dd') : r.date) : '-',
              checkIn: r.checkInTime ? format(new Date(r.checkInTime), 'hh:mm a') : '-',
              checkOut: r.checkOutTime ? format(new Date(r.checkOutTime), 'hh:mm a') : '-',
              hoursWorked: r.totalHours ? `${r.totalHours}h` : '-',
              status: r.status || (r.checkInTime ? 'Present' : 'Absent')
            }));
          }
        }
        setAllEmployeesRecords(employeeRecords);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [viewMode, currentDate, searchQuery, selectedEmployee]);

  const filteredData = allEmployeesRecords;

  const stats = useMemo(() => {
    const totalWorkingDays = filteredData.length;
    const presentCount = filteredData.filter(d => d.status === 'Present' || d.checkIn !== '-').length;
    const lateCount = filteredData.filter(d => d.status === 'Late').length;
    const leaveCount = filteredData.filter(d => d.status === 'Leave').length;
    const absentCount = filteredData.filter(d => d.status === 'Absent' || (d.checkIn === '-' && d.status !== 'Leave' && d.status !== 'Weekend')).length;

    // Estimate hours if not provided
    let totalMinutes = 0;
    filteredData.forEach(r => {
      if (r.hoursWorked && r.hoursWorked !== '-') {
        const h = parseFloat(r.hoursWorked);
        if (!isNaN(h)) totalMinutes += h * 60;
      }
    });

    const avgMinutes = totalWorkingDays > 0 ? totalMinutes / totalWorkingDays : 0;
    const totalHoursStr = `${Math.floor(totalMinutes / 60)}h ${Math.round(totalMinutes % 60)}m`;
    const avgHoursStr = `${Math.floor(avgMinutes / 60)}h ${Math.round(avgMinutes % 60)}m`;

    return [
      { icon: CalendarIcon, label: 'Total Records', value: totalWorkingDays.toString(), color: 'text-gray-700' },
      { icon: CheckCircle, label: 'Present', value: presentCount.toString(), color: 'text-green-500' },
      { icon: Clock, label: 'Late', value: lateCount.toString(), color: 'text-yellow-500' },
      { icon: FileText, label: 'Leave', value: leaveCount.toString(), color: 'text-blue-500' },
      { icon: XCircle, label: 'Absent', value: absentCount.toString(), color: 'text-red-500' },
      { icon: TrendingUp, label: 'Avg Hours', value: avgHoursStr, color: 'text-purple-500' },
      { icon: Timer, label: 'Total Hours', value: totalHoursStr, color: 'text-gray-700' },
    ];
  }, [filteredData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-700';
      case 'Late': return 'bg-yellow-100 text-yellow-700';
      case 'Leave': return 'bg-blue-100 text-blue-700';
      case 'Weekend': return 'bg-gray-100 text-gray-600';
      case 'Absent': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handlePrevious = () => {
    switch (viewMode) {
      case 'daily': setCurrentDate(subDays(currentDate, 1)); break;
      case 'weekly': setCurrentDate(subWeeks(currentDate, 1)); break;
      case 'monthly': setCurrentDate(subMonths(currentDate, 1)); break;
      case 'yearly': setCurrentDate(subYears(currentDate, 1)); break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'daily': setCurrentDate(addDays(currentDate, 1)); break;
      case 'weekly': setCurrentDate(addWeeks(currentDate, 1)); break;
      case 'monthly': setCurrentDate(addMonths(currentDate, 1)); break;
      case 'yearly': setCurrentDate(addYears(currentDate, 1)); break;
    }
  };

  const getPeriodLabel = () => {
    switch (viewMode) {
      case 'daily':
        return format(currentDate, 'PPP');
      case 'weekly':
        const end = addDays(currentDate, 6);
        return `${format(currentDate, 'PP')} - ${format(end, 'PP')}`;
      case 'monthly':
        return format(currentDate, 'MMMM yyyy');
      case 'yearly':
        return format(currentDate, 'yyyy');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Check In', 'Check Out', 'Hours Worked', 'Status'];
    const rows = filteredData.map(r => [
      format(parse(r.date, 'yyyy-MM-dd', new Date()), 'PP'),
      r.checkIn,
      r.checkOut,
      r.hoursWorked,
      r.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    let fileName = `attendance_${viewMode}_${format(currentDate, 'yyyyMMdd')}.csv`;
    if (viewMode === 'weekly') {
      const end = addDays(currentDate, 6);
      fileName = `attendance_weekly_${format(currentDate, 'yyyyMMdd')}_to_${format(end, 'yyyyMMdd')}.csv`;
    }

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Attendance</h1>
            <p className="text-sm md:text-base text-gray-500">Track your daily attendance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters and Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex p-1 bg-gray-100 rounded-lg w-fit">
              {(['daily', 'weekly', 'monthly', 'yearly'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 relative">
              <button
                onClick={handlePrevious}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div ref={calendarRef}>
                <button
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm md:text-base font-semibold text-gray-900 min-w-[150px] text-center border border-transparent hover:border-gray-200"
                >
                  {getPeriodLabel()}
                </button>

                {isCalendarOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white shadow-xl rounded-xl border border-gray-200 p-2">
                    <Calendar
                      mode="single"
                      selected={currentDate}
                      onSelect={(date: Date | undefined) => {
                        if (date) {
                          setCurrentDate(date);
                          setIsCalendarOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleNext}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4 mb-6 md:mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-4 md:p-6 text-center">
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 md:mb-3 ${stat.color}`} />
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500 text-nowrap">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Admin Personal Attendance History */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">My Attendance History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap">Check In</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap">Check Out</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap">Hours Worked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Loading your records...
                    </td>
                  </tr>
                ) : adminRecords.length > 0 ? (
                  adminRecords.map((record, idx) => {
                    const recordDate = record.date ? (typeof record.date === 'string' && record.date.includes('-') ? record.date : format(new Date(record.date), 'yyyy-MM-dd')) : '-';
                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 md:px-6 md:py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {recordDate}
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-gray-700 whitespace-nowrap">
                          {record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : '-'}
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-gray-700 whitespace-nowrap">
                          {record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm a') : '-'}
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-gray-700 whitespace-nowrap">
                          {record.totalHours ? `${record.totalHours}h` : '-'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No personal records found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Attendance History (All Employees) */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Attendance History</h2>
              <div className="flex flex-col md:flex-row items-center gap-3">
                {/* Employee Dropdown */}
                <div className="relative w-full md:w-64">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="all">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.fullName}>
                        {emp.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap">Employee</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap">Check In</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap">Check Out</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Loading employee records...
                    </td>
                  </tr>
                ) : allEmployeesRecords.length > 0 ? (
                  allEmployeesRecords.map((record, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 md:px-6 md:py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {record.employeeName}
                      </td>
                      <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-gray-600 whitespace-nowrap">
                        {record.date}
                      </td>
                      <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-gray-700 whitespace-nowrap">{record.checkIn}</td>
                      <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-gray-700 whitespace-nowrap">{record.checkOut}</td>
                      <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No employee attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;