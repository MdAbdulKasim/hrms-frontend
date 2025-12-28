"use client";

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthToken } from '@/lib/auth';

// --- DATA & TYPES ---

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

// --- COMPONENT ---

export default function OrganizationChart() {
  const [activeDeptId, setActiveDeptId] = useState<string>('it');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch departments and employees from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const apiUrl = getApiUrl();
        const token = getAuthToken();

        const response = await axios.get(`${apiUrl}/departments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const departmentsData = response.data.data || response.data || [];

        // Transform API data to match component interface
        const transformedData: Department[] = departmentsData.map((dept: any) => ({
          id: dept.id || dept._id || dept.name?.toLowerCase().replace(/\s/g, '-'),
          name: dept.name || 'Unknown Department',
          initial: dept.name?.charAt(0).toUpperCase() || 'U',
          count: dept.employees?.length || dept.members?.length || 0,
          employees: (dept.employees || dept.members || []).map((emp: any) => ({
            id: emp.id || emp._id || String(Math.random()),
            name: emp.name || emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown Employee',
            role: emp.role || emp.designation || emp.position || 'Employee',
            imageUrl: emp.imageUrl || emp.profileImage || undefined
          }))
        }));

        setDepartments(transformedData);
        // Set first department as active if available
        if (transformedData.length > 0 && !transformedData.find(d => d.id === activeDeptId)) {
          setActiveDeptId(transformedData[0].id);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [activeDeptId]);

  // Find the currently active department
  const activeDept = departments.find((d) => d.id === activeDeptId) || departments[0];

  // Calculate the index to determine the top margin for the right column
  const activeIndex = departments.findIndex((d) => d.id === activeDeptId);
  
  // Vertical Offset: 80px (card height) + 20px (gap) = 100px approx
  const verticalOffset = activeIndex * 100; 

  return (
    // RESPONSIVE UPDATE: Changed p-12 to p-4 md:p-12, and flex gap to flex-col md:flex-row
    <div className="min-h-screen bg-white p-4 md:p-12 flex flex-col md:flex-row gap-8 md:gap-12 font-sans">
      
      {/* --- Left Column: Departments --- */}
      {/* RESPONSIVE UPDATE: w-full on mobile, fixed width on desktop */}
      <div className="w-full md:w-[320px] flex flex-col gap-5 shrink-0">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading departments...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No departments found</p>
          </div>
        ) : (
          departments.map((dept) => {
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
              {/* RESPONSIVE UPDATE: Positioned absolute on right, but adjusted badge logic slightly for mobile if needed, 
                  mostly hiding the extended lines on mobile via hidden md:flex */}
              <div className="absolute right-4 md:-right-[46px] flex items-center">
                {/* Horizontal Line connecting Card to Badge (Desktop Only) */}
                <div 
                  className={`hidden md:block h-[1px] w-[14px] ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`} 
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

                {/* Horizontal Line connecting Badge to Tree (Only if active & Desktop Only) */}
                {isActive && (
                  <div className="hidden md:block h-[1px] w-[14px] bg-blue-500" />
                )}
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* --- Right Column: Employee Tree --- */}
      <div 
        className="flex-1 transition-all duration-300 ease-in-out"
        // RESPONSIVE UPDATE: Use CSS Variable for offset. 
        // Mobile: margin-top is 0. Desktop: margin-top is verticalOffset.
        style={{ '--tree-offset': `${verticalOffset}px` } as React.CSSProperties} 
      >
        <div 
            // RESPONSIVE UPDATE: Added mt-0 md:mt-[var(--tree-offset)]
            // Border left and padding left only on desktop
            className="relative mt-0 md:mt-[var(--tree-offset)] border-l-0 md:border-l border-gray-200 pl-0 md:pl-8 flex flex-col gap-4"
        >
          
          {/* Active Department Employees */}
          {activeDept.employees.map((emp) => (
            <div 
              key={emp.id} 
              // RESPONSIVE UPDATE: w-full on mobile
              className="relative flex items-center bg-white border border-gray-200 rounded-xl p-3 shadow-sm w-full md:min-w-[300px] md:max-w-[400px]"
            >
              {/* Connector Line (Desktop Only) */}
              <div className="hidden md:block absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-[1px] bg-gray-200"></div>

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