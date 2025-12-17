"use client";

import { Home, Users, Bell, Calendar, Clock, UserCircle, ClipboardList, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isDesktopCollapsed: boolean;
  isMobileOpen: boolean;
  closeMobileMenu: () => void;
  userRole?: 'admin' | 'employee'; // Add role prop
}

export default function Sidebar({ 
  isDesktopCollapsed, 
  isMobileOpen, 
  closeMobileMenu,
  userRole = 'admin' // Default to admin
}: SidebarProps) {
  const pathname = usePathname();

  // Admin menu with Onboarding
  const adminMenu = [
    { label: "Home", href: "/my-space/overview", icon: Home },
    { label: "Onboarding", href: "/onboarding", icon: Users },
    { label: "Feeds", href: "/feeds", icon: Bell },
    { label: "Leave Tracker", href: "/leavetracker", icon: Calendar },
    { label: "Attendance", href: "/attendance", icon: Clock },
    { label: "Time Tracking", href: "/timetracking", icon: ClipboardList },
    { label: "Profile", href: "/profile", icon: UserCircle },
  ];

  // Employee menu without Onboarding
  const employeeMenu = [
    { label: "Home", href: "/my-space/overview", icon: Home },
    { label: "Feeds", href: "/feeds", icon: Bell },
    { label: "Leave Tracker", href: "/leavetracker", icon: Calendar },
    { label: "Attendance", href: "/attendance", icon: Clock },
    { label: "Time Tracking", href: "/timetracking", icon: ClipboardList },
    { label: "Profile", href: "/profile", icon: UserCircle },
  ];

  // Select menu based on role
  const menu = userRole === 'admin' ? adminMenu : employeeMenu;

  // Get role display text
  const roleDisplay = userRole === 'admin' ? 'Admin' : 'Employee';

  return (
    <>
      {/* Sidebar Container */}
      <aside 
        className={`
          bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-50
          fixed inset-y-0 left-0 h-[100dvh] w-[280px] max-w-[85vw] shadow-2xl
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:h-screen md:shadow-none md:w-64
          lg:${isDesktopCollapsed ? "w-20" : "w-72"}
        `}
      >
        {/* Header / Logo Area */}
        <div className={`h-16 flex items-center justify-between px-4 ${isDesktopCollapsed ? "lg:justify-center lg:px-0" : "lg:px-8"} md:px-6 md:h-20`}>
          <div className={`font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent ${isDesktopCollapsed ? "text-xl lg:text-2xl" : "text-xl md:text-2xl"}`}>
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

          {/* Close button - Mobile & Tablet Only */}
          <button 
            onClick={closeMobileMenu} 
            className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 md:px-4 md:py-6 space-y-1.5 md:space-y-2 overflow-y-auto scrollbar-hide">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                title={isDesktopCollapsed ? item.label : ""}
                className={`
                  relative group flex items-center gap-3.5 py-2.5 md:py-3 rounded-xl text-sm font-medium 
                  transition-all duration-200 ease-in-out
                  ${active 
                    ? "bg-blue-50 text-blue-700 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-0.5 md:hover:translate-x-1"
                  }
                  px-4
                  ${isDesktopCollapsed ? "lg:justify-center lg:px-0" : "lg:px-5"}
                `}
              >
                <Icon 
                  className={`transition-all duration-300 shrink-0 text-blue-600 ${isDesktopCollapsed ? "lg:h-6 lg:w-6" : "h-5 w-5"} h-5 w-5 md:h-5 md:w-5`} 
                />
                
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${active ? "font-semibold md:font-bold" : "font-medium"} ${isDesktopCollapsed ? "lg:hidden" : "block"}`}>
                  {item.label}
                </span>
                
                {active && !isDesktopCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 md:h-8 bg-blue-600 rounded-r-full hidden lg:block" />
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Bottom User Profile */}
        <div className="p-3 md:p-4 border-t border-slate-100 mt-auto">
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
    </>
  );
}