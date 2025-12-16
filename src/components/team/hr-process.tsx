'use client';
import React, { useState } from 'react';
import { X, ChevronDown, Search, Menu, Plus, Calendar, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Types
type ProcessType = 'Department Change' | 'Location Change' | 'Designation Change';
type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

interface Process {
  id: string;
  name: ProcessType;
  description: string;
  icon: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface ProcessRequest {
  id: string;
  employee: Employee;
  department: string;
  location?: string;
  designation?: string;
  reportingManager: string;
  effectiveDate: string;
  reason: string;
  status: ApprovalStatus;
  processType: ProcessType;
  createdAt: string;
}

const processes: Process[] = [
  {
    id: 'dc',
    name: 'Department Change',
    description: 'This process is used by reporting managers to initiate the team change process.',
    icon: 'DC'
  },
  {
    id: 'lc',
    name: 'Location Change',
    description: 'This process is used by reporting managers to initiate the location change process.',
    icon: 'LC'
  },
  {
    id: 'pp',
    name: 'Designation Change',
    description: 'This process is used by reporting managers to raise a designation change for their reportees',
    icon: 'PP'
  }
];

const availableEmployees: Employee[] = [
  { id: 'S10', name: 'Lindon Smith', email: 'lindonsmith@zylker.com', role: 'Team member' },
  { id: 'S11', name: 'John Doe', email: 'johndoe@zylker.com', role: 'Team member' },
  { id: 'S12', name: 'Jane Smith', email: 'janesmith@zylker.com', role: 'Senior Developer' },
];

const departments = ['HR', 'MANAGEMENT', 'MARKETING', 'IT'];
const locations = ['New York', 'San Francisco', 'London', 'Mumbai'];
const designations = ['Assistant Manager', 'Manager', 'Senior Manager', 'Team Lead', 'Senior Developer'];
const reportingManagers = ['S2 Lilly Williams', 'S3 CLARKSON WALTER', 'S4 Emma Johnson', 'S5 Michael Brown'];

export default function HRProcessManager() {
  const [selectedProcess, setSelectedProcess] = useState<string>('All');
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [currentProcess, setCurrentProcess] = useState<Process | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [currentEmployeeIndex, setCurrentEmployeeIndex] = useState(0);
  const [processRequests, setProcessRequests] = useState<ProcessRequest[]>([]);
  const [currentRequest, setCurrentRequest] = useState<ProcessRequest | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 11, 16)); // Dec 16, 2025
  
  // Form state
  const [formData, setFormData] = useState({
    department: '',
    location: '',
    designation: '',
    reportingManager: '',
    effectiveDate: '16-Dec-2025',
    reason: ''
  });

  const handleInitiateProcess = () => {
    setShowProcessModal(true);
  };

  const handleProcessSelect = (process: Process) => {
    setCurrentProcess(process);
    setShowProcessModal(false);
    setShowEmployeeModal(true);
    setSelectedEmployees([]);
    setCurrentEmployeeIndex(0);
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployees([employee]);
  };

  const handleNextFromEmployeeSelection = () => {
    if (selectedEmployees.length > 0) {
      setShowEmployeeModal(false);
      setShowDetailsModal(true);
      setFormData({
        department: '',
        location: '',
        designation: '',
        reportingManager: '',
        effectiveDate: '16-Dec-2025',
        reason: ''
      });
    }
  };

  const handleAddMoreEmployees = () => {
    setShowDetailsModal(false);
    setShowEmployeeModal(true);
  };

  const handleSubmitRequest = () => {
    const newRequest: ProcessRequest = {
      id: `REQ-${Date.now()}`,
      employee: selectedEmployees[currentEmployeeIndex],
      department: formData.department,
      location: formData.location,
      designation: formData.designation,
      reportingManager: formData.reportingManager,
      effectiveDate: formData.effectiveDate,
      reason: formData.reason,
      status: 'Pending',
      processType: currentProcess?.name || 'Department Change',
      createdAt: new Date().toISOString()
    };
    
    setProcessRequests([...processRequests, newRequest]);
    setCurrentRequest(newRequest);
    setShowDetailsModal(false);
    setShowViewModal(true);
  };

  const handleViewClick = () => {
    setShowViewModal(false);
    setShowTimelineModal(true);
  };

  const handleApprove = () => {
    if (currentRequest) {
      const updatedRequests = processRequests.map(req =>
        req.id === currentRequest.id ? { ...req, status: 'Approved' as ApprovalStatus } : req
      );
      setProcessRequests(updatedRequests);
      setCurrentRequest({ ...currentRequest, status: 'Approved' });
    }
  };

  const handleReject = () => {
    if (currentRequest) {
      const updatedRequests = processRequests.map(req =>
        req.id === currentRequest.id ? { ...req, status: 'Rejected' as ApprovalStatus } : req
      );
      setProcessRequests(updatedRequests);
      setCurrentRequest({ ...currentRequest, status: 'Rejected' });
    }
  };

  const handleFilterClick = () => {
    setShowFilterModal(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
    setFormData({...formData, effectiveDate: formattedDate});
    setShowCalendar(false);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Previous month's days
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, isPrevMonth: true });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, isPrevMonth: false });
    }

    // Next month's days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, isPrevMonth: false });
    }

    return days;
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           selectedDate.getMonth() === today.getMonth() && 
           selectedDate.getFullYear() === today.getFullYear();
  };

  const isSelectedDay = (day: number) => {
    const formattedDay = parseInt(formData.effectiveDate.split('-')[0]);
    return day === formattedDay && selectedDate.getMonth() === 11 && selectedDate.getFullYear() === 2025;
  };

  const filteredEmployees = availableEmployees.filter(emp =>
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.id.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'Approved': return 'text-green-600 bg-green-50';
      case 'Rejected': return 'text-red-600 bg-red-50';
      case 'Pending': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium">Process</span>
              <div className="relative">
                <select 
                  value={selectedProcess}
                  onChange={(e) => setSelectedProcess(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>All</option>
                  <option>Department Change</option>
                  <option>Location Change</option>
                  <option>Designation Change</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleInitiateProcess}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium transition-colors"
            >
              Initiate Process
            </button>
            <button 
              onClick={handleFilterClick}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-600">
            <div>Status</div>
            <div>Employee</div>
            <div>Key Field</div>
            <div>Value</div>
            <div>Effective date</div>
            <div>Process</div>
            <div>Reason</div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {processRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="mb-6">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="80" r="35" fill="#E8EEFF" />
              <circle cx="100" cy="80" r="30" fill="white" />
              <circle cx="105" cy="78" r="8" fill="#3B82F6" />
              <path d="M70 95 Q70 110 85 110 L115 110 Q130 110 130 95" stroke="#3B82F6" strokeWidth="3" fill="none" />
              <rect x="75" y="95" width="50" height="8" fill="#3B82F6" rx="4" />
              <rect x="75" y="108" width="50" height="8" fill="#3B82F6" rx="4" />
              <rect x="75" y="121" width="50" height="8" fill="#3B82F6" rx="4" />
              <path d="M130 100 L145 115 L160 85" stroke="#3B82F6" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="70" cy="70" r="3" fill="#93C5FD" />
              <circle cx="135" cy="65" r="3" fill="#93C5FD" />
              <circle cx="130" cy="120" r="3" fill="#93C5FD" />
              <line x1="165" y1="75" x2="168" y2="72" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No records found</p>
        </div>
      ) : (
        <div className="bg-white">
          {processRequests.map((request) => (
            <div key={request.id} className="px-6 py-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                 onClick={() => {
                   setCurrentRequest(request);
                   setShowViewModal(true);
                 }}>
              <div className="grid grid-cols-7 gap-4 text-sm">
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <div className="font-medium text-gray-900">{request.employee.name}</div>
                <div className="text-gray-600">
                  {request.processType === 'Designation Change' ? 'Designation' : 'Department'}
                </div>
                <div className="text-gray-900">
                  {request.processType === 'Designation Change' ? request.designation : request.department}
                </div>
                <div className="text-gray-600">{request.effectiveDate}</div>
                <div className="text-gray-900">{request.processType}</div>
                <div className="text-gray-600 truncate">{request.reason}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Process Selection Modal */}
      <Dialog open={showProcessModal} onOpenChange={setShowProcessModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>HR Process</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {processes.map((process) => (
              <button
                key={process.id}
                onClick={() => handleProcessSelect(process)}
                className="w-full flex items-start gap-4 p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-semibold ${
                  process.id === 'dc' ? 'bg-blue-100 text-blue-600' :
                  process.id === 'lc' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {process.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{process.name}</h3>
                  <p className="text-gray-600">{process.description}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Employee Selection Modal */}
      <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{currentProcess?.name}</DialogTitle>
          </DialogHeader>
          <div>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-3">Select employees</label>
              <input
                type="text"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                placeholder="Enter employee name or ID number"
                className="w-full px-4 py-3 border-2 border-blue-400 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <div className="bg-gray-100 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-2 gap-4 px-4 py-3 text-sm font-medium text-gray-600 border-b border-gray-200">
                  <div>User (Total : {filteredEmployees.length})</div>
                  <div>Role</div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => handleEmployeeSelect(employee)}
                      className={`grid grid-cols-2 gap-4 px-4 py-4 cursor-pointer hover:bg-blue-50 border-b border-gray-200 last:border-b-0 ${
                        selectedEmployees.some(e => e.id === employee.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{employee.id} - {employee.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">{employee.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
              <p className="text-sm text-gray-700">
                In order to initiate a HR Process, date of joining is mandatory. Only employees with valid date of joining records will be listed here.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleNextFromEmployeeSelection}
                disabled={selectedEmployees.length === 0}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-medium transition-colors"
              >
                Next
              </button>
              <button 
                onClick={() => setShowEmployeeModal(false)}
                className="text-gray-600 hover:text-gray-800 px-6 py-2 rounded font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* HR Process Request Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentProcess?.name}</DialogTitle>
          </DialogHeader>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">HR Process request details</h3>
            
            <p className="text-gray-700 mb-4">Initiate HR Process for the selected employees:</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedEmployees.map((employee, index) => (
                  <div key={employee.id} className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                ))}
              </div>
              <button 
                onClick={handleAddMoreEmployees}
                className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {currentProcess?.name === 'Designation Change' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Designation <span className="text-red-500">*</span>
                    <button className="ml-2 text-gray-400 hover:text-gray-600">
                      <Info className="w-4 h-4 inline" />
                    </button>
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                      className="appearance-none w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      {designations.map(desig => (
                        <option key={desig} value={desig}>{desig}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              )}

              {currentProcess?.name !== 'Designation Change' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Department <span className="text-red-500">*</span>
                    <button className="ml-2 text-gray-400 hover:text-gray-600">
                      <Info className="w-4 h-4 inline" />
                    </button>
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="appearance-none w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              )}

              {currentProcess?.name === 'Location Change' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Location</label>
                  <div className="relative">
                    <select 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="appearance-none w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              )}

              {currentProcess?.name !== 'Designation Change' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Reporting Manager</label>
                  <div className="relative">
                    <select 
                      value={formData.reportingManager}
                      onChange={(e) => setFormData({...formData, reportingManager: e.target.value})}
                      className="appearance-none w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      {reportingManagers.map(manager => (
                        <option key={manager} value={manager}>{manager}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Process date and reason</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Select effective date: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.effectiveDate}
                    readOnly
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 cursor-pointer"
                  />
                  <Calendar 
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer" 
                  />
                  
                  {showCalendar && (
                    <div className="absolute z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
                      {/* Calendar Header */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => changeMonth(-1)}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <ChevronDown className="w-5 h-5 rotate-90" />
                        </button>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                        <button
                          onClick={() => changeMonth(1)}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <ChevronDown className="w-5 h-5 -rotate-90" />
                        </button>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {/* Day Headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                            {day}
                          </div>
                        ))}
                        
                        {/* Calendar Days */}
                        {generateCalendarDays().map((dayObj, index) => {
                          const isCurrentMonthDay = dayObj.isCurrentMonth;
                          const isTodayDay = isCurrentMonthDay && isToday(dayObj.day);
                          const isSelected = isCurrentMonthDay && isSelectedDay(dayObj.day);
                          
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                if (isCurrentMonthDay) {
                                  const newDate = new Date(selectedDate);
                                  newDate.setDate(dayObj.day);
                                  handleDateSelect(newDate);
                                } else if (dayObj.isPrevMonth) {
                                  const newDate = new Date(selectedDate);
                                  newDate.setMonth(newDate.getMonth() - 1);
                                  newDate.setDate(dayObj.day);
                                  handleDateSelect(newDate);
                                } else {
                                  const newDate = new Date(selectedDate);
                                  newDate.setMonth(newDate.getMonth() + 1);
                                  newDate.setDate(dayObj.day);
                                  handleDateSelect(newDate);
                                }
                              }}
                              className={`
                                p-2 text-sm rounded hover:bg-blue-50 transition-colors
                                ${!isCurrentMonthDay ? 'text-gray-400' : 'text-gray-900'}
                                ${isTodayDay ? 'bg-blue-100 font-semibold' : ''}
                                ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                              `}
                            >
                              {dayObj.day}
                            </button>
                          );
                        })}
                      </div>

                      {/* Today Button */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleDateSelect(new Date())}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition-colors"
                        >
                          Today
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Enter the reason for change: <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleSubmitRequest}
                disabled={
                  (currentProcess?.name === 'Designation Change' && !formData.designation) ||
                  (currentProcess?.name !== 'Designation Change' && (!formData.department || !formData.reportingManager)) ||
                  !formData.reason
                }
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-medium transition-colors"
              >
                Submit
              </button>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-600 hover:text-gray-800 px-6 py-2 rounded font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Request Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{currentProcess?.name}</DialogTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentRequest?.status === 'Pending' ? 'bg-orange-500' : currentRequest?.status === 'Approved' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-gray-700">{currentRequest?.status}</span>
                </div>
                <button 
                  onClick={handleViewClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Employee</h3>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                  {currentRequest?.employee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{currentRequest?.employee.id} - {currentRequest?.employee.name}</div>
                  <div className="text-sm text-gray-600">{currentRequest?.employee.email}</div>
                </div>
              </div>
            </div>

            {currentRequest?.processType === 'Designation Change' ? (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  Designation
                  <button className="ml-2 text-gray-400 hover:text-gray-600">
                    <Info className="w-4 h-4 inline" />
                  </button>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900">{currentRequest?.designation}</p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-3">
                    Department
                    <button className="ml-2 text-gray-400 hover:text-gray-600">
                      <Info className="w-4 h-4 inline" />
                    </button>
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">{currentRequest?.department}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-3">Reporting Manager</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">{currentRequest?.reportingManager}</p>
                  </div>
                </div>
              </>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Effective date</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">{currentRequest?.effectiveDate}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Reason</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">{currentRequest?.reason}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Timeline Modal */}
      <Dialog open={showTimelineModal} onOpenChange={setShowTimelineModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Approval Timeline</DialogTitle>
          </DialogHeader>
          <div>
            <div className="mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                  {currentRequest?.employee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-gray-900 font-medium">{currentRequest?.employee.id} - {currentRequest?.employee.name}'s request has been sent for approval</p>
                  <p className="text-sm text-gray-500">16-Dec-2025  12:33 PM</p>
                </div>
              </div>

              {currentRequest?.status === 'Pending' && (
                <div className="ml-6 pl-6 border-l-2 border-gray-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-3 h-3 rounded-full bg-orange-500 -ml-[37px] mt-2"></div>
                    <div className="flex-1">
                      <p className="text-orange-600 font-medium mb-4">Pending</p>
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">👤</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Admin</p>
                          <p className="text-sm text-gray-600">Role</p>
                        </div>
                      </div>

                      <textarea
                        placeholder="Write a comment..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 mb-4 resize-none"
                      />

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={handleApprove}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium transition-colors"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={handleReject}
                          className="border border-red-300 text-red-600 hover:bg-red-50 px-6 py-2 rounded font-medium transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentRequest?.status === 'Approved' && (
                <div className="ml-6 pl-6 border-l-2 border-gray-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 -ml-[37px] mt-2"></div>
                    <div className="flex-1">
                      <p className="text-green-600 font-medium mb-2">Approved</p>
                      <p className="text-sm text-gray-500 mb-4">16-Dec-2025  12:35 PM</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 text-sm font-medium">👤</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">1 - mohamed</p>
                            <p className="text-sm text-gray-600">farhanbasheerfarhan399@gmail.com</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 italic">On behalf of</span>
                          <div className="flex items-start gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 text-xs font-medium">👤</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Admin</p>
                              <p className="text-xs text-gray-600">Role</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 text-sm">👤</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">mohamed</p>
                            <p className="text-gray-700 mt-1">Approved</p>
                            <div className="flex items-center gap-3 mt-2">
                              <p className="text-sm text-gray-500">Today 12:35 PM</p>
                              <button className="text-sm text-gray-600 hover:text-gray-800">Like</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 text-sm">👤</span>
              </div>
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Modal */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="fixed right-0 top-0 h-full max-w-md translate-x-0 translate-y-0 rounded-none border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
          <DialogHeader>
            <DialogTitle>Filter</DialogTitle>
          </DialogHeader>
          <div className="mt-6 pr-4">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Field Search"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-6">
              <button className="flex items-center justify-between w-full py-3 text-left">
                <span className="text-lg font-semibold text-gray-900">System Filter</span>
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Approval Status</label>
                <div className="relative">
                  <select className="appearance-none w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500">
                    <option>All Requests</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                    <option>Pending</option>
                    <option>Drafts</option>
                    <option>Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Employee</label>
                <input
                  type="text"
                  placeholder="Employee"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Employee Status</label>
                <div className="relative">
                  <select className="appearance-none w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500">
                    <option>All Requests</option>
                    <option>All Active Employee Requests</option>
                    <option>Ex-Employee Requests</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
            <div className="flex items-center gap-3">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded font-medium transition-colors">
                Apply
              </button>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="text-gray-600 hover:text-gray-800 px-8 py-3 rounded font-medium transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}