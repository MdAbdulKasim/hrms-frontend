'use client';
import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';

interface Holiday {
  id: string;
  holidayName: string;
  date: string;
}

// Static mock data
const INITIAL_HOLIDAYS: Holiday[] = [
  {
    id: '1',
    holidayName: 'New Year\'s Day',
    date: '2026-01-01'
  },
  {
    id: '2',
    holidayName: 'Independence Day',
    date: '2026-07-04'
  },
  {
    id: '3',
    holidayName: 'Christmas',
    date: '2026-12-25'
  }
];

const UpcomingHolidaysSection: React.FC = () => {
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>(INITIAL_HOLIDAYS);

  const [holidayForm, setHolidayForm] = useState({
    holidayName: '',
    date: ''
  });

  const handleAddHoliday = () => {
    if (holidayForm.holidayName && holidayForm.date) {
      const newHoliday: Holiday = {
        id: Date.now().toString(),
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
            className="text-blue-500 hover:text-blue-600 text-2xl leading-none px-2 transition-colors"
          >
            +
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