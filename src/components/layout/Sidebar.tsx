"use client";

import { Home, Users, Bell, Calendar, Clock, UserCircle, ClipboardList, X, LogOut, ReceiptIndianRupeeIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from 'react';
import { clearSetupData, getAuthToken, decodeToken, getCookie, setCookie, getUserDetails, getOrgId, getEmployeeId, getApiUrl } from "@/lib/auth";

interface SidebarProps {
  isDesktopCollapsed: boolean;
  isMobileOpen: boolean;
  closeMobileMenu: () => void;
  userRole?: 'admin' | 'employee';
}

export default function Sidebar({
  isDesktopCollapsed,
  isMobileOpen,
  closeMobileMenu,
  userRole = 'admin'
}: SidebarProps) {
  const pathname = usePathname();

  // User data state
  const [userData, setUserData] = useState(() => {
    const details = getUserDetails();
    return {
      name: details.fullName,
      email: details.email,
      initials: details.initials
    };
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = () => {
      const details = getUserDetails();
      setUserData({
        name: details.fullName,
        email: details.email,
        initials: details.initials
      });

      // Self-healing: if name is "User" or likely an email prefix (no space), try to fetch from API
      if (details.fullName === 'User' || !details.fullName.includes(' ')) {
        const token = getAuthToken();
        const orgId = getOrgId();
        const empId = getEmployeeId();

        if (token && orgId && empId) {
          const apiUrl = getApiUrl();
          fetch(`${apiUrl}/org/${orgId}/employees/${empId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(data => {
              const emp = data.data || data.employee || data;
              if (emp && (emp.fullName || emp.firstName)) {
                const first = emp.firstName || (emp.fullName ? emp.fullName.split(' ')[0] : '');
                const last = emp.lastName || (emp.fullName ? emp.fullName.split(' ').slice(1).join(' ') : '');
                const newFull = `${first} ${last}`.trim() || emp.fullName || emp.name;

                if (newFull) {
                  setUserData({
                    name: newFull,
                    email: emp.email || details.email,
                    initials: newFull.substring(0, 2).toUpperCase()
                  });

                  // Persist to sync with other components
                  setCookie('hrms_user_fullName', newFull, 7);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('hrms_user_fullName', newFull);
                  }
                }
              }
            })
            .catch(err => console.error("Sidebar auto-fetch failed", err));
        }
      }
    };
    fetchUserData();
  }, [userRole]);


  const handleLogout = () => {
    clearSetupData();
    window.location.href = '/auth/login';
  };

  const adminMenu = [
    { label: "Home", href: "/admin/my-space/dashboard", icon: Home, protected: true },
    { label: "Employees", href: "/admin/onboarding", icon: Users, protected: true },
    { label: "Leave Tracker", href: "/admin/leavetracker", icon: Calendar, protected: true },
    { label: "Attendance", href: "/admin/attendance", icon: Clock, protected: true },
    { label: "Reports", href: "/admin/reports", icon: Bell, protected: true },
    // { label: "Payroll", href: "/admin/salary", icon: ReceiptIndianRupeeIcon, protected: true },
    { label: "Profile", href: "/admin/profile", icon: UserCircle, protected: true },
  ];

  const employeeMenu = [
    { label: "Home", href: "/employee/my-space/dashboard", icon: Home, protected: true },
    { label: "Leave Tracker", href: "/employee/leavetracker", icon: Calendar, protected: true },
    { label: "Attendance", href: "/employee/attendance", icon: Clock, protected: true },
    { label: "Payslip", href: "/employee/payslips", icon: ReceiptIndianRupeeIcon, protected: true },
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
      <div className={`h-20 md:h-28 flex items-center justify-between px-25 ${isDesktopCollapsed ? "md:justify-center md:px-0" : ""}`}>
        <div
          className={`flex items-center cursor-pointer group w-full ${isDesktopCollapsed ? "justify-center" : "justify-start"}`}
          onClick={() => window.location.href = userRole === 'admin' ? '/admin/my-space/dashboard' : '/employee/my-space/dashboard'}
        >
          <img
            src="/logo.png"
            alt="Logo"
            className={`transition-all duration-300 object-contain ${isDesktopCollapsed ? "w-12 h-12" : "w-24 h-24 md:w-56 md:h-56"}`}
          />
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

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => closeMobileMenu()}
              title={isDesktopCollapsed ? item.label : ""}
              className={`group flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border border-transparent ${active
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 border-blue-600/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                } ${isDesktopCollapsed ? "md:justify-center md:px-0" : ""}`}
            >
              <Icon
                className={`transition-all duration-300 shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                  } ${isDesktopCollapsed ? "md:w-6 md:h-6" : "w-5 h-5"}`}
              />

              <span className={`whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? "md:hidden" : "block"}`}>
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>

      {/* User Info & Logout Section */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100 md:hidden`}>
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
            {userData.initials}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[13px] font-bold text-gray-900 leading-tight">{userData.name}</span>
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