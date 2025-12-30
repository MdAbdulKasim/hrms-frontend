"use client";

import React, { useState, useEffect } from 'react';
import { Search, Settings, Bell, User, PanelLeft, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAuthToken, decodeToken, getCookie, getUserDetails, setCookie, getOrgId, getEmployeeId, getUserRole, getApiUrl } from '@/lib/auth';

type SubTab = {
  name: string;
  path: string;
};

type MainTab = {
  name: string;
  path: string;
  subTabs: SubTab[];
};

const adminNavigationConfig: MainTab[] = [
  {
    name: 'My Space',
    path: '/admin/my-space',
    subTabs: [
      { name: 'Overview', path: '/admin/my-space/overview' },
      { name: 'Dashboard', path: '/admin/my-space/dashboard' },
      { name: 'Calendar', path: '/admin/my-space/calendar' }
    ]
  },
  {
    name: 'Team',
    path: '/admin/team',
    subTabs: [
      { name: 'HR Process', path: '/admin/team/hr-process' }
    ]
  }
];

const employeeNavigationConfig: MainTab[] = [
  {
    name: 'My Space',
    path: '/employee/my-space',
    subTabs: [
      { name: 'Overview', path: '/employee/my-space/overview' },
      { name: 'Dashboard', path: '/employee/my-space/dashboard' },
      { name: 'Calendar', path: '/employee/my-space/calender' }
    ]
  }
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

  const navigationConfig = userRole === 'admin' ? adminNavigationConfig : employeeNavigationConfig;
  const [activeMainTab, setActiveMainTab] = useState(navigationConfig[0]);

  // User data state - start with empty values
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    initials: ''
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data based on role
  useEffect(() => {
    const fetchUserData = async () => {
      const token = getAuthToken();
      const orgId = getOrgId();
      const empId = getEmployeeId();
      const role = getUserRole();

      console.log('Header - Fetching user data for role:', role);

      if (!token || !orgId || !empId) {
        console.log('Header - Missing auth data');
        setIsLoading(false);
        return;
      }

      const apiUrl = getApiUrl();
      
      // Fetch from the appropriate endpoint based on role
      let endpoint = '';
      if (role === 'admin') {
        endpoint = `${apiUrl}/org/${orgId}/admin/${empId}`;
      } else {
        endpoint = `${apiUrl}/org/${orgId}/employees/${empId}`;
      }

      console.log('Header - Fetching from endpoint:', endpoint);

      try {
        const response = await fetch(endpoint, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Header - API Response:', data);

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

          console.log('Header - Setting user data:', { fullName, email, initials, role });

          setUserData({
            name: fullName,
            email: email,
            initials: initials
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
              localStorage.setItem('hrms_user_role', role || '');
            }
          }
        }
      } catch (error) {
        console.error("Header - Failed to fetch user data:", error);
        
        // Try to get from local storage as fallback
        const details = getUserDetails();
        if (details.fullName) {
          setUserData({
            name: details.fullName,
            email: details.email,
            initials: details.initials
          });
        }
      } finally {
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
          initials: details.initials
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

  useEffect(() => {
    const matchedTab = navigationConfig.find(tab =>
      pathname.startsWith(tab.path)
    );
    if (matchedTab) {
      setActiveMainTab(matchedTab);
    }
  }, [pathname, navigationConfig]);

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
            <PanelLeft className="w-5 h-5 hidden md:block" />
            <Menu className="w-5 h-5 md:hidden" />
          </button>

          {/* Desktop & Mobile Main Tabs */}
          <div className={`flex items-center gap-2 md:gap-3 overflow-x-auto whitespace-nowrap ${noScrollbarClass} py-1`}>
            {navigationConfig.map((tab) => {
              const isActive = activeMainTab.name === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveMainTab(tab)}
                  className={`text-xs md:text-sm font-bold transition-all px-4 py-2 rounded-xl shrink-0 ${isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Section - Icons */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button className="p-2.5 text-gray-500 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all active:scale-95 relative">
            <Bell className="w-5 h-5" />
          </button>

          {/* {userRole === 'admin' && (
            <Link href="/admin/settings/permissions" className="hidden sm:block">
              <button className="p-2.5 text-gray-500 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all active:scale-95">
                <Settings className="w-5 h-5" />
              </button>
            </Link>
          )} */}

          <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block"></div>

          {!isLoading && userData.name && (
            <button className="flex items-center gap-2 p-1.5 md:p-2 hover:bg-gray-50 rounded-xl transition-all group">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/10 shrink-0">
                <span className="text-white font-bold text-sm">{userData.initials}</span>
              </div>
              <div className="hidden lg:flex flex-col items-start mr-1">
                <span className="text-[13px] font-bold text-gray-900 leading-tight">{userData.name}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{userRole}</span>
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

      {/* Sub Header - Sub Navigation */}
      <div className="bg-gray-50/50">
        <div className={`flex items-center px-4 md:px-8 h-12 md:h-14 gap-2 md:gap-2 overflow-x-auto whitespace-nowrap ${noScrollbarClass}`}>
          {activeMainTab.subTabs.map((tab) => {
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
      </div>
    </div>
  );
}