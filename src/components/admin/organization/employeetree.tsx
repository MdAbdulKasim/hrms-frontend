
'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, Briefcase, Calendar, MapPin } from 'lucide-react';
import ProfilePage from '../profile/ProfilePage';

// --- Type Definitions ---
interface Employee {
  id: string;
  name: string;
  role: string;
  employeeId?: string;
  email?: string;
  phone?: string;
  department?: string;
  imageUrl?: string;
  count?: number; 
  children?: Employee[];
}

// --- Data ---
const initialData: Employee = {
  id: 'root',
  name: 'mohamed',
  role: 'CEO',
  employeeId: '1',
  email: 'mohamed@company.com',
  phone: '+1 234-567-8900',
  department: 'Executive',
  count: 15,
  children: [
    { 
      id: '1', 
      name: 'Michael Johnson', 
      role: 'Administration', 
      employeeId: 'S19',
      email: 'michaeljohnson@zylker.com',
      phone: '727-555-4545',
      department: 'Management'
    },
    {
      id: '2',
      name: 'Lilly Williams',
      role: 'Administration',
      employeeId: 'S2',
      email: 'lillywilliams@zylker.com',
      phone: '239-555-0001',
      department: 'Management',
      count: 11,
      children: [
        {
          id: '2-1',
          name: 'Andrew Turner',
          role: 'Manager',
          employeeId: 'S5',
          email: 'andrewturner@zylker.com',
          department: 'Management',
          count: 3,
          children: [
            {
              id: '2-1-1',
              name: 'Asher Miller',
              role: 'Assistant Manager',
              employeeId: 'S8',
              email: 'ashermiller@zylker.com',
              department: 'Operations',
              count: 2,
              children: [
                { id: '2-1-1-1', name: 'Emily Jones', role: 'Team Member', employeeId: 'S14', email: 'emilyjones@zylker.com', department: 'Operations' },
                { id: '2-1-1-2', name: 'Isabella Lopez', role: 'Team Member', employeeId: 'S13', email: 'isabellalopez@zylker.com', department: 'Sales' },
              ],
            },
          ],
        },
        {
          id: '2-2',
          name: 'Ember Johnson',
          role: 'Assistant Manager',
          employeeId: 'S6',
          email: 'emberjohnson@zylker.com',
          department: 'Management',
          count: 2,
          children: [
            {
              id: '2-2-1',
              name: 'Caspian Jones',
              role: 'Team Member',
              employeeId: 'S9',
              email: 'caspianjones@zylker.com',
              department: 'Operations',
              count: 1,
              children: [
                { id: '2-2-1-1', name: 'Amardeep Banjeet', role: 'Team Member', employeeId: 'S17', email: 'amardeep@zylker.com', department: 'Sales' },
              ],
            },
          ],
        },
        {
          id: '2-3',
          name: 'Ethen Anderson',
          role: 'Manager',
          employeeId: 'S4',
          email: 'ethenanderson@zylker.com',
          department: 'Operations',
          count: 3,
          children: [
            {
              id: '2-3-1',
              name: 'Hazel Carter',
              role: 'Assistant Manager',
              employeeId: 'S7',
              email: 'hazelcarter@zylker.com',
              department: 'Operations',
              count: 2,
              children: [
                { id: '2-3-1-1', name: 'Olivia Smith', role: 'Team Member', employeeId: 'S11', email: 'oliviasmith@zylker.com', department: 'Sales' },
                { id: '2-3-1-2', name: 'Lindon Smith', role: 'Team Member', employeeId: 'S10', email: 'lindonsmith@zylker.com', department: 'Sales' },
              ],
            },
          ],
        },
      ],
    },
    { id: '3', name: 'Christopher Brown', role: 'Administration', employeeId: 'S20', email: 'christopherbrown@zylker.com', department: 'Management' },
    { id: '4', name: 'Clarkson Walter', role: 'Administration', employeeId: 'S3', email: 'clarksonwalter@zylker.com', department: 'Management' },
  ],
};

export default function OrgChart() {
  const [activePath, setActivePath] = useState<string[]>(['root']);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [hoveredNode, setHoveredNode] = useState<Employee | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number; showAbove?: boolean } | null>(null);
  const [isHoveringPreview, setIsHoveringPreview] = useState(false);
  let hoverTimeout: NodeJS.Timeout;

  const handleNodeClick = (nodeId: string, depth: number) => {
    const newPath = activePath.slice(0, depth + 1);
    if (newPath[depth] !== nodeId) {
      newPath[depth] = nodeId;
    }
    setActivePath(newPath);
  };

  const handleNodeHover = (node: Employee, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const previewHeight = 280; // Reduced max height of preview card
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Determine if preview should appear above or below
    const showAbove = spaceBelow < previewHeight && spaceAbove > spaceBelow;
    
    setHoveredNode(node);
    setHoverPosition({
      x: rect.left + (rect.width / 2),
      y: showAbove ? rect.top - 10 : rect.bottom + 10,
      showAbove: showAbove
    });
  };

  const handleNodeLeave = () => {
    // Delay closing to allow moving to preview
    hoverTimeout = setTimeout(() => {
      if (!isHoveringPreview) {
        setHoveredNode(null);
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
    setHoveredNode(null);
    setHoverPosition(null);
  };

  const handleViewProfile = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setShowProfile(true);
    setHoveredNode(null);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
    setSelectedEmployeeId('');
  };

  // If profile is shown, render only the profile page
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

  const columns: { nodes: Employee[], parentId: string | null }[] = [];
  columns.push({ nodes: [initialData], parentId: null });

  for (let i = 0; i < activePath.length; i++) {
    const activeId = activePath[i];
    const currentColumnNodes = columns[i].nodes;
    const activeNode = currentColumnNodes.find(n => n.id === activeId);

    if (activeNode && activeNode.children && activeNode.children.length > 0) {
      columns.push({ nodes: activeNode.children, parentId: activeId });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans md:overflow-x-auto">
      <div className="flex flex-col md:flex-row md:items-start items-center">
        {columns.map((col, colIndex) => {
          
          return (
            <div key={colIndex} className="flex flex-col md:flex-row items-center md:items-stretch">
              
              {/* Connector Area (Lines) between columns - Desktop Only */}
              {colIndex > 0 && (
                 <div className="hidden md:flex flex-col justify-center relative w-16">
                    <div className="absolute top-0 bottom-0 left-0 w-full flex items-center justify-center pointer-events-none">
                    </div>
                 </div>
              )}

              {/* The Column of Nodes */}
              <div className="flex flex-col justify-center space-y-4 relative py-4 px-2">
                
                {/* Vertical Line for siblings - Desktop Only */}
                {colIndex > 0 && (
                   <div 
                     className="absolute left-0 w-0.5 bg-gray-200 hidden md:block"
                     style={{
                        top: '2rem', 
                        bottom: '2rem',
                     }} 
                   >
                   </div>
                )}

                {col.nodes.map((node) => {
                  const isActive = activePath.includes(node.id);
                  
                  return (
                    <div key={node.id} className="flex items-center group relative flex-col md:flex-row">
                      
                      {/* Left Connector (Horizontal) - Desktop Only */}
                      {colIndex > 0 && (
                         <div className={`hidden md:block w-8 h-0.5 ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                      )}

                      {/* The Card */}
                      <div
                        onClick={() => handleNodeClick(node.id, colIndex)}
                        onMouseEnter={(e) => handleNodeHover(node, e)}
                        onMouseLeave={handleNodeLeave}
                        className={`
                          relative flex items-center p-3 w-64 rounded-xl border-2 cursor-pointer transition-all bg-white z-10
                          ${isActive 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-100 hover:border-blue-300 shadow-sm hover:shadow-md'
                          }
                        `}
                      >
                         <div className="mr-3 shrink-0">
                           {node.imageUrl ? (
                             <img src={node.imageUrl} className="w-10 h-10 rounded-full object-cover" alt={node.name} />
                           ) : (
                             <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                               <User size={20} />
                             </div>
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-800 text-sm truncate">
                              {node.name}
                            </div>
                            <div className="text-gray-500 text-xs truncate">{node.role}</div>
                         </div>
                      </div>

                      {/* Right/Bottom Connector (Outgoing Line + Badge) */}
                      {isActive && node.children && (
                        <div className={`
                            absolute flex items-center justify-center
                            top-full left-1/2 -translate-x-1/2 flex-col
                            md:top-1/2 md:left-full md:translate-x-0 md:-translate-y-1/2 md:flex-row
                        `}>
                           <div className="bg-blue-500 w-0.5 h-6 md:w-8 md:h-0.5"></div>
                           
                           {node.count !== undefined && (
                             <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-20 -mt-1 md:mt-0 md:-ml-1">
                               {node.count}
                             </div>
                           )}
                           
                           <div className="bg-blue-500 w-0.5 h-6 -mt-1 md:mt-0 md:-ml-1 md:w-8 md:h-0.5"></div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover Preview Card */}
      {hoveredNode && hoverPosition && (
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
          {hoveredNode.employeeId && (
            <button
              onClick={() => handleViewProfile(hoveredNode.employeeId!)}
              className="absolute top-2 right-2 p-1.5 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow-md group"
              title="View Full Profile"
            >
              <User size={16} className="text-white" />
            </button>
          )}

          {/* Profile Preview Header */}
          <div className="flex items-start gap-3 mb-3 pb-3 border-b border-gray-200">
            <div className="shrink-0">
              {hoveredNode.imageUrl ? (
                <img src={hoveredNode.imageUrl} className="w-12 h-12 rounded-full object-cover" alt={hoveredNode.name} />
              ) : (
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                  {hoveredNode.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <h3 className="font-bold text-gray-900 text-base truncate">{hoveredNode.name}</h3>
              <p className="text-blue-600 text-xs font-medium">{hoveredNode.role}</p>
              {hoveredNode.employeeId && (
                <p className="text-gray-500 text-xs mt-0.5">ID: {hoveredNode.employeeId}</p>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="space-y-2">
            {hoveredNode.email && (
              <div className="flex items-center gap-2 text-xs">
                <Mail size={14} className="text-gray-400 shrink-0" />
                <span className="text-gray-700 truncate">{hoveredNode.email}</span>
              </div>
            )}
            
            {hoveredNode.phone && (
              <div className="flex items-center gap-2 text-xs">
                <Phone size={14} className="text-gray-400 shrink-0" />
                <span className="text-gray-700">{hoveredNode.phone}</span>
              </div>
            )}
            
            {hoveredNode.department && (
              <div className="flex items-center gap-2 text-xs">
                <Briefcase size={14} className="text-gray-400 shrink-0" />
                <span className="text-gray-700">{hoveredNode.department}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}