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

interface AttendanceRecord {
  date: string; // Dynamic date string or ISO
  checkIn: string;
  checkOut: string;
  hoursWorked: string;
  status: 'Present' | 'Late' | 'Leave' | 'Weekend' | 'Absent';
}

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

const AttendanceTracker: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 15)); // Default to Jan 15, 2024 to match dummy data
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const allAttendanceData: AttendanceRecord[] = [
    { date: '2024-01-15', checkIn: '09:00 AM', checkOut: '06:30 PM', hoursWorked: '9h 30m', status: 'Present' },
    { date: '2024-01-14', checkIn: '09:15 AM', checkOut: '06:00 PM', hoursWorked: '8h 45m', status: 'Present' },
    { date: '2024-01-13', checkIn: '-', checkOut: '-', hoursWorked: '-', status: 'Weekend' },
    { date: '2024-01-12', checkIn: '-', checkOut: '-', hoursWorked: '-', status: 'Weekend' },
    { date: '2024-01-11', checkIn: '09:30 AM', checkOut: '05:45 PM', hoursWorked: '8h 15m', status: 'Late' },
    { date: '2024-01-10', checkIn: '-', checkOut: '-', hoursWorked: '-', status: 'Leave' },
    { date: '2024-01-09', checkIn: '08:55 AM', checkOut: '06:15 PM', hoursWorked: '9h 20m', status: 'Present' },
    { date: '2024-01-08', checkIn: '09:00 AM', checkOut: '06:00 PM', hoursWorked: '9h 00m', status: 'Present' },
    { date: '2024-01-07', checkIn: '-', checkOut: '-', hoursWorked: '-', status: 'Weekend' },
    { date: '2023-12-25', checkIn: '09:00 AM', checkOut: '06:00 PM', hoursWorked: '9h 00m', status: 'Present' },
  ];

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

  const filteredData = useMemo(() => {
    let start: Date, end: Date;

    switch (viewMode) {
      case 'daily':
        return allAttendanceData.filter(d => isSameDay(parse(d.date, 'yyyy-MM-dd', new Date()), currentDate));
      case 'weekly':
        start = currentDate;
        end = addDays(currentDate, 6);
        break;
      case 'monthly':
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
        break;
      case 'yearly':
        start = startOfYear(currentDate);
        end = endOfYear(currentDate);
        break;
      default:
        return allAttendanceData;
    }

    return allAttendanceData.filter(d => {
      const recordDate = parse(d.date, 'yyyy-MM-dd', new Date());
      return isWithinInterval(recordDate, { start, end });
    });
  }, [viewMode, currentDate]);

  const stats = useMemo(() => {
    const presentCount = filteredData.filter(d => d.status === 'Present').length;
    const lateCount = filteredData.filter(d => d.status === 'Late').length;
    const leaveCount = filteredData.filter(d => d.status === 'Leave').length;
    const absentCount = filteredData.filter(d => d.status === 'Absent').length;
    const totalWorkingDays = filteredData.filter(d => d.status !== 'Weekend').length;

    return [
      { icon: CalendarIcon, label: 'Working Days', value: totalWorkingDays.toString(), color: 'text-gray-700' },
      { icon: CheckCircle, label: 'Present', value: presentCount.toString(), color: 'text-green-500' },
      { icon: Clock, label: 'Late', value: lateCount.toString(), color: 'text-yellow-500' },
      { icon: FileText, label: 'Leave', value: leaveCount.toString(), color: 'text-blue-500' },
      { icon: XCircle, label: 'Absent', value: absentCount.toString(), color: 'text-red-500' },
      { icon: TrendingUp, label: 'Avg Hours', value: '8h 45m', color: 'text-purple-500' },
      { icon: Timer, label: 'Total Hours', value: '157h 30m', color: 'text-gray-700' },
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
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Attendance History</h2>
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
                {filteredData.length > 0 ? (
                  filteredData.map((record, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 md:px-6 md:py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {format(parse(record.date, 'yyyy-MM-dd', new Date()), 'EEE, MMM d, yyyy')}
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