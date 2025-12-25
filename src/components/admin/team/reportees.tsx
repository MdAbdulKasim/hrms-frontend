'use client';
import React, { useState } from 'react';
import { Search, Grid, List, LayoutGrid, Filter, X, ChevronDown, ArrowLeft } from 'lucide-react';
import ProfilePage from "@/components/profile/ProfilePage";

// Employee data type
interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  status: string;
  image: string;
  seniority: string;
}

// Sample employee data
const employees: Employee[] = [
  {
    id: 'S19',
    name: 'Michael Johnson',
    designation: 'Administration',
    department: 'Management',
    status: 'Yet to check-in',
    image: '👨‍💼',
    seniority: 'Above 10 Years'
  },
  {
    id: 'S2',
    name: 'Lilly Williams',
    designation: 'Administration',
    department: 'Management',
    status: 'Yet to check-in',
    image: '👩‍💼',
    seniority: 'Above 10 Years'
  },
  {
    id: 'S20',
    name: 'Christopher Brown',
    designation: 'Administration',
    department: 'Management',
    status: 'Yet to check-in',
    image: '👨‍💼',
    seniority: 'Above 10 Years'
  },
  {
    id: 'S3',
    name: 'Clarkson Walter',
    designation: 'Administration',
    department: 'Management',
    status: 'Yet to check-in',
    image: '👨‍💼',
    seniority: '0 - 5 Years'
  },
  {
    id: 'S5',
    name: 'Andrew Turner',
    designation: 'Manager',
    department: 'Management',
    status: 'Yet to check-in',
    image: '👨‍💼',
    seniority: '5 - 10 Years'
  },
  {
    id: 'S6',
    name: 'Ember Johnson',
    designation: 'Assistant Manager',
    department: 'Management',
    status: 'Yet to check-in',
    image: '👨‍💼',
    seniority: '5 - 10 Years'
  },
  {
    id: 'S4',
    name: 'Ethen Anderson',
    designation: 'Manager',
    department: 'Operations',
    status: 'Yet to check-in',
    image: '👨‍💼',
    seniority: '5 - 10 Years'
  },
  {
    id: 'S9',
    name: 'Caspian Jones',
    designation: 'Team Member',
    department: 'Operations',
    status: 'Yet to check-in',
    image: '👨‍💼',
    seniority: '5 - 10 Years'
  },
  {
    id: 'S8',
    name: 'Asher Miller',
    designation: 'Assistant Manager',
    department: 'Operations',
    status: 'Yet to check-in',
    image: '👨‍💼',
    seniority: '5 - 10 Years'
  },
  {
    id: 'S7',
    name: 'Hazel Carter',
    designation: 'Assistant Manager',
    department: 'Operations',
    status: 'Yet to check-in',
    image: '👩‍💼',
    seniority: '5 - 10 Years'
  },
  {
    id: 'S14',
    name: 'Emily Jones',
    designation: 'Team Member',
    department: 'Operations',
    status: 'Yet to check-in',
    image: '👩‍💼',
    seniority: '5 - 10 Years'
  },
  {
    id: 'S15',
    name: 'Aparna Acharya',
    designation: 'Team Member',
    department: 'Operations',
    status: 'Yet to check-in',
    image: '👨‍💼',
    seniority: '5 - 10 Years'
  },
  {
    id: 'S18',
    name: 'William Smith',
    designation: 'Team Member',
    department: 'Sales',
    status: 'Yet to check-in',
    image: '👨‍💼',
    seniority: '5 - 10 Years'
  },
  {
    id: 'S13',
    name: 'Isabella Lopez',
    designation: 'Team Member',
    department: 'Sales',
    status: 'Yet to check-in',
    image: '👩‍💼',
    seniority: '5 - 10 Years'
  },
  {
    id: 'S11',
    name: 'Olivia Smith',
    designation: 'Team Member',
    department: 'Sales',
    status: 'Yet to check-in',
    image: '👩‍💼',
    seniority: '5 - 10 Years'
  },
  {
    id: 'S17',
    name: 'Amardeep Banjeet',
    designation: 'Team Member',
    department: 'Sales',
    status: 'Yet to check-in',
    image: '👨‍💼',
    seniority: '5 - 10 Years'
  },
  {
    id: 'S12',
    name: 'Sofia Rodriguez',
    designation: 'Team Member',
    department: 'Sales',
    status: 'Yet to check-in',
    image: '👩‍💼',
    seniority: '5 - 10 Years'
  },
  {
    id: 'S16',
    name: 'Andrea Garcia',
    designation: 'Team Member',
    department: 'Sales',
    status: 'Yet to check-in',
    image: '👩‍💼',
    seniority: '5 - 10 Years'
  },
  {
    id: 'S10',
    name: 'Lindon Smith',
    designation: 'Team Member',
    department: 'Sales',
    status: 'Yet to check-in',
    image: '👨‍💼',
    seniority: '5 - 10 Years'
  }
];

const EmployeeManagement = () => {
  const [activeTab, setActiveTab] = useState<'direct' | 'all'>('direct');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [kanbanGroupBy, setKanbanGroupBy] = useState<'seniority' | 'department' | 'designation'>('seniority');
  const [showKanbanMenu, setShowKanbanMenu] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('All Departments');
  const [filterDesignation, setFilterDesignation] = useState('All Designations');

  // Profile navigation state
  const [showProfile, setShowProfile] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const deptMatch = filterDepartment === 'All Departments' || emp.department === filterDepartment;
    const desigMatch = filterDesignation === 'All Designations' || emp.designation === filterDesignation;
    return deptMatch && desigMatch;
  });

  // Get employees for active tab
  const tabEmployees = activeTab === 'direct'
    ? filteredEmployees.filter(emp => ['S19', 'S2', 'S20', 'S3'].includes(emp.id))
    : filteredEmployees;

  // Group employees for kanban view
  const groupEmployees = () => {
    const groups: { [key: string]: Employee[] } = {};

    tabEmployees.forEach(emp => {
      let key = '';
      if (kanbanGroupBy === 'seniority') {
        key = emp.seniority;
      } else if (kanbanGroupBy === 'department') {
        key = emp.department;
      } else {
        key = emp.designation;
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(emp);
    });

    return groups;
  };

  // Handle employee click
  const handleEmployeeClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setShowProfile(true);
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

  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl shrink-0">
          {employee.image}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            onClick={() => handleEmployeeClick(employee.id)}
            className="font-semibold text-gray-900 text-sm truncate cursor-pointer hover:text-blue-600 transition-colors"
          >
            {employee.id} - {employee.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1 truncate">{employee.designation}</p>
          <p className="text-sm text-red-500 mt-1">{employee.status}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              👤
            </div>
            <h1 className="text-lg font-semibold text-gray-900">1 - mohamed</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
            {/* Tab Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('direct')}
                className={`px-3 py-2 md:px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'direct'
                    ? 'bg-blue-50 text-blue-600 border-2 border-blue-500'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Direct <span className="ml-1">4</span>
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-2 md:px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'all'
                    ? 'bg-blue-50 text-blue-600 border-2 border-blue-500'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                All <span className="ml-1">19</span>
              </button>
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-md p-1 ml-auto md:ml-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => {
                  setViewMode('kanban');
                  setShowKanbanMenu(false);
                }}
                className={`p-2 rounded relative ${viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2 ml-auto md:ml-0">
              <button className="p-2 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100">
                <Search size={18} />
              </button>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="p-2 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <Filter size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Group Menu */}
        {viewMode === 'kanban' && (
          <div className="mb-4 flex justify-end">
            <div className="relative">
              <button
                onClick={() => setShowKanbanMenu(!showKanbanMenu)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                Group by: {kanbanGroupBy.charAt(0).toUpperCase() + kanbanGroupBy.slice(1)}
                <ChevronDown size={16} />
              </button>

              {showKanbanMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      setKanbanGroupBy('seniority');
                      setShowKanbanMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Seniority
                  </button>
                  <button
                    onClick={() => {
                      setKanbanGroupBy('department');
                      setShowKanbanMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Department
                  </button>
                  <button
                    onClick={() => {
                      setKanbanGroupBy('designation');
                      setShowKanbanMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Designation
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter Modal - ShadCN Style */}
        {showFilter && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md h-full shadow-2xl animate-in slide-in-from-right duration-300">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900">Filter</h2>
                  <button
                    onClick={() => setShowFilter(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <div className="relative">
                      <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="w-full h-11 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm appearance-none cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option>All Departments</option>
                        <option>Management</option>
                        <option>Operations</option>
                        <option>Sales</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Designation
                    </label>
                    <div className="relative">
                      <select
                        value={filterDesignation}
                        onChange={(e) => setFilterDesignation(e.target.value)}
                        className="w-full h-11 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm appearance-none cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option>All Designations</option>
                        <option>Administration</option>
                        <option>Manager</option>
                        <option>Assistant Manager</option>
                        <option>Team Member</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <button
                    onClick={() => setShowFilter(false)}
                    className="flex-1 h-11 px-6 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setFilterDepartment('All Departments');
                      setFilterDesignation('All Designations');
                    }}
                    className="flex-1 h-11 px-6 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tabEmployees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-3">
            {tabEmployees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        )}

        {viewMode === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {Object.entries(groupEmployees()).map(([groupName, groupEmployees]) => (
              <div key={groupName} className="shrink-0 w-80 snap-center md:snap-align-none">
                <div className="bg-gray-100 rounded-lg p-4 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{groupName}</h3>
                    <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                      {groupEmployees.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {groupEmployees.map((employee) => (
                      <EmployeeCard key={employee.id} employee={employee} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;