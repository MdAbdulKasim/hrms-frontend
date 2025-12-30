'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';

interface Event {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  type: 'holiday' | 'leave' | 'announcement';
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); // Use current date
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const eventTypes = [
    { label: 'Holiday', color: 'bg-green-500' },
    { label: 'Announcement', color: 'bg-yellow-500' },
    { label: 'Leave', color: 'bg-orange-500' },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = getApiUrl();
      const token = getAuthToken();
      const orgId = getOrgId();

      if (!orgId || !apiUrl) return;

      try {
        setLoading(true);
        // Fetch holidays, announcements, and leaves in parallel
        const [holidaysRes, announcementsRes, leavesRes] = await Promise.all([
          axios.get(`${apiUrl}/org/${orgId}/holidays?limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => ({ data: { data: [] } })),
          axios.get(`${apiUrl}/org/${orgId}/announcements?limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => ({ data: { data: [] } })),
          axios.get(`${apiUrl}/org/${orgId}/leaves?limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => ({ data: { data: [] } })),
        ]);

        const holidayData = holidaysRes.data.data || holidaysRes.data || [];
        const holidayEvents: Event[] = holidayData.map((holiday: any) => ({
          id: holiday.id || `holiday-${Math.random()}`,
          title: holiday.holidayName,
          date: new Date(holiday.date),
          type: 'holiday' as const,
        }));

        const announcementData = announcementsRes.data.data || announcementsRes.data || [];
        const announcementEvents: Event[] = announcementData.map((announcement: any) => ({
          id: announcement.id || `announcement-${Math.random()}`,
          title: announcement.title,
          date: new Date(announcement.date || announcement.createdAt),
          type: 'announcement' as const,
        }));

        const leaveData = leavesRes.data.data || leavesRes.data || [];
        const leaveEvents: Event[] = leaveData.map((leave: any) => ({
          id: leave.id || `leave-${Math.random()}`,
          title: `Leave (${leave.status || 'Pending'})`,
          date: new Date(leave.startDate || leave.from),
          endDate: new Date(leave.endDate || leave.to),
          type: 'leave' as const,
        }));

        setEvents([...holidayEvents, ...announcementEvents, ...leaveEvents]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate]); // Refresh when month changes or on mount

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="min-h-[4rem] sm:min-h-[6rem] md:h-24 bg-white border border-gray-200"
        ></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = isToday(day);
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = events.filter(event => {
        const start = new Date(event.date);
        start.setHours(0, 0, 0, 0);
        const end = event.endDate ? new Date(event.endDate) : start;
        end.setHours(23, 59, 59, 999);
        const current = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return current >= start && current <= end;
      });

      days.push(
        <div
          key={day}
          className={`min-h-[4rem] sm:min-h-[6rem] md:h-24 bg-white border border-gray-200 p-1 sm:p-2 hover:bg-gray-50 transition-colors ${isCurrentDay ? 'ring-2 ring-blue-400 ring-inset' : ''
            }`}
        >
          <div className="flex justify-between items-start">
            <div className={`text-xs sm:text-sm font-medium ${isCurrentDay ? 'text-blue-600' : 'text-gray-700'}`}>
              {day}
            </div>
          </div>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-1.5rem)]">
            {dayEvents.map(event => (
              <div
                key={event.id}
                className={`text-[10px] sm:text-xs px-1 py-0.5 rounded truncate border ${event.type === 'holiday' ? 'bg-green-100 text-green-700 border-green-200' :
                  event.type === 'announcement' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    event.type === 'leave' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    // RESPONSIVE UPDATE: Adjusted padding (p-2 on mobile, p-6 on desktop)
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-6 bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
            </svg>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {formatMonthYear(currentDate)}
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              // RESPONSIVE UPDATE: Text size small on mobile, medium on tablet+
              className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2 truncate"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-200">
          {renderCalendarDays()}
        </div>

        {/* Legend */}
        {/* RESPONSIVE UPDATE: Added flex-wrap and justified center for smaller screens */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-6 mt-6 pt-6 border-t border-gray-200">
          {eventTypes.map((type) => (
            <div key={type.label} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${type.color}`}></div>
              <span className="text-xs sm:text-sm text-gray-600">{type.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;