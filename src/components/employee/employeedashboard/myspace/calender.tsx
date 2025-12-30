'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  type: 'holiday' | 'announcement';
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const eventTypes = [
    { label: 'Holiday', color: 'bg-green-500' },
    { label: 'Announcement', color: 'bg-yellow-500' },
  ];

  // Helper to parse date string without timezone shift
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    try {
      const [y, m, d] = dateStr.includes('T')
        ? dateStr.split('T')[0].split('-').map(Number)
        : dateStr.split('-').map(Number);
      return new Date(y, m - 1, d);
    } catch (e) {
      console.error('Error parsing date:', dateStr, e);
      return new Date();
    }
  };

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

  // Auto-advance to next month
  useEffect(() => {
    const checkAndAdvanceMonth = () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const displayedMonth = currentDate.getMonth();
      const displayedYear = currentDate.getFullYear();

      if (displayedYear < currentYear || (displayedYear === currentYear && displayedMonth < currentMonth)) {
        setCurrentDate(new Date(currentYear, currentMonth, 1));
      }
    };

    checkAndAdvanceMonth();
    const interval = setInterval(checkAndAdvanceMonth, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentDate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setDebugInfo('Starting fetch...');
        
        // Import auth functions dynamically
        const { getApiUrl, getAuthToken, getOrgId } = await import('@/lib/auth');
        
        const apiUrl = getApiUrl();
        const token = getAuthToken();
        const orgId = getOrgId();

        console.log('=== CALENDAR FETCH DEBUG ===');
        console.log('API URL:', apiUrl);
        console.log('Org ID:', orgId);
        console.log('Token exists:', !!token);
        console.log('Token length:', token?.length);

        // Validate required auth data
        if (!orgId) {
          const errorMsg = 'Organization ID not found';
          console.error(errorMsg);
          setError(errorMsg + '. Please log in again.');
          setDebugInfo('Missing orgId');
          setEvents([]);
          setLoading(false);
          return;
        }

        if (!apiUrl) {
          const errorMsg = 'API URL not configured';
          console.error(errorMsg);
          setError(errorMsg + '. Please check configuration.');
          setDebugInfo('Missing apiUrl');
          setEvents([]);
          setLoading(false);
          return;
        }

        if (!token) {
          const errorMsg = 'Authentication token not found';
          console.error(errorMsg);
          setError(errorMsg + '. Please log in again.');
          setDebugInfo('Missing token');
          setEvents([]);
          setLoading(false);
          return;
        }

        setDebugInfo('Auth validated, fetching data...');

        const axios = (await import('axios')).default;

        const holidaysUrl = `${apiUrl}/org/${orgId}/holidays?limit=100`;
        const announcementsUrl = `${apiUrl}/org/${orgId}/announcements?limit=100`;

        console.log('Fetching from URLs:');
        console.log('- Holidays:', holidaysUrl);
        console.log('- Announcements:', announcementsUrl);

        // Fetch data with detailed error handling
        const [holidaysRes, announcementsRes] = await Promise.allSettled([
          axios.get(holidaysUrl, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(announcementsUrl, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log('=== FETCH RESULTS ===');
        console.log('Holidays status:', holidaysRes.status);
        console.log('Announcements status:', announcementsRes.status);

        // Process holidays
        let holidayEvents: Event[] = [];
        if (holidaysRes.status === 'fulfilled') {
          console.log('Holidays response:', holidaysRes.value);
          console.log('Holidays data structure:', holidaysRes.value.data);
          
          const holidayData = holidaysRes.value.data.data || holidaysRes.value.data || [];
          console.log('Extracted holiday data:', holidayData);
          console.log('Holiday count:', Array.isArray(holidayData) ? holidayData.length : 'Not an array');

          if (Array.isArray(holidayData)) {
            holidayEvents = holidayData.map((holiday: any) => {
              console.log('Processing holiday:', holiday);
              return {
                id: holiday.id || holiday._id || `holiday-${Math.random()}`,
                title: holiday.holidayName || holiday.name || holiday.title || 'Holiday',
                date: parseLocalDate(holiday.date || holiday.holidayDate),
                type: 'holiday' as const,
              };
            });
          }
        } else {
          console.error('Holidays fetch failed:', holidaysRes.reason);
          console.error('Error response:', holidaysRes.reason?.response);
          console.error('Error status:', holidaysRes.reason?.response?.status);
          console.error('Error data:', holidaysRes.reason?.response?.data);
        }

        // Process announcements
        let announcementEvents: Event[] = [];
        if (announcementsRes.status === 'fulfilled') {
          console.log('Announcements response:', announcementsRes.value);
          console.log('Announcements data structure:', announcementsRes.value.data);
          
          const announcementData = announcementsRes.value.data.data || announcementsRes.value.data || [];
          console.log('Extracted announcement data:', announcementData);
          console.log('Announcement count:', Array.isArray(announcementData) ? announcementData.length : 'Not an array');

          if (Array.isArray(announcementData)) {
            announcementEvents = announcementData.map((announcement: any) => {
              console.log('Processing announcement:', announcement);
              return {
                id: announcement.id || announcement._id || `announcement-${Math.random()}`,
                title: announcement.title || announcement.message || announcement.announcementTitle || 'Announcement',
                date: parseLocalDate(announcement.date || announcement.announcementDate || announcement.createdAt),
                type: 'announcement' as const,
              };
            });
          }
        } else {
          console.error('Announcements fetch failed:', announcementsRes.reason);
          console.error('Error response:', announcementsRes.reason?.response);
          console.error('Error status:', announcementsRes.reason?.response?.status);
          console.error('Error data:', announcementsRes.reason?.response?.data);
        }

        const allEvents = [...holidayEvents, ...announcementEvents];
        console.log('=== FINAL EVENTS ===');
        console.log('Total events:', allEvents.length);
        console.log('Holiday events:', holidayEvents.length);
        console.log('Announcement events:', announcementEvents.length);
        console.log('All events:', allEvents);
        
        setEvents(allEvents);
        setDebugInfo(`Loaded ${allEvents.length} events (${holidayEvents.length} holidays, ${announcementEvents.length} announcements)`);

        // Check if both requests failed
        if (holidaysRes.status === 'rejected' && announcementsRes.status === 'rejected') {
          const firstError = (holidaysRes as PromiseRejectedResult).reason;
          if (firstError?.response?.status === 401) {
            setError('Authentication failed. Please log in again.');
          } else if (firstError?.response?.status === 403) {
            setError('Access denied. You may not have permission to view this data.');
          } else if (firstError?.response?.status === 404) {
            setError('Calendar endpoints not found. Please check API configuration.');
          } else {
            setError(`Failed to load calendar data: ${firstError?.message || 'Unknown error'}`);
          }
        } else if (holidaysRes.status === 'rejected' || announcementsRes.status === 'rejected') {
          // Only one failed
          const failedType = holidaysRes.status === 'rejected' ? 'holidays' : 'announcements';
          console.warn(`${failedType} fetch failed, but continuing with available data`);
        }

      } catch (error: any) {
        console.error('=== FETCH ERROR ===');
        console.error('Error:', error);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        setError(`Unexpected error: ${error?.message || 'Unknown error'}`);
        setDebugInfo(`Error: ${error?.message}`);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate]);

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

  const isPastDate = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const renderCalendarDays = () => {
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="min-h-[4rem] sm:min-h-[6rem] md:h-24 bg-white border border-gray-200"
        ></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = isToday(day);
      const isPast = isPastDate(day);
      
      // Create date for this calendar day
      const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      // Filter events that match this specific day
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        
        // Compare year, month, and day
        return (
          eventDate.getFullYear() === currentDayDate.getFullYear() &&
          eventDate.getMonth() === currentDayDate.getMonth() &&
          eventDate.getDate() === currentDayDate.getDate()
        );
      });

      // Log for debugging (you can remove this later)
      if (dayEvents.length > 0) {
        console.log(`Day ${day}: Found ${dayEvents.length} events`, dayEvents);
      }

      days.push(
        <div
          key={day}
          className={`min-h-[4rem] sm:min-h-[6rem] md:h-24 bg-white border border-gray-200 p-1 sm:p-2 transition-colors ${
            isPast ? 'opacity-30 bg-gray-50' : 'hover:bg-gray-50'
          } ${
            isCurrentDay ? 'ring-2 ring-blue-400 ring-inset' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <div className={`text-xs sm:text-sm font-medium ${
              isPast ? 'text-gray-400' : isCurrentDay ? 'text-blue-600' : 'text-gray-700'
            }`}>
              {day}
            </div>
          </div>
          {!isPast && (
            <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-1.5rem)]">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  className={`text-[10px] sm:text-xs px-1 py-0.5 rounded truncate border ${
                    event.type === 'holiday' ? 'bg-green-100 text-green-700 border-green-200' :
                    event.type === 'announcement' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-6 bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
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
            {loading && (
              <div className="ml-3 w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              Today
            </button>
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-medium">{error}</p>
              <p className="text-xs text-red-600 mt-1">Check browser console for detailed logs</p>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {/* {debugInfo && !error && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">{debugInfo}</p>
          </div>
        )} */}

        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2 truncate"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-200">
          {renderCalendarDays()}
        </div>

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