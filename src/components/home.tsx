'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Clock,
  Sun,
  Calendar,
  AlertCircle,
  Briefcase,
  X
} from 'lucide-react';
import ProfilePage from './profile/ProfilePage'; // Import ProfilePage from profile folder


// --- Types ---
type Reportee = {
  id: string;
  name: string;
  roleId: string;
  status: string;
  employeeId: string; // Add employeeId for profile lookup
};

type ScheduleDay = {
  day: string;
  date: string;
  status: 'Weekend' | 'Absent' | 'Present' | 'Upcoming';
  isToday?: boolean;
};

// --- Mock Data ---
const reportees: Reportee[] = [
  { id: '1', name: 'Michael Johnson', roleId: 'S19', status: 'Yet to check-in', employeeId: 'S19' },
  { id: '2', name: 'Lilly Williams', roleId: 'S2', status: 'Yet to check-in', employeeId: 'S2' },
  { id: '3', name: 'Christopher Brown', roleId: 'S20', status: 'Yet to check-in', employeeId: 'S20' },
];

const schedule: ScheduleDay[] = [
  { day: 'Sun', date: '07', status: 'Weekend' },
  { day: 'Mon', date: '08', status: 'Absent' },
  { day: 'Tue', date: '09', status: 'Absent' },
  { day: 'Wed', date: '10', status: 'Absent' },
  { day: 'Thu', date: '11', status: 'Upcoming', isToday: true },
  { day: 'Fri', date: '12', status: 'Upcoming' },
  { day: 'Sat', date: '13', status: 'Weekend' },
];

// --- Sub-Components ---

const ProfileCard = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCheckedIn) {
      interval = setInterval(() => { setSeconds((prev) => prev + 1); }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isCheckedIn]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(hours)} : ${pad(minutes)} : ${pad(secs)}`;
  };

  const handleToggleCheckIn = () => {
    if (isCheckedIn) { setIsCheckedIn(false); }
    else { setSeconds(0); setIsCheckedIn(true); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center border border-gray-100 w-full">
      <div className="relative group">
        <input
          type="file"
          id="profile-upload"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <label
          htmlFor="profile-upload"
          className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400 cursor-pointer overflow-hidden hover:opacity-80 transition-opacity"
        >
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={40} />
          )}
        </label>
        <div className="absolute bottom-3 right-0 bg-blue-500 rounded-full p-1 cursor-pointer z-10">
          <label htmlFor="profile-upload" className="cursor-pointer flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </label>
        </div>
        {profileImage && (
          <div
            onClick={handleRemoveImage}
            className="absolute bottom-3 left-0 bg-red-500 rounded-full p-1 cursor-pointer hover:bg-red-600 transition-colors z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      <h2 className="text-gray-800 font-medium text-sm break-all">1-farhan21ps13716</h2>
      <p className="text-gray-500 text-xs mt-1">CEO</p>
      <p className={`text-xs font-medium mt-3 ${isCheckedIn ? 'text-green-500' : 'text-red-500'}`}>
        {isCheckedIn ? 'Checked In' : 'Yet to check-in'}
      </p>
      <div className={`bg-gray-100 px-4 py-2 rounded-md mt-3 font-mono font-medium tracking-wider w-full sm:w-auto ${isCheckedIn ? 'text-gray-900' : 'text-gray-600'}`}>
        {formatTime(seconds)}
      </div>
      <button
        onClick={handleToggleCheckIn}
        className={`mt-4 w-full py-2 border rounded-md transition-colors text-sm font-medium ${isCheckedIn ? 'border-red-500 text-red-500 hover:bg-red-50' : 'border-green-500 text-green-500 hover:bg-green-50'
          }`}
      >
        {isCheckedIn ? 'Check-out' : 'Check-in'}
      </button>
    </div>
  );
};

// Modified ReporteesCard with click handler
const ReporteesCard = ({ onEmployeeClick }: { onEmployeeClick: (employeeId: string, name: string) => void }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex flex-col h-full w-full">
      <h3 className="text-gray-700 font-semibold mb-4 text-sm">Reportees</h3>
      <div className="flex-1 space-y-5">
        {reportees.map((person) => (
          <div key={person.id} className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-500">
                <User size={16} />
              </div>
            </div>
            <div className="min-w-0">
              <p
                className="text-xs text-gray-500 font-medium truncate hover:text-blue-600 cursor-pointer transition-colors"
                onClick={() => onEmployeeClick(person.employeeId, person.name)}
              >
                {person.roleId} - <span className="hover:underline">{person.name}</span>
              </p>
              <p className="text-[10px] text-red-400 mt-0.5">{person.status}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="text-blue-500 text-xs font-medium mt-4 text-left hover:underline">

      </button>
    </div>
  );
};

const ActivitiesSection = () => {
  return (
    <div className="space-y-4">
      {/* Greeting Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex flex-shrink-0 items-center justify-center bg-blue-50 rounded-lg">
            <Briefcase className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-gray-800 font-medium">Good Afternoon <span className="text-gray-500 font-normal block sm:inline">farhan21ps13716</span></h3>
            <p className="text-gray-500 text-sm">Have a productive day!</p>
          </div>
        </div>
        <div className="bg-yellow-100 p-2 rounded-full self-end sm:self-center">
          <Sun className="text-yellow-500" size={24} />
        </div>
      </div>

      {/* Check-in Reminder */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-50 rounded-full text-orange-400 flex-shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 text-sm">Check-in reminder</h4>
            <p className="text-gray-500 text-sm mt-0.5">Your shift has already started</p>
          </div>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto pl-12 sm:pl-0">
          <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">General</span>
          <p className="text-gray-400 text-sm mt-0.5">9:00 AM-6:00 PM</p>
        </div>
      </div>

      {/* Work Schedule Timeline */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-full text-blue-400 flex-shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 text-sm">Work Schedule</h4>
            <p className="text-gray-500 text-xs mt-0.5">07-Dec-2025 - 13-Dec-2025</p>
          </div>
        </div>
        <div className="mb-8">
          <div className="border-l-2 border-gray-200 pl-4 py-1">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">General</span>
            <p className="text-gray-400 text-sm mt-0.5">9:00 AM - 6:00 PM</p>
          </div>
        </div>

        <div className="relative pt-4 pb-2 overflow-x-auto">
          <div className="min-w-[600px] relative">
            <div className="absolute top-[19px] left-0 w-full h-[2px] bg-gray-100 z-0"></div>
            <div className="grid grid-cols-7 gap-2 relative z-10">
              {schedule.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full mb-3 flex-shrink-0 ${item.isToday ? 'bg-blue-500 ring-4 ring-blue-100' : 'bg-gray-300'}`}></div>
                  <div className="text-center">
                    <p className={`text-xs ${item.isToday ? 'text-gray-800 font-bold' : 'text-gray-500'}`}>
                      {item.day} <span className="text-gray-800">{item.date}</span>
                    </p>
                    <p className={`text-[10px] mt-1 ${item.status === 'Weekend' ? 'text-yellow-600' :
                        item.status === 'Absent' ? 'text-red-500' : 'text-gray-400'
                      }`}>
                      {item.status === 'Upcoming' ? '' : item.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Alert */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start sm:items-center gap-3">
        <div className="p-1.5 bg-yellow-50 rounded-full text-yellow-500 flex-shrink-0">
          <AlertCircle size={18} />
        </div>
        <p className="text-gray-700 text-sm leading-tight sm:leading-normal pt-0.5 sm:pt-0">You are yet to submit your time logs today!</p>
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function Dashboard() {
  const [showProfile, setShowProfile] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const handleEmployeeClick = (employeeId: string, name: string) => {
    setSelectedEmployeeId(employeeId);
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
    setSelectedEmployeeId('');
  };

  // If profile is shown, render only the profile page
  if (showProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfilePage
          employeeId={selectedEmployeeId}
          onBack={handleCloseProfile}
        />
      </div>
    );
  }

  // Otherwise render the dashboard
  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-8 font-sans">
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left Column: Profile & Reportees */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <ProfileCard />
            <ReporteesCard onEmployeeClick={handleEmployeeClick} />
          </div>

          {/* Right Column: Activities & Schedule */}
          <div className="lg:col-span-3">
            <ActivitiesSection />
          </div>

        </div>
      </div>
    </div>
  );
}