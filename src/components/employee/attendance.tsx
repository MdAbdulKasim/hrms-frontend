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
  Download
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
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
import { getOrgId } from '@/lib/auth';
import attendanceService from '@/lib/attendanceService';

interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: string;
  status: string;
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
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Loading state for API calls
  const [loading, setLoading] = useState(false);

  // Attendance data from API
  const [allAttendanceData, setAllAttendanceData] = useState<AttendanceRecord[]>([]);

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

  // Fetch attendance data from API
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const orgId = getOrgId();
        if (!orgId) return;



        let startDateStr = '';
        let endDateStr = '';

        const start = viewMode === 'daily' ? startOfDay(currentDate) :
          viewMode === 'weekly' ? startOfWeek(currentDate, { weekStartsOn: 1 }) :
            viewMode === 'monthly' ? startOfMonth(currentDate) :
              startOfYear(currentDate);

        const end = viewMode === 'daily' ? endOfDay(currentDate) :
          viewMode === 'weekly' ? endOfWeek(currentDate, { weekStartsOn: 1 }) :
            viewMode === 'monthly' ? endOfMonth(currentDate) :
              endOfYear(currentDate);

        startDateStr = start.toISOString();
        endDateStr = end.toISOString();

        // Special handling for "Today" in Daily view to get real-time status
        if (viewMode === 'daily' && isSameDay(currentDate, new Date())) {
          const statusRes = await attendanceService.getStatus(orgId);
          if (statusRes && !statusRes.error) {
            // Handle various backend response shapes (wrapped in .data or direct object)
            const anyRes = statusRes as any;
            const finalizedData = anyRes.data || (anyRes.id || anyRes.checkInTime || anyRes.checkIn ? anyRes : null);

            if (finalizedData && (finalizedData.checkInTime || finalizedData.checkIn)) {
              const r = finalizedData;
              const hasCheckedIn = !!(r.checkInTime || r.checkIn);
              const transformedStatus = hasCheckedIn ? 'Present' : (r.status || 'Absent');

              const transformed: AttendanceRecord = {
                date: r.date ? (typeof r.date === 'string' && r.date.includes('T') ? format(new Date(r.date), 'yyyy-MM-dd') : r.date) : format(currentDate, 'yyyy-MM-dd'),
                checkIn: r.checkInTime ? format(new Date(r.checkInTime), 'hh:mm a') : (r.checkIn ? format(new Date(r.checkIn), 'hh:mm a') : '-'),
                checkOut: r.checkOutTime ? format(new Date(r.checkOutTime), 'hh:mm a') : (r.checkOut ? format(new Date(r.checkOut), 'hh:mm a') : '-'),
                hoursWorked: r.totalHours ? `${r.totalHours}h` : (r.hoursWorked ? `${r.hoursWorked}h` : '-'),
                status: transformedStatus
              };
              setAllAttendanceData([transformed]);
              setLoading(false);
              return;
            }
          }
        }

        const res = await attendanceService.getMyHistory(orgId, startDateStr, endDateStr);
        if (res && !res.error) {
          const rawData = res as any;
          const records = rawData.attendance ||
            (rawData.data && Array.isArray(rawData.data.attendance) ? rawData.data.attendance : null) ||
            (rawData.data && Array.isArray(rawData.data) ? rawData.data : null) ||
            (Array.isArray(rawData) ? rawData : []);

          let transformedData: AttendanceRecord[] = records.map((r: any) => {
            const rawStatus = r.status?.toLowerCase();
            const hasCheckedIn = !!(r.checkInTime || r.checkIn);
            const hasCheckedOut = !!(r.checkOutTime || r.checkOut);

            // Parse record date to check if it is today
            let isToday = false;
            try {
              const recordDateStr = r.date ? (typeof r.date === 'string' && r.date.includes('T') ? format(new Date(r.date), 'yyyy-MM-dd') : r.date) : '';
              const todayStr = format(new Date(), 'yyyy-MM-dd');
              isToday = recordDateStr === todayStr;
            } catch (e) {
              console.error("Error parsing date for status logic", e);
            }

            let status = 'Absent';

            if (hasCheckedIn) {
              if (hasCheckedOut) {
                status = 'Present';
                if (rawStatus === 'late') status = 'Late';
              } else {
                // Checked in but no check out
                // Show Present if today (allowed until midnight), else Absent
                status = isToday ? 'Present' : 'Absent';
              }
            } else {
              status = 'Absent';
              if (rawStatus === 'late') status = 'Late';
              else if (rawStatus === 'present') status = 'Present';
            }

            // Override with special statuses if applicable
            if (rawStatus === 'holiday') status = 'Holiday';
            else if (rawStatus === 'leave' || rawStatus === 'on-leave') status = 'Leave';
            else if (rawStatus === 'weekend') status = 'Weekend';
            else if (rawStatus === 'absent') status = 'Absent';

            return {
              date: r.date ? (typeof r.date === 'string' && r.date.includes('T') ? format(new Date(r.date), 'yyyy-MM-dd') : r.date) : '-',
              checkIn: r.checkInTime ? format(new Date(r.checkInTime), 'hh:mm a') : (r.checkIn ? format(new Date(r.checkIn), 'hh:mm a') : '-'),
              checkOut: r.checkOutTime ? format(new Date(r.checkOutTime), 'hh:mm a') : (r.checkOut ? format(new Date(r.checkOut), 'hh:mm a') : '-'),
              hoursWorked: r.totalHours ? `${r.totalHours}h` : (r.hoursWorked ? `${r.hoursWorked}h` : '-'),
              status: status
            };
          });

          // If daily view and no records found, show as Absent for that day
          if (viewMode === 'daily' && transformedData.length === 0) {
            transformedData = [{
              date: startDateStr,
              checkIn: '-',
              checkOut: '-',
              hoursWorked: '-',
              status: 'Absent'
            }];
          }

          setAllAttendanceData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setAllAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [viewMode, currentDate]);

  const filteredData = allAttendanceData;

  const stats = useMemo(() => {
    const totalRecords = filteredData.length;
    const workingDaysData = filteredData.filter(d => d.status !== 'Holiday' && d.status !== 'Weekend');
    const totalWorkingDays = workingDaysData.length;

    const presentCount = filteredData.filter(d => d.status === 'Present' || d.status === 'Late').length;
    const lateCount = filteredData.filter(d => d.status === 'Late').length;
    const leaveCount = filteredData.filter(d => d.status === 'Leave').length;
    const absentCount = workingDaysData.filter(d => d.status === 'Absent').length;
    const holidayCount = filteredData.filter(d => d.status === 'Holiday').length;

    // Estimate hours
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
      { icon: CalendarIcon, label: 'Working Days', value: totalWorkingDays.toString(), color: 'text-gray-700' },
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

  const handleExportCSV = () => {
    const headers = ['Date', 'Check In', 'Check Out', 'Hours Worked', 'Status'];
    const rows = filteredData.map(r => [
      `\t${r.date}`,
      r.checkIn,
      r.checkOut,
      r.hoursWorked,
      r.status
    ]);

    const fileName = `my_attendance_${viewMode}_${format(currentDate, 'yyyyMMdd')}.csv`;
    downloadCSV(headers, rows, fileName);
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
        </div>

        {/* Filters and Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap p-1 bg-gray-100 rounded-lg w-fit">
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4 mb-6 md:mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-3 md:p-6 text-center">
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 md:mb-3 ${stat.color}`} />
              <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-[10px] md:text-xs text-gray-500 truncate">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200 flex items-center gap-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Attendance History</h2>
            <Button onClick={handleExportCSV} variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap">Check In</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap">Check Out</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap">Hours Worked</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Loading attendance records...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((record, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 md:px-6 md:py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {record.date}
                      </td>
                      <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-gray-700 whitespace-nowrap">{record.checkIn}</td>
                      <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-gray-700 whitespace-nowrap">{record.checkOut}</td>
                      <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-gray-700 whitespace-nowrap">{record.hoursWorked}</td>
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
                      No attendance records found for this period.
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