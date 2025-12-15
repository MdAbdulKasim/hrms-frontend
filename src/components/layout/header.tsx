import React, { useState, useEffect } from 'react';
import { Search, Settings, Bell, User } from 'lucide-react';
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

const navigationConfig: MainTab[] = [
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

export default function NavigationHeader() {
  const pathname = usePathname();
  const [activeMainTab, setActiveMainTab] = useState(navigationConfig[0]);

  // Sync active main tab with current path
  useEffect(() => {
    const matchedTab = navigationConfig.find(tab =>
      pathname.startsWith(tab.path)
    );
    if (matchedTab) {
      setActiveMainTab(matchedTab);
    }
  }, [pathname]);

  return (
    <div className="w-full bg-white">
      {/* Main Header */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-6 h-16">
          {/* Left Section - Main Navigation */}
          <div className="flex items-center gap-8">
            {navigationConfig.map((tab) => {
              const isActive = activeMainTab.name === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveMainTab(tab)}
                  className={`text-sm font-medium transition-colors px-4 py-2 rounded-md border ${isActive
                    ? 'text-blue-600 border-blue-600 bg-blue-50'
                    : 'text-gray-500 border-gray-300 hover:text-gray-700 hover:border-gray-400'
                    }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Right Section - Search, Icons, Profile */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Settings Icon */}
            <button className="p-2 hover:bg-blue-50 rounded-md transition-colors">
              <Settings className="w-5 h-5 text-blue-600" />
            </button>

            {/* Notification Bell with Badge */}
            <button className="p-2 hover:bg-blue-50 rounded-md transition-colors relative">
              <Bell className="w-5 h-5 text-blue-600" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-xs flex items-center justify-center rounded-full">
                3
              </span>
            </button>

            {/* User Profile */}
            <button className="flex items-center gap-2 hover:bg-gray-100 px-2 py-2 rounded-md transition-colors">
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">John Doe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Header */}
      <div className="border-b border-gray-200">
        <div className="flex items-center px-6 h-14 gap-8">
          {activeMainTab.subTabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`text-sm font-medium transition-colors px-4 py-2 border-b-2 ${isActive
                    ? 'text-blue-600 border-blue-600'
                    : 'text-blue-500 border-transparent hover:text-gray-700 hover:border-blue-50'
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