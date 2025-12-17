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
    path: '/my-space',
    subTabs: [
      { name: 'Overview', path: '/my-space/overview' },
      { name: 'Dashboard', path: '/my-space/dashboard' },
      { name: 'Calendar', path: '/my-space/calendar' }
    ]
  },
  {
    name: 'Team',
    path: '/team',
    subTabs: [
      { name: 'Reportees', path: '/team/reportees' },
      { name: 'HR Process', path: '/team/hr-process' }
    ]
  },
  {
    name: 'Organization',
    path: '/organization',
    subTabs: [
      { name: 'Employee Tree', path: '/organization/employee-tree' },
      { name: 'Department Tree', path: '/organization/department-tree' }
    ]
  }
];

const employeeNavigationConfig: MainTab[] = [
  {
    name: 'My Space',
    path: '/my-space',
    subTabs: [
      { name: 'Overview', path: '/my-space/overview' },
      { name: 'Dashboard', path: '/my-space/dashboard' },
      { name: 'Calendar', path: '/my-space/calendar' }
    ]
  },
  {
    name: 'Team',
    path: '/team',
    subTabs: [
      { name: 'Reportees', path: '/team/reportees' },
      { name: 'HR Process', path: '/team/hr-process' }
    ]
  },
  {
    name: 'Organization',
    path: '/organization',
    subTabs: [
      { name: 'Employee Tree', path: '/organization/employee-tree' },
      { name: 'Department Tree', path: '/organization/department-tree' }
    ]
  }
];

interface NavigationHeaderProps {
  toggleSidebar?: () => void;
  userRole?: 'admin' | 'employee'; // Add role prop
}

export default function NavigationHeader({ 
  toggleSidebar, 
  userRole = 'admin' // Default to admin
}: NavigationHeaderProps) {
  const pathname = usePathname();
  
  // Select navigation config based on role
  const navigationConfig = userRole === 'admin' ? adminNavigationConfig : employeeNavigationConfig;
  const [activeMainTab, setActiveMainTab] = useState(navigationConfig[0]);

  // Sync active main tab with current path
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
    <div className="w-full bg-white z-30 sticky top-0">
      {/* Main Header */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-4 md:px-6 h-16">
          {/* Left Section - Sidebar Toggle & Main Navigation */}
          <div className="flex items-center flex-1 min-w-0 mr-2 md:mr-4">
            
            <button 
              onClick={toggleSidebar}
              className="p-2 mr-2 md:mr-6 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-md transition-colors shrink-0"
              aria-label="Toggle Sidebar"
            >
              <PanelLeft className="w-5 h-5 hidden md:block" />
              <Menu className="w-5 h-5 md:hidden" />
            </button>

            {/* Scrollable Container for Main Tabs */}
            <div className={`flex items-center gap-2 md:gap-4 overflow-x-auto whitespace-nowrap mask-linear-fade pr-2 ${noScrollbarClass}`}>
              {navigationConfig.map((tab) => {
                const isActive = activeMainTab.name === tab.name;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveMainTab(tab)}
                    className={`text-sm font-medium transition-colors px-3 py-1.5 md:px-4 md:py-2 rounded-md border shrink-0 ${isActive
                      ? 'text-blue-600 border-blue-600 bg-blue-50'
                      : 'text-gray-500 border-gray-300 hover:text-gray-700 hover:border-gray-400'
                      }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Section - Icons */}
          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            {/* Desktop Search */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-48 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Mobile Search Icon */}
            <button className="p-2 lg:hidden hover:bg-gray-100 rounded-md">
              <Search className="w-5 h-5 text-gray-500" />
            </button>

            {/* Settings Icon - Only for Admin */}
            {userRole === 'admin' && (
              <Link href="/settings/permissions" className="hidden sm:block">
                <button className="p-2 hover:bg-blue-50 rounded-md">
                  <Settings className="w-5 h-5 text-blue-600" />
                </button>
              </Link>
            )}

            <button className="p-2 hover:bg-blue-50 rounded-md transition-colors relative">
              <Bell className="w-5 h-5 text-blue-600" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[10px] flex items-center justify-center rounded-full">
                3
              </span>
            </button>

            <button className="flex items-center gap-2 hover:bg-gray-100 px-1 md:px-2 py-2 rounded-md transition-colors">
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900 hidden lg:block">John Doe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Header */}
      <div className="border-b border-gray-200">
        <div className={`flex items-center px-4 md:px-6 h-12 md:h-14 gap-4 md:gap-8 overflow-x-auto whitespace-nowrap ${noScrollbarClass}`}>
          {activeMainTab.subTabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`text-sm font-medium transition-colors px-1 py-3 md:px-4 md:py-4 border-b-2 shrink-0 ${isActive
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200'
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