'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';

// --- Type Definitions ---
interface Employee {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  count?: number; 
  children?: Employee[];
}

// --- Data ---
const initialData: Employee = {
  id: 'root',
  name: 'mohamed',
  role: 'CEO',
  count: 15, // Badge on line to Level 1
  children: [
    { id: '1', name: 'Michael Johnson', role: 'Administration' },
    {
      id: '2',
      name: 'Lilly Williams',
      role: 'Administration',
      count: 11, // Badge on line to Level 2
      children: [
        {
          id: '2-1',
          name: 'Andrew Turner',
          role: 'Manager',
          count: 3,
          children: [
            {
              id: '2-1-1',
              name: 'Asher Miller',
              role: 'Assistant Manager',
              count: 2,
              children: [
                { id: '2-1-1-1', name: 'Emily Jones', role: 'Team Member' },
                { id: '2-1-1-2', name: 'Isabella Lopez', role: 'Team Member' },
              ],
            },
          ],
        },
        {
          id: '2-2',
          name: 'Ember Johnson',
          role: 'Assistant Manager',
          count: 2,
          children: [
            {
              id: '2-2-1',
              name: 'Caspian Jones',
              role: 'Team Member',
              count: 1,
              children: [
                { id: '2-2-1-1', name: 'Amardeep Banjeet', role: 'Team Member' },
              ],
            },
          ],
        },
        {
          id: '2-3',
          name: 'Ethen Anderson',
          role: 'Manager',
          count: 3,
          children: [
            {
              id: '2-3-1',
              name: 'Hazel Carter',
              role: 'Assistant Manager',
              count: 2,
              children: [
                { id: '2-3-1-1', name: 'Olivia Smith', role: 'Team Member' },
                { id: '2-3-1-2', name: 'Lindon Smith', role: 'Team Member' },
              ],
            },
          ],
        },
      ],
    },
    { id: '3', name: 'Christopher Brown', role: 'Administration' },
    { id: '4', name: 'Clarkson Walter', role: 'Administration' },
  ],
};

export default function OrgChart() {
  const [activePath, setActivePath] = useState<string[]>(['root']);

  const handleNodeClick = (nodeId: string, depth: number) => {
    // If clicking a node at depth 0, we want path to be [root, clickedNodeId]?
    // Actually, if I click Lilly (depth 1), path becomes ['root', '2'].
    
    // Create new path up to this depth
    const newPath = activePath.slice(0, depth + 1);
    
    // If the clicked node is already the active one at this depth, do nothing or toggle?
    // Requirement: "Show next". So we set it as active.
    if (newPath[depth] !== nodeId) {
      newPath[depth] = nodeId;
    }
    
    setActivePath(newPath);
  };

  // Recursive render function
  // We render a Node. If it is in the activePath, we render its children to the right.
  // But wait, the design is Columns.
  
  // Let's stick to the column generation approach, it's robust.
  const columns: { nodes: Employee[], parentId: string | null }[] = [];
  
  // Init with Root
  columns.push({ nodes: [initialData], parentId: null });

  for (let i = 0; i < activePath.length; i++) {
    const activeId = activePath[i];
    // Find the active node object in the current last column
    const currentColumnNodes = columns[i].nodes;
    const activeNode = currentColumnNodes.find(n => n.id === activeId);

    if (activeNode && activeNode.children && activeNode.children.length > 0) {
      columns.push({ nodes: activeNode.children, parentId: activeId });
    }
  }

  return (
    <div className="min-h-screen bg-white p-10 font-sans overflow-x-auto">
      <div className="flex">
        {columns.map((col, colIndex) => {
          const isLastCol = colIndex === columns.length - 1;
          
          // Identify the parent node for this column (to get the badge count)
          // We look at column index - 1
          let badgeCount = null;
          if (colIndex > 0) {
             const parentCol = columns[colIndex - 1];
             const parentNode = parentCol.nodes.find(n => n.id === activePath[colIndex - 1]);
             badgeCount = parentNode?.count;
          }

          return (
            <div key={colIndex} className="flex">
              
              {/* Connector Area (Lines) between columns */}
              {colIndex > 0 && (
                 <div className="flex flex-col justify-center relative w-16">
                    {/* The horizontal line coming from the left parent is handled by the parent's padding usually, 
                        but here we draw the 'Split' structure. */}
                    
                    {/* We need a line from the "Center" of the previous active node...
                       Actually, simply drawing a horizontal line in the center of this gap
                       with the badge is the easiest way.
                    */}
                    <div className="absolute top-0 bottom-0 left-0 w-full flex items-center justify-center pointer-events-none">
                       {/* This only works if the trees are perfectly centered. 
                           Since they are lists, the 'active' node might be at the top or bottom.
                           This makes pure CSS lines hard. 
                           
                           Solution: The 'Line' is part of the Node component.
                       */}
                    </div>
                 </div>
              )}

              {/* The Column of Nodes */}
              <div className="flex flex-col justify-center space-y-4 relative py-4 px-2">
                
                {/* Vertical Line on the Left of the children group.
                   Only visible if there are multiple children or to create the bracket.
                   It connects the top child to the bottom child.
                */}
                {colIndex > 0 && (
                   <div 
                     className="absolute left-0 w-[2px] bg-gray-200"
                     style={{
                        top: '2rem', // approximate center of first card
                        bottom: '2rem', // approximate center of last card
                        // Dynamic calculation is needed for perfect results, 
                        // but usually 'top-8 bottom-8' works if cards are fixed height.
                     }} 
                   >
                     {/* If the path is active, part of this line needs to be Blue.
                        The logic: The line from the top (or where the parent connects) 
                        to the Selected Child should be blue.
                     */}
                   </div>
                )}

                {col.nodes.map((node) => {
                  const isActive = activePath.includes(node.id);
                  const isLeaf = !node.children;
                  
                  return (
                    <div key={node.id} className="flex items-center group relative">
                      
                      {/* Left Connector (Horizontal from Vertical Line to Card) */}
                      {colIndex > 0 && (
                         <div className={`w-8 h-[2px] ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
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
                         <div className="mr-3">
                           {node.imageUrl ? (
                             <img src={node.imageUrl} className="w-10 h-10 rounded-full object-cover" />
                           ) : (
                             <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                               <User size={20} />
                             </div>
                           )}
                         </div>
                         <div>
                            <div className="font-bold text-gray-800 text-sm">{node.name}</div>
                            <div className="text-gray-500 text-xs">{node.role}</div>
                         </div>
                      </div>

                      {/* Right Connector (Outgoing Line + Badge) */}
                      {/* Only show if this node is ACTIVE and has children to show */}
                      {isActive && node.children && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 flex items-center">
                           <div className="w-8 h-[2px] bg-blue-500"></div>
                           {node.count !== undefined && (
                             <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-20 -ml-1">
                               {node.count}
                             </div>
                           )}
                           <div className="w-8 h-[2px] bg-blue-500 -ml-1"></div>
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