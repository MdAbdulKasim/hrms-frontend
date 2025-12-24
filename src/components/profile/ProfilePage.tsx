// pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import ProfileTab from './tabs/ProfileTab';
import PeersTab from './tabs/PeersTab';
import LeaveTab from './tabs/LeaveTab';
import AttendanceTab from './tabs/AttendanceTab';
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

interface ProfilePageProps {
  employeeId?: string;
  onBack?: () => void;
}

export default function ProfilePage({ employeeId, onBack }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [employee, setEmployee] = useState<Employee>(mockEmployee);

  // Load employee data based on employeeId
  useEffect(() => {
    if (employeeId && mockEmployeeData[employeeId]) {
      setEmployee(mockEmployeeData[employeeId]);
    } else {
      setEmployee(mockEmployee);
    }
  }, [employeeId]);

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
      case 'time-logs':
        return (
          <div className="p-6 flex flex-col items-center justify-center min-h-96">
            <img src="/api/placeholder/200/200" alt="No data" className="w-48 h-48 mb-4" />
            <p className="text-gray-500">No time logs added for today</p>
          </div>
        );
      case 'career-history':
        return (
          <div className="p-6">
            <p className="text-gray-500">Career History content coming soon...</p>
          </div>
        );
      case 'department':
        return (
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <select className="border rounded px-4 py-2">
                <option>Management</option>
              </select>
              <select className="border rounded px-4 py-2">
                <option>Unspecified location</option>
              </select>
              <span className="text-gray-600 py-2">-</span>
              <span className="py-2 font-medium">5 Members</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">CEO</h3>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">1</span>
                </div>
                <div className="flex items-center gap-3">
                  <img src="/api/placeholder/40/40" alt="CEO" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-medium">1 - fathima</p>
                    <p className="text-sm text-red-500">Yet to check-in</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Administration</h3>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">4</span>
                </div>
                <div className="space-y-3">
                  {mockPeers.slice(0, 3).map((peer) => (
                    <div key={peer.id} className="flex items-center gap-3">
                      <img src="/api/placeholder/40/40" alt={peer.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-medium">{peer.employeeId} - {peer.name}</p>
                        <p className="text-sm text-red-500">{peer.checkInStatus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Profile Header */}
      <ProfileHeader employee={employee} />

      {/* Tabs */}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="bg-gray-50">
        {renderTabContent()}
      </div>
    </div>
  );
}