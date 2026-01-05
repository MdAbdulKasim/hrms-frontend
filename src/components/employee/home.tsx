'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Sun,
  Briefcase,
  X
} from 'lucide-react';
import ProfilePage from '../profile/ProfilePage';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId, getCookie } from '@/lib/auth';
import attendanceService from '@/lib/attendanceService';
import { CustomAlertDialog } from '@/components/ui/custom-dialogs';

type Reportee = {
  id: string;
  name: string;
  roleId: string;
  status: string;
  employeeId: string;
};

type CurrentUser = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  designation: string;
  profileImage?: string;
};

interface ProfileCardProps {
  currentUser: CurrentUser | null;
  token: string | null;
  orgId: string | null;
  currentEmployeeId: string | null;
  initialIsCheckedIn?: boolean;
  initialIsCheckedOut?: boolean;
  onCheckInStatusChange?: (isCheckedIn: boolean) => void;
}

const ProfileCard = ({ currentUser, token, orgId, currentEmployeeId, initialIsCheckedIn = false, initialIsCheckedOut = false, onCheckInStatusChange }: ProfileCardProps) => {
  const [isCheckedIn, setIsCheckedIn] = useState(initialIsCheckedIn);
  const [isCheckedOut, setIsCheckedOut] = useState(initialIsCheckedOut);
  const [seconds, setSeconds] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    title: '',
    description: '',
    variant: 'info'
  });

  // Sync state with props
  useEffect(() => {
    setIsCheckedIn(initialIsCheckedIn);
    setIsCheckedOut(initialIsCheckedOut);
  }, [initialIsCheckedIn, initialIsCheckedOut]);

  const showAlert = (title: string, description: string, variant: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setAlertState({ open: true, title, description, variant });
  };

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
        const response = await attendanceService.checkOut(orgId);
        if (response.error) {
          showAlert('Error', 'Failed to check out: ' + response.error, 'error');
          return;
        }
        setIsCheckedIn(false);
        setSeconds(0);
        onCheckInStatusChange?.(false);
      } else {
        const response = await attendanceService.checkIn(orgId);
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
          {profileImage || currentUser?.profileImage ? (
            <img src={profileImage || currentUser?.profileImage} alt="Profile" className="w-full h-full object-cover" />
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

      {/* Fixed: Show actual name or skeleton loader */}
      {displayName ? (
        <h2 className="text-gray-800 font-medium text-sm break-all">{displayName}</h2>
      ) : (
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
      )}

      <p className="text-gray-500 text-xs mt-1">{currentUser?.designation || 'N/A'}</p>
      <p className={`text-xs font-medium mt-3 ${isCheckedOut ? 'text-gray-400' : isCheckedIn ? 'text-green-500' : 'text-red-500'}`}>
        {isCheckedOut ? 'Shift Completed' : isCheckedIn ? 'Checked In' : 'Yet to check-in'}
      </p>
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

const ReporteesCard = ({ onEmployeeClick, reportees }: { onEmployeeClick: (employeeId: string, name: string) => void, reportees: Reportee[] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex flex-col h-full w-full">
      <h3 className="text-gray-700 font-semibold mb-4 text-sm">Reportees</h3>
      <div className="flex-1 space-y-5">
        {reportees.length > 0 ? (
          reportees.map((person) => (
            <div key={person.id} className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-500">
                  <User size={16} />
                </div>
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs text-gray-500 font-medium truncate hover:text-blue-600 cursor-pointer transition-colors"
                  onClick={() => onEmployeeClick(person.employeeId, person.name)}
                >
                  <span className="hover:text-blue-600">{person.name}</span>
                </p>
                <p className="text-[10px] text-red-400 mt-0.5">{person.status}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-xs">No reportees found</p>
        )}
      </div>
    </div>
  );
};

const ActivitiesSection = ({ currentUser }: { currentUser: CurrentUser | null }) => {
  // Get display name
  const displayName = currentUser?.fullName ||
    (currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
      : currentUser?.firstName || '');

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex shrink-0 items-center justify-center bg-blue-50 rounded-lg">
            <Briefcase className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-gray-800 font-medium">
              Welcome,
              {displayName ? (
                <span className="text-gray-500 font-normal block sm:inline"> {displayName}</span>
              ) : (
                <span className="inline-block ml-2 h-5 w-32 bg-gray-200 rounded animate-pulse"></span>
              )}
            </h3>
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

export default function Dashboard() {
  const [showProfile, setShowProfile] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [reportees, setReportees] = useState<Reportee[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
  const [isSelfCheckedIn, setIsSelfCheckedIn] = useState(false);
  const [isSelfCheckedOut, setIsSelfCheckedOut] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = getAuthToken();
        const authOrgId = getOrgId();
        const apiUrl = getApiUrl();
        const authEmployeeId = getCookie('hrms_user_id');

        console.log('=== DASHBOARD DEBUG ===');
        console.log('authToken:', authToken ? 'exists' : 'missing');
        console.log('authOrgId:', authOrgId);
        console.log('authEmployeeId:', authEmployeeId);

        if (!authToken || !authOrgId || !authEmployeeId) {
          console.error('Missing auth credentials');
          setLoading(false);
          return;
        }

        setToken(authToken);
        setOrgId(authOrgId);
        setCurrentEmployeeId(authEmployeeId);

        // Fetch current user data
        const endpoint = `${apiUrl}/org/${authOrgId}/employees/${authEmployeeId}`;
        console.log('Fetching from:', endpoint);

        const currentUserRes = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        console.log('API Response:', currentUserRes.data);

        const userData = currentUserRes.data.data || currentUserRes.data;

        // Handle name extraction - try multiple field combinations
        let firstName = userData.firstName || '';
        let lastName = userData.lastName || '';
        let fullName = userData.fullName || userData.full_name || userData.name || '';

        // If no fullName but has firstName/lastName, construct it
        if (!fullName && (firstName || lastName)) {
          fullName = `${firstName} ${lastName}`.trim();
        }

        // If fullName exists but no firstName/lastName, split it
        if (fullName && !firstName && !lastName) {
          const nameParts = fullName.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }

        console.log('Processed name:', { firstName, lastName, fullName });

        setCurrentUser({
          id: userData.id || userData._id || '',
          employeeId: userData.employeeId || userData.id || '',
          firstName: firstName,
          lastName: lastName,
          fullName: fullName,
          designation: (typeof userData.designation === 'object' ? userData.designation?.name : userData.designation) || 'N/A',
          profileImage: userData.profileImage
        });

        // Fetch attendance status for synchronization
        const today = new Date().toISOString().split('T')[0];
        const attendanceRes = await attendanceService.getDailyAttendance(authOrgId, today);
        const attendanceData = (attendanceRes as any).data || (Array.isArray(attendanceRes) ? attendanceRes : []);

        const currentRecord = Array.isArray(attendanceData)
          ? attendanceData.find((r: any) => r.employeeId === authEmployeeId)
          : null;

        if (currentRecord) {
          setIsSelfCheckedIn(!!currentRecord.checkInTime && !currentRecord.checkOutTime);
          setIsSelfCheckedOut(!!currentRecord.checkInTime && !!currentRecord.checkOutTime);
        }

        // Fetch reportees
        try {
          // Try to fetch reportees - this may fail with 403 for regular employees
          const reporteesRes = await axios.get(`${apiUrl}/org/${authOrgId}/employees/${authEmployeeId}/reportees`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          const reporteesData = reporteesRes.data.data || reporteesRes.data || [];
          setReportees(reporteesData.slice(0, 5).map((emp: any) => ({
            id: emp.id || emp._id,
            name: emp.fullName || emp.full_name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email || 'Unknown',
            roleId: emp.employeeId || emp.id,
            status: 'Yet to check-in',
            employeeId: emp.id || emp._id
          })));
        } catch (reporteesError) {
          // If reportees endpoint doesn't exist or returns 403/404, just set empty array
          console.log('Reportees not available for this employee (this is normal for non-managers)');
          setReportees([]);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (axios.isAxiosError(error)) {
          console.error('API Error Response:', error.response?.data);
        }
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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-8 font-sans scrollbar-hide">
      <div className="max-w-7xl mx-auto space-y-6">
        <ActivitiesSection currentUser={currentUser} />

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
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <ReporteesCard onEmployeeClick={handleEmployeeClick} reportees={reportees} />
          </div>
        </div>
      </div>
    </div>
  );
}