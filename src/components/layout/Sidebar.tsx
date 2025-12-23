"use client";

import { Home, Users, Bell, Calendar, Clock, UserCircle, ClipboardList, X, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from 'react';

interface SidebarProps {
  isDesktopCollapsed: boolean;
  isMobileOpen: boolean;
  closeMobileMenu: () => void;
  userRole?: 'admin' | 'employee';
}

const checkSetupCompleted = (role: 'admin' | 'employee'): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    if (role === 'admin') {
      const setupData = localStorage.getItem('organizationSetup');
      if (!setupData) return false;
      const data = JSON.parse(setupData);
      return data.allStepsCompleted === true;
    }
    
    if (role === 'employee') {
      const setupData = localStorage.getItem('employeeSetupData');
      if (!setupData) return false;
      const data = JSON.parse(setupData);
      return data.allStepsCompleted === true;
    }
    
    return false;
  } catch {
    return false;
  }
};

export default function Sidebar({ 
  isDesktopCollapsed, 
  isMobileOpen, 
  closeMobileMenu,
  userRole = 'admin'
}: SidebarProps) {
  const pathname = usePathname();
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    setSetupComplete(checkSetupCompleted(userRole));

    const handleSetupStatusChange = () => {
      setSetupComplete(checkSetupCompleted(userRole));
    };

    window.addEventListener('setupStatusChanged', handleSetupStatusChange);
    window.addEventListener('storage', handleSetupStatusChange);

    return () => {
      window.removeEventListener('setupStatusChanged', handleSetupStatusChange);
      window.removeEventListener('storage', handleSetupStatusChange);
    };
  }, [userRole]);

  const handleProtectedClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!setupComplete) {
      e.preventDefault();
      const message = userRole === 'admin' 
        ? 'Please complete the organization setup first!' 
        : 'Please complete your profile setup first!';
      alert(message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('organizationSetup');
    localStorage.removeItem('employeeSetupData');
    localStorage.removeItem('role');
    window.location.href = '/auth/login';
  };

  const adminMenu = [
    { label: "Home", href: "/my-space/overview", icon: Home, protected: true },
    { label: "Onboarding", href: "/onboarding", icon: Users, protected: true },
    { label: "Feeds", href: "/feeds", icon: Bell, protected: true },
    { label: "Leave Tracker", href: "/leavetracker", icon: Calendar, protected: true },
    { label: "Attendance", href: "/attendance", icon: Clock, protected: true },
    { label: "Time Tracking", href: "/timetracking", icon: ClipboardList, protected: true },
    { label: "Profile", href: "/profile", icon: UserCircle, protected: true },
  ];

  const employeeMenu = [
    { label: "Home", href: "/employee/my-space/overview", icon: Home, protected: true },
    { label: "Feeds", href: "/employee/feeds", icon: Bell, protected: true },
    { label: "Leave Tracker", href: "/employee/leavetracker", icon: Calendar, protected: true },
    { label: "Attendance", href: "/employee/attendance", icon: Clock, protected: true },
    { label: "Time Tracking", href: "/employee/timetracking", icon: ClipboardList, protected: true },
    { label: "Profile", href: "/employee/profile", icon: UserCircle, protected: true },
  ];

  const menu = userRole === 'admin' ? adminMenu : employeeMenu;
  const roleDisplay = userRole === 'admin' ? 'Admin' : 'Employee';

  return (
    <aside 
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-50 fixed inset-y-0 left-0 h-dvh w-[280px] max-w-[85vw] shadow-3xl ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:h-screen md:shadow-none md:w-64 lg:${isDesktopCollapsed ? "w-20" : "w-72"}`}
    >
      <div className={`h-16 flex items-center justify-between px-4 ${isDesktopCollapsed ? "lg:justify-center lg:px-0" : "lg:px-8"} md:px-6 md:h-20`}>
        <div className={`font-bold bg-linear-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent ${isDesktopCollapsed ? "text-xl lg:text-2xl" : "text-xl md:text-2xl"}`}>
          {isDesktopCollapsed ? (
            <span className="hidden lg:block">HR</span>
          ) : (
            <>
              <span className="lg:hidden">HRMS</span>
              <span className="hidden lg:inline">HRMS Portal</span>
            </>
          )}
          <span className="lg:hidden">HRMS Portal</span>
        </div>

        <button 
          onClick={closeMobileMenu} 
          className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 md:px-4 md:py-6 space-y-1.5 md:space-y-2 overflow-y-auto scrollbar-hide">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          const isDisabled = item.protected && !setupComplete;

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                handleProtectedClick(e);
                if (setupComplete) closeMobileMenu();
              }}
              title={isDesktopCollapsed ? item.label : ""}
              className={`relative group flex items-center gap-3.5 py-2.5 md:py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out ${active ? "bg-blue-50 text-blue-700 shadow-sm" : isDisabled ? "text-slate-400 cursor-not-allowed opacity-50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-0.5 md:hover:translate-x-1"} px-4 ${isDesktopCollapsed ? "lg:justify-center lg:px-0" : "lg:px-5"}`}
              aria-disabled={isDisabled}
            >
              <Icon 
                className={`transition-all duration-300 shrink-0 ${isDisabled ? 'text-slate-400' : 'text-blue-600'} ${isDesktopCollapsed ? "lg:h-6 lg:w-6" : "h-5 w-5"} h-5 w-5 md:h-5 md:w-5`} 
              />
              
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${active ? "font-semibold md:font-bold" : "font-medium"} ${isDesktopCollapsed ? "lg:hidden" : "block"}`}>
                {item.label}
              </span>

              {isDisabled && !isDesktopCollapsed && (
                <svg className="ml-auto w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
              
              {active && !isDesktopCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 md:h-8 bg-blue-600 rounded-r-full hidden lg:block" />
              )}
            </a>
          );
        })}
      </nav>

      {!setupComplete && (
        <div className={`mx-3 mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg ${isDesktopCollapsed ? "lg:hidden" : ""}`}>
          <p className="text-xs font-semibold text-orange-800 mb-1">Setup Required</p>
          <p className="text-xs text-orange-700">
            {userRole === 'admin' ? 'Complete organization setup to unlock all features' : 'Complete your profile setup to unlock all features'}
          </p>
        </div>
      )}

      <div className={`px-3 pb-3 border-t border-slate-100 ${isDesktopCollapsed ? "lg:px-0 lg:flex lg:justify-center" : ""}`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 ${isDesktopCollapsed ? "lg:w-auto lg:justify-center lg:px-3" : ""}`}
          title={isDesktopCollapsed ? "Logout" : ""}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className={isDesktopCollapsed ? "lg:hidden" : ""}>Logout</span>
        </button>
      </div>
      
      <div className="p-3 md:p-4 border-t border-slate-100">
        <div className={`flex items-center gap-3 ${isDesktopCollapsed ? "lg:justify-center" : "lg:px-2"}`}>
          <div className="h-8 w-8 md:h-9 md:w-9 lg:h-8 lg:w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
            JD
          </div>
          <div className={`flex flex-col overflow-hidden ${isDesktopCollapsed ? "lg:hidden" : "block"}`}>
            <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">John Doe</span>
            <span className="text-xs text-slate-500 truncate">{roleDisplay}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}