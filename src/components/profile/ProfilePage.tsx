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
import axios from 'axios';
import { getApiUrl, getAuthToken } from '@/lib/auth';

interface ProfilePageProps {
  employeeId?: string;
  onBack?: () => void;
}

export default function ProfilePage({ employeeId: initialEmployeeId, onBack }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [currentEmployeeId, setCurrentEmployeeId] = useState(initialEmployeeId || 'S19');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load employee data based on currentEmployeeId
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = getAuthToken();
        const apiUrl = getApiUrl();

        if (!token || !currentEmployeeId) return;

        // Fetch employee details
        const empRes = await axios.get(`${apiUrl}/employees/${currentEmployeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const empData = empRes.data.data || empRes.data;
        setEmployee({
          id: empData.id || empData._id,
          employeeId: empData.employeeId || empData.id,
          firstName: empData.firstName || '',
          lastName: empData.lastName || '',
          nickName: empData.nickName || '',
          email: empData.email || '',
          department: empData.department?.name || empData.department || '',
          designation: empData.designation?.name || empData.designation || '',
          zohoRole: empData.role || '',
          employmentType: empData.employmentType || '',
          employeeStatus: empData.status || 'Active',
          sourceOfHire: empData.sourceOfHire || '',
          dateOfJoining: empData.dateOfJoining || '',
          currentExperience: empData.currentExperience || '',
          totalExperience: empData.totalExperience || '',
          reportingManager: empData.reportingManager || '',
          workPhone: empData.workPhone || '',
          personalMobile: empData.personalMobile || '',
          extension: empData.extension || '',
          seatingLocation: empData.seatingLocation || '',
          shift: empData.shift || '',
          shiftTiming: empData.shiftTiming || '',
          presentAddress: empData.presentAddress || '',
          dateOfBirth: empData.dateOfBirth || '',
          age: empData.age || '',
          gender: empData.gender || '',
          maritalStatus: empData.maritalStatus || '',
          profileImage: empData.profileImage || '/api/placeholder/120/120',
          checkInStatus: 'Yet to check-in' // Default
        });

        // Fetch education (if available)
        setEducation([]); // Placeholder

        // Fetch peers (team members)
        const peersRes = await axios.get(`${apiUrl}/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const peersData = peersRes.data.data || peersRes.data;
        setPeers(peersData.slice(0, 5).map((p: any) => ({
          id: p.id || p._id,
          employeeId: p.employeeId || p.id,
          name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email,
          designation: p.designation?.name || p.designation || '',
          department: p.department?.name || p.department || '',
          checkInStatus: 'Yet to check-in'
        })));

        // Fetch leave balances
        setLeaveBalances([
          { type: 'Casual Leave', available: 12, booked: 0 },
          { type: 'Earned Leave', available: 12, booked: 0 },
          { type: 'Leave Without Pay', available: 0, booked: 0 },
          { type: 'Paternity Leave', available: 0, booked: 0 },
          { type: 'Sabbatical', available: 0, booked: 0 },
        ]);

        // Fetch attendance records
        setAttendanceRecords([]);

      } catch (error) {
        console.error('Error fetching employee data:', error);
        setEmployee(null);
        setEducation([]);
        setPeers([]);
        setLeaveBalances([]);
        setAttendanceRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
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
 
  // Handle edit employee
  const handleEditEmployee = () => {
    if (!employee) return;
    
    const confirmed = window.confirm(`Edit employee: ${employee.firstName} ${employee.lastName}?`);
    if (!confirmed) return;

    // Show edit form (placeholder for now)
    const newFirstName = window.prompt('First Name:', employee.firstName);
    if (newFirstName === null) return;

    const newLastName = window.prompt('Last Name:', employee.lastName);
    if (newLastName === null) return;

    const handleUpdate = async () => {
      try {
        const token = getAuthToken();
        const apiUrl = getApiUrl();

        if (!token || !employee.id) return;

        const updateData = {
          firstName: newFirstName || employee.firstName,
          lastName: newLastName || employee.lastName,
          // Add more fields as needed
        };

        const response = await axios.put(
          `${apiUrl}/employees/${employee.id}`,
          updateData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200 || response.status === 201) {
          alert('Employee updated successfully!');
          // Refresh employee data
          setCurrentEmployeeId(employee.id);
        }
      } catch (error) {
        console.error('Error updating employee:', error);
        alert('Failed to update employee. Check console for details.');
      }
    };

    handleUpdate();
  };

  // Handle delete employee
  const handleDeleteEmployee = () => {
    if (!employee) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`
    );
    if (!confirmed) return;

    const handleDelete = async () => {
      try {
        const token = getAuthToken();
        const apiUrl = getApiUrl();

        if (!token || !employee.id) return;

        const response = await axios.delete(
          `${apiUrl}/employees/${employee.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200 || response.status === 204) {
          alert('Employee deleted successfully!');
          // Go back after deletion
          if (onBack) {
            onBack();
          } else {
            window.history.back();
          }
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee. Check console for details.');
      }
    };

    handleDelete();
  };

  const renderTabContent = () => {
    if (!employee) return <div>Loading...</div>;

    switch (activeTab) {
      case 'profile':
        return (
          <ProfileTab
            employee={employee}
            education={education}
            dependents={[]}
          />
        );
      case 'peers':
        return (
          <PeersTab
            peers={peers}
            managerName={employee.reportingManager}
            onEmployeeClick={handleEmployeeClick}
          />
        );
      case 'leave':
        return (
          <LeaveTab
            leaveBalances={leaveBalances}
            year="This Year"
          />
        );
      case 'attendance':
        return (
          <AttendanceTab records={attendanceRecords} />
        );
      case 'time-tracking':
        return <TimeTrackingTab />;
      case 'department':
        return (
          <DepartmentTab
            department="Management"
            location="Unspecified location"
            ceoMembers={[]}
            administrationMembers={[]}
            onEmployeeClick={handleEmployeeClick}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!employee) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Employee not found</div>;
  }

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
      <ProfileHeader 
        employee={employee} 
        onEmployeeClick={handleEmployeeClick}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
      />

      {/* Tabs */}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="bg-gray-50">
        {renderTabContent()}
      </div>
    </div>
  );
}