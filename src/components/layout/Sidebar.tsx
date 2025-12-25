"use client";

import { Home, Users, Bell, Calendar, Clock, UserCircle, ClipboardList, X, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from 'react';
import { clearSetupData, checkSetupStatus, requiresSetup } from "@/lib/auth";

interface SidebarProps {
  isDesktopCollapsed: boolean;
  isMobileOpen: boolean;
  closeMobileMenu: () => void;
  userRole?: 'admin' | 'employee';
}

const checkSetupCompleted = (role: 'admin' | 'employee'): boolean => {
  // If it's an employee, setup is always "complete" (not required)
  // If it's an admin, check the actual status
  return !requiresSetup(role);
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
      console.warn("SIDEBAR: Navigation blocked - Setup required for admins");
    }
  };

  const handleLogout = () => {
    clearSetupData();
    window.location.href = '/auth/login';
  };

  const adminMenu = [
    { label: "Home", href: "/admin/my-space/overview", icon: Home, protected: true },
    { label: "Onboarding", href: "/admin/onboarding", icon: Users, protected: true },
    { label: "Feeds", href: "/admin/feeds", icon: Bell, protected: true },
    { label: "Leave Tracker", href: "/admin/leavetracker", icon: Calendar, protected: true },
    { label: "Attendance", href: "/admin/attendance", icon: Clock, protected: true },
    { label: "Time Tracking", href: "/admin/timetracking", icon: ClipboardList, protected: true },
    { label: "Profile", href: "/admin/profile", icon: UserCircle, protected: true },
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
  const roleDisplay = userRole === 'admin' ? 'Administrator' : 'Employee';

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-50 fixed inset-y-0 left-0 h-dvh w-[280px] max-w-[85vw] shadow-2xl md:translate-x-0 md:static md:h-screen md:shadow-none ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDesktopCollapsed ? "md:w-20" : "md:w-64 lg:w-72"
        }`}
    >
      {/* Brand Section */}
      <div className={`h-16 md:h-20 flex items-center justify-between px-6 ${isDesktopCollapsed ? "md:justify-center md:px-0" : ""}`}>
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => window.location.href = userRole === 'admin' ? '/admin/my-space/overview' : '/employee/my-space/overview'}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform shrink-0">
            HR
          </div>
          <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isDesktopCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}`}>
            <span className="text-xl font-bold text-gray-900 tracking-tight leading-none">HRMS</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Enterprise</span>
          </div>
        </div>

        <button
          onClick={closeMobileMenu}
          className="md:hidden p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation section */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
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
              className={`group flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border border-transparent ${active
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 border-blue-600/10"
                : isDisabled
                  ? "text-slate-300 cursor-not-allowed opacity-60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                } ${isDesktopCollapsed ? "md:justify-center md:px-0" : ""}`}
            >
              <Icon
                className={`transition-all duration-300 shrink-0 ${active ? "text-white" : isDisabled ? "text-slate-300" : "text-slate-400 group-hover:text-blue-600"
                  } ${isDesktopCollapsed ? "md:w-6 md:h-6" : "w-5 h-5"}`}
              />

              <span className={`whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? "md:hidden" : "block"}`}>
                {item.label}
              </span>

              {isDisabled && !isDesktopCollapsed && (
                <div className="ml-auto bg-slate-100 p-1.5 rounded-lg group-hover:bg-slate-200 transition-colors">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              )}
            </a>
          );
        })}
      </nav>

      {/* Setup Required Banner */}
      {!setupComplete && (
        <div className={`mx-4 mb-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 ${isDesktopCollapsed ? "md:hidden" : ""}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 text-[10px] font-bold">!</div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Setup Required</span>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
            Complete organization setup to unlock all premium features.
          </p>
        </div>
      )}

      {/* User Info & Logout Section */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100 ${isDesktopCollapsed ? "md:justify-center md:border-none md:bg-transparent" : ""}`}>
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
            JD
          </div>
          <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isDesktopCollapsed ? "md:hidden" : "block"}`}>
            <span className="text-[13px] font-bold text-gray-900 leading-tight">John Doe</span>
            <span className="text-[11px] font-semibold text-gray-500">{roleDisplay}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className={`group w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 ${isDesktopCollapsed ? "md:justify-center md:px-0" : ""}`}
        >
          <LogOut className={`shrink-0 transition-transform group-hover:-translate-x-0.5 ${isDesktopCollapsed ? "w-6 h-6" : "w-5 h-5"}`} />
          <span className={isDesktopCollapsed ? "md:hidden" : ""}>Logout</span>
        </button>
      </div>
    </aside>
  );
}