// components/profile/tabs/AttendanceTab.tsx
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useState } from 'react';
import { AttendanceRecord } from '../types';

interface AttendanceTabProps {
  records: AttendanceRecord[];
}

export default function AttendanceTab({ records }: AttendanceTabProps) {
  const [currentWeek, setCurrentWeek] = useState('21-Dec-2025 - 27-Dec-2025');

  const daysOfWeek = [
    { day: 'Sun', date: '21', status: 'weekend' },
    { day: 'Mon', date: '22', status: 'absent' },
    { day: 'Today', date: '23', status: 'present' },
    { day: 'Wed', date: '24', status: 'present' },
    { day: 'Thu', date: '25', status: 'present' },
    { day: 'Fri', date: '26', status: 'present' },
    { day: 'Sat', date: '27', status: 'weekend' },
  ];

  const stats = [
    { label: 'Payable Days', value: '2 Days', color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Present', value: '0 Days', color: 'bg-green-100 text-green-800' },
    { label: 'On Duty', value: '0 Days', color: 'bg-purple-100 text-purple-800' },
    { label: 'Paid leave', value: '0 Days', color: 'bg-orange-100 text-orange-800' },
    { label: 'Holidays', value: '0 Days', color: 'bg-blue-100 text-blue-800' },
    { label: 'Weekend', value: '2 Days', color: 'bg-yellow-100 text-yellow-800' },
  ];

  return (
    <div className="p-6">
      {/* Week Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 bg-white border rounded px-4 py-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">{currentWeek}</span>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">00:00</div>
          <div className="text-sm text-gray-600">Hrs worked</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border rounded-lg mb-6">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="border-b last:border-b-0">
            <div className="flex items-center p-4">
              <div className="w-20">
                <div className={`text-center ${day.day === 'Today' ? 'bg-blue-500 text-white rounded-full px-3 py-1' : ''}`}>
                  <div className="text-sm font-medium">{day.day}</div>
                  <div className="text-sm">{day.date}</div>
                </div>
              </div>
              <div className="flex-1 px-4">
                <div className="relative h-8">
                  {/* Timeline bar */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  {/* Status indicators */}
                  <div className="relative flex justify-between">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 flex justify-center">
                      {day.status === 'weekend' && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Weekend
                        </span>
                      )}
                      {day.status === 'absent' && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Absent
                        </span>
                      )}
                    </div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
                {/* Time labels */}
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>09AM</span>
                  <span>10AM</span>
                  <span>11AM</span>
                  <span>12PM</span>
                  <span>01PM</span>
                  <span>02PM</span>
                  <span>03PM</span>
                  <span>04PM</span>
                  <span>05PM</span>
                  <span>06PM</span>
                </div>
              </div>
              <div className="w-32 text-right">
                <div className="text-lg font-semibold">00:00</div>
                <div className="text-xs text-gray-500">Hrs worked</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border rounded-lg p-4 text-center">
            <div className={`inline-block px-3 py-1 rounded text-sm font-semibold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 mt-2">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Shift Info */}
      <div className="bg-gray-50 border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-sm">
            <span className="font-medium">General</span> [ 9:00 AM - 6:00 PM ]
          </span>
        </div>
      </div>
    </div>
  );
}