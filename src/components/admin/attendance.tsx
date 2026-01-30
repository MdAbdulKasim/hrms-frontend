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
  User,
  Eye,
  Filter,
  UserX
} from 'lucide-react';
import ViewAttendanceDetails from './ViewAttendanceDetails';
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
import { getApiUrl, getAuthToken, getOrgId, getCookie } from '@/lib/auth';
import attendanceService from '@/lib/attendanceService';
import employeeService from '@/lib/employeeService';

interface AttendanceRecord {
  employeeId?: string;
  employeeName?: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: string;
  standardHours?: number;
  overtimeHours?: number;
  status: 'Present' | 'Late' | 'Leave' | 'Weekend' | 'Absent' | string;
}

interface PersonalAttendanceRecord {
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  standardHours?: number;
  overtimeHours?: number;
  status?: string;
}

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

const AttendanceTracker: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Loading state for API calls
  const [loading, setLoading] = useState(false);

  // Attendance data from API
  const [allEmployeesRecords, setAllEmployeesRecords] = useState<AttendanceRecord[]>([]);
  const [adminRecords, setAdminRecords] = useState<PersonalAttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<{ id: string, fullName: string, employeeId?: string }[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<AttendanceRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
        const data = Array.isArray(res.data) ? res.data : [];
        setEmployees(data.map((e: any) => ({
          id: e.id,
          fullName: e.fullName,
          employeeId: e.employeeNumber || e.employeeId
        })));
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

        // Shared data containers
        let dailyAttendanceData: any[] = [];
        let adminRealTimeRecord: any = null;
        let foundMyRecord: any = null;

        // 1. If DAILY view, fetch daily attendance for everyone first (Single source of truth)
        if (viewMode === 'daily') {
          const dailyRes = await attendanceService.getDailyAttendance(orgId, startDateStr);
          if (dailyRes && !dailyRes.error) {
            const rawDaily = dailyRes as any;
            dailyAttendanceData = Array.isArray(rawDaily) ? rawDaily :
              (rawDaily.data && Array.isArray(rawDaily.data) ? rawDaily.data :
                (rawDaily.data && Array.isArray(rawDaily.data.attendance) ? rawDaily.data.attendance : []));
          }

          // Populate Admin Records from this Daily Data
          const myId = getCookie('hrms_user_id');

          if (myId) {
            foundMyRecord = dailyAttendanceData.find((r: any) =>
              r.employeeId === myId ||
              (r.employee && (r.employee.id === myId || r.employee._id === myId))
            );
          }

          if (foundMyRecord) {
            // Found in daily list data
            const hasCheckedIn = !!(foundMyRecord.checkInTime || foundMyRecord.checkIn);
            const hasCheckedOut = !!(foundMyRecord.checkOutTime || foundMyRecord.checkOut);
            const isToday = isSameDay(new Date(), parse(startDateStr, 'yyyy-MM-dd', new Date()));

            let status = 'Absent';
            if (hasCheckedIn) {
              if (hasCheckedOut) {
                status = 'Present';
                if (foundMyRecord.status === 'Late') status = 'Late';
              } else {
                status = isToday ? 'Present' : 'Absent';
              }
            }

            const record = {
              date: startDateStr,
              checkInTime: foundMyRecord.checkInTime || foundMyRecord.checkIn,
              checkOutTime: foundMyRecord.checkOutTime || foundMyRecord.checkOut,
              totalHours: foundMyRecord.totalHours || foundMyRecord.hoursWorked,
              status: foundMyRecord.status || status
            };
            setAdminRecords([record]);
            adminRealTimeRecord = record;
          } else {
            // Not found in daily list (or list empty).
            // If TODAY, try getStatus as fallback/supplement
            if (isSameDay(currentDate, new Date())) {
              const statusRes = await attendanceService.getStatus(orgId);
              let currentStatusRecord: PersonalAttendanceRecord = {
                date: format(currentDate, 'yyyy-MM-dd'),
                status: 'Absent'
              };

              if (statusRes && !statusRes.error) {
                const rawData = statusRes.data as any;
                if (rawData) {
                  currentStatusRecord = {
                    date: rawData.date ? (typeof rawData.date === 'string' && rawData.date.includes('T') ? format(new Date(rawData.date), 'yyyy-MM-dd') : rawData.date) : format(currentDate, 'yyyy-MM-dd'),
                    checkInTime: rawData.checkInTime || rawData.checkIn,
                    checkOutTime: rawData.checkOutTime || rawData.checkOut,
                    totalHours: rawData.totalHours || rawData.hoursWorked,
                    status: rawData.status || (rawData.checkInTime || rawData.checkIn ? 'Present' : 'Absent')
                  };
                }
              }
              setAdminRecords([currentStatusRecord]);
              adminRealTimeRecord = currentStatusRecord;
            } else {
              // Past day, not in list -> Absent
              setAdminRecords([{ date: startDateStr, status: 'Absent' }]);
            }
          }
        } else {
          // Weekly/Monthly/Yearly -> Use getMyHistory
          const adminHistoryRes = await attendanceService.getMyHistory(orgId, startDateStr, endDateStr);
          if (adminHistoryRes && !adminHistoryRes.error) {
            const rawData = adminHistoryRes as any;
            const records = rawData.attendance ||
              (rawData.data && rawData.data.attendance) ||
              (Array.isArray(rawData.data) ? rawData.data : (Array.isArray(rawData) ? rawData : []));
            setAdminRecords(records);
          }
        }

        // 2. Populate All Employees Table
        let employeeRecords: AttendanceRecord[] = [];
        const qParam = selectedEmployee !== 'all' ? selectedEmployee : searchQuery;

        if (viewMode === 'daily' && !qParam) {
          // Use the ALREADY FETCHED dailyAttendanceData
          employeeRecords = dailyAttendanceData.map((r: any) => {
            const rawStatus = r.status?.toLowerCase();
            const hasCheckedIn = !!(r.checkInTime || r.checkIn);
            const hasCheckedOut = !!(r.checkOutTime || r.checkOut);
            const isToday = isSameDay(new Date(), parse(startDateStr, 'yyyy-MM-dd', new Date()));

            let status = 'Absent';
            if (hasCheckedIn) {
              if (hasCheckedOut) {
                status = 'Present';
                if (rawStatus === 'late') status = 'Late';
              } else {
                status = isToday ? 'Present' : 'Absent';
              }
            } else {
              if (rawStatus === 'late') status = 'Late';
              else if (rawStatus === 'present') status = 'Present';
            }

            if (rawStatus === 'holiday') status = 'Holiday';
            else if (rawStatus === 'leave') status = 'Leave';
            else if (rawStatus === 'weekend') status = 'Weekend';
            else if (rawStatus === 'absent') status = 'Absent';

            return {
              employeeId: r.employee?.employeeNumber || r.employeeNumber || 'N/A',
              employeeName: r.employeeName || (r.employee && (r.employee.fullName || r.employee.name)) || 'Unknown',
              date: startDateStr,
              checkIn: r.checkInTime ? format(new Date(r.checkInTime), 'hh:mm a') : '-',
              checkOut: r.checkOutTime ? format(new Date(r.checkOutTime), 'hh:mm a') : '-',
              hoursWorked: r.totalHours ? `${r.totalHours}h` : '-',
              standardHours: r.standardHours,
              overtimeHours: r.overtimeHours,
              status: status
            };
          });

          // If we found a specific admin record via fallback (getStatus) for Today that wasn't in dailyRes,
          // we might want to inject it into the main list if not present?
          // But usually, if it wasn't in dailyRes, it might not be relevant for the team list unless we want to force it.
          // The previous code forced it. Let's keep that behavior if checkIn exists.
          // We need this injection if dailyRes didn't find us (e.g. backend lag) but getStatus found us.
          if (adminRealTimeRecord && isSameDay(currentDate, new Date()) && adminRealTimeRecord.status !== 'Absent') {
            const myId = getCookie('hrms_user_id');
            if (myId) { // Only inject if we can identify ourselves
              const myName = employees.find(e => e.id === myId)?.fullName || 'Me';

              // Check if we are already in the list to avoid duplication
              const existingIndex = employeeRecords.findIndex(r => r.employeeName === myName);

              if (existingIndex === -1 && !foundMyRecord) { // Only inject if NOT found in daily list (foundMyRecord covers this conceptually, but checking index is safer)
                const adminEntry: AttendanceRecord = {
                  employeeId: employees.find(e => e.id === myId)?.employeeId || 'N/A', // Assuming employee object in state has employeeId
                  employeeName: myName,
                  date: startDateStr,
                  checkIn: adminRealTimeRecord.checkInTime ? format(new Date(adminRealTimeRecord.checkInTime), 'hh:mm a') : '-',
                  checkOut: adminRealTimeRecord.checkOutTime ? format(new Date(adminRealTimeRecord.checkOutTime), 'hh:mm a') : '-',
                  hoursWorked: adminRealTimeRecord.totalHours ? `${adminRealTimeRecord.totalHours}h` : '-',
                  status: adminRealTimeRecord.status || 'Present'
                };
                employeeRecords.unshift(adminEntry);
              }
            }
          }

        } else {
          // Search Mode or Date Range
          const searchRes = await attendanceService.searchAttendance(orgId, qParam, startDateStr, endDateStr);
          if (searchRes && !searchRes.error) {
            const rawSearch = searchRes as any;
            const data = (rawSearch.data && Array.isArray(rawSearch.data)) ? rawSearch.data :
              (Array.isArray(rawSearch) ? rawSearch : []);

            employeeRecords = data.map((r: any) => {
              const rawStatus = r.status?.toLowerCase();
              const hasCheckedIn = !!(r.checkInTime || r.checkIn);
              const hasCheckedOut = !!(r.checkOutTime || r.checkOut);
              const recordDateStr = r.date ? (typeof r.date === 'string' && r.date.includes('T') ? format(new Date(r.date), 'yyyy-MM-dd') : r.date) : startDateStr;
              const isToday = isSameDay(new Date(), parse(recordDateStr, 'yyyy-MM-dd', new Date()));

              let status = 'Absent';
              if (hasCheckedIn) {
                if (hasCheckedOut) {
                  status = 'Present';
                  if (rawStatus === 'late') status = 'Late';
                } else {
                  status = isToday ? 'Present' : 'Absent';
                }
              } else {
                if (rawStatus === 'late') status = 'Late';
                else if (rawStatus === 'present') status = 'Present';
              }

              if (rawStatus === 'holiday') status = 'Holiday';
              else if (rawStatus === 'leave') status = 'Leave';
              else if (rawStatus === 'weekend') status = 'Weekend';
              else if (rawStatus === 'absent') status = 'Absent';

              return {
                employeeId: r.employee?.employeeNumber || r.employeeNumber || 'N/A',
                employeeName: r.employeeName || (r.employee && (r.employee.fullName || r.employee.name)) || 'Unknown',
                date: r.date ? (typeof r.date === 'string' && r.date.includes('T') ? format(new Date(r.date), 'yyyy-MM-dd') : r.date) : '-',
                checkIn: r.checkInTime ? format(new Date(r.checkInTime), 'hh:mm a') : '-',
                checkOut: r.checkOutTime ? format(new Date(r.checkOutTime), 'hh:mm a') : '-',
                hoursWorked: r.totalHours ? `${r.totalHours}h` : '-',
                standardHours: r.standardHours,
                overtimeHours: r.overtimeHours,
                status: status
              };
            });
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
  }, [viewMode, currentDate, searchQuery, selectedEmployee, refreshKey]);

  const handleMarkAbsent = async (employeeId: string, employeeName: string, dateStr?: string) => {
    if (!employeeId) return;
    if (!confirm(`Are you sure you want to mark ${employeeName} as absent?`)) return;

    try {
      setLoading(true);
      const orgId = getOrgId();
      if (!orgId) return;

      // Use record date if provided, otherwise current viewing date
      const targetDate = dateStr || format(currentDate, 'yyyy-MM-dd');

      const res = await attendanceService.markAbsent(orgId, employeeId, targetDate);

      if (res && !res.error) {
        // Success - refresh data
        setRefreshKey(prev => prev + 1);
      } else {
        alert(res.error || 'Failed to mark absent');
      }
    } catch (error) {
      console.error('Error marking absent:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Filter records based on status filter
  const filteredRecords = useMemo(() => {
    return allEmployeesRecords.filter(record => {
      // Status Filter
      if (statusFilter !== 'all' && record.status !== statusFilter) return false;
      return true;
    });
  }, [allEmployeesRecords, statusFilter]);

  const filteredData = filteredRecords; // Use filtered records for stats calculation

  const stats = useMemo(() => {
    const totalRecords = filteredData.length;
    const workingDaysData = filteredData.filter(d => d.status !== 'Holiday' && d.status !== 'Weekend');
    const totalWorkingDays = workingDaysData.length;

    const presentCount = filteredData.filter(d => d.status === 'Present' || d.status === 'Late').length;
    const lateCount = filteredData.filter(d => d.status === 'Late').length;
    const leaveCount = filteredData.filter(d => d.status === 'Leave').length;
    const absentCount = workingDaysData.filter(d => d.status === 'Absent').length;
    const holidayCount = filteredData.filter(d => d.status === 'Holiday').length;

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
      { icon: CalendarIcon, label: 'Total Records', value: totalRecords.toString(), color: 'text-gray-700' },
      { icon: CheckCircle, label: 'Present', value: presentCount.toString(), color: 'text-green-500' },
      { icon: Clock, label: 'Late', value: lateCount.toString(), color: 'text-yellow-500' },
      { icon: FileText, label: 'Leave', value: leaveCount.toString(), color: 'text-blue-500' },
      { icon: CalendarIcon, label: 'Holiday', value: holidayCount.toString(), color: 'text-orange-500' },
      { icon: XCircle, label: 'Absent', value: absentCount.toString(), color: 'text-red-500' },
      { icon: TrendingUp, label: 'Avg Hours', value: avgHoursStr, color: 'text-purple-500' },
    ];
  }, [filteredData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-700';
      case 'Late': return 'bg-yellow-100 text-yellow-700';
      case 'Leave': return 'bg-blue-100 text-blue-700';
      case 'Holiday': return 'bg-orange-100 text-orange-700';
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

  const downloadCSV = (headers: string[], rows: any[][], fileName: string) => {
    // Add BOM for Excel UTF-8 support
    const BOM = '\uFEFF';
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const str = String(val ?? '').replace(/"/g, '""');
        return `"${str}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExportPersonalCSV = () => {
    const headers = ['Date', 'Check In', 'Check Out', 'Hours Worked'];
    const rows = adminRecords.map(r => {
      const recordDate = r.date ? (typeof r.date === 'string' && r.date.includes('-') ? r.date : format(new Date(r.date), 'yyyy-MM-dd')) : '-';
      return [
        `\t${recordDate}`,
        r.checkInTime ? format(new Date(r.checkInTime), 'hh:mm a') : '-',
        r.checkOutTime ? format(new Date(r.checkOutTime), 'hh:mm a') : '-',
        r.totalHours ? `${r.totalHours}h` : '-'
      ];
    });

    const fileName = `my_attendance_${format(currentDate, 'yyyy-MM')}.csv`;
    downloadCSV(headers, rows, fileName);
  };

  const handleExportTeamCSV = () => {
    const headers = ['Employee ID', 'Employee Name', 'Date', 'Check In', 'Check Out', 'Status'];
    const rows = allEmployeesRecords.map(r => [
      r.employeeId || 'N/A',
      r.employeeName || 'Unknown',
      `\t${r.date}`,
      r.checkIn,
      r.checkOut,
      r.status
    ]);

    const fileName = `team_attendance_${viewMode}_${format(currentDate, 'yyyyMMdd')}.csv`;
    downloadCSV(headers, rows, fileName);
  };

  return (
    <div className="min-h-screen bg-white p-1 sm:p-4 md:p-8">
      <style jsx>{`
        @media (max-width: 480px) {
          .responsive-text { font-size: 11px; }
          .responsive-title { font-size: 18px; }
          .responsive-button { padding: 4px 8px; font-size: 10px; }
          .responsive-stat-value { font-size: 16px; }
          .responsive-stat-label { font-size: 9px; }
          .responsive-table-text { font-size: 10px; }
          .responsive-input { font-size: 11px; height: 32px; }
        }
        @media (max-width: 300px) {
          .responsive-text { font-size: 9px; }
          .responsive-title { font-size: 14px; }
          .responsive-button { padding: 2px 4px; font-size: 8px; }
          .responsive-stat-value { font-size: 14px; }
          .responsive-stat-label { font-size: 8px; }
          .responsive-table-text { font-size: 9px; }
          .responsive-input { font-size: 9px; height: 28px; }
          .responsive-icon { width: 12px; height: 12px; }
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8 gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 responsive-title">Attendance Tracker</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 responsive-text">Track and manage employee attendance records</p>
          </div>
        </div>

        {/* Filters and Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex p-1 bg-gray-100 rounded-lg w-fit overflow-x-auto responsive-gap">
              {(['daily', 'weekly', 'monthly', 'yearly'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-sm font-medium rounded-md transition-all whitespace-nowrap ${viewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 sm:gap-4 relative">
              <button
                onClick={handlePrevious}
                className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 responsive-icon" />
              </button>

              <div ref={calendarRef}>
                <button
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="px-2 sm:px-4 py-1 sm:py-2 hover:bg-gray-50 rounded-lg transition-colors text-xs sm:text-sm md:text-base font-semibold text-gray-900 min-w-[100px] sm:min-w-[150px] text-center border border-transparent hover:border-gray-200 responsive-text"
                >
                  {getPeriodLabel()}
                </button>

                {isCalendarOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white shadow-xl rounded-xl border border-gray-200 p-1 sm:p-2 scale-[0.85] sm:scale-100">
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
                className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 responsive-icon" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4 mb-4 sm:mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-2 sm:p-4 md:p-6 text-center border border-gray-100">
              <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mx-auto mb-1 sm:mb-2 md:mb-3 ${stat.color} responsive-icon`} />
              <div className="text-base sm:text-2xl md:text-3xl font-bold text-gray-900 mb-0.5 responsive-stat-value">{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-gray-500 truncate responsive-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Admin Personal Attendance History */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 responsive-text">My Attendance History</h2>
            <Button onClick={handleExportPersonalCSV} variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 h-8 sm:h-9 responsive-button">
              <Download className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
              <span className="responsive-text">Export CSV</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="px-2 py-2 sm:px-6 sm:py-4 text-left text-[10px] sm:text-sm font-medium text-black whitespace-nowrap responsive-header">Date</th>
                  <th className="px-2 py-2 sm:px-6 sm:py-4 text-left text-[10px] sm:text-sm font-medium text-black whitespace-nowrap responsive-header">Check In</th>
                  <th className="px-2 py-2 sm:px-6 sm:py-4 text-left text-[10px] sm:text-sm font-medium text-black whitespace-nowrap responsive-header">Check Out</th>
                  <th className="px-2 py-2 sm:px-6 sm:py-4 text-left text-[10px] sm:text-sm font-medium text-black whitespace-nowrap responsive-header">Hours Worked</th>
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
                    const recordDate = record.date ? (typeof record.date === 'string' && record.date.includes('T') ? format(new Date(record.date), 'yyyy-MM-dd') : record.date) : '-';
                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-2 py-2 sm:px-6 sm:py-4 text-[10px] sm:text-sm font-medium text-gray-900 whitespace-nowrap responsive-cell">
                          {recordDate}
                        </td>
                        <td className="px-2 py-2 sm:px-6 sm:py-4 text-[10px] sm:text-sm text-gray-700 whitespace-nowrap responsive-cell">
                          {record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : '-'}
                        </td>
                        <td className="px-2 py-2 sm:px-6 sm:py-4 text-[10px] sm:text-sm text-gray-700 whitespace-nowrap responsive-cell">
                          {record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm a') : '-'}
                        </td>
                        <td className="px-2 py-2 sm:px-6 sm:py-4 text-[10px] sm:text-sm text-gray-700 whitespace-nowrap responsive-cell">
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
          <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
                <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 responsive-text">All Employees</h2>
                <Button onClick={handleExportTeamCSV} variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 h-8 sm:h-9 responsive-button">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                  <span className="responsive-text">Export CSV</span>
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                {/* Employee Dropdown */}
                <div className="relative w-full sm:w-64">
                  <User className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 responsive-icon" />
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-4 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none responsive-input"
                  >
                    <option value="all">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.fullName}>
                        {emp.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative w-full sm:w-48">
                  <Filter className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 responsive-icon" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-4 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none responsive-input"
                  >
                    <option value="all">All Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="Leave">Leave</option>
                    <option value="Weekend">Weekend</option>
                    <option value="Holiday">Holiday</option>
                  </select>
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 responsive-icon" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-4 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 responsive-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="px-2 py-2 sm:px-6 sm:py-4 text-left text-[10px] sm:text-sm font-medium text-black whitespace-nowrap responsive-header">Employee</th>
                  <th className="px-2 py-2 sm:px-6 sm:py-4 text-left text-[10px] sm:text-sm font-medium text-black whitespace-nowrap responsive-header">Date</th>
                  <th className="px-2 py-2 sm:px-6 sm:py-4 text-left text-[10px] sm:text-sm font-medium text-black whitespace-nowrap responsive-header">Check In</th>
                  <th className="px-2 py-2 sm:px-6 sm:py-4 text-left text-[10px] sm:text-sm font-medium text-black whitespace-nowrap responsive-header">Check Out</th>
                  <th className="px-2 py-2 sm:px-6 sm:py-4 text-left text-[10px] sm:text-sm font-medium text-black whitespace-nowrap responsive-header">Status</th>
                  <th className="px-2 py-2 sm:px-6 sm:py-4 text-left text-[10px] sm:text-sm font-medium text-black whitespace-nowrap responsive-header">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Loading employee records...
                    </td>
                  </tr>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((record, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-2 sm:px-6 sm:py-4 text-[10px] sm:text-sm font-medium text-gray-900 whitespace-nowrap responsive-cell">
                        {record.employeeName}
                      </td>
                      <td className="px-2 py-2 sm:px-6 sm:py-4 text-[10px] sm:text-sm text-gray-600 whitespace-nowrap responsive-cell">
                        {record.date}
                      </td>
                      <td className="px-2 py-2 sm:px-6 sm:py-4 text-[10px] sm:text-sm text-gray-700 whitespace-nowrap responsive-cell">{record.checkIn}</td>
                      <td className="px-2 py-2 sm:px-6 sm:py-4 text-[10px] sm:text-sm text-gray-700 whitespace-nowrap responsive-cell">{record.checkOut}</td>
                      <td className="px-2 py-2 sm:px-6 sm:py-4 text-left whitespace-nowrap responsive-cell">
                        <span className={`inline-block px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md text-[9px] sm:text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-2 py-2 sm:px-6 sm:py-4 text-left whitespace-nowrap responsive-cell">
                        <button
                          onClick={() => {
                            setViewingRecord(record);
                            setIsViewDialogOpen(true);
                          }}
                          className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                        </button>
                        {record.status !== 'Present' && record.status !== 'Leave' && record.status !== 'Holiday' && record.status !== 'Weekend' && (
                          <button
                            onClick={() => handleMarkAbsent(record.employeeId || '', record.employeeName || '', record.date)}
                            className="p-1 sm:p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors ml-1"
                            title="Mark Absent"
                          >
                            <UserX className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                          </button>
                        )}
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
      {
        isViewDialogOpen && viewingRecord && (
          <ViewAttendanceDetails
            record={viewingRecord}
            onClose={() => {
              setIsViewDialogOpen(false);
              setViewingRecord(null);
            }}
          />
        )
      }
    </div >
  );
};

export default AttendanceTracker;