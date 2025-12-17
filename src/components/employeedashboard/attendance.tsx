'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, FileText, XCircle, TrendingUp, Timer } from 'lucide-react';

interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: string;
  status: 'Present' | 'Late' | 'Leave' | 'Weekend' | 'Absent';
}

const AttendanceTracker: React.FC = () => {
  const [selectedMonth] = useState('January 2024');
  
  const attendanceData: AttendanceRecord[] = [
    { date: 'Mon, Jan 15, 2024', checkIn: '09:00 AM', checkOut: '06:30 PM', hoursWorked: '9h 30m', status: 'Present' },
    { date: 'Sun, Jan 14, 2024', checkIn: '09:15 AM', checkOut: '06:00 PM', hoursWorked: '8h 45m', status: 'Present' },
    { date: 'Sat, Jan 13, 2024', checkIn: '-', checkOut: '-', hoursWorked: '-', status: 'Weekend' },
    { date: 'Fri, Jan 12, 2024', checkIn: '-', checkOut: '-', hoursWorked: '-', status: 'Weekend' },
    { date: 'Thu, Jan 11, 2024', checkIn: '09:30 AM', checkOut: '05:45 PM', hoursWorked: '8h 15m', status: 'Late' },
    { date: 'Wed, Jan 10, 2024', checkIn: '-', checkOut: '-', hoursWorked: '-', status: 'Leave' },
    { date: 'Tue, Jan 09, 2024', checkIn: '08:55 AM', checkOut: '06:15 PM', hoursWorked: '9h 20m', status: 'Present' },
    { date: 'Mon, Jan 08, 2024', checkIn: '09:00 AM', checkOut: '06:00 PM', hoursWorked: '9h 00m', status: 'Present' },
  ];

  const stats = [
    { icon: Calendar, label: 'Working Days', value: '22', color: 'text-gray-700' },
    { icon: CheckCircle, label: 'Present', value: '18', color: 'text-green-500' },
    { icon: Clock, label: 'Late', value: '2', color: 'text-yellow-500' },
    { icon: FileText, label: 'Leave', value: '1', color: 'text-blue-500' },
    { icon: XCircle, label: 'Absent', value: '1', color: 'text-red-500' },
    { icon: TrendingUp, label: 'Avg Hours', value: '8h 45m', color: 'text-purple-500' },
    { icon: Timer, label: 'Total Hours', value: '157h 30m', color: 'text-gray-700' },
  ];

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Attendance</h1>
          <p className="text-sm md:text-base text-gray-500">Track your daily attendance</p>
        </div>

        {/* Stats Grid - Responsive Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4 mb-6 md:mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-4 md:p-6 text-center">
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 md:mb-3 ${stat.color}`} />
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Daily Attendance History */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Daily Attendance History</h2>
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
                {attendanceData.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 md:px-6 md:py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{record.date}</td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-gray-700 whitespace-nowrap">{record.checkIn}</td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-gray-700 whitespace-nowrap">{record.checkOut}</td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-gray-700 whitespace-nowrap">{record.hoursWorked}</td>
                    <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;