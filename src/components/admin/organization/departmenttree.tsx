"use client";

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import ProfilePage from "@/components/profile/ProfilePage";

// --- DATA & TYPES ---

export type Employee = {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  department?: string;
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

export default function DepartmentTree() {
  const [activeDeptId, setActiveDeptId] = useState<string>('management');
  const [showProfile, setShowProfile] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [hoveredEmployee, setHoveredEmployee] = useState<Employee | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number; showAbove?: boolean } | null>(null);
  const [isHoveringPreview, setIsHoveringPreview] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  let hoverTimeout: NodeJS.Timeout;

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const apiUrl = getApiUrl();
        const orgId = getOrgId();

        if (!orgId) {
          console.error('Organization ID not found');
          return;
        }

        // Fetch departments
        const deptResponse = await axios.get(`${apiUrl}/org/${orgId}/departments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const departmentsData = deptResponse.data?.data || deptResponse.data || [];

        // Fetch employees
        const empResponse = await axios.get(`${apiUrl}/org/${orgId}/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const employeesData = empResponse.data?.data || empResponse.data || [];

        // Group employees by department
        const deptMap = new Map();
        employeesData.forEach((emp: any) => {
          const deptId = emp.departmentId || emp.department?.toLowerCase().replace(/\s+/g, '') || 'other';
          if (!deptMap.has(deptId)) {
            deptMap.set(deptId, []);
          }
          deptMap.get(deptId).push({
            id: emp.id,
            employeeId: emp.employeeId || emp.id,
            name: `${emp.firstName} ${emp.lastName}`,
            role: emp.designation || emp.role || 'Employee',
            email: emp.email,
            phone: emp.phone,
            department: emp.department,
            imageUrl: emp.imageUrl
          });
        });

        // Create department objects
        const formattedDepartments: Department[] = departmentsData.map((dept: any) => ({
          id: dept.id || dept.name?.toLowerCase().replace(/\s+/g, ''),
          name: dept.name,
          initial: dept.name?.charAt(0).toUpperCase() || 'D',
          count: deptMap.get(dept.id || dept.name?.toLowerCase().replace(/\s+/g, ''))?.length || 0,
          employees: deptMap.get(dept.id || dept.name?.toLowerCase().replace(/\s+/g, '')) || []
        }));

        setDepartments(formattedDepartments);
        if (formattedDepartments.length > 0 && !activeDeptId) {
          setActiveDeptId(formattedDepartments[0].id);
        }
      } catch (error) {
        console.error('Error fetching departments and employees:', error);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const activeDept = departments.find((d) => d.id === activeDeptId) || departments[0];
  const activeIndex = departments.findIndex((d) => d.id === activeDeptId);
  const verticalOffset = activeIndex * 100;

  const handleEmployeeHover = (employee: Employee, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const previewHeight = 280; // Reduced max height of preview card
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Determine if preview should appear above or below
    const showAbove = spaceBelow < previewHeight && spaceAbove > spaceBelow;

    setHoveredEmployee(employee);
    setHoverPosition({
      x: rect.left + (rect.width / 2),
      y: showAbove ? rect.top - 10 : rect.bottom + 10,
      showAbove: showAbove
    });
  };

  const handleEmployeeLeave = () => {
    hoverTimeout = setTimeout(() => {
      if (!isHoveringPreview) {
        setHoveredEmployee(null);
        setHoverPosition(null);
      }
    }, 100);
  };

  const handlePreviewEnter = () => {
    clearTimeout(hoverTimeout);
    setIsHoveringPreview(true);
  };

  const handlePreviewLeave = () => {
    setIsHoveringPreview(false);
    setHoveredEmployee(null);
    setHoverPosition(null);
  };

  const handleEmployeeClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setShowProfile(true);
    setHoveredEmployee(null);
  };

  const handleViewProfile = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setShowProfile(true);
    setHoveredEmployee(null);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
    setSelectedEmployeeId('');
  };

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfilePage
          employeeId={selectedEmployeeId}
          onBack={handleCloseProfile}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-12 flex flex-col md:flex-row gap-8 md:gap-12 font-sans">

      {/* --- Left Column: Departments --- */}
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
                  relative flex items-center p-4 rounded-2xl border cursor-pointer transition-all duration-200 h-20
                  ${isActive
                    ? 'bg-blue-50 border-blue-500 shadow-sm z-20'
                    : 'bg-gray-50/50 border-gray-200 hover:bg-gray-100'
                  }
                `}
              >
                <div className="w-10 h-10 bg-gray-200/80 rounded-lg flex items-center justify-center text-gray-700 font-medium mr-4">
                  {dept.initial}
                </div>

                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800 text-base">{dept.name}</span>
                  <span className="text-gray-400 text-xs">{dept.count} employees</span>
                </div>

                <div className="absolute right-4 md:-right-[46px] flex items-center">
                  <div
                    className={`hidden md:block h-px w-3.5 ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`}
                  />

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

                  {isActive && (
                    <div className="hidden md:block h-px w-3.5 bg-blue-500" />
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
        style={{ '--tree-offset': `${verticalOffset}px` } as React.CSSProperties}
      >
        <div
          className="relative mt-0 md:mt-(--tree-offset) border-l-0 md:border-l border-gray-200 pl-0 md:pl-8 flex flex-col gap-4"
        >

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading employees...</p>
            </div>
          ) : !activeDept || activeDept.employees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No employees in this department</p>
            </div>
          ) : (
            activeDept.employees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => handleEmployeeClick(emp.id)}
                onMouseEnter={(e) => handleEmployeeHover(emp, e)}
                onMouseLeave={handleEmployeeLeave}
                className="relative flex items-center bg-white border border-gray-200 rounded-xl p-3 shadow-sm w-full md:min-w-[300px] md:max-w-[400px] cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="hidden md:block absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-px bg-gray-200"></div>

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

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {emp.employeeId} - {emp.name}
                  </span>
                  <span className="text-xs text-gray-500 truncate">{emp.role}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Hover Preview Card */}
      {hoveredEmployee && hoverPosition && (
        <div
          className="fixed bg-white rounded-lg shadow-2xl border-2 border-blue-500 p-3 w-72 z-50 animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: `${hoverPosition.x}px`,
            [hoverPosition.showAbove ? 'bottom' : 'top']: hoverPosition.showAbove
              ? `${window.innerHeight - hoverPosition.y}px`
              : `${hoverPosition.y}px`,
            transform: 'translateX(-50%)',
            maxHeight: '280px',
            overflowY: 'auto'
          }}
          onMouseEnter={handlePreviewEnter}
          onMouseLeave={handlePreviewLeave}
        >
          {/* View Profile Icon - Top Right */}
          {hoveredEmployee.employeeId && (
            <button
              onClick={() => handleViewProfile(hoveredEmployee.employeeId)}
              className="absolute top-2 right-2 p-1.5 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow-md group"
              title="View Full Profile"
            >
              <User size={16} className="text-white" />
            </button>
          )}

          {/* Profile Preview Header */}
          <div className="flex items-start gap-3 mb-3 pb-3 border-b border-gray-200">
            <div className="shrink-0">
              {hoveredEmployee.imageUrl ? (
                <img src={hoveredEmployee.imageUrl} className="w-12 h-12 rounded-full object-cover" alt={hoveredEmployee.name} />
              ) : (
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                  {hoveredEmployee.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <h3 className="font-bold text-gray-900 text-base truncate">{hoveredEmployee.name}</h3>
              <p className="text-blue-600 text-xs font-medium">{hoveredEmployee.role}</p>
              {hoveredEmployee.employeeId && (
                <p className="text-gray-500 text-xs mt-0.5">ID: {hoveredEmployee.employeeId}</p>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="space-y-2">
            {hoveredEmployee.email && (
              <div className="flex items-center gap-2 text-xs">
                <Mail size={14} className="text-gray-400 shrink-0" />
                <span className="text-gray-700 truncate">{hoveredEmployee.email}</span>
              </div>
            )}

            {hoveredEmployee.phone && (
              <div className="flex items-center gap-2 text-xs">
                <Phone size={14} className="text-gray-400 shrink-0" />
                <span className="text-gray-700">{hoveredEmployee.phone}</span>
              </div>
            )}

            {hoveredEmployee.department && (
              <div className="flex items-center gap-2 text-xs">
                <Briefcase size={14} className="text-gray-400 shrink-0" />
                <span className="text-gray-700">{hoveredEmployee.department}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}