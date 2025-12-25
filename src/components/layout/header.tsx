"use client";

import React, { useState, useEffect } from 'react';
import { Search, Settings, Bell, User, PanelLeft, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
      { name: 'Reportees', path: '/admin/team/reportees' },
      { name: 'HR Process', path: '/admin/team/hr-process' }
    ]
  },
  {
    name: 'Organization',
    path: '/admin/organization',
    subTabs: [
      { name: 'Employee Tree', path: '/admin/organization/employee-tree' },
      { name: 'Department Tree', path: '/admin/organization/department-tree' }
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
      { name: 'Calendar', path: '/employee/my-space/calendar' }
    ]
  },
  {
    name: 'Team',
    path: '/employee/team',
    subTabs: [
      { name: 'Reportees', path: '/employee/team/reportees' },
      { name: 'HR Process', path: '/employee/team/hr-process' }
    ]
  },
  {
    name: 'Organization',
    path: '/employee/organization',
    subTabs: [
      { name: 'Employee Tree', path: '/employee/organization/employee-tree' },
      { name: 'Department Tree', path: '/employee/organization/department-tree' }
    ]
  }
];

interface NavigationHeaderProps {
  toggleSidebar?: () => void;
  userRole?: 'admin' | 'employee'; // Add role prop
}

export default function NavigationHeader({
  toggleSidebar,
  userRole = 'admin'
}: NavigationHeaderProps) {
  const pathname = usePathname();

  const navigationConfig = userRole === 'admin' ? adminNavigationConfig : employeeNavigationConfig;
  const [activeMainTab, setActiveMainTab] = useState(navigationConfig[0]);

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
          {/* Desktop Search */}
          <div className="relative hidden xl:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search features..."
              className="pl-11 pr-4 py-2.5 w-64 text-sm bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all font-medium"
            />
          </div>

          <button className="p-2.5 text-gray-500 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all active:scale-95 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
          </button>

          {userRole === 'admin' && (
            <Link href="/settings/permissions" className="hidden sm:block">
              <button className="p-2.5 text-gray-500 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all active:scale-95">
                <Settings className="w-5 h-5" />
              </button>
            </Link>
          )}

          <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block"></div>

          <button className="flex items-center gap-2 p-1.5 md:p-2 hover:bg-gray-50 rounded-xl transition-all group">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/10 shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden lg:flex flex-col items-start mr-1">
              <span className="text-[13px] font-bold text-gray-900 leading-tight">John Doe</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{userRole}</span>
            </div>
          </button>
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