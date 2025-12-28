'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthToken } from '@/lib/auth';

// --- Type Definitions ---
interface Employee {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  count?: number;
  children?: Employee[];
}

export default function OrgChart() {
  const [activePath, setActivePath] = useState<string[]>(['root']);
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<Employee | null>(null);

  // Fetch employee hierarchy from API
  useEffect(() => {
    const fetchEmployeeHierarchy = async () => {
      try {
        setLoading(true);
        const apiUrl = getApiUrl();
        const token = getAuthToken();

        const response = await axios.get(`${apiUrl}/employees/hierarchy`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const hierarchyData = response.data.data || response.data || null;
        setInitialData(hierarchyData);
      } catch (error) {
        console.error('Error fetching employee hierarchy:', error);
        setInitialData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeHierarchy();
  }, []);

  const handleNodeClick = (nodeId: string, depth: number) => {
    const newPath = activePath.slice(0, depth + 1);
    if (newPath[depth] !== nodeId) {
      newPath[depth] = nodeId;
    }
    setActivePath(newPath);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans flex items-center justify-center">
        <p className="text-gray-500">Loading organization chart...</p>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans flex items-center justify-center">
        <p className="text-gray-500">No organization data available</p>
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
                     className="absolute left-0 w-[2px] bg-gray-200 hidden md:block"
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
                         <div className={`hidden md:block w-8 h-[2px] ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                      )}

                      {/* The Card */}
                      <div
                        onClick={() => handleNodeClick(node.id, colIndex)}
                        className={`
                          flex items-center p-3 w-64 rounded-xl border-2 cursor-pointer transition-all bg-white z-10
                          ${isActive 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-100 hover:border-blue-200 shadow-sm'
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
                         <div>
                            <div className="font-bold text-gray-800 text-sm truncate">{node.name}</div>
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
                           {/* Line 1 */}
                           <div className="bg-blue-500 w-[2px] h-6 md:w-8 md:h-[2px]"></div>
                           
                           {/* Badge */}
                           {node.count !== undefined && (
                             <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-20 -mt-1 md:mt-0 md:-ml-1">
                               {node.count}
                             </div>
                           )}
                           
                           {/* Line 2 */}
                           <div className="bg-blue-500 w-[2px] h-6 -mt-1 md:mt-0 md:-ml-1 md:w-8 md:h-[2px]"></div>
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
    </div>
  );
}