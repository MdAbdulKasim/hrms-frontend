import React, { useState } from 'react';
import { Search, Settings, Bell, User } from 'lucide-react';

type TabConfig = {
  main: string[];
  sub: string[];
};

const tabConfigs: Record<string, TabConfig> = {
  'My Space': {
    main: ['My Space', 'Team', 'Organization'],
    sub: ['Overview', 'Dashboard', 'Calendar']
  },
  'Team': {
    main: ['My Space', 'Team', 'Organization'],
    sub: ['Reportees', 'HR Process']
  },
  'Organization': {
    main: ['My Space', 'Team', 'Organization'],
    sub: ['Employee Tree', 'Department Tree']
  }
};

export default function NavigationHeader() {
  const [activeMainTab, setActiveMainTab] = useState('My Space');
  const [activeSubTab, setActiveSubTab] = useState('Overview');

  const handleMainTabChange = (tab: string) => {
    setActiveMainTab(tab);
    setActiveSubTab(tabConfigs[tab].sub[0]);
  };

  const currentConfig = tabConfigs[activeMainTab];

  return (
    <div className="w-full bg-white">
      {/* Main Header */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-6 h-16">
          {/* Left Section - Main Navigation */}
          <div className="flex items-center gap-8">
            {currentConfig.main.map((tab) => (
              <button
                key={tab}
                onClick={() => handleMainTabChange(tab)}
                className={`text-sm font-medium transition-colors px-4 py-2 rounded-md border ${
                  activeMainTab === tab
                    ? 'text-blue-600 border-blue-600 bg-blue-50'
                    : 'text-gray-500 border-gray-300 hover:text-gray-700 hover:border-gray-400'
                }`}
              >
                {tab}
              </button>
            ))}
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
          {currentConfig.sub.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`text-sm font-medium transition-colors px-4 py-2 rounded-md border ${
                activeSubTab === tab
                  ? 'text-blue-600 border-blue-600 bg-blue-50'
                  : 'text-gray-500 border-gray-300 hover:text-gray-700 hover:border-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}