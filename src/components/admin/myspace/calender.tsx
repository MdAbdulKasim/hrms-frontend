'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Megaphone } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import { CustomAlertDialog } from '@/components/ui/custom-dialogs';

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'meeting' | 'deadline' | 'event' | 'holiday' | 'leave' | 'announcement';
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectedDateForCreate, setSelectedDateForCreate] = useState<string>('');

  // Alert State
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

  const [holidayForm, setHolidayForm] = useState({
    holidayName: '',
    date: ''
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    expiryDate: '',
    disableComments: false,
    pinToTop: false,
    notifyAll: false
  });

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const eventTypes = [
    { label: 'Meeting', color: 'bg-blue-500', type: 'meeting' },
    { label: 'Deadline', color: 'bg-red-500', type: 'deadline' },
    { label: 'Announcement', color: 'bg-orange-500', type: 'announcement' },
    { label: 'Holiday', color: 'bg-green-500', type: 'holiday' },
    { label: 'Leave', color: 'bg-orange-500', type: 'leave' },
  ];

  const fetchHolidaysAndAnnouncements = async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const token = getAuthToken();
      const orgId = getOrgId();

      if (!orgId) {
        console.warn('No Organization ID found');
        return;
      }

      // Parallelize fetches with individual error handling
      const [holidaysRes, announcementsRes] = await Promise.allSettled([
        axios.get(`${apiUrl}/org/${orgId}/holidays`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/org/${orgId}/announcements`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const holidayData = holidaysRes.status === 'fulfilled' ? (holidaysRes.value.data.data || holidaysRes.value.data || []) : [];
      const announcementData = announcementsRes.status === 'fulfilled' ? (announcementsRes.value.data.data || announcementsRes.value.data || []) : [];

      if (holidaysRes.status === 'rejected') console.error('Holiday fetch failed:', holidaysRes.reason);
      if (announcementsRes.status === 'rejected') console.error('Announcement fetch failed:', announcementsRes.reason);

      // Helper to parse date string without timezone shift (for YYYY-MM-DD)
      const parseLocalDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        const [y, m, d] = dateStr.includes('T')
          ? dateStr.split('T')[0].split('-').map(Number)
          : dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
      };

      const holidayEvents: Event[] = holidayData.map((h: any) => ({
        id: `h-${h.id}`,
        title: h.holidayName,
        date: parseLocalDate(h.date),
        type: 'holiday',
      }));

      const announcementEvents: Event[] = announcementData.map((a: any) => ({
        id: `a-${a.id}`,
        title: a.title,
        date: parseLocalDate(a.date || a.createdAt),
        type: 'announcement',
      }));

      console.log(`Fetched ${holidayEvents.length} holidays and ${announcementEvents.length} announcements`);
      setEvents([...holidayEvents, ...announcementEvents]);
    } catch (error) {
      console.error('Critical error in calendar fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidaysAndAnnouncements();
  }, [currentDate]); // Trigger fetch on month change just in case the backend filters

  const handleAddHoliday = async () => {
    if (holidayForm.holidayName && holidayForm.date) {
      try {
        setLoading(true);
        const apiUrl = getApiUrl();
        const token = getAuthToken();
        const orgId = getOrgId();

        if (!orgId) {
          showAlert("Error", "Organization not found", "error");
          return;
        }

        const response = await axios.post(
          `${apiUrl}/org/${orgId}/holidays`,
          {
            holidayName: holidayForm.holidayName,
            date: holidayForm.date
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.status === 201 || response.status === 200) {
          await fetchHolidaysAndAnnouncements();
          setHolidayForm({ holidayName: '', date: '' });
          setShowHolidayModal(false);
        }
      } catch (error) {
        console.error('Error creating holiday:', error);
        showAlert("Error", "Failed to add holiday. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddAnnouncement = async () => {
    if (announcementForm.title && announcementForm.message) {
      try {
        setLoading(true);
        const apiUrl = getApiUrl();
        const token = getAuthToken();
        const orgId = getOrgId();

        if (!orgId) {
          showAlert("Error", "Organization not found", "error");
          return;
        }

        const response = await axios.post(
          `${apiUrl}/org/${orgId}/announcements`,
          {
            title: announcementForm.title,
            content: announcementForm.message,
            expiryDate: announcementForm.expiryDate || null,
            isPinned: announcementForm.pinToTop,
            disableComments: announcementForm.disableComments,
            notifyEmployees: announcementForm.notifyAll,
            createdAt: `${selectedDateForCreate}T00:00:00.000Z`, // Explicitly set creation date to the selected day
            date: selectedDateForCreate
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.status === 201 || response.status === 200) {
          await fetchHolidaysAndAnnouncements();
          setAnnouncementForm({
            title: '',
            message: '',
            expiryDate: '',
            disableComments: false,
            pinToTop: false,
            notifyAll: false
          });
          setShowAnnouncementModal(false);
        }
      } catch (error) {
        console.error('Error creating announcement:', error);
        showAlert("Error", "Failed to create announcement. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const onDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // Use local date string YYYY-MM-DD to avoid timezone shifting
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${year}-${month}-${dayStr}`;

    setSelectedDateForCreate(dateStr);
    setHolidayForm(prev => ({ ...prev, date: dateStr }));
    setAnnouncementForm(prev => ({ ...prev, expiryDate: `${dateStr}T23:59` }));
    setShowSelectionModal(true);
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

      const dayEvents = events.filter(event =>
        event.date.getDate() === day &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear()
      );

      days.push(
        <div
          key={day}
          onClick={() => onDateClick(day)}
          className={`min-h-[4rem] sm:min-h-[6rem] md:h-24 bg-white border border-gray-200 p-1 sm:p-2 cursor-pointer hover:bg-blue-50/30 transition-all ${isCurrentDay ? 'ring-2 ring-blue-400 ring-inset' : ''
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
                className={`text-[10px] sm:text-xs px-1 py-0.5 rounded truncate ${event.type === 'holiday' ? 'bg-green-100 text-green-700 border border-green-200' :
                  event.type === 'announcement' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                    event.type === 'meeting' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
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
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-6 bg-white">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500">Manage organization events and holidays</p>
        </div>
        <button
          onClick={() => setShowHolidayModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add Holiday</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
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
            {loading && <div className="ml-3 w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>}
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
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 border border-gray-200"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 border border-gray-200"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
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

      {/* Selection Modal / Day View */}
      {showSelectionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            {(() => {
              // Parse YYYY-MM-DD manually to avoid timezone shifting
              const [y, m, d] = selectedDateForCreate.split('-').map(Number);
              const filteredEvents = events.filter(e =>
                e.date.getDate() === d &&
                e.date.getMonth() === (m - 1) &&
                e.date.getFullYear() === y
              );

              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </h3>
                      <p className="text-xs text-gray-500">Day View</p>
                    </div>
                    <button
                      onClick={() => setShowSelectionModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Existing Events for this date */}
                  <div className="mb-6 max-h-48 overflow-y-auto pr-1">
                    {filteredEvents.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Scheduled</h4>
                        {filteredEvents.map(event => (
                          <div
                            key={event.id}
                            className={`flex items-center gap-3 p-2 rounded-lg border ${event.type === 'holiday' ? 'bg-green-50 border-green-100 text-green-700' :
                              event.type === 'announcement' ? 'bg-orange-50 border-orange-100 text-orange-700' :
                                'bg-gray-50 border-gray-100 text-gray-700'
                              }`}
                          >
                            <div className={`w-2.5 h-2.5 rounded-full ${event.type === 'holiday' ? 'bg-green-500' :
                              event.type === 'announcement' ? 'bg-orange-500' :
                                'bg-gray-500'
                              }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{event.title}</p>
                              <p className="text-[10px] opacity-70 uppercase font-bold">{event.type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-sm text-gray-400 italic">No events scheduled for today</p>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}

            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Create New</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowSelectionModal(false);
                    setShowHolidayModal(true);
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-green-50 hover:border-green-200 hover:bg-green-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 transition-transform group-hover:scale-105">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-green-700">Holiday</span>
                </button>
                <button
                  onClick={() => {
                    setShowSelectionModal(false);
                    setShowAnnouncementModal(true);
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-orange-50 hover:border-orange-200 hover:bg-orange-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 transition-transform group-hover:scale-105">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-orange-700">Update</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Holiday</h3>
                <p className="text-sm text-gray-500">Create a new holiday for the organization.</p>
              </div>
              <button
                onClick={() => setShowHolidayModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Holiday Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., New Year's Day"
                  value={holidayForm.holidayName}
                  onChange={(e) => setHolidayForm({ ...holidayForm, holidayName: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowHolidayModal(false)}
                className="flex-1 h-11 px-4 rounded-lg border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddHoliday}
                disabled={loading || !holidayForm.holidayName || !holidayForm.date}
                className="flex-1 h-11 px-4 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Adding...' : 'Add Holiday'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Create Announcement</h3>
                <p className="text-sm text-gray-500">Post a new update for the team.</p>
              </div>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Announcement title"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                <textarea
                  placeholder="Write your announcement..."
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDateForCreate}
                    disabled
                    className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="datetime-local"
                    value={announcementForm.expiryDate}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, expiryDate: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={announcementForm.disableComments}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, disableComments: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Disable comments</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={announcementForm.pinToTop}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, pinToTop: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Pin to top</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={announcementForm.notifyAll}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, notifyAll: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Notify all</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="flex-1 h-11 px-4 rounded-lg border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAnnouncement}
                disabled={loading || !announcementForm.title || !announcementForm.message}
                className="flex-1 h-11 px-4 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
      <CustomAlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}
        title={alertState.title}
        description={alertState.description}
        variant={alertState.variant}
      />
    </div>
  );
};

export default Calendar;