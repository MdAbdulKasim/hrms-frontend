'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Sun,
  Briefcase,
  X
} from 'lucide-react';
import ProfilePage from '../profile/ProfilePage'; // Import ProfilePage from profile folder
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId, getCookie, getUserRole } from '@/lib/auth';
import attendanceService from '@/lib/attendanceService';
import { CustomAlertDialog } from '@/components/ui/custom-dialogs';
import { Check, Clock, UserCheck } from 'lucide-react';


// --- Types ---
type Reportee = {
  id: string;
  name: string;
  roleId: string;
  status: 'checked-in' | 'checked-out' | 'yet-to-check-in';
  employeeId: string; // Add employeeId for profile lookup
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  checkInTime?: string;
  checkOutTime?: string;
};


type CurrentUser = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  designation: string;
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
  onCheckInStatusChange?: (isCheckedIn: boolean) => void;
  showAlert: (title: string, description: string, variant?: "success" | "error" | "info" | "warning") => void;
}

const ProfileCard = ({ currentUser, token, orgId, currentEmployeeId, initialIsCheckedIn = false, initialIsCheckedOut = false, onCheckInStatusChange, showAlert }: ProfileCardProps) => {
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
  }, [initialIsCheckedIn]);

  useEffect(() => {
    setIsCheckedOut(initialIsCheckedOut);
  }, [initialIsCheckedOut]);

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
      <h2 className="text-gray-800 font-medium text-sm break-all">{currentUser?.firstName ? `${currentUser.firstName}${currentUser.lastName ? ' ' + currentUser.lastName : ''}` : 'Loading...'}</h2>
      <p className="text-gray-500 text-xs mt-1">{currentUser?.designation || 'N/A'}</p>
      <p className={`text-xs font-medium mt-3 ${isCheckedOut ? 'text-gray-400' : isCheckedIn ? 'text-green-500' : 'text-red-500'}`}>
        {isCheckedOut ? 'Shift Completed' : isCheckedIn ? 'Checked In' : 'Yet to check-in'}
      </p>

      {/* Login/Logout Time Input */}
      {!isCheckedOut && (
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
        disabled={loading || isCheckedOut}
        className={`mt-4 w-full py-2 border rounded-md transition-colors text-sm font-medium ${loading || isCheckedOut ? 'opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200' :
          isCheckedIn ? 'border-red-500 text-red-500 hover:bg-red-50' : 'border-green-500 text-green-500 hover:bg-green-50'
          }`}
      >
        {loading ? 'Processing...' : isCheckedOut ? 'Work Ended' : isCheckedIn ? 'Check-out' : 'Check-in'}
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
  onSelectAll: (selectAll: boolean, forCheckOut?: boolean) => void;
  onTimeChange: (employeeId: string, time: string) => void;
  onGlobalCheckInTimeChange: (time: string) => void;
  onGlobalCheckOutTimeChange: (time: string) => void;
  onCheckInReportees: (employeeIds: string[]) => void;
  onCheckOutReportees: (employeeIds: string[]) => void;
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
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-gray-700 font-semibold text-sm">Attendance Management</h3>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Check In with Global Time */}
          {selectedUncheckedReportees.length > 0 && (
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
              <label className="text-xs text-green-700 font-medium whitespace-nowrap">Login Time:</label>
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
                {checkInLoading ? 'Processing...' : `Check In (${selectedUncheckedReportees.length})`}
              </button>
            </div>
          )}

          {/* Check Out with Global Time */}
          {selectedCheckedReportees.length > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
              <label className="text-xs text-orange-700 font-medium whitespace-nowrap">Logout Time:</label>
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
                {checkInLoading ? 'Processing...' : `Check Out (${selectedCheckedReportees.length})`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Select Buttons */}
      <div className="flex items-center gap-3 mb-3">
        {uncheckedReportees.length > 0 && (
          <button
            onClick={() => onSelectAll(!allUncheckedSelected, false)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${allUncheckedSelected
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
          >
            {allUncheckedSelected ? 'Deselect' : 'Select'} Pending ({uncheckedReportees.length})
          </button>
        )}
        {checkedReportees.length > 0 && (
          <button
            onClick={() => onSelectAll(!allCheckedSelected, true)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${allCheckedSelected
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
              }`}
          >
            {allCheckedSelected ? 'Deselect' : 'Select'} Checked In ({checkedReportees.length})
          </button>
        )}
      </div>

      {/* Info text */}
      <p className="text-xs text-gray-500 mb-3">
        {selectedReporteeIds.length} employee(s) selected
        {selectedUncheckedReportees.length > 0 && ` • ${selectedUncheckedReportees.length} pending`}
        {selectedCheckedReportees.length > 0 && ` • ${selectedCheckedReportees.length} checked in`}
      </p>

      {/* Reportees List */}
      <div className="flex-1 space-y-3 max-h-[400px] overflow-y-auto">
        {reportees.map((person) => {
          const isSelected = selectedReporteeIds.includes(person.employeeId);

          return (
            <div
              key={person.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${person.isCheckedOut ? 'bg-gray-50 opacity-60' : isSelected
                ? person.isCheckedIn
                  ? 'bg-orange-50 border-2 border-orange-400'
                  : 'bg-blue-50 border-2 border-blue-400'
                : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
            >
              {/* Selection checkbox */}
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${person.isCheckedOut ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'cursor-pointer'} ${isSelected
                  ? person.isCheckedIn
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
                onClick={() => !person.isCheckedOut && onSelectReportee(person.employeeId)}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-500">
                  <User size={16} />
                </div>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-start">
                  <div>
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
                      {person.status === 'checked-in' ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-[11px] text-green-600 font-medium">Checked In</span>
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

                {/* Times Display */}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 border-t border-gray-50 pt-1.5">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded">
                    <span className="font-medium text-gray-600">In:</span>
                    <span className="font-mono">{formatTimeDisplay(person.checkInTime) || '--:--'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded">
                    <span className="font-medium text-gray-600">Out:</span>
                    <span className="font-mono">{formatTimeDisplay(person.checkOutTime) || '--:--'}</span>
                  </div>
                </div>
              </div>

              {/* Status icon */}
              <div className={`p-1.5 rounded-full ${person.isCheckedIn ? 'bg-green-100' : 'bg-gray-100'}`}>
                {person.isCheckedIn ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
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
            onClick={() => onSelectAll(false)}
            className="text-xs text-red-500 hover:text-red-600 font-medium"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
};

const ActivitiesSection = ({ currentUser }: { currentUser: CurrentUser | null }) => {
  return (
    <div className="space-y-4">
      {/* Greeting Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex shrink-0 items-center justify-center bg-blue-50 rounded-lg">
            <Briefcase className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-gray-800 font-medium">Welcome,<span className="text-gray-500 font-normal block sm:inline">{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User'}</span></h3>
            <p className="text-gray-500 text-sm">Have a productive day!</p>
          </div>
        </div>
        <div className="bg-yellow-100 p-2 rounded-full self-end sm:self-center">
          <Sun className="text-yellow-500" size={24} />
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

        // Store in state for ProfileCard
        setToken(authToken);
        setOrgId(authOrgId);
        setCurrentEmployeeId(authEmployeeId);

        // Fetch current user data
        const currentUserRes = await axios.get(`${apiUrl}/org/${authOrgId}/employees/${authEmployeeId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const userData = currentUserRes.data.data || currentUserRes.data;

        // Parse full name - API returns fullName as single string
        const fullName = userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ');

        setCurrentUser({
          id: userData.id || userData._id,
          employeeId: userData.employeeId || userData.id,
          firstName: firstName || '',
          lastName: lastName || '',
          designation: (typeof userData.designation === 'object' ? userData.designation?.name : userData.designation) || 'N/A',
          profileImage: userData.profileImage
        });

        // Fetch attendance status for all employees
        let attendanceMap: Record<string, boolean> = {};
        let checkedOutMap: Record<string, boolean> = {};
        let attendanceDetails: Record<string, { checkInTime?: string; checkOutTime?: string }> = {};

        try {
          const today = new Date().toISOString().split('T')[0];
          const attendanceRes = await attendanceService.getDailyAttendance(authOrgId, today);

          // Handle both { data: [...] } and [...] formats
          const attendanceData = (attendanceRes as any).data || (Array.isArray(attendanceRes) ? attendanceRes : []);

          if (Array.isArray(attendanceData)) {
            attendanceData.forEach((record: any) => {
              if (record.employeeId) {
                attendanceDetails[record.employeeId] = {
                  checkInTime: record.checkInTime,
                  checkOutTime: record.checkOutTime
                };

                // If there's a check-in but no check-out, they are active
                if (record.checkInTime && !record.checkOutTime) {
                  attendanceMap[record.employeeId] = true;
                }
                // If they have both, they are finished for the day
                else if (record.checkInTime && record.checkOutTime) {
                  checkedOutMap[record.employeeId] = true;
                }
              }
            });
          }
        } catch (attendanceError) {
          console.log('Could not fetch attendance data');
        }

        // Fetch reportees
        const reporteesRes = await axios.get(`${apiUrl}/org/${authOrgId}/employees`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const reporteesData = reporteesRes.data.data || reporteesRes.data || [];

        setReportees(reporteesData.slice(0, 10).map((emp: any) => {
          const empId = emp.id || emp._id;
          const isCheckedIn = !!attendanceMap[empId];
          const isCheckedOut = !!checkedOutMap[empId];
          const times = attendanceDetails[empId] || {};

          return {
            id: empId,
            name: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email,
            roleId: emp.employeeId || empId,
            status: isCheckedIn ? 'checked-in' : (isCheckedOut ? 'checked-out' : 'yet-to-check-in'),
            employeeId: empId,
            isCheckedIn: isCheckedIn,
            isCheckedOut: isCheckedOut,
            checkInTime: times.checkInTime,
            checkOutTime: times.checkOutTime
          };
        }));

        setIsSelfCheckedIn(!!attendanceMap[authEmployeeId]);
        setIsSelfCheckedOut(!!checkedOutMap[authEmployeeId]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

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
  const handleSelectAll = (selectAll: boolean, forCheckOut?: boolean) => {
    if (selectAll) {
      if (forCheckOut) {
        // Select all checked-in reportees for checkout
        const checkedIds = reportees
          .filter(r => r.isCheckedIn)
          .map(r => r.employeeId);
        setSelectedReporteeIds(prev => [...new Set([...prev, ...checkedIds])]);
      } else {
        // Select all unchecked-in reportees for check-in
        const uncheckedIds = reportees
          .filter(r => !r.isCheckedIn)
          .map(r => r.employeeId);
        setSelectedReporteeIds(prev => [...new Set([...prev, ...uncheckedIds])]);
      }
    } else {
      if (forCheckOut) {
        // Deselect only checked-in reportees
        const checkedIds = reportees.filter(r => r.isCheckedIn).map(r => r.employeeId);
        setSelectedReporteeIds(prev => prev.filter(id => !checkedIds.includes(id)));
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

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  // Otherwise render the dashboard
  return (
    <div className="bg-white p-4 md:p-8 font-sans scrollbar-hide">
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Section: Welcome Greeting */}
        <ActivitiesSection currentUser={currentUser} />

        {/* Bottom Section: Profile & Reportees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <ProfileCard
              currentUser={currentUser}
              token={token}
              orgId={orgId}
              currentEmployeeId={currentEmployeeId}
              initialIsCheckedIn={isSelfCheckedIn}
              initialIsCheckedOut={isSelfCheckedOut}
              onCheckInStatusChange={() => setRefreshTrigger(prev => prev + 1)}
              showAlert={showAlert}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
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
              checkInLoading={checkInLoading}
              showAlert={showAlert}
            />
          </div>
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