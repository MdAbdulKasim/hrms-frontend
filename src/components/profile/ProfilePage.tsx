// pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import ProfileTab from './tabs/ProfileTab';
import PeersTab from './tabs/PeersTab';
import LeaveTab from './tabs/LeaveTab';
import AttendanceTab from './tabs/AttendanceTab';
import DepartmentTab from './tabs/DepartmentTab';
import TimeTrackingTab from './tabs/TimeTrackingTab';
import { Employee, Education, Peer, LeaveBalance, AttendanceRecord } from './types';

// Mock data - replace with actual API calls
const mockEmployee: Employee = {
  id: '202479000000292291',
  employeeId: 'S19',
  firstName: 'Michael',
  lastName: 'Johnson',
  nickName: 'Mike',
  email: 'michaeljohnson@zylker.com',
  department: 'Management',
  designation: 'Administration',
  zohoRole: 'Team member',
  employmentType: 'Permanent',
  employeeStatus: 'Active',
  sourceOfHire: 'Web',
  dateOfJoining: '03-Jan-2004',
  currentExperience: '21 year(s) 11 month(s)',
  totalExperience: '21 year(s) 11 month(s)',
  reportingManager: '1 - fathima',
  workPhone: '727-555-4545',
  personalMobile: '239-221-8049',
  extension: '4',
  seatingLocation: 'FL_ADMIN_3',
  shift: 'General',
  shiftTiming: '09:00 AM - 06:00 PM',
  presentAddress: '360 NW, 98th St, Miami, Florida, UNITED STATES, 33150.',
  dateOfBirth: '05-Feb-1982',
  age: '43 year(s) 10 month(s)',
  gender: 'Male',
  maritalStatus: 'Married',
  profileImage: '/api/placeholder/120/120',
  checkInStatus: 'Yet to check-in',
};

const mockEmployeeData: Record<string, Employee> = {
  'S19': {
    ...mockEmployee,
    employeeId: 'S19',
    firstName: 'Michael',
    lastName: 'Johnson',
  },
  'S2': {
    ...mockEmployee,
    id: '202479000000292292',
    employeeId: 'S2',
    firstName: 'Lilly',
    lastName: 'Williams',
    designation: 'Administration',
    department: 'Administration',
  },
  'S20': {
    ...mockEmployee,
    id: '202479000000292293',
    employeeId: 'S20',
    firstName: 'Christopher',
    lastName: 'Brown',
    designation: 'Administration',
    department: 'Administration',
  },
  'S3': {
    ...mockEmployee,
    id: '202479000000292294',
    employeeId: 'S3',
    firstName: 'Clarkson',
    lastName: 'Walter',
    designation: 'Administration',
    department: 'Administration',
  },
  '1': {
    ...mockEmployee,
    id: '202479000000292295',
    employeeId: '1',
    firstName: 'fathima',
    lastName: '',
    designation: 'CEO',
    department: 'CEO',
    reportingManager: '', // CEO has no manager
  },
};

const mockEducation: Education[] = [
  {
    instituteName: 'Elmwood College',
    degree: 'Bachelors',
    specialization: 'Investment Management',
  },
];

const mockPeers: Peer[] = [
  {
    id: '1',
    employeeId: 'S2',
    name: 'Lilly Williams',
    designation: 'Administration',
    department: 'Administration',
    checkInStatus: 'Yet to check-in',
  },
  {
    id: '2',
    employeeId: 'S20',
    name: 'Christopher Brown',
    designation: 'Administration',
    department: 'Administration',
    checkInStatus: 'Yet to check-in',
  },
  {
    id: '3',
    employeeId: 'S3',
    name: 'Clarkson Walter',
    designation: 'Administration',
    department: 'Administration',
    checkInStatus: 'Yet to check-in',
  },
];

const mockLeaveBalances: LeaveBalance[] = [
  { type: 'Casual Leave', available: 12, booked: 0 },
  { type: 'Earned Leave', available: 12, booked: 0 },
  { type: 'Leave Without Pay', available: 0, booked: 0 },
  { type: 'Paternity Leave', available: 0, booked: 0 },
  { type: 'Sabbatical', available: 0, booked: 0 },
];

const mockAttendanceRecords: AttendanceRecord[] = [];

// Department members data
const mockDepartmentMembers = {
  ceo: [
    {
      id: '1',
      employeeId: '1',
      name: 'fathima',
      checkInStatus: 'Yet to check-in',
      profileImage: '/api/placeholder/40/40',
    }
  ],
  administration: [
    {
      id: '2',
      employeeId: 'S2',
      name: 'Lilly Williams',
      phone: '239-201-1816',
      checkInStatus: 'Yet to check-in',
      profileImage: '/api/placeholder/40/40',
    },
    {
      id: '3',
      employeeId: 'S3',
      name: 'Clarkson Walter',
      phone: '239-204-5678',
      checkInStatus: 'Yet to check-in',
      profileImage: '/api/placeholder/40/40',
    },
    {
      id: '4',
      employeeId: 'S19',
      name: 'Michael Johnson',
      phone: '239-221-8049',
      checkInStatus: 'Yet to check-in',
      profileImage: '/api/placeholder/40/40',
    },
    {
      id: '5',
      employeeId: 'S20',
      name: 'Christopher Brown',
      phone: '239-222-4567',
      checkInStatus: 'Yet to check-in',
      profileImage: '/api/placeholder/40/40',
    },
  ]
};

interface ProfilePageProps {
  employeeId?: string;
  onBack?: () => void;
}

export default function ProfilePage({ employeeId: initialEmployeeId, onBack }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [currentEmployeeId, setCurrentEmployeeId] = useState(initialEmployeeId || 'S19');
  const [employee, setEmployee] = useState<Employee>(mockEmployee);

  // Load employee data based on currentEmployeeId
  useEffect(() => {
    if (currentEmployeeId && mockEmployeeData[currentEmployeeId]) {
      setEmployee(mockEmployeeData[currentEmployeeId]);
    } else {
      setEmployee(mockEmployee);
    }
  }, [currentEmployeeId]);

  // Handle clicking on another employee
  const handleEmployeeClick = (employeeId: string) => {
    setCurrentEmployeeId(employeeId);
    setActiveTab('profile'); // Reset to profile tab when viewing a new employee
  };

  // Handle back button click
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      // Fallback: use browser back if no onBack prop provided
      window.history.back();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileTab
            employee={employee}
            education={mockEducation}
            dependents={[]}
          />
        );
      case 'peers':
        return (
          <PeersTab
            peers={mockPeers}
            managerName={employee.reportingManager}
            onEmployeeClick={handleEmployeeClick}
          />
        );
      case 'leave':
        return (
          <LeaveTab
            leaveBalances={mockLeaveBalances}
            year="This Year"
          />
        );
      case 'attendance':
        return (
          <AttendanceTab records={mockAttendanceRecords} />
        );
      case 'time-tracking':
        return <TimeTrackingTab />;
      case 'department':
        return (
          <DepartmentTab
            department="Management"
            location="Unspecified location"
            ceoMembers={mockDepartmentMembers.ceo}
            administrationMembers={mockDepartmentMembers.administration}
            onEmployeeClick={handleEmployeeClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b px-6 py-4">
        <button 
          onClick={handleBackClick}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Profile Header */}
      <ProfileHeader employee={employee} onEmployeeClick={handleEmployeeClick} />

      {/* Tabs */}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="bg-gray-50">
        {renderTabContent()}
      </div>
    </div>
  );
}