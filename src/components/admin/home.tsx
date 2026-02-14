'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Sun,
  Briefcase,
  X
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getApiUrl, getAuthToken, getOrgId, getCookie, getUserRole, clearSetupData } from '@/lib/auth';
import attendanceService from '@/lib/attendanceService';
import { leaveService } from '@/lib/leaveService';
import { CustomAlertDialog } from '@/components/ui/custom-dialogs';
import { Check, Clock, UserCheck, UserX } from 'lucide-react';
import AnnouncementsSection from './myspace/dashboard/announcement';
import UpcomingHolidaysSection from './myspace/dashboard/holidays';
import ManageSection from './myspace/dashboard/ManageSection';
import {
  AttendanceOverviewChart,
  EmployeeSummaryCards,
  LeaveStatisticsChart,
  LeaveStatisticsPieChart
} from './myspace/dashboard/Charts';
import { UserProfileCard } from './myspace/dashboard/UserProfileCard';
import { LiveAttendanceCard } from './myspace/dashboard/LiveAttendanceCard';


// --- Types ---
type Reportee = {
  id: string;
  name: string;
  roleId: string;
  status: 'checked-in' | 'checked-out' | 'yet-to-check-in' | 'absent' | 'on-leave';
  employeeId: string; // Add employeeId for profile lookup
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  departmentId?: string;
  departmentName?: string;
  locationId?: string;
  locationName?: string;
  designationId?: string;
  shiftType?: string;
};


type CurrentUser = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  designation: string;
  shiftType?: string;
  profileImage?: string;
};

// --- State ---

// --- Sub-Components ---

interface ProfileCardProps {
  currentUser: CurrentUser | null;
  token: string | null;
  orgId: string | null;
  currentEmployeeId: string | null;
  initialIsCheckedIn?: boolean;
  initialIsCheckedOut?: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  onCheckInStatusChange?: (isCheckedIn: boolean) => void;
  isAbsent?: boolean;
  showAlert: (title: string, description: string, variant?: "success" | "error" | "info" | "warning") => void;
}

const ProfileCard = ({ currentUser, token, orgId, currentEmployeeId, initialIsCheckedIn = false, initialIsCheckedOut = false, checkInTime, checkOutTime, onCheckInStatusChange, isAbsent = false, showAlert }: ProfileCardProps) => {
  const [isCheckedIn, setIsCheckedIn] = useState(initialIsCheckedIn);
  const [isCheckedOut, setIsCheckedOut] = useState(initialIsCheckedOut);
  const [seconds, setSeconds] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginTime, setLoginTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [logoutTime, setLogoutTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    setIsCheckedIn(initialIsCheckedIn);
    setIsCheckedOut(initialIsCheckedOut);
  }, [initialIsCheckedIn, initialIsCheckedOut]);

  useEffect(() => {
    if (checkInTime && isCheckedIn) {
      try {
        const checkInDate = new Date(checkInTime);
        const now = new Date();
        const diffInSeconds = Math.max(0, Math.floor((now.getTime() - checkInDate.getTime()) / 1000));
        setSeconds(diffInSeconds);
      } catch (e) {
        setSeconds(0);
      }
    } else {
      setSeconds(0);
    }
  }, [isCheckedIn, checkInTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCheckedIn) {
      interval = setInterval(() => { setSeconds((prev) => prev + 1); }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isCheckedIn]);

  // Sync profile image from currentUser prop
  useEffect(() => {
    if (currentUser?.profileImage) {
      setProfileImage(currentUser.profileImage);
    }
  }, [currentUser?.profileImage]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(hours)} : ${pad(minutes)} : ${pad(secs)}`;
  };

  const handleToggleCheckIn = async () => {
    if (!token || !orgId) {
      showAlert('Authentication Error', 'Authentication required', "error");
      return;
    }

    try {
      setLoading(true);
      if (isCheckedIn) {
        // Check out
        const [hours, minutes] = logoutTime.split(':');
        const checkOutDate = new Date();
        checkOutDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const response = await attendanceService.adminCheckOut(orgId, currentEmployeeId!, checkOutDate.toISOString());
        if (response.error) {
          showAlert('Check-out Failed', response.error, "error");
          return;
        }
        setIsCheckedIn(false);
        setIsCheckedOut(true);
        setSeconds(0);
        onCheckInStatusChange?.(false);
      } else {
        // Check in with custom login time
        const [hours, minutes] = loginTime.split(':');
        const checkInDate = new Date();
        checkInDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const response = await attendanceService.adminCheckIn(orgId, currentEmployeeId!, checkInDate.toISOString());
        if (response.error) {
          showAlert('Check-in Failed', response.error, "error");
          return;
        }
        setIsCheckedIn(true);
        setSeconds(0);
        onCheckInStatusChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling check-in:', error);
      showAlert('Error', 'An unexpected error occurred while toggling check-in.', "error");
    } finally {
      setLoading(false);
    }
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
    <div className="bg-white rounded-[2.5rem] shadow-xl p-8 flex flex-col items-center justify-center text-center border border-slate-100 w-full h-full transform transition-all hover:shadow-2xl hover:scale-[1.01]">
      <div className="relative group">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400 overflow-hidden">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={40} />
          )}
        </div>
      </div>
      <h2 className="text-gray-800 font-medium text-sm break-all">{currentUser?.firstName ? `${currentUser.firstName}${currentUser.lastName ? ' ' + currentUser.lastName : ''}` : 'Loading...'}</h2>
      <p className="text-gray-500 text-xs mt-1">
        {currentUser?.designation || 'N/A'}
        {currentUser?.shiftType && <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold uppercase tracking-tighter text-[10px]">{currentUser.shiftType}</span>}
      </p>
      <p className={`text-xs font-medium mt-3 ${isAbsent ? 'text-red-600' : isCheckedOut ? 'text-gray-400' : isCheckedIn ? 'text-green-500' : 'text-red-500'}`}>
        {isAbsent ? 'Marked Absent' : isCheckedOut ? 'Shift Completed' : isCheckedIn ? `Checked In ${checkInTime ? 'at ' + new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}` : 'Yet to check-in'}
      </p>

      {/* Login/Logout Time Input */}
      {!isCheckedOut && !isAbsent && (
        <div className="mt-3 w-full">
          <label className="text-xs text-gray-500 block mb-1">
            {isCheckedIn ? 'Logout Time' : 'Login Time'}
          </label>
          <input
            type="time"
            value={isCheckedIn ? logoutTime : loginTime}
            onChange={(e) => isCheckedIn ? setLogoutTime(e.target.value) : setLoginTime(e.target.value)}
            className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 ${isCheckedIn ? 'focus:ring-red-500' : 'focus:ring-green-500'} focus:border-transparent text-center`}
          />
        </div>
      )}

      <div className={`bg-gray-100 px-4 py-2 rounded-md mt-3 font-mono font-medium tracking-wider w-full sm:w-auto ${isCheckedIn ? 'text-gray-900' : 'text-gray-600'}`}>
        {formatTime(seconds)}
      </div>
      <button
        onClick={handleToggleCheckIn}
        disabled={loading || isCheckedOut || isAbsent}
        className={`mt-4 w-full py-2 border rounded-md transition-colors text-sm font-medium ${loading || isCheckedOut || isAbsent ? 'opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200' :
          isCheckedIn ? 'border-red-500 text-red-500 hover:bg-red-50' : 'border-green-500 text-green-500 hover:bg-green-50'
          }`}
      >
        {loading ? 'Processing...' : isAbsent ? 'Absent' : isCheckedOut ? 'Work Ended' : isCheckedIn ? 'Check-out' : 'Check-in'}
      </button>
    </div>
  );
};

// Modified ReporteesCard with multiple selection and check-in/check-out functionality
interface ReporteesCardProps {
  onEmployeeClick: (employeeId: string, name: string) => void;
  reportees: Reportee[];
  selectedReporteeIds: string[];
  reporteeTimes: Record<string, string>; // employeeId -> time (HH:MM)
  globalCheckInTime: string;
  globalCheckOutTime: string;
  onSelectReportee: (employeeId: string) => void;
  onSelectAll: (selectAll: boolean, type?: 'checkin' | 'checkout' | 'all') => void;
  onTimeChange: (employeeId: string, time: string) => void;
  onGlobalCheckInTimeChange: (time: string) => void;
  onGlobalCheckOutTimeChange: (time: string) => void;
  onCheckInReportees: (employeeIds: string[]) => void;
  onCheckOutReportees: (employeeIds: string[]) => void;
  onMarkAbsentReportees: (employeeIds: string[]) => void;
  checkInLoading: boolean;
  showAlert: (title: string, description: string, variant?: "success" | "error" | "info" | "warning") => void;

  // Pagination Props
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  entriesPerPage: number;
  totalEntries: number;
}

const ReporteesCard = ({
  onEmployeeClick,
  reportees,
  selectedReporteeIds,
  reporteeTimes,
  globalCheckInTime,
  globalCheckOutTime,
  onSelectReportee,
  onSelectAll,
  onTimeChange,
  onGlobalCheckInTimeChange,
  onGlobalCheckOutTimeChange,
  onCheckInReportees,
  onCheckOutReportees,
  onMarkAbsentReportees,
  checkInLoading,
  showAlert,
  currentPage,
  totalPages,
  onPageChange,
  entriesPerPage,
  totalEntries
}: ReporteesCardProps) => {
  // Get unchecked-in reportees that are selected
  const selectedUncheckedReportees = reportees.filter(
    r => selectedReporteeIds.includes(r.employeeId) && !r.isCheckedIn
  );

  // Get checked-in reportees that are selected
  const selectedCheckedReportees = reportees.filter(
    r => selectedReporteeIds.includes(r.employeeId) && r.isCheckedIn
  );

  // Count of unchecked and checked reportees
  const uncheckedReportees = reportees.filter(r => !r.isCheckedIn);
  const checkedReportees = reportees.filter(r => r.isCheckedIn);

  // Check if all unchecked reportees are selected
  const allUncheckedSelected = uncheckedReportees.length > 0 &&
    uncheckedReportees.every(r => selectedReporteeIds.includes(r.employeeId));

  // Check if all checked reportees are selected
  const allCheckedSelected = checkedReportees.length > 0 &&
    checkedReportees.every(r => selectedReporteeIds.includes(r.employeeId));

  // Get selectable reportees (not checked out)
  const selectableReportees = reportees.filter(r => !r.isCheckedOut);

  // Check if all selectable reportees are selected
  const allSelected = selectableReportees.length > 0 &&
    selectableReportees.every(r => selectedReporteeIds.includes(r.employeeId));

  // Get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const formatTimeDisplay = (isoString?: string) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl p-6 sm:p-10 border border-slate-100 flex flex-col h-full w-full transition-all hover:shadow-2xl hover:scale-[1.005]">
      {/* Header - Stack on mobile, side-by-side on tablet/desktop */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Select All Checkbox */}
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${allSelected
              ? 'border-blue-500 bg-blue-500'
              : 'border-gray-300 hover:border-gray-400'
              }`}
            onClick={() => onSelectAll(!allSelected, 'all')}
          >
            {allSelected && <Check className="w-3 h-3 text-white" />}
          </div>
          <h3 className="text-gray-700 font-semibold text-sm">Attendance Management</h3>
        </div>

        {/* Action Buttons - Wrap on medium screens, grid or stack on small */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Check In with Global Time */}
          {selectedUncheckedReportees.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
              <label className="text-xs text-green-700 font-medium whitespace-nowrap">Login:</label>
              <input
                type="time"
                value={globalCheckInTime}
                onChange={(e) => onGlobalCheckInTimeChange(e.target.value)}
                className="px-2 py-1 text-xs border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white w-24"
              />
              <button
                onClick={() => onCheckInReportees(selectedUncheckedReportees.map(r => r.employeeId))}
                disabled={checkInLoading}
                className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="truncate">{checkInLoading ? '...' : `Check In (${selectedUncheckedReportees.length})`}</span>
              </button>
            </div>
          )}

          {/* Check Out with Global Time */}
          {selectedCheckedReportees.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
              <label className="text-xs text-orange-700 font-medium whitespace-nowrap">Logout:</label>
              <input
                type="time"
                value={globalCheckOutTime}
                onChange={(e) => onGlobalCheckOutTimeChange(e.target.value)}
                className="px-2 py-1 text-xs border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white w-24"
              />
              <button
                onClick={() => onCheckOutReportees(selectedCheckedReportees.map(r => r.employeeId))}
                disabled={checkInLoading}
                className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="truncate">{checkInLoading ? '...' : `Check Out (${selectedCheckedReportees.length})`}</span>
              </button>
            </div>
          )}

          {/* Mark Absent Button */}
          {selectedUncheckedReportees.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
              <button
                onClick={() => onMarkAbsentReportees(selectedUncheckedReportees.map(r => r.employeeId))}
                disabled={checkInLoading}
                className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <UserX className="w-3.5 h-3.5" />
                <span className="truncate">{checkInLoading ? '...' : `Mark Absent (${selectedUncheckedReportees.length})`}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Select Buttons - better wrapping */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
        {uncheckedReportees.length > 0 && (
          <button
            onClick={() => onSelectAll(!allUncheckedSelected, 'checkin')}
            className={`px-3 py-1.5 text-[10px] sm:text-xs rounded-full border transition-colors ${allUncheckedSelected
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
          >
            {allUncheckedSelected ? 'Deselect' : 'Select'} Pending ({uncheckedReportees.length})
          </button>
        )}
        {checkedReportees.length > 0 && (
          <button
            onClick={() => onSelectAll(!allCheckedSelected, 'checkout')}
            className={`px-3 py-1.5 text-[10px] sm:text-xs rounded-full border transition-colors ${allCheckedSelected
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
              }`}
          >
            {allCheckedSelected ? 'Deselect' : 'Select'} Checked In ({checkedReportees.length})
          </button>
        )}
      </div>

      {/* Info text */}
      <p className="text-[10px] sm:text-xs text-gray-500 mb-3">
        {selectedReporteeIds.length} employee(s) selected
        {selectedUncheckedReportees.length > 0 && ` • ${selectedUncheckedReportees.length} pending`}
        {selectedCheckedReportees.length > 0 && ` • ${selectedCheckedReportees.length} checked in`}
      </p>

      {/* Reportees List */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar min-h-0">
        {reportees.map((person) => {
          const isSelected = selectedReporteeIds.includes(person.employeeId);

          return (
            <div
              key={person.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg transition-all border-2 ${person.isCheckedOut || person.status === 'absent' ? 'bg-gray-50 opacity-60 border-transparent' : isSelected
                ? person.isCheckedIn
                  ? 'bg-orange-50 border-orange-400'
                  : 'bg-blue-50 border-blue-400'
                : 'hover:bg-gray-50 border-transparent'
                }`}
            >
              <div className="flex items-center gap-3">
                {/* Selection checkbox */}
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${person.isCheckedOut || person.status === 'absent' ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'cursor-pointer'} ${isSelected
                    ? person.isCheckedIn
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                  onClick={() => !person.isCheckedOut && person.status !== 'absent' && onSelectReportee(person.employeeId)}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-500">
                    <User size={16} />
                  </div>
                </div>

                {/* Info Container */}
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm text-gray-700 font-medium truncate hover:text-blue-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEmployeeClick(person.employeeId, person.name);
                    }}
                  >
                    {person.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {person.status === 'absent' ? (
                      <>
                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                        <span className="text-[11px] text-red-600 font-medium">Marked Absent</span>
                      </>
                    ) : person.status === 'checked-in' ? (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-[11px] text-green-600 font-medium">
                          Checked In {person.checkInTime ? `at ${new Date(person.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </span>
                      </>
                    ) : person.status === 'checked-out' ? (
                      <>
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        <span className="text-[11px] text-gray-500 font-medium">Checked Out</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                        <span className="text-[11px] text-red-500 font-medium">Yet to check-in</span>
                      </>
                    )}
                    {person.shiftType && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-tighter">
                        {person.shiftType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Times Display - Stack on mobile, side by side on SM+ */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-0 sm:ml-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded text-[10px] sm:text-xs">
                  <span className="font-medium text-gray-600">In:</span>
                  <span className="font-mono">{formatTimeDisplay(person.checkInTime) || '--:--'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded text-[10px] sm:text-xs">
                  <span className="font-medium text-gray-600">Out:</span>
                  <span className="font-mono">{formatTimeDisplay(person.checkOutTime) || '--:--'}</span>
                </div>
                {/* Status icon - Hide on very small screens, show on SM+ */}
                <div className={`hidden sm:block p-1.5 rounded-full ${person.isCheckedIn ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {person.isCheckedIn ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <Clock className="w-3 h-3 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>



      {/* Pagination Footer */}
      {
        totalPages > 1 && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500">
              Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries} entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs font-medium rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show a window of pages around current page could be added here
                  // For simplicity, showing first 5 or logic to implement sliding window
                  let p = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) p = currentPage - 2 + i;
                    if (p > totalPages) p = i + (totalPages - 4);
                  }

                  return (
                    <button
                      key={p}
                      onClick={() => onPageChange(p)}
                      className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium ${currentPage === p
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs font-medium rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )
      }

      {/* Footer showing selection count */}
      {
        selectedReporteeIds.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">{selectedReporteeIds.length}</span> employee(s) selected
            </p>
            <button
              onClick={() => onSelectAll(false, 'all')}
              className="text-xs text-red-500 hover:text-red-600 font-medium"
            >
              Clear Selection
            </button>
          </div>
        )
      }
    </div >
  );
};



// --- Main Page Component ---

export default function Dashboard() {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [reportees, setReportees] = useState<Reportee[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);

  // Reportee selection and check-in state
  const [selectedReporteeIds, setSelectedReporteeIds] = useState<string[]>([]);
  const [reporteeTimes, setReporteeTimes] = useState<Record<string, string>>({}); // employeeId -> time (HH:MM)
  const [globalCheckInTime, setGlobalCheckInTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [globalCheckOutTime, setGlobalCheckOutTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [isSelfCheckedIn, setIsSelfCheckedIn] = useState(false);
  const [isSelfCheckedOut, setIsSelfCheckedOut] = useState(false);
  const [isSelfAbsent, setIsSelfAbsent] = useState(false);
  const [selfCheckInTime, setSelfCheckInTime] = useState<string | undefined>(undefined);
  const [selfCheckOutTime, setSelfCheckOutTime] = useState<string | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [onLeaveCount, setOnLeaveCount] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [leaveBreakdown, setLeaveBreakdown] = useState<{ name: string, value: number, color: string }[]>([]);
  const [attendanceTrendData, setAttendanceTrendData] = useState<{ name: string, present: number, absent: number }[]>([]);
  const [attendancePeriod, setAttendancePeriod] = useState<string>('Week'); // Default to Week

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  // Workforce summary stats from API
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [totalDesignations, setTotalDesignations] = useState(0);
  const [totalLocations, setTotalLocations] = useState(0);

  // Alert State
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

  // Get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = getAuthToken();
        const authOrgId = getOrgId();
        const apiUrl = getApiUrl();
        const authEmployeeId = getCookie('hrms_user_id');

        if (!authToken || !authOrgId || !authEmployeeId) return;

        setToken(authToken);
        setOrgId(authOrgId);
        setCurrentEmployeeId(authEmployeeId);

        const today = new Date().toISOString().split('T')[0];
        const headers = { Authorization: `Bearer ${authToken}` };

        // Parallelize API calls
        const [
          userRes,
          statusRes,
          attendanceRes,
          leaveRequestsRes,
          leaveReportRes,
          workforceRes
        ] = await Promise.allSettled([
          axios.get(`${apiUrl}/org/${authOrgId}/employees/${authEmployeeId}`, { headers }),
          attendanceService.getStatus(authOrgId),
          attendanceService.getDailyAttendance(authOrgId, today),
          leaveService.getPendingLeaves(authOrgId),
          leaveService.getLeaveReport(authOrgId),
          Promise.all([
            axios.get(`${apiUrl}/org/${authOrgId}/departments?limit=1`, { headers }),
            axios.get(`${apiUrl}/org/${authOrgId}/designations?limit=1`, { headers }),
            axios.get(`${apiUrl}/org/${authOrgId}/locations?limit=1`, { headers })
          ])
        ]);

        // 1. Process User Data
        if (userRes.status === 'fulfilled') {
          const userData = userRes.value.data.data || userRes.value.data;
          const fullName = userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
          const [firstName, ...lastNameParts] = fullName.split(' ');
          const lastName = lastNameParts.join(' ');

          setCurrentUser({
            id: userData.id || userData._id,
            employeeId: userData.employeeId || userData.id,
            firstName: firstName || '',
            lastName: lastName || '',
            designation: (typeof userData.designation === 'object' ? userData.designation?.name : userData.designation) || 'N/A',
            shiftType: userData.shiftType,
            profileImage: userData.profileImage || userData.profilePicUrl
          });

          // Fetch profile picture if available (non-blocking)
          if (userData.profileImage || userData.profilePicUrl) {
            axios.get(`${apiUrl}/org/${authOrgId}/employees/${authEmployeeId}/profile-pic`, { headers })
              .then(picResponse => {
                const picData = picResponse.data;
                if (picData.success && picData.imageUrl) {
                  setCurrentUser(prev => prev ? { ...prev, profileImage: picData.imageUrl } : null);
                }
              })
              .catch(err => console.error("Failed to fetch profile picture:", err));
          }
        }

        // 2. Process Self Status
        if (statusRes.status === 'fulfilled' && statusRes.value && !statusRes.value.error) {
          const record = (statusRes.value as any).data || statusRes.value;
          if (record && !record.message) {
            const hasIn = !!(record.checkInTime || record.checkIn);
            const hasOut = !!(record.checkOutTime || record.checkOut);
            const status = (record.status || '').toLowerCase();
            const isAbsent = status === 'absent' || !!record.isAbsent;

            setIsSelfCheckedIn(hasIn && !hasOut);
            setIsSelfCheckedOut(hasIn && hasOut);
            setIsSelfAbsent(isAbsent);
            setSelfCheckInTime(record.checkInTime || record.checkIn);
            setSelfCheckOutTime(record.checkOutTime || record.checkOut);
          }
        }

        // 3. Process Attendance Maps
        let attendanceMap: Record<string, boolean> = {};
        let checkedOutMap: Record<string, boolean> = {};
        let absentMap: Record<string, boolean> = {};
        let attendanceDetails: Record<string, { checkInTime?: string; checkOutTime?: string }> = {};

        if (attendanceRes.status === 'fulfilled') {
          const attendanceData = (attendanceRes.value as any).data || (Array.isArray(attendanceRes.value) ? attendanceRes.value : []);
          if (Array.isArray(attendanceData)) {
            attendanceData.forEach((record: any) => {
              if (record.employeeId) {
                attendanceDetails[record.employeeId] = {
                  checkInTime: record.checkInTime || record.checkIn,
                  checkOutTime: record.checkOutTime || record.checkOut
                };
                if (record.status === 'Absent' || record.status === 'absent') absentMap[record.employeeId] = true;
                if ((record.checkInTime || record.checkIn) && !(record.checkOutTime || record.checkOut)) attendanceMap[record.employeeId] = true;
                else if ((record.checkInTime || record.checkIn) && (record.checkOutTime || record.checkOut)) checkedOutMap[record.employeeId] = true;
              }
            });
          }
        }

        // 4. Process Leave Maps
        let onLeaveMap: Record<string, boolean> = {};
        if (leaveReportRes.status === 'fulfilled' && leaveReportRes.value.success) {
          const allLeaves = leaveReportRes.value.data as any[] || [];
          allLeaves.forEach(l => {
            if (l.status === 'approved' && l.startDate <= today && l.endDate >= today) {
              onLeaveMap[l.employeeId] = true;
            }
          });

          // Summary Stats
          const activeToday = allLeaves.filter(l => l.status === 'approved' && l.startDate <= today && l.endDate >= today);
          setOnLeaveCount(activeToday.length);

          const breakdown: Record<string, number> = {};
          allLeaves.forEach(l => {
            if (l.status === 'approved') {
              const code = l.leaveTypeCode || 'OTHER';
              breakdown[code] = (breakdown[code] || 0) + 1;
            }
          });

          const colors = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];
          const names: Record<string, string> = { 'AL': 'Annual', 'SL': 'Sick', 'CL': 'Casual', 'PL': 'Personal' };
          const formattedBreakdown = Object.entries(breakdown).map(([code, count], idx) => ({
            name: names[code] || code,
            value: count,
            color: colors[idx % colors.length]
          }));
          setLeaveBreakdown(formattedBreakdown.length > 0 ? formattedBreakdown : [
            { name: "Annual", value: 0, color: "#10b981" },
            { name: "Sick", value: 0, color: "#f59e0b" }
          ]);
        }

        if (leaveRequestsRes.status === 'fulfilled' && leaveRequestsRes.value.success) {
          setPendingLeaveCount((leaveRequestsRes.value.data as any[] || []).length);
        }

        // 5. Fetch and Set Reportees (Requires initial employee list)
        try {
          const reporteesRes = await axios.get(`${apiUrl}/org/${authOrgId}/employees?limit=1000`, { headers });
          const reporteesData = reporteesRes.data.data || reporteesRes.data || [];

          const currentReportees = reporteesData.map((emp: any) => {
            const empId = emp.id || emp._id;
            const isCheckedIn = !!attendanceMap[empId];
            const isCheckedOut = !!checkedOutMap[empId];
            const isAbsent = !!absentMap[empId];
            const isOnLeave = !!onLeaveMap[empId];
            const times = attendanceDetails[empId] || {};

            return {
              id: empId,
              name: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email,
              roleId: emp.employeeId || empId,
              status: isOnLeave ? 'on-leave' : (isAbsent ? 'absent' : (isCheckedIn ? 'checked-in' : (isCheckedOut ? 'checked-out' : 'yet-to-check-in'))),
              employeeId: empId,
              isCheckedIn: isCheckedIn,
              isCheckedOut: isCheckedOut,
              checkInTime: times.checkInTime,
              checkOutTime: times.checkOutTime,
              departmentId: emp.departmentId || emp.department?.id,
              departmentName: emp.department?.name || 'Other',
              locationId: emp.locationId || emp.location?.id,
              locationName: emp.location?.name || 'Main Office',
              designationId: emp.designationId || emp.designation?.id,
              employmentStatus: emp.status,
              shiftType: emp.shiftType
            };
          });
          setReportees(currentReportees);

          // After reportees are set, fetch trend (this depends on reportees in original logic for some context, but here it's mostly org-wide)
          try {
            const endDate = new Date();
            const startDate = new Date();
            if (attendancePeriod === 'Day') startDate.setHours(0, 0, 0, 0);
            else if (attendancePeriod === 'Week') startDate.setDate(endDate.getDate() - 6);
            else if (attendancePeriod === 'Month') startDate.setDate(endDate.getDate() - 29);
            else if (attendancePeriod === 'Year') startDate.setFullYear(endDate.getFullYear() - 1);

            const trendRes = await attendanceService.getReporteesHistory(authOrgId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
            if (trendRes && !trendRes.error) {
              const rawHistory = (trendRes as any).data || (Array.isArray(trendRes) ? trendRes : []);
              const trendMap: Record<string, { present: number, absent: number }> = {};
              const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

              if (attendancePeriod === 'Day') trendMap[today] = { present: 0, absent: 0 };
              else if (attendancePeriod === 'Week' || attendancePeriod === 'Month') {
                const numDays = attendancePeriod === 'Week' ? 7 : 30;
                for (let i = numDays - 1; i >= 0; i--) {
                  const d = new Date(); d.setDate(d.getDate() - i);
                  trendMap[d.toISOString().split('T')[0]] = { present: 0, absent: 0 };
                }
              } else if (attendancePeriod === 'Year') {
                for (let i = 11; i >= 0; i--) {
                  const d = new Date(); d.setMonth(d.getMonth() - i);
                  trendMap[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`] = { present: 0, absent: 0 };
                }
              }

              if (Array.isArray(rawHistory)) {
                rawHistory.forEach((record: any) => {
                  const recordDate = new Date(record.date || record.checkInTime);
                  const key = attendancePeriod === 'Year' ? `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}` : recordDate.toISOString().split('T')[0];
                  if (trendMap[key]) {
                    if (record.status?.toLowerCase() === 'present' || record.checkInTime) trendMap[key].present++;
                    else if (record.status?.toLowerCase() === 'absent') trendMap[key].absent++;
                  }
                });
              }

              if (trendMap[today]) {
                const livePresent = currentReportees.filter((r: any) => r.status?.toLowerCase() === 'present' || r.checkInTime).length;
                const liveAbsent = currentReportees.filter((r: any) => r.status?.toLowerCase() === 'absent').length;
                trendMap[today] = { present: Math.max(trendMap[today].present, livePresent), absent: Math.max(trendMap[today].absent, liveAbsent) };
              }

              const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const formattedTrend = Object.entries(trendMap).map(([key, stats]) => {
                let name = '';
                if (attendancePeriod === 'Year') name = monthsShort[parseInt(key.split('-')[1]) - 1];
                else if (attendancePeriod === 'Month') { const d = new Date(key); name = `${d.getDate()} ${monthsShort[d.getMonth()]}`; }
                else { name = days[new Date(key).getDay()]; }
                return { name, present: stats.present, absent: stats.absent };
              });
              setAttendanceTrendData(formattedTrend);
            }
          } catch (trendError) { console.error("Trend error:", trendError); }
        } catch (reporteesError) { console.error("Reportees error:", reporteesError); }

        // 6. Process Workforce Counts
        if (workforceRes.status === 'fulfilled') {
          const [deptRes, desigRes, locRes] = workforceRes.value;
          if (deptRes.data?.total !== undefined) setTotalDepartments(deptRes.data.total); else if (Array.isArray(deptRes.data)) setTotalDepartments(deptRes.data.length);
          if (desigRes.data?.total !== undefined) setTotalDesignations(desigRes.data.total); else if (Array.isArray(desigRes.data)) setTotalDesignations(desigRes.data.length);
          if (locRes.data?.total !== undefined) setTotalLocations(locRes.data.total); else if (Array.isArray(locRes.data)) setTotalLocations(locRes.data.length);
        }

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearSetupData();
          router.push('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger, attendancePeriod]);

  const handleEmployeeClick = (employeeId: string, name: string) => {
    setSelectedEmployeeId(employeeId);
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
    setSelectedEmployeeId('');
  };

  // Handle single reportee selection toggle
  const handleSelectReportee = (employeeId: string) => {
    setSelectedReporteeIds(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // Handle select all / deselect all
  const handleSelectAll = (selectAll: boolean, type?: 'checkin' | 'checkout' | 'all') => {
    if (selectAll) {
      let idsToSelect: string[] = [];

      // Filter based on currently visible reportees (paginated)
      const visibleReportees = reportees.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
      );

      if (type === 'checkout') {
        // Select all checked-in reportees for checkout
        idsToSelect = visibleReportees
          .filter(r => r.isCheckedIn && !r.isCheckedOut)
          .map(r => r.employeeId);
      } else if (type === 'checkin') {
        // Select all unchecked-in reportees for check-in
        idsToSelect = visibleReportees
          .filter(r => !r.isCheckedIn && !r.isCheckedOut)
          .map(r => r.employeeId);
      } else {
        // Select all non-checked-out reportees
        idsToSelect = visibleReportees
          .filter(r => !r.isCheckedOut)
          .map(r => r.employeeId);
      }
      setSelectedReporteeIds(prev => [...new Set([...prev, ...idsToSelect])]);
    } else {
      if (type === 'checkout') {
        // Deselect only checked-in reportees
        const checkedIds = reportees.filter(r => r.isCheckedIn).map(r => r.employeeId);
        setSelectedReporteeIds(prev => prev.filter(id => !checkedIds.includes(id)));
      } else if (type === 'checkin') {
        // Deselect only unchecked-in reportees
        const uncheckedIds = reportees.filter(r => !r.isCheckedIn).map(r => r.employeeId);
        setSelectedReporteeIds(prev => prev.filter(id => !uncheckedIds.includes(id)));
      } else {
        // Deselect all and clear times
        setSelectedReporteeIds([]);
        setReporteeTimes({});
      }
    }
  };

  // Handle time change for individual reportee
  const handleTimeChange = (employeeId: string, time: string) => {
    setReporteeTimes(prev => ({
      ...prev,
      [employeeId]: time
    }));
  };

  // Handle bulk check-in for multiple reportees with global time
  const handleCheckInReportees = async (employeeIds: string[]) => {
    if (!orgId) {
      showAlert('Error', 'Authentication required', 'error');
      return;
    }

    // Debug logging
    const authToken = getAuthToken();
    const userRole = getUserRole();
    console.log('[BulkCheckIn] Auth details:', {
      hasToken: !!authToken,
      tokenPreview: authToken?.substring(0, 30) + '...',
      orgId,
      userRole,
      employeeCount: employeeIds.length
    });

    setCheckInLoading(true);
    try {
      const [hours, minutes] = globalCheckInTime.split(':');
      const checkInDate = new Date();
      checkInDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const isoTime = checkInDate.toISOString();

      const response = await attendanceService.bulkCheckIn(orgId, employeeIds, isoTime);

      if (response.error) {
        showAlert('Bulk Check-in Failed', response.error, 'error');
      } else {
        // Handle success/partial success from backend bulk response
        const { success = [], failed = [] } = response as any;
        const successCount = success.length;
        const failCount = failed.length;

        // Update the reportees status locally based on backend success list
        const successfulIds = success.map((att: any) => att.employeeId);

        if (successCount > 0) {
          setReportees(prev => prev.map(r =>
            successfulIds.includes(r.employeeId)
              ? { ...r, isCheckedIn: true, status: 'checked-in', checkInTime: isoTime }
              : r
          ));
        }

        if (failCount === 0) {
          showAlert('Success', `Successfully checked in ${successCount} employee(s)`, 'success');
        } else {
          showAlert('Partial Success', `Checked in ${successCount} employee(s), ${failCount} failed`, 'warning');
        }
      }

      // Clear selection
      setSelectedReporteeIds([]);
      // Trigger refresh to ensure consistency
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Error checking in reportees:', error);
      showAlert('Check-in Failed', 'An unexpected error occurred', 'error');
    } finally {
      setCheckInLoading(false);
    }
  };

  // Handle bulk check-out for multiple reportees with custom times
  const handleCheckOutReportees = async (employeeIds: string[]) => {
    if (!orgId) {
      showAlert('Error', 'Authentication required', 'error');
      return;
    }

    setCheckInLoading(true);
    try {
      const [hours, minutes] = globalCheckOutTime.split(':');
      const checkOutDate = new Date();
      checkOutDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const isoTime = checkOutDate.toISOString();

      const response = await attendanceService.bulkCheckOut(orgId, employeeIds, isoTime);

      if (response.error) {
        showAlert('Bulk Check-out Failed', response.error, 'error');
      } else {
        // Handle success/partial success from backend bulk response
        const { success = [], failed = [] } = response as any;
        const successCount = success.length;
        const failCount = failed.length;

        // Update the reportees status locally
        const successfulIds = success.map((att: any) => att.employeeId);

        if (successCount > 0) {
          setReportees(prev => prev.map(r =>
            successfulIds.includes(r.employeeId)
              ? { ...r, isCheckedIn: false, isCheckedOut: true, status: 'checked-out', checkOutTime: isoTime }
              : r
          ));
        }

        if (failCount === 0) {
          showAlert('Success', `Successfully checked out ${successCount} employee(s)`, 'success');
        } else {
          showAlert('Partial Success', `Checked out ${successCount} employee(s), ${failCount} failed`, 'warning');
        }
      }

      // Clear selection
      setSelectedReporteeIds([]);
      // Trigger refresh to ensure consistency
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Error checking out reportees:', error);
      showAlert('Check-out Failed', 'An unexpected error occurred', 'error');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleMarkAbsentReportees = async (employeeIds: string[]) => {
    if (employeeIds.length === 0) return;
    if (!confirm(`Mark ${employeeIds.length} employee(s) as absent? This action cannot be undone.`)) return;

    try {
      setCheckInLoading(true);
      if (!orgId) return;

      const today = new Date().toISOString().split('T')[0];
      // Use bulkMarkAbsent from attendanceService
      const response = await attendanceService.bulkMarkAbsent(orgId, employeeIds, today);

      if (response && !response.error) {
        setAlertState({
          open: true,
          title: "Success",
          description: "Employees marked as absent",
          variant: "success"
        });
        // Clear selection and refresh
        setSelectedReporteeIds([]);
        setRefreshTrigger(prev => prev + 1);
      } else {
        setAlertState({
          open: true,
          title: "Error",
          description: response.error || "Failed to mark absent",
          variant: "error"
        });
      }
    } catch (error) {
      console.error('Error marking absent:', error);
      setAlertState({
        open: true,
        title: "Error",
        description: "An unexpected error occurred",
        variant: "error"
      });
    } finally {
      setCheckInLoading(false);
    }
  };

  // If profile is shown, render only the profile page
  // if (showProfile) {
  //   return (
  //     <div className="min-h-screen bg-gray-50">
  //       <ProfilePage
  //         employeeId={selectedEmployeeId}
  //         onBack={handleCloseProfile}
  //       />
  //     </div>
  //   );
  // }

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  // Calculate stats for EmployeeSummaryCards
  const allInactive = reportees.filter(r => (r as any).employmentStatus?.toLowerCase() === 'inactive');
  const allActive = reportees.filter(r => (r as any).employmentStatus?.toLowerCase() !== 'inactive');

  const totalEmployees = reportees.length;
  const inactiveCount = allInactive.length;
  const activeEmployeesCount = allActive.length;

  // Refined counts based on active workforce
  const presentCount = allActive.filter(r => r.isCheckedIn || r.isCheckedOut).length;
  const onLeaveToday = allActive.filter(r => r.status === 'on-leave').length;
  // "Absent" card shows everyone who hasn't checked in (including those on leave and marked absent)
  // This ensures the summary cards account for the full active workforce.
  const absentCount = activeEmployeesCount - presentCount;

  const departmentsCount = new Set(allActive.map(r => r.departmentId).filter(Boolean)).size;
  const designationsCount = new Set(allActive.map(r => r.designationId).filter(Boolean)).size;
  const locationsCount = new Set(allActive.map(r => r.locationId).filter(Boolean)).size;

  // Calculate Department Distribution
  const deptMap = new Map<string, number>();
  // Calculate Location Distribution
  const locMap = new Map<string, number>();

  reportees.forEach(emp => {
    const dName = emp.departmentName || 'Other';
    const lName = emp.locationName || 'Main Office';
    deptMap.set(dName, (deptMap.get(dName) || 0) + 1);
    locMap.set(lName, (locMap.get(lName) || 0) + 1);
  });

  const deptData = Array.from(deptMap.entries()).map(([name, count]) => ({ name, count }));
  const locationData = Array.from(locMap.entries()).map(([name, count]) => ({ name, count }));

  // Calculate summary stats
  // (Using pre-calculated counts above)

  // Leave Data for Workforce Snapshot (Pie Chart)
  // Ensure mutual exclusivity for categorical correctness: Total Active = Present + On Leave + Absent
  const snapshotData = [
    { name: "Present", value: presentCount, color: "#22c55e" },
    { name: "On Leave", value: onLeaveCount, color: "#3b82f6" },
    { name: "Absent", value: Math.max(0, activeEmployeesCount - presentCount - onLeaveCount), color: "#ef4444" },
    { name: "Inactive", value: inactiveCount, color: "#9ca3af" },
  ];

  // Calculate Paginated Reportees
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentReportees = allActive.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(allActive.length / entriesPerPage);

  return (
    <div className="bg-white min-h-screen p-4 md:p-8 font-sans transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* 1. Welcome Card */}


        {/* 2. Profile + Live Attendance Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserProfileCard user={currentUser} />
          <LiveAttendanceCard
            isCheckedIn={isSelfCheckedIn}
            checkInTime={selfCheckInTime}
            onCheckIn={async () => {
              if (!token || !orgId || !currentEmployeeId) return;
              try {
                const now = new Date();
                const response = await attendanceService.adminCheckIn(orgId, currentEmployeeId, now.toISOString());
                if (response.error) {
                  showAlert('Check-in Failed', response.error, 'error');
                  return;
                }
                setIsSelfCheckedIn(true);
                setSelfCheckInTime(now.toISOString());
                setRefreshTrigger(prev => prev + 1);
              } catch (e) {
                showAlert('Error', 'Check-in failed', 'error');
              }
            }}
            onCheckOut={async () => {
              if (!token || !orgId || !currentEmployeeId) return;
              try {
                const now = new Date();
                const response = await attendanceService.adminCheckOut(orgId, currentEmployeeId, now.toISOString());
                if (response.error) {
                  showAlert('Check-out Failed', response.error, 'error');
                  return;
                }
                setIsSelfCheckedIn(false);
                setIsSelfCheckedOut(true);
                setRefreshTrigger(prev => prev + 1);
              } catch (e) {
                showAlert('Error', 'Check-out failed', 'error');
              }
            }}
            loading={false}
          />
        </div>

        {/* 3. Leave Insights (Charts) */}
        <div>
          <h3 className="text-2xl font-black text-slate-800 mb-6 px-1 tracking-tight">Leave Insights</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AttendanceOverviewChart
                data={attendanceTrendData}
                activePeriod={attendancePeriod}
                onPeriodChange={setAttendancePeriod}
              />
            </div>
            <div className="lg:col-span-1">
              <LeaveStatisticsPieChart
                data={snapshotData}
                title="Workforce Status"
                subtitle="LIVE SNAPSHOT"
                todaysLeaves={onLeaveCount}
                pendingRequests={pendingLeaveCount}
              />
            </div>
          </div>
        </div>

        {/* 4. Employee Summary */}
        <EmployeeSummaryCards
          totalEmployees={totalEmployees}
          activeEmployees={activeEmployeesCount}
          inactive={inactiveCount}
          present={presentCount}
          absent={absentCount}
          departments={totalDepartments}
          designations={totalDesignations}
          locations={totalLocations}
        />

        {/* 5. Operations & Team */}
        <div>
          <h3 className="text-2xl font-black text-slate-800 mb-6 px-1 tracking-tight">Operations & Team</h3>
          <div className="min-h-[500px]">
            <ReporteesCard
              onEmployeeClick={handleEmployeeClick}
              reportees={currentReportees}
              selectedReporteeIds={selectedReporteeIds}
              reporteeTimes={reporteeTimes}
              globalCheckInTime={globalCheckInTime}
              globalCheckOutTime={globalCheckOutTime}
              onSelectReportee={handleSelectReportee}
              onSelectAll={handleSelectAll}
              onTimeChange={handleTimeChange}
              onGlobalCheckInTimeChange={setGlobalCheckInTime}
              onGlobalCheckOutTimeChange={setGlobalCheckOutTime}
              onCheckInReportees={handleCheckInReportees}
              onCheckOutReportees={handleCheckOutReportees}
              onMarkAbsentReportees={handleMarkAbsentReportees}
              checkInLoading={checkInLoading}
              showAlert={showAlert}
              // Pagination Props
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              entriesPerPage={entriesPerPage}
              totalEntries={allActive.length}
            />
          </div>
        </div>

        {/* 6. Latest Updates (Announcements & Holidays) */}
        <div>
          <h3 className="text-2xl font-black text-slate-800 mb-6 px-1 tracking-tight">Latest Updates</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <AnnouncementsSection />
            <UpcomingHolidaysSection />
          </div>
        </div>

        {/* 7. Manage Organization */}
        <div>
          <ManageSection />
        </div>

      </div>

      <CustomAlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}
        title={alertState.title}
        description={alertState.description}
        variant={alertState.variant}
      />
    </div>
  );
}