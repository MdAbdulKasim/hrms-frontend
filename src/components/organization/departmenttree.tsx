"use client";

import React, { useState } from 'react';
import { User } from 'lucide-react';

// --- DATA & TYPES (Merged here to fix the import error) ---

export type Employee = {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
};

export type Department = {
  id: string;
  name: string;
  initial: string;
  count: number;
  employees: Employee[];
};

export const departments: Department[] = [
  {
    id: 'it',
    name: 'IT',
    initial: 'I',
    count: 10,
    employees: [
      { id: '1', name: 'Andrew Turner', role: 'Manager', imageUrl: '/images/user1.jpg' },
      { id: '2', name: 'Ember Johnson', role: 'Assistant Manager', imageUrl: '/images/user2.jpg' },
      { id: '3', name: 'Asher Miller', role: 'Assistant Manager', imageUrl: '/images/user3.jpg' },
      { id: '4', name: 'Caspian Jones', role: 'Team Member', imageUrl: '/images/user4.jpg' },
      { id: '5', name: 'Isabella Lopez', role: 'Team Member', imageUrl: '/images/user5.jpg' },
    ],
  },
  {
    id: 'management',
    name: 'Management',
    initial: 'M',
    count: 5,
    employees: [
      { id: '10', name: 'Mohamed', role: 'CEO', imageUrl: '/images/user6.jpg' },
      { id: '11', name: 'Lilly Williams', role: 'Administration', imageUrl: '/images/user7.jpg' },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    initial: 'M',
    count: 5,
    employees: [
      { id: '15', name: 'Ethen Anderson', role: 'Manager', imageUrl: '/images/user8.jpg' },
      { id: '16', name: 'Hazel Carter', role: 'Assistant Manager', imageUrl: '/images/user9.jpg' },
      { id: '17', name: 'Lindon Smith', role: 'Team Member', imageUrl: '/images/user10.jpg' },
    ],
  },
  {
    id: 'hr',
    name: 'HR',
    initial: 'H',
    count: 0,
    employees: [],
  },
];

// --- COMPONENT ---

export default function OrganizationChart() {
  const [activeDeptId, setActiveDeptId] = useState<string>('it');

  // Find the currently active department
  const activeDept = departments.find((d) => d.id === activeDeptId) || departments[0];

  // Calculate the index to determine the top margin for the right column
  const activeIndex = departments.findIndex((d) => d.id === activeDeptId);
  
  // Vertical Offset: 80px (card height) + 20px (gap) = 100px approx
  const verticalOffset = activeIndex * 100; 

  return (
    <div className="min-h-screen bg-white p-12 flex gap-12 font-sans">
      
      {/* --- Left Column: Departments --- */}
      <div className="w-[320px] flex flex-col gap-5 shrink-0">
        {departments.map((dept) => {
          const isActive = activeDeptId === dept.id;

          return (
            <div
              key={dept.id}
              onClick={() => setActiveDeptId(dept.id)}
              className={`
                relative flex items-center p-4 rounded-2xl border cursor-pointer transition-all duration-200 h-[80px]
                ${isActive 
                  ? 'bg-blue-50 border-blue-500 shadow-sm z-20' 
                  : 'bg-gray-50/50 border-gray-200 hover:bg-gray-100'
                }
              `}
            >
              {/* Initial Box */}
              <div className="w-10 h-10 bg-gray-200/80 rounded-lg flex items-center justify-center text-gray-700 font-medium mr-4">
                {dept.initial}
              </div>

              {/* Text Content */}
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 text-base">{dept.name}</span>
                <span className="text-gray-400 text-xs">-</span>
              </div>

              {/* Connection Logic (Line + Badge) */}
              <div className="absolute -right-[46px] flex items-center">
                {/* Horizontal Line connecting Card to Badge */}
                <div 
                  className={`h-[1px] w-[14px] ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`} 
                />
                
                {/* The Number Badge */}
                <div 
                  className={`
                    w-8 h-7 flex items-center justify-center text-xs border rounded-sm
                    ${isActive 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-600'
                    }
                  `}
                >
                  {dept.count > 0 ? dept.count : 0}
                </div>

                {/* Horizontal Line connecting Badge to Tree (Only if active) */}
                {isActive && (
                  <div className="h-[1px] w-[14px] bg-blue-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Right Column: Employee Tree --- */}
      <div 
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{ marginTop: `${verticalOffset}px` }} 
      >
        <div className="relative border-l border-gray-200 pl-8 flex flex-col gap-4">
          
          {/* Active Department Employees */}
          {activeDept.employees.map((emp) => (
            <div 
              key={emp.id} 
              className="relative flex items-center bg-white border border-gray-200 rounded-xl p-3 shadow-sm min-w-[300px] max-w-[400px]"
            >
              {/* Connector Line */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-[1px] bg-gray-200"></div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 mr-3 shrink-0 relative">
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <User size={20} />
                 </div>
                 {emp.imageUrl && (
                   <img 
                     src={emp.imageUrl} 
                     alt={emp.name} 
                     className="w-full h-full object-cover relative z-10"
                     onError={(e) => { e.currentTarget.style.display = 'none'; }}
                   />
                 )}
              </div>

              {/* Details */}
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">{emp.name}</span>
                <span className="text-xs text-gray-500">{emp.role}</span>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {activeDept.employees.length === 0 && (
            <div className="text-gray-400 text-sm italic pl-2 pt-2">
              No team members listed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}