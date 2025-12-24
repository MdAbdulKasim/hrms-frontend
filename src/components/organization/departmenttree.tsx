"use client";

import React, { useState } from 'react';
import { User, Mail, Phone, Briefcase } from 'lucide-react';
import ProfilePage from '../profile/ProfilePage';

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

export const departments: Department[] = [
  {
    id: 'it',
    name: 'IT',
    initial: 'I',
    count: 10,
    employees: [
      { id: '1', employeeId: 'S5', name: 'Andrew Turner', role: 'Manager', email: 'andrewturner@zylker.com', phone: '555-0101', department: 'Management' },
      { id: '2', employeeId: 'S6', name: 'Ember Johnson', role: 'Assistant Manager', email: 'emberjohnson@zylker.com', phone: '555-0102', department: 'Management' },
      { id: '3', employeeId: 'S8', name: 'Asher Miller', role: 'Assistant Manager', email: 'ashermiller@zylker.com', phone: '555-0103', department: 'Operations' },
      { id: '4', employeeId: 'S9', name: 'Caspian Jones', role: 'Team Member', email: 'caspianjones@zylker.com', phone: '555-0104', department: 'Operations' },
      { id: '5', employeeId: 'S13', name: 'Isabella Lopez', role: 'Team Member', email: 'isabellalopez@zylker.com', phone: '555-0105', department: 'Sales' },
    ],
  },
  {
    id: 'management',
    name: 'Management',
    initial: 'M',
    count: 5,
    employees: [
      { id: '10', employeeId: '1', name: 'Mohamed', role: 'CEO', email: 'mohamed@zylker.com', phone: '555-0200', department: 'Executive' },
      { id: '11', employeeId: 'S2', name: 'Lilly Williams', role: 'Administration', email: 'lillywilliams@zylker.com', phone: '239-555-0001', department: 'Management' },
      { id: '12', employeeId: 'S19', name: 'Michael Johnson', role: 'Administration', email: 'michaeljohnson@zylker.com', phone: '727-555-4545', department: 'Management' },
      { id: '13', employeeId: 'S20', name: 'Christopher Brown', role: 'Administration', email: 'christopherbrown@zylker.com', phone: '555-0203', department: 'Management' },
      { id: '14', employeeId: 'S3', name: 'Clarkson Walter', role: 'Administration', email: 'clarksonwalter@zylker.com', phone: '555-0204', department: 'Management' },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    initial: 'M',
    count: 5,
    employees: [
      { id: '15', employeeId: 'S4', name: 'Ethen Anderson', role: 'Manager', email: 'ethenanderson@zylker.com', phone: '555-0301', department: 'Operations' },
      { id: '16', employeeId: 'S7', name: 'Hazel Carter', role: 'Assistant Manager', email: 'hazelcarter@zylker.com', phone: '555-0302', department: 'Operations' },
      { id: '17', employeeId: 'S10', name: 'Lindon Smith', role: 'Team Member', email: 'lindonsmith@zylker.com', phone: '555-0303', department: 'Sales' },
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    initial: 'O',
    count: 3,
    employees: [
      { id: '18', employeeId: 'S14', name: 'Emily Jones', role: 'Team Member', email: 'emilyjones@zylker.com', phone: '555-0401', department: 'Operations' },
      { id: '19', employeeId: 'S15', name: 'Aparna Acharya', role: 'Team Member', email: 'aparnaacharya@zylker.com', phone: '555-0402', department: 'Operations' },
    ],
  },
  {
    id: 'sales',
    name: 'Sales',
    initial: 'S',
    count: 7,
    employees: [
      { id: '20', employeeId: 'S11', name: 'Olivia Smith', role: 'Team Member', email: 'oliviasmith@zylker.com', phone: '555-0501', department: 'Sales' },
      { id: '21', employeeId: 'S12', name: 'Sofia Rodriguez', role: 'Team Member', email: 'sofiarodriguez@zylker.com', phone: '555-0502', department: 'Sales' },
      { id: '22', employeeId: 'S16', name: 'Andrea Garcia', role: 'Team Member', email: 'andreagarcia@zylker.com', phone: '555-0503', department: 'Sales' },
      { id: '23', employeeId: 'S17', name: 'Amardeep Banjeet', role: 'Team Member', email: 'amardeep@zylker.com', phone: '555-0504', department: 'Sales' },
      { id: '24', employeeId: 'S18', name: 'William Smith', role: 'Team Member', email: 'williamsmith@zylker.com', phone: '555-0505', department: 'Sales' },
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

export default function DepartmentTree() {
  const [activeDeptId, setActiveDeptId] = useState<string>('management');
  const [showProfile, setShowProfile] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [hoveredEmployee, setHoveredEmployee] = useState<Employee | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number; showAbove?: boolean } | null>(null);
  const [isHoveringPreview, setIsHoveringPreview] = useState(false);
  let hoverTimeout: NodeJS.Timeout;

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
        {departments.map((dept) => {
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
                <span className="text-gray-400 text-xs">-</span>
              </div>

              <div className="absolute right-4 md:-right-[46px] flex items-center">
                <div 
                  className={`hidden md:block h-px w- ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`} 
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
                  <div className="hidden md:block h-[1px] w-[14px] bg-blue-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Right Column: Employee Tree --- */}
      <div 
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{ '--tree-offset': `${verticalOffset}px` } as React.CSSProperties} 
      >
        <div 
            className="relative mt-0 md:mt-(--tree-offset) border-l-0 md:border-l border-gray-200 pl-0 md:pl-8 flex flex-col gap-4"
        >
          
          {activeDept.employees.map((emp) => (
            <div 
              key={emp.id} 
              onClick={() => setActiveDeptId(activeDeptId)}
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
          ))}

          {activeDept.employees.length === 0 && (
            <div className="text-gray-400 text-sm italic pl-2 pt-2">
              No team members listed.
            </div>
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