// pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
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
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import employeeService, { EmployeeUpdateData } from '@/lib/employeeService';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<EmployeeUpdateData>({});
  const [saving, setSaving] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  // Load employee data based on currentEmployeeId
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = getAuthToken();
        const orgId = getOrgId();
        const apiUrl = getApiUrl();

        if (!token || !currentEmployeeId || !orgId) return;

        // Fetch employee details
        const empRes = await axios.get(`${apiUrl}/org/${orgId}/employees/${currentEmployeeId}`, {
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
        const peersRes = await axios.get(`${apiUrl}/org/${orgId}/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const peersData = peersRes.data.data || peersRes.data;
        setPeers((Array.isArray(peersData) ? peersData : []).slice(0, 5).map((p: any) => ({
          id: p.id || p._id,
          employeeId: p.employeeId || p.id,
          name: p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email,
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
 
  // Handle edit employee - open modal with current data
  const handleEditEmployee = () => {
    if (!employee) return;
    
    // Pre-populate form with existing employee data
    setEditFormData({
      fullName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
      email: employee.email,
      phoneNumber: employee.personalMobile || employee.workPhone,
      gender: employee.gender as any,
      maritalStatus: employee.maritalStatus as any,
      dateOfBirth: employee.dateOfBirth,
      bloodGroup: '',
      presentAddressLine1: employee.presentAddress,
      shiftType: employee.shift as any,
      status: employee.employeeStatus,
      UAN: employee.uan,
      PAN: employee.pan,
      aadharNumber: employee.aadhaar,
    });
    setIsEditModalOpen(true);
  };

  // Handle save employee updates
  const handleSaveEmployee = async () => {
    if (!employee) return;
    
    const orgId = getOrgId();
    if (!orgId) {
      alert('Organization not found');
      return;
    }

    setSaving(true);
    try {
      let result;
      if (profilePicFile) {
        result = await employeeService.updateWithProfilePic(orgId, employee.id, editFormData, profilePicFile);
      } else {
        result = await employeeService.update(orgId, employee.id, editFormData);
      }

      if (result.error) {
        alert(`Failed to update: ${result.error}`);
      } else {
        alert('Employee updated successfully!');
        setIsEditModalOpen(false);
        setProfilePicFile(null);
        // Refresh employee data
        setCurrentEmployeeId(employee.id);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  // Handle form field changes
  const handleEditFormChange = (field: keyof EmployeeUpdateData, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle delete employee
  const handleDeleteEmployee = () => {
    if (!employee) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`
    );
    if (!confirmed) return;

    const handleDelete = async () => {
      const orgId = getOrgId();
      if (!orgId) {
        alert('Organization not found');
        return;
      }

      try {
        const result = await employeeService.delete(orgId, employee.id);

        if (result.error) {
          alert(`Failed to delete: ${result.error}`);
        } else {
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

      {/* Edit Employee Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Edit Employee Details</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePicFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Basic Info Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editFormData.fullName || ''}
                      onChange={(e) => handleEditFormChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => handleEditFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editFormData.phoneNumber || ''}
                      onChange={(e) => handleEditFormChange('phoneNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                    <input
                      type="text"
                      value={editFormData.bloodGroup || ''}
                      onChange={(e) => handleEditFormChange('bloodGroup', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., O+, A-, B+"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Info Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editFormData.dateOfBirth || ''}
                      onChange={(e) => handleEditFormChange('dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      value={editFormData.gender || ''}
                      onChange={(e) => handleEditFormChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                    <select
                      value={editFormData.maritalStatus || ''}
                      onChange={(e) => handleEditFormChange('maritalStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Present Address Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Present Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value={editFormData.presentAddressLine1 || ''}
                      onChange={(e) => handleEditFormChange('presentAddressLine1', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={editFormData.presentAddressLine2 || ''}
                      onChange={(e) => handleEditFormChange('presentAddressLine2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editFormData.presentCity || ''}
                      onChange={(e) => handleEditFormChange('presentCity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={editFormData.presentState || ''}
                      onChange={(e) => handleEditFormChange('presentState', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={editFormData.presentCountry || ''}
                      onChange={(e) => handleEditFormChange('presentCountry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={editFormData.presentPinCode || ''}
                      onChange={(e) => handleEditFormChange('presentPinCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Permanent Address Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Permanent Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value={editFormData.permanentAddressLine1 || ''}
                      onChange={(e) => handleEditFormChange('permanentAddressLine1', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={editFormData.permanentAddressLine2 || ''}
                      onChange={(e) => handleEditFormChange('permanentAddressLine2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editFormData.permanentCity || ''}
                      onChange={(e) => handleEditFormChange('permanentCity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={editFormData.permanentState || ''}
                      onChange={(e) => handleEditFormChange('permanentState', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={editFormData.permanentCountry || ''}
                      onChange={(e) => handleEditFormChange('permanentCountry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={editFormData.permanentPinCode || ''}
                      onChange={(e) => handleEditFormChange('permanentPinCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={editFormData.emergencyContactName || ''}
                      onChange={(e) => handleEditFormChange('emergencyContactName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                    <input
                      type="text"
                      value={editFormData.emergencyContactRelation || ''}
                      onChange={(e) => handleEditFormChange('emergencyContactRelation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Spouse, Parent, Sibling"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                      type="tel"
                      value={editFormData.emergencyContactNumber || ''}
                      onChange={(e) => handleEditFormChange('emergencyContactNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Work Info Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Work Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                    <select
                      value={editFormData.empType || ''}
                      onChange={(e) => handleEditFormChange('empType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="permanent">Permanent</option>
                      <option value="temporary">Temporary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
                    <select
                      value={editFormData.shiftType || ''}
                      onChange={(e) => handleEditFormChange('shiftType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Shift</option>
                      <option value="morning">Morning</option>
                      <option value="evening">Evening</option>
                      <option value="night">Night</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
                    <input
                      type="date"
                      value={editFormData.dateOfJoining || ''}
                      onChange={(e) => handleEditFormChange('dateOfJoining', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                    <input
                      type="text"
                      value={editFormData.timeZone || ''}
                      onChange={(e) => handleEditFormChange('timeZone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Asia/Kolkata"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Position</label>
                    <select
                      value={editFormData.teamPosition || ''}
                      onChange={(e) => handleEditFormChange('teamPosition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Position</option>
                      <option value="lead">Lead</option>
                      <option value="member">Member</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <input
                      type="text"
                      value={editFormData.status || ''}
                      onChange={(e) => handleEditFormChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Active, On Leave"
                    />
                  </div>
                </div>
              </div>

              {/* Identity Documents Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Identity Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UAN</label>
                    <input
                      type="text"
                      value={editFormData.UAN || ''}
                      onChange={(e) => handleEditFormChange('UAN', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PAN</label>
                    <input
                      type="text"
                      value={editFormData.PAN || ''}
                      onChange={(e) => handleEditFormChange('PAN', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                    <input
                      type="text"
                      value={editFormData.aadharNumber || ''}
                      onChange={(e) => handleEditFormChange('aadharNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                    <input
                      type="text"
                      value={editFormData.passportNumber || ''}
                      onChange={(e) => handleEditFormChange('passportNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driving License Number</label>
                    <input
                      type="text"
                      value={editFormData.drivingLicenseNumber || ''}
                      onChange={(e) => handleEditFormChange('drivingLicenseNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white flex items-center justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors font-medium"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEmployee}
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

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