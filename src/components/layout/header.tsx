"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, PanelLeft, Menu, X, Check, Clock, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAuthToken, getUserDetails, setCookie, getOrgId, getEmployeeId, getUserRole, getApiUrl, clearSetupData } from '@/lib/auth';
import { notificationService, Notification, NotificationSeverity } from '@/lib/notificationService';

type SubTab = {
  name: string;
  path: string;
};

const adminNavigationConfig: SubTab[] = [
  { name: 'Dashboard', path: '/admin/my-space/dashboard' },
  { name: 'Calendar', path: '/admin/my-space/calendar' },
  { name: 'HR Process', path: '/admin/team/hr-process' }
];

const employeeNavigationConfig: SubTab[] = [
  { name: 'Dashboard', path: '/employee/my-space/dashboard' },
  { name: 'Calendar', path: '/employee/my-space/calender' }
];

interface NavigationHeaderProps {
  toggleSidebar?: () => void;
  userRole?: 'admin' | 'employee';
}

export default function NavigationHeader({
  toggleSidebar,
  userRole = 'admin'
}: NavigationHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigationConfig = userRole === 'admin' ? adminNavigationConfig : employeeNavigationConfig;
  const isHomeSection = navigationConfig.some(tab => pathname.startsWith(tab.path.split('/').slice(0, 3).join('/')));

  // User data state - start with empty values
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    initials: '',
    designation: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    const orgId = getOrgId();
    const empId = getEmployeeId();
    if (orgId && empId) {
      const data = await notificationService.getNotifications(orgId, empId);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const orgId = getOrgId();
    if (orgId) {
      const success = await notificationService.markAsRead(orgId, id);
      if (success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    const role = getUserRole();
    const type = notification.type;

    if (role === 'admin') {
      if (['leave_applied'].includes(type)) {
        router.push('/admin/leavetracker');
      } else if (['contract_expiry', 'employee_contract_expiry_admin', 'contract_extended'].includes(type)) {
        router.push('/admin/onboarding');
      } else if (type === 'announcement') {
        router.push('/admin/home');
      }
    } else {
      if (['leave_approved', 'leave_rejected'].includes(type)) {
        router.push('/employee/leavetracker');
      } else if (['employee_contract_expiry', 'contract_extended'].includes(type)) {
        router.push('/employee/profile');
      } else if (type === 'announcement') {
        router.push('/employee/home');
      }
    }
    setShowNotifications(false);
  };

  const handleMarkAllAsRead = async () => {
    const orgId = getOrgId();
    const empId = getEmployeeId();
    if (orgId && empId) {
      const success = await notificationService.markAllAsRead(orgId, empId);
      if (success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    }
  };

  const getSeverityStyles = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-100',
          icon: <AlertCircle className="w-4 h-4 text-red-600" />,
          dot: 'bg-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-100',
          icon: <AlertTriangle className="w-4 h-4 text-orange-600" />,
          dot: 'bg-orange-600'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-100',
          icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
          dot: 'bg-green-600'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-100',
          icon: <Info className="w-4 h-4 text-blue-600" />,
          dot: 'bg-blue-600'
        };
    }
  };

  // Fetch user data based on role
  useEffect(() => {
    const fetchUserData = async () => {
      const token = getAuthToken();
      const role = getUserRole();

      // First, try to get user data from cache (cookies/localStorage/token)
      const cachedDetails = getUserDetails();
      if (cachedDetails.fullName && cachedDetails.fullName !== 'User') {
        setUserData({
          name: cachedDetails.fullName,
          email: cachedDetails.email,
          initials: cachedDetails.initials,
          designation: (typeof window !== 'undefined' ? localStorage.getItem('hrms_user_designation') : '') || ''
        });
        setIsLoading(false);

        // If we have good cached data, we can still try to refresh from API in background
        // but don't block on it
      }

      if (!token) {
        setIsLoading(false);
        return;
      }

      const orgId = getOrgId();
      const empId = getEmployeeId();

      // If we have a token but missing orgId or empId, try to get from localStorage with a small delay
      // This handles the case where cookies might not be immediately available after login
      let finalOrgId = orgId;
      let finalEmpId = empId;

      if (!finalOrgId || !finalEmpId) {
        // Wait a bit for cookies to be set after login redirect
        await new Promise(resolve => setTimeout(resolve, 200));

        finalOrgId = getOrgId();
        finalEmpId = getEmployeeId();

        if (!finalOrgId || !finalEmpId) {
          setIsLoading(false);
          // Already set cached data above, so we're done
          return;
        }
      }

      // Only make API call if we have both orgId and empId
      // This is optional - we already have cached data displayed
      const apiUrl = getApiUrl();
      const endpoint = `${apiUrl}/org/${finalOrgId}/employees/${finalEmpId}`;

      try {
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          // Handle 404 Not Found - employee might not exist or endpoint issue
          if (response.status === 404) {
            // Use cached data as fallback for 404
            const details = getUserDetails();
            if (details.fullName && details.fullName !== 'User') {
              setUserData({
                name: details.fullName,
                email: details.email,
                initials: details.initials,
                designation: (typeof window !== 'undefined' ? localStorage.getItem('hrms_user_designation') : '') || ''
              });
              setIsLoading(false);
              return;
            }
            // If no cached data, just set loading to false and continue
            setIsLoading(false);
            return;
          }

          // Handle 401 Unauthorized - token expired or invalid
          if (response.status === 401) {
            // Try to use cached data first before redirecting
            const details = getUserDetails();
            if (details.fullName && details.fullName !== 'User') {
              setUserData({
                name: details.fullName,
                email: details.email,
                initials: details.initials,
                designation: (typeof window !== 'undefined' ? localStorage.getItem('hrms_user_designation') : '') || ''
              });
              setIsLoading(false);
              return;
            }

            // Only redirect if we're sure the session is invalid and we have no cached data
            clearSetupData();
            // Add a small delay to prevent immediate redirect loops
            setTimeout(() => {
              if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
                window.location.href = '/auth/login';
              }
            }, 500);
            return; // Exit early to prevent further processing
          }

          // For other errors, try to use cached data
          const details = getUserDetails();
          if (details.fullName && details.fullName !== 'User') {
            setUserData({
              name: details.fullName,
              email: details.email,
              initials: details.initials,
              designation: (typeof window !== 'undefined' ? localStorage.getItem('hrms_user_designation') : '') || ''
            });
            setIsLoading(false);
            return;
          }

          // If no cached data and it's not a critical error, just continue
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        const user = data.data || data.admin || data.employee || data;

        if (user) {
          let firstName = user.firstName || '';
          let lastName = user.lastName || '';
          let fullName = user.fullName || user.name || '';
          let email = user.email || '';

          // If fullName exists, use it; otherwise construct from firstName and lastName
          if (!fullName && (firstName || lastName)) {
            fullName = `${firstName} ${lastName}`.trim();
          }

          // If still no fullName, extract from email
          if (!fullName && email) {
            fullName = email.split('@')[0];
          }

          // Helper to check if string looks like an ID
          const isId = (s: string) => s && s.length > 20 && /\d/.test(s);

          // Clean up if firstName/lastName are IDs
          if (isId(firstName) || isId(lastName)) {
            firstName = '';
            lastName = '';
            fullName = '';
          }

          // Generate initials from fullName
          const initials = fullName
            ? fullName.split(' ')
              .filter((word: string) => word.length > 0)
              .map((word: string) => word[0])
              .join('')
              .substring(0, 2)
              .toUpperCase()
            : (role === 'admin' ? 'AD' : 'EM');

          // Designation resolution
          const designationName = user.designationName || user.designation?.name || user.role || '';

          setUserData({
            name: fullName,
            email: email,
            initials: initials,
            designation: designationName
          });

          // Persist to storage for consistency
          if (fullName) {
            setCookie('hrms_user_firstName', firstName || '', 7);
            setCookie('hrms_user_lastName', lastName || '', 7);
            setCookie('hrms_user_fullName', fullName || '', 7);
            setCookie('hrms_user_email', email || '', 7);

            if (typeof window !== 'undefined') {
              localStorage.setItem('hrms_user_firstName', firstName || '');
              localStorage.setItem('hrms_user_lastName', lastName || '');
              localStorage.setItem('hrms_user_fullName', fullName || '');
              localStorage.setItem('hrms_user_email', email || '');
              localStorage.setItem('hrms_user_designation', designationName || '');
              localStorage.setItem('hrms_user_role', role || '');
            }
          }
        }
      } catch (error: any) {
        // Silently handle errors - use cached data as fallback
        const details = getUserDetails();
        if (details.fullName && details.fullName !== 'User') {
          setUserData({
            name: details.fullName,
            email: details.email,
            initials: details.initials,
            designation: (typeof window !== 'undefined' ? localStorage.getItem('hrms_user_designation') : '') || ''
          });
        }
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('firstName') || e.key?.includes('lastName') || e.key?.includes('email') || e.key?.includes('fullName')) {
        const details = getUserDetails();
        setUserData({
          name: details.fullName,
          email: details.email,
          initials: details.initials,
          designation: (typeof window !== 'undefined' ? localStorage.getItem('hrms_user_designation') : '') || ''
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listen for custom events
    const handleUserDataUpdate = () => {
      fetchUserData();
    };
    window.addEventListener('userDataUpdated', handleUserDataUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataUpdated', handleUserDataUpdate);
    };
  }, [userRole]); // Re-fetch when userRole changes

  const noScrollbarClass = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

  return (
    <div className="w-full bg-white z-30 sticky top-0 shadow-sm border-b border-gray-100">
      {/* Main Header */}
      <div className="px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Left Section - Sidebar Toggle & Main Navigation */}
        <div className="flex items-center flex-1 min-w-0 mr-4">
          <button
            onClick={toggleSidebar}
            className="p-2.5 mr-4 text-gray-500 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all active:scale-95 shrink-0"
            aria-label="Toggle Sidebar"
          >
            {/* <PanelLeft className="w-5 h-5 hidden md:block" /> */}
            <Menu className="w-5 h-5 md:hidden" />
          </button>

          {/* Desktop & Mobile Main Tabs */}
          {isHomeSection ? (
            <div className={`flex items-center gap-2 md:gap-2 overflow-x-auto whitespace-nowrap ${noScrollbarClass} py-1`}>
              {navigationConfig.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    className={`text-[12px] md:text-[13px] font-bold transition-all px-4 py-2 rounded-lg shrink-0 ${isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                      }`}
                  >
                    {tab.name}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center ml-2">
              <h1 className="text-sm md:text-base font-bold text-gray-900">
                {pathname.includes('/onboarding') ? 'Employees' :
                  pathname.includes('/contractors') ? 'Contractors' :
                    pathname.includes('/leavetracker') ? 'Leave Tracker' :
                      pathname.includes('/attendance') ? 'Attendance' :
                        pathname.includes('/reports') ? 'Reports' :
                          pathname.includes('/salary') ? 'Payroll' :
                            pathname.includes('/profile') ? 'Profile' :
                              'Dashboard'}
              </h1>
            </div>
          )}
        </div>

        {/* Right Section - Icons */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-xl transition-all active:scale-95 relative group ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                }`}
            >
              <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-wiggle' : ''}`} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-[320px] md:w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className={`max-h-[400px] overflow-y-auto ${noScrollbarClass}`}>
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {notifications.slice(0, 2).map((notification) => {
                        const styles = getSeverityStyles(notification.severity);
                        return (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${!notification.isRead ? 'bg-blue-50/30' : ''
                              }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${styles.bg} ${styles.border} border`}>
                                {styles.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className={`text-[13px] font-bold truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {notification.title}
                                  </h4>
                                  {!notification.isRead && (
                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${styles.dot}`}></div>
                                  )}
                                </div>
                                <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                  <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                  </div>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider ${styles.text}`}>
                                    {notification.severity}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="absolute right-4 bottom-4 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 text-gray-300" />
                      </div>
                      <h4 className="text-[14px] font-bold text-gray-900">No notifications yet</h4>
                      <p className="text-[12px] text-gray-500 mt-1">
                        We'll notify you when something important happens.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-gray-50 text-center border-t border-gray-100 mt-2">
                  <Link
                    href={userRole === 'admin' ? '/admin/notifications' : '/employee/notifications'}
                    onClick={() => setShowNotifications(false)}
                    className="block w-full text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors py-1.5"
                  >
                    View All Activity
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block"></div>

          {!isLoading && userData.name && (
            <button className="flex items-center gap-2 p-1.5 md:p-2 hover:bg-gray-50 rounded-xl transition-all group">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/10 shrink-0">
                <span className="text-white font-bold text-sm">{userData.initials}</span>
              </div>
              <div className="hidden lg:flex flex-col items-start mr-1">
                <span className="text-[13px] font-bold text-gray-900 leading-tight">{userData.name}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{userData.designation || userRole}</span>
              </div>
            </button>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 p-1.5 md:p-2">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-gray-200 rounded-xl animate-pulse shrink-0"></div>
              <div className="hidden lg:flex flex-col gap-1">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-2 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
