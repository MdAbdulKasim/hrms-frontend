'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Briefcase,
  X,
  Check,
  Clock,
  UserCheck,
  UserX,
  User
} from 'lucide-react';
import ProfilePage from '../admin/profile/profilepage';
import { isAxiosError } from 'axios';
import axiosInstance from '@/lib/axios';
import { getApiUrl, getAuthToken, getOrgId, getCookie, getEmployeeId, getUserRole } from '@/lib/auth';
import attendanceService from '@/lib/attendanceService';
import { CustomAlertDialog } from '@/components/ui/custom-dialogs';
import AnnouncementsSection from '@/components/admin/myspace/dashboard/announcement';
import UpcomingHolidaysSection from '@/components/admin/myspace/dashboard/holidays';
import { StatsCards } from './employeedashboard/myspace/StatsCards';
import { leaveService } from '@/lib/leaveService';
import { LeaveStatisticsChart, LeaveStatisticsPieChart, AttendanceOverviewChart } from '@/components/admin/myspace/dashboard/Charts';
import { UserProfileCard } from '@/components/admin/myspace/dashboard/UserProfileCard';
import { LiveAttendanceCard } from '@/components/admin/myspace/dashboard/LiveAttendanceCard';

// --- Types ---
type Reportee = {
  id: string;
  name: string;
  roleId: string;
  status: 'checked-in' | 'checked-out' | 'yet-to-check-in' | 'absent' | 'on-leave';
  employeeId: string;
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  isAbsent: boolean;
  isOnLeave: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  shiftType?: string;
};

type CurrentUser = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  designation: string;
  shiftType?: string;
  profileImage?: string;
};

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
  isOnLeave?: boolean;
  showAlert: (title: string, description: string, variant: "success" | "error" | "info" | "warning") => void;
}

const ProfileCard = ({ currentUser, token,
  orgId,
  currentEmployeeId,
  initialIsCheckedIn = false,
  initialIsCheckedOut = false,
  checkInTime,
  checkOutTime,
  onCheckInStatusChange,
  isAbsent = false,
  isOnLeave = false,
  showAlert
}: ProfileCardProps) => {
  const [isCheckedIn, setIsCheckedIn] = useState(initialIsCheckedIn);
  const [isCheckedOut, setIsCheckedOut] = useState(initialIsCheckedOut);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Time inputs
  const [loginTime, setLoginTime] = useState<string>(() => {
    if (checkInTime) {
      try {
        const d = new Date(checkInTime);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      } catch (e) { }
    }
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  const [logoutTime, setLogoutTime] = useState<string>(() => {
    if (checkOutTime) {
      try {
        const d = new Date(checkOutTime);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      } catch (e) { }
    }
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  // Sync state with props
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

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(hours)} : ${pad(minutes)} : ${pad(secs)}`;
  };

  const handleToggleCheckIn = async () => {
    if (!token || !orgId) {
      showAlert('Error', 'Authentication required', 'error');
      return;
    }

    try {
      setLoading(true);
      if (isCheckedIn) {
        // Check out with custom logout time
        const [hours, minutes] = logoutTime.split(':');
        const checkOutDate = new Date();
        checkOutDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const response = await attendanceService.checkOut(orgId, checkOutDate.toISOString());
        if (response.error) {
          showAlert('Error', 'Failed to check out: ' + response.error, 'error');
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

        const response = await attendanceService.checkIn(orgId, checkInDate.toISOString());
        if (response.error) {
          showAlert('Error', 'Failed to check in: ' + response.error, 'error');
          return;
        }
        setIsCheckedIn(true);
        setSeconds(0);
        onCheckInStatusChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling check-in:', error);
      showAlert('Error', 'Error toggling check-in', 'error');
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

  // Get display name
  const displayName = currentUser?.fullName ||
    (currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
      : currentUser?.firstName || '');

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl p-8 flex flex-col items-center justify-center text-center border border-slate-100 w-full h-full transform transition-all hover:shadow-2xl hover:scale-[1.01]">
      <div className="relative group">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400 overflow-hidden">
          {profileImage || currentUser?.profileImage ? (
            <img src={profileImage || currentUser?.profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={40} />
          )}
        </div>
      </div>

      {/* Fixed: Show actual name or skeleton loader */}
      {displayName ? (
        <h2 className="text-gray-800 font-medium text-sm break-all">{displayName}</h2>
      ) : (
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
      )}

      <p className="text-gray-500 text-xs mt-1">
        {currentUser?.designation || 'N/A'}
        {currentUser?.shiftType && <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold uppercase tracking-tighter text-[10px]">{currentUser.shiftType}</span>}
      </p>
      <p className={`text-xs font-medium mt-3 ${isOnLeave ? 'text-blue-600' : isAbsent ? 'text-red-600' : isCheckedOut ? 'text-gray-400' : isCheckedIn ? 'text-green-500' : 'text-red-500'}`}>
        {isOnLeave ? 'On Approved Leave' : isAbsent ? 'Marked Absent' : isCheckedOut ? 'Shift Completed' : isCheckedIn ? `Checked In ${checkInTime ? 'at ' + new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}` : 'Yet to check-in'}
      </p>

      {/* Login/Logout Time Input */}
      {!isCheckedOut && !isAbsent && !isOnLeave && (
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
        disabled={loading || isCheckedOut || isAbsent || isOnLeave}
        className={`mt-4 w-full py-2 border rounded-md transition-colors text-sm font-medium ${loading || isCheckedOut || isAbsent || isOnLeave ? 'opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200' :
          isCheckedIn ? 'border-red-500 text-red-500 hover:bg-red-50' : 'border-green-500 text-green-500 hover:bg-green-50'
          }`}
      >
        {loading ? 'Processing...' : isOnLeave ? 'On Leave' : isAbsent ? 'Absent' : isCheckedOut ? 'Work Ended' : isCheckedIn ? 'Check-out' : 'Check-in'}
      </button>
    </div>
  );
};

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
  showAlert
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
      <div className="flex-1 space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {reportees.map((person) => {
          const isSelected = selectedReporteeIds.includes(person.employeeId);

          return (
            <div
              key={person.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg transition-all border-2 ${person.isCheckedOut || person.status === 'absent' || person.status === 'on-leave' ? 'bg-gray-50 opacity-60 border-transparent' : isSelected
                ? person.isCheckedIn
                  ? 'bg-orange-50 border-orange-400'
                  : 'bg-blue-50 border-blue-400'
                : 'hover:bg-gray-50 border-transparent'
                }`}
            >
              <div className="flex items-center gap-3">
                {/* Selection checkbox */}
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${person.isCheckedOut || person.status === 'absent' || person.status === 'on-leave' ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'cursor-pointer'} ${isSelected
                    ? person.isCheckedIn
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                  onClick={() => !person.isCheckedOut && person.status !== 'absent' && person.status !== 'on-leave' && onSelectReportee(person.employeeId)}
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
                    {person.shiftType && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-tighter">
                        {person.shiftType}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {person.status === 'absent' ? (
                      <>
                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                        <span className="text-[11px] text-red-600 font-medium">Marked Absent</span>
                      </>
                    ) : person.status === 'on-leave' ? (
                      <>
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-[11px] text-blue-600 font-medium">On Approved Leave</span>
                      </>
                    ) : person.status === 'checked-in' ? (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-[11px] text-green-600 font-medium">
                          Checked In {person.checkInTime ? `at ${formatTimeDisplay(person.checkInTime)}` : ''}
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

      {/* Footer showing selection count */}
      {selectedReporteeIds.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
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
      )}
    </div>
  );
};



export default function Dashboard() {
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
  const [isSelfOnLeave, setIsSelfOnLeave] = useState(false);
  const [selfCheckInTime, setSelfCheckInTime] = useState<string | undefined>(undefined);
  const [selfCheckOutTime, setSelfCheckOutTime] = useState<string | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [onLeaveCount, setOnLeaveCount] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [leaveBreakdown, setLeaveBreakdown] = useState<{ name: string, value: number, color: string }[]>([]);
  const [attendanceTrendData, setAttendanceTrendData] = useState<{ name: string, present: number, absent: number }[]>([]);
  const [attendancePeriod, setAttendancePeriod] = useState<string>('Week'); // Default to Week

  // Alert State
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = getAuthToken();
        const authOrgId = getOrgId();
        const apiUrl = getApiUrl();
        const authEmployeeId = getEmployeeId();

        if (!authToken || !authOrgId || !authEmployeeId || authOrgId === 'undefined' || authEmployeeId === 'undefined') {
          console.error('Missing or invalid auth credentials');
          setLoading(false);
          return;
        }

        setToken(authToken);
        setOrgId(authOrgId);
        setCurrentEmployeeId(authEmployeeId);

        const today = new Date().toISOString().split('T')[0];

        // Parallelize initial set of API calls
        const [userRes, statusRes, pendingRes, historyRes, leaveRes] = await Promise.allSettled([
          axiosInstance.get(`${apiUrl}/org/${authOrgId}/employees/${authEmployeeId}`),
          attendanceService.getStatus(authOrgId),
          attendanceService.getPendingCheckIns(authOrgId, today, true),
          attendanceService.getReporteesHistory(authOrgId, today, today),
          leaveService.getMyHistory(authOrgId)
        ]);

        // Process User Data
        if (userRes.status === 'fulfilled') {
          try {
            const userData = userRes.value.data.data || userRes.value.data;
            let firstName = userData.firstName || '';
            let lastName = userData.lastName || '';
            let fullName = userData.fullName || userData.full_name || userData.name || '';

            if (!fullName && (firstName || lastName)) {
              fullName = `${firstName} ${lastName}`.trim();
            }

            if (fullName && !firstName && !lastName) {
              const nameParts = fullName.split(' ');
              firstName = nameParts[0] || '';
              lastName = nameParts.slice(1).join(' ') || '';
            }

            const userObj: CurrentUser = {
              id: userData.id || userData._id || '',
              employeeId: userData.employeeId || userData.id || '',
              firstName: firstName,
              lastName: lastName,
              fullName: fullName,
              designation: (typeof userData.designation === 'object' ? userData.designation?.name : userData.designation) || 'N/A',
              shiftType: userData.shiftType,
              profileImage: userData.profileImage || userData.profilePicUrl
            };
            setCurrentUser(userObj);

            // Fetch profile picture if available (async, non-blocking for main UI)
            if (userData.profileImage || userData.profilePicUrl) {
              axiosInstance.get(`${apiUrl}/org/${authOrgId}/employees/${authEmployeeId}/profile-pic`)
                .then(picResponse => {
                  const picData = picResponse.data;
                  if (picData.success && picData.imageUrl) {
                    setCurrentUser(prev => prev ? { ...prev, profileImage: picData.imageUrl } : null);
                  }
                })
                .catch(err => console.error("Failed to fetch profile picture:", err));
            }
          } catch (e) {
            console.error('Error processing user data:', e);
          }
        }

        // Process Attendance Status
        if (statusRes.status === 'fulfilled' && statusRes.value && !statusRes.value.error) {
          const record = (statusRes.value as any).data || statusRes.value;
          if (record && !record.message) {
            const hasIn = !!(record.checkInTime || record.checkIn);
            const hasOut = !!(record.checkOutTime || record.checkOut);
            const status = (record.status || '').toLowerCase();
            const isAbsent = status === 'absent' || !!record.isAbsent;
            const isOnLeave = status === 'on-leave';

            setIsSelfCheckedIn(hasIn && !hasOut && !isOnLeave);
            setIsSelfCheckedOut(hasIn && hasOut);
            setIsSelfAbsent(isAbsent);
            setIsSelfOnLeave(isOnLeave);
            setSelfCheckInTime(record.checkInTime || record.checkIn);
            setSelfCheckOutTime(record.checkOutTime || record.checkOut);
          }
        }

        // Process Reportees and Pending Check-ins
        let currentReportees: Reportee[] = [];
        if (pendingRes.status === 'fulfilled' && pendingRes.value && !pendingRes.value.error) {
          const pendingData = (pendingRes.value as any).data || pendingRes.value;
          const employees = (pendingData as any).employees || [];

          let historyData: any[] = [];
          if (historyRes.status === 'fulfilled' && historyRes.value && !historyRes.value.error) {
            historyData = (historyRes.value as any).data || (Array.isArray(historyRes.value) ? historyRes.value : []);
          }

          const historyMap = new Map();
          if (Array.isArray(historyData)) {
            historyData.forEach((h: any) => historyMap.set(h.employeeId, h));
          }

          currentReportees = employees.map((emp: any) => {
            const history = historyMap.get(emp.employeeId);
            const status = (history?.status || '').toLowerCase();
            const isAbsent = status === 'absent' || !!history?.isAbsent;
            const isOnLeave = status === 'on-leave';
            const hasIn = emp.hasCheckedIn || !!history?.checkInTime;
            const hasOut = emp.hasCheckedOut || !!history?.checkOutTime;

            return {
              id: emp.employeeId,
              name: emp.employeeName || 'Unknown',
              roleId: emp.employeeId,
              status: isOnLeave ? 'on-leave' : (isAbsent ? 'absent' : (hasIn ? (hasOut ? 'checked-out' : 'checked-in') : 'yet-to-check-in')),
              employeeId: emp.employeeId,
              isCheckedIn: hasIn,
              isCheckedOut: hasOut,
              isAbsent: isAbsent,
              isOnLeave: isOnLeave,
              checkInTime: emp.checkInTime || history?.checkInTime,
              checkOutTime: emp.checkOutTime || history?.checkOutTime,
              shiftType: emp.shiftType
            };
          });
          setReportees(currentReportees);
        }

        // Process Leave statistics
        if (leaveRes.status === 'fulfilled' && leaveRes.value?.success) {
          const history = (leaveRes.value.data as any[] || []).filter(l => l !== null);
          const pending = history.filter(l => l.status === 'pending');
          setPendingLeaveCount(pending.length);

          const todayStr = new Date().toISOString().split('T')[0];
          const activeToday = history.filter(l =>
            l.status === 'approved' &&
            l.startDate <= todayStr &&
            l.endDate >= todayStr
          );
          setOnLeaveCount(activeToday.length);

          const breakdown: Record<string, number> = {};
          history.forEach(l => {
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
          setLeaveBreakdown(formattedBreakdown);
        }

        // Process Trend Data - This requires reportees to be processed first for final sync
        try {
          const endDate = new Date();
          const startDate = new Date();

          if (attendancePeriod === 'Day') {
            startDate.setHours(0, 0, 0, 0);
          } else if (attendancePeriod === 'Week') {
            startDate.setDate(endDate.getDate() - 6);
          } else if (attendancePeriod === 'Month') {
            startDate.setDate(endDate.getDate() - 29);
          } else if (attendancePeriod === 'Year') {
            startDate.setFullYear(endDate.getFullYear() - 1);
          }

          const startStr = startDate.toISOString().split('T')[0];
          const endStr = endDate.toISOString().split('T')[0];

          let trendHistoryRes;
          if (currentReportees.length > 0) {
            trendHistoryRes = await attendanceService.getReporteesHistory(authOrgId, startStr, endStr);
          } else {
            trendHistoryRes = await attendanceService.getMyHistory(authOrgId, startStr, endStr);
          }

          if (trendHistoryRes && !trendHistoryRes.error) {
            const rawHistory = (trendHistoryRes as any).data || (Array.isArray(trendHistoryRes) ? trendHistoryRes : []);
            const trendMap: Record<string, { present: number, absent: number }> = {};
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            if (attendancePeriod === 'Day') {
              const todayKey = new Date().toISOString().split('T')[0];
              trendMap[todayKey] = { present: 0, absent: 0 };
            } else if (attendancePeriod === 'Week' || attendancePeriod === 'Month') {
              const numDays = attendancePeriod === 'Week' ? 7 : 30;
              for (let i = numDays - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateKey = d.toISOString().split('T')[0];
                trendMap[dateKey] = { present: 0, absent: 0 };
              }
            } else if (attendancePeriod === 'Year') {
              for (let i = 11; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                trendMap[monthKey] = { present: 0, absent: 0 };
              }
            }

            if (Array.isArray(rawHistory)) {
              rawHistory.forEach((record: any) => {
                const recordDate = new Date(record.date || record.checkInTime);
                let key = '';
                if (attendancePeriod === 'Year') {
                  key = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
                } else {
                  key = recordDate.toISOString().split('T')[0];
                }

                if (trendMap[key]) {
                  const status = (record.status || '').toLowerCase();
                  if (status === 'present' || record.checkInTime) {
                    trendMap[key].present++;
                  } else if (status === 'absent') {
                    trendMap[key].absent++;
                  }
                }
              });
            }

            const todayKey = new Date().toISOString().split('T')[0];
            if (trendMap[todayKey]) {
              const livePresent = currentReportees.filter((r: any) => (r.status || '').toLowerCase() === 'present' || r.checkInTime).length;
              const liveAbsent = currentReportees.filter((r: any) => (r.status || '').toLowerCase() === 'absent').length;

              if (currentReportees.length > 0) {
                trendMap[todayKey] = {
                  present: Math.max(trendMap[todayKey].present, livePresent),
                  absent: Math.max(trendMap[todayKey].absent, liveAbsent)
                };
              }
            }

            const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const formattedTrend = Object.entries(trendMap).map(([key, stats]) => {
              let name = '';
              if (attendancePeriod === 'Year') {
                const [y, m] = key.split('-');
                name = monthsShort[parseInt(m) - 1];
              } else if (attendancePeriod === 'Month') {
                const d = new Date(key);
                name = `${d.getDate()} ${monthsShort[d.getMonth()]}`;
              } else {
                const d = new Date(key);
                name = days[d.getDay()];
              }
              return { name, present: stats.present, absent: stats.absent };
            });

            setAttendanceTrendData(formattedTrend);
          }
        } catch (trendError) {
          console.error("Failed to fetch attendance trend:", trendError);
        }

      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          console.log('Session expired, redirecting...');
          return;
        }
        console.error('Error fetching dashboard data:', error);
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
    setRefreshTrigger(prev => prev + 1);
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
      if (type === 'checkout') {
        idsToSelect = reportees
          .filter(r => r.isCheckedIn && !r.isCheckedOut)
          .map(r => r.employeeId);
      } else if (type === 'checkin') {
        idsToSelect = reportees
          .filter(r => !r.isCheckedIn && !r.isCheckedOut && !r.isOnLeave && !r.isAbsent)
          .map(r => r.employeeId);
      } else {
        idsToSelect = reportees
          .filter(r => !r.isCheckedOut && !r.isOnLeave && !r.isAbsent)
          .map(r => r.employeeId);
      }
      setSelectedReporteeIds(prev => [...new Set([...prev, ...idsToSelect])]);
    } else {
      if (type === 'checkout') {
        const checkedIds = reportees.filter(r => r.isCheckedIn).map(r => r.employeeId);
        setSelectedReporteeIds(prev => prev.filter(id => !checkedIds.includes(id)));
      } else if (type === 'checkin') {
        const uncheckedIds = reportees.filter(r => !r.isCheckedIn).map(r => r.employeeId);
        setSelectedReporteeIds(prev => prev.filter(id => !uncheckedIds.includes(id)));
      } else {
        setSelectedReporteeIds([]);
        setReporteeTimes({});
      }
    }
  };

  const handleTimeChange = (employeeId: string, time: string) => {
    setReporteeTimes(prev => ({
      ...prev,
      [employeeId]: time
    }));
  };

  const handleCheckInReportees = async (employeeIds: string[]) => {
    if (!orgId) {
      showAlert('Error', 'Authentication required', 'error');
      return;
    }

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
        showAlert('Success', `Successfully checked in ${employeeIds.length} employees`, 'success');
        setSelectedReporteeIds([]);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      showAlert('Error', 'An unexpected error occurred during bulk check-in', 'error');
    } finally {
      setCheckInLoading(false);
    }
  };

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
        showAlert('Success', `Successfully checked out ${employeeIds.length} employees`, 'success');
        setSelectedReporteeIds([]);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      showAlert('Error', 'An unexpected error occurred during bulk check-out', 'error');
    } finally {
      setCheckInLoading(false);
    }
  };

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


  const handleMarkAbsentReportees = async (employeeIds: string[]) => {
    if (employeeIds.length === 0) return;
    if (!confirm(`Mark ${employeeIds.length} employee(s) as absent? This action cannot be undone.`)) return;

    try {
      setCheckInLoading(true);
      if (!orgId) return;

      const today = new Date().toISOString().split('T')[0];
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Calculate Derived Stats for StatsCards
  let status = 'Marked Absent';
  if (isSelfOnLeave) {
    status = 'On Leave';
  } else if (!isSelfAbsent) {
    status = isSelfCheckedIn ? 'Active' : isSelfCheckedOut ? 'Completed' : 'Yet to Check-in';
  }

  // Work Hours Calculation (Simple approximation based on check-in)
  let workHours = '0h 0m';
  if (isSelfCheckedIn && selfCheckInTime) {
    const start = new Date(selfCheckInTime).getTime();
    const now = new Date().getTime();
    const diff = now - start;
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    workHours = `${hrs}h ${mins}m`;
  } else if (isSelfCheckedOut && selfCheckInTime && selfCheckOutTime) {
    const start = new Date(selfCheckInTime).getTime();
    const end = new Date(selfCheckOutTime).getTime();
    const diff = end - start;
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    workHours = `${hrs}h ${mins}m`;
  }

  const shift = currentUser?.designation || 'Regular Shift';

  // Team Stats for Managers
  const totalTeam = reportees.length;
  const teamPresentCount = reportees.filter(r => r.isCheckedIn).length;
  const teamAbsentCount = reportees.filter(r => (r as any).status === 'absent' || (r as any).status === 'Absent').length;

  const teamSnapshotData = [
    { name: "Present", value: teamPresentCount, color: "#22c55e" },
    { name: "Absent", value: teamAbsentCount, color: "#ef4444" },
    { name: "On Leave", value: onLeaveCount, color: "#3b82f6" },
  ];

  // (Using attendanceTrendData from state)

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 font-sans transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* 1. Welcome Card */}


        {/* 2. Profile + Live Attendance Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserProfileCard user={currentUser} />
          <LiveAttendanceCard
            isCheckedIn={isSelfCheckedIn}
            checkInTime={selfCheckInTime}
            isOnLeave={isSelfOnLeave}
            onCheckIn={async () => {
              if (!token || !orgId) return;
              try {
                const now = new Date();
                const response = await attendanceService.checkIn(orgId, now.toISOString());
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
              if (!token || !orgId) return;
              try {
                const now = new Date();
                const response = await attendanceService.checkOut(orgId, now.toISOString());
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

        {/* 3. Attendance Overview (Charts) */}
        <div>
          <h3 className="text-2xl font-black text-slate-800 mb-6 px-1 tracking-tight">Attendance Overview</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <LeaveStatisticsPieChart
              data={reportees.length > 0 ? teamSnapshotData : leaveBreakdown}
              title={reportees.length > 0 ? "Team Status" : "Leave Statistics"}
              subtitle={reportees.length > 0 ? "TEAM SNAPSHOT" : "YOUR LEAVE HISTORY"}
            />
            <AttendanceOverviewChart
              data={attendanceTrendData}
              activePeriod={attendancePeriod}
              onPeriodChange={setAttendancePeriod}
            />
          </div>
        </div>

        {/* 4. Employee Metrics / Stats */}
        <StatsCards
          status={isSelfAbsent ? 'Absent' : isSelfCheckedOut ? 'Completed' : isSelfCheckedIn ? 'Active' : 'Pending'}
          workHours={workHours}
          shift={shift}
        />

        {/* 5. Operations & Team */}
        {reportees.length > 0 && (
          <div>
            <h3 className="text-2xl font-black text-slate-800 mb-6 px-1 tracking-tight">Operations & Team</h3>
            <div className="min-h-[500px]">
              <ReporteesCard
                onEmployeeClick={handleEmployeeClick}
                reportees={reportees}
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
              />
            </div>
          </div>
        )}

        {/* 6. Latest Updates (Announcements & Holidays) */}
        <div>
          <h3 className="text-2xl font-black text-slate-800 mb-6 px-1 tracking-tight">Latest Updates</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <AnnouncementsSection />
            <UpcomingHolidaysSection />
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
    </div>
  );
}