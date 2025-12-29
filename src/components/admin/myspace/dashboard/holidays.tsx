'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, X, Plus } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';

interface Holiday {
  id: string;
  holidayName: string;
  date: string;
}

const UpcomingHolidaysSection: React.FC = () => {
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);

  const [holidayForm, setHolidayForm] = useState({
    holidayName: '',
    date: ''
  });

  // Fetch holidays from API
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const apiUrl = getApiUrl();
        const token = getAuthToken();
        const orgId = getOrgId();

        if (!orgId) {
          console.error('No organization ID found');
          setHolidays([]);
          return;
        }

        const response = await axios.get(`${apiUrl}/org/${orgId}/holidays`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const holidayData = response.data.data || response.data || [];

        // Transform API data to component format and sort by date
        const transformedHolidays: Holiday[] = holidayData
          .map((item: any) => ({
            id: item.id || Date.now().toString(),
            holidayName: item.holidayName || 'Holiday',
            date: item.date || ''
          }))
          .sort((a: Holiday, b: Holiday) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        setHolidays(transformedHolidays);
      } catch (error) {
        console.error('Error fetching holidays:', error);
        setHolidays([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  const handleAddHoliday = async () => {
    if (holidayForm.holidayName && holidayForm.date) {
      try {
        setLoading(true);
        const apiUrl = getApiUrl();
        const token = getAuthToken();
        const orgId = getOrgId();

        if (!orgId) {
          alert('Organization not found');
          return;
        }

        // Call API to create holiday
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
          // Add to local state
          const newHoliday: Holiday = {
            id: response.data.id || Date.now().toString(),
            holidayName: holidayForm.holidayName,
            date: holidayForm.date
          };

          const updatedHolidays = [...holidays, newHoliday].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          setHolidays(updatedHolidays);
          setHolidayForm({ holidayName: '', date: '' });
          setShowHolidayModal(false);
        }
      } catch (error) {
        console.error('Error creating holiday:', error);
        alert('Failed to add holiday. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper to format date string (YYYY-MM-DD) to readable format (e.g. Dec 25, 2024)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 sm:p-5 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold truncate text-slate-900">Upcoming Holidays</h2>
          </div>
          <button
            onClick={() => setShowHolidayModal(true)}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100"
          >
            <Plus className="w-4 h-4" />
            <span>Add Holiday</span>
          </button>
        </div>
        <div className="space-y-3">
          {holidays.length === 0 ? (
            <p className="text-sm text-slate-500">No holidays scheduled</p>
          ) : (
            holidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between">
                <span className="text-sm text-slate-900">{holiday.holidayName}</span>
                <span className="text-sm text-slate-500">{formatDate(holiday.date)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {showHolidayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <div className="relative w-full max-w-sm gap-4 border border-slate-200 bg-white p-6 shadow-lg sm:rounded-lg animate-in fade-in-0 zoom-in-95 duration-200">

            <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-5">
              <h2 className="text-lg font-semibold leading-none tracking-tight text-slate-900">Add Holiday</h2>
              <p className="text-sm text-slate-500">Schedule a new upcoming holiday.</p>
            </div>

            <button
              onClick={() => setShowHolidayModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500"
            >
              <X className="h-4 w-4 text-slate-500" />
              <span className="sr-only">Close</span>
            </button>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">Holiday Name</label>
                <input
                  type="text"
                  placeholder="e.g. Independence Day"
                  value={holidayForm.holidayName}
                  onChange={(e) => setHolidayForm({ ...holidayForm, holidayName: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">Date</label>
                <input
                  type="date"
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <button
                onClick={() => setShowHolidayModal(false)}
                className="mt-2 sm:mt-0 inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 ring-offset-white transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddHoliday}
                className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-slate-50 ring-offset-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Add Holiday
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpcomingHolidaysSection;