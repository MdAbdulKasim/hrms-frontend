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
import { CustomAlertDialog, ConfirmDialog } from '@/components/ui/custom-dialogs';

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

  // Dialog States
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });
  const [confirmState, setConfirmState] = useState<{ open: boolean, title: string, description: string, onConfirm: () => void }>({
    open: false, title: "", description: "", onConfirm: () => { }
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

  const showConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmState({ open: true, title, description, onConfirm });
  };

  // Load employee data based on currentEmployeeId
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = getAuthToken()
        const orgId = getOrgId()
        const employeeId = propEmployeeId || getEmployeeId()
        const apiUrl = getApiUrl()

        if (!token || !orgId || !employeeId) {
          console.error("Authentication, organization ID, or employee ID missing")
          return
        }

        const response = await axios.get(`${apiUrl}/org/${orgId}/employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const employee = response.data?.data || response.data

        setFormData({
          fullName: employee.fullName || (employee.firstName && employee.lastName ? `${employee.firstName} ${employee.lastName}`.trim() : ""),
          emailAddress: employee.email || "",
          mobileNumber: employee.phoneNumber || employee.mobileNumber || "",
          role: employee.role || "",
          department: employee.department?.departmentName || employee.department?.name || "",
          designation: employee.designation?.name || "",
          reportingTo: employee.reportingTo?.fullName || (employee.reportingTo?.firstName && employee.reportingTo?.lastName ? `${employee.reportingTo.firstName} ${employee.reportingTo.lastName}`.trim() : employee.reportingTo?.name || ""),
          teamPosition: employee.teamPosition || "",
          shift: employee.shiftType || employee.shift || "",
          location: employee.location?.name || "",
          timeZone: employee.timeZone || "",
          dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split("T")[0] : "",
          gender: employee.gender || "",
          maritalStatus: employee.maritalStatus || "",
          bloodGroup: employee.bloodGroup || "",
          uan: employee.UAN || "",
          pan: employee.PAN || "",
          aadhaarNumber: employee.aadharNumber || "",
          passportNumber: employee.passportNumber || "",
          drivingLicenseNumber: employee.drivingLicenseNumber || "",
          workExperience: (employee.experience || []).map((exp: any) => ({
            companyName: exp.companyName || "",
            jobTitle: exp.jobTitle || "",
            fromDate: exp.fromDate ? exp.fromDate.split("T")[0] : "",
            toDate: exp.toDate ? exp.toDate.split("T")[0] : "",
            currentlyWorkHere: !exp.toDate,
            jobDescription: exp.jobDescription || "",
          })),
          presentAddress: {
            addressLine1: employee.presentAddressLine1 || "",
            addressLine2: employee.presentAddressLine2 || "",
            city: employee.presentCity || "",
            state: employee.presentState || "",
            country: employee.presentCountry || "",
            pinCode: employee.presentPinCode || "",
          },
          sameAsPresentAddress: false,
          permanentAddress: {
            addressLine1: employee.permanentAddressLine1 || "",
            addressLine2: employee.permanentAddressLine2 || "",
            city: employee.permanentCity || "",
            state: employee.permanentState || "",
            country: employee.permanentCountry || "",
            pinCode: employee.permanentPinCode || "",
          },
          emergencyContact: {
            contactName: employee.emergencyContactName || "",
            relation: employee.emergencyContactRelation || "",
            contactNumber: employee.emergencyContactNumber || "",
          },
          education: (employee.education || []).map((edu: any) => ({
            instituteName: edu.instituteName || "",
            degree: edu.degree || "",
            fieldOfStudy: edu.specialization || "",
            startYear: edu.startYear || "",
            endYear: edu.dateOfCompletion ? new Date(edu.dateOfCompletion).getFullYear().toString() : "",
          })),
        })

        try {
          const picResponse = await axios.get(`${apiUrl}/org/${orgId}/employees/${employeeId}/profile-pic`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (picResponse.data.success && picResponse.data.imageUrl) {
            setProfilePicUrl(picResponse.data.imageUrl)
          }
        } catch (error) {
          console.error("Failed to fetch profile picture:", error)
        }
      } catch (error) {
        console.error("Failed to fetch employee data:", error)
      }
    }

    fetchEmployeeData()
  }, [propEmployeeId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section?: string, field?: string) => {
    const { name, value } = e.target

    if (section === "presentAddress") {
      setFormData((prev) => {
        const updated = { ...prev.presentAddress, [field || name]: value };
        return {
          ...prev,
          presentAddress: updated,
          permanentAddress: prev.sameAsPresentAddress ? updated : prev.permanentAddress
        }
      })
    } else if (section === "permanentAddress") {
      setFormData((prev) => ({ ...prev, permanentAddress: { ...prev.permanentAddress, [field || name]: value } }))
    } else if (section === "emergencyContact") {
      setFormData((prev) => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [field || name]: value } }))
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
      showAlert("Error", "Organization not found", "error");
      return;
    }

      // PAN validation
      if (name === 'pan') {
        const uppercaseValue = value.toUpperCase();
        let validatedValue = '';
        for (let i = 0; i < Math.min(uppercaseValue.length, 10); i++) {
          const char = uppercaseValue[i];
          if (i < 5 || i === 9) {
            if (/[A-Z]/.test(char)) validatedValue += char;
          } else if (i >= 5 && i <= 8) {
            if (/[0-9]/.test(char)) validatedValue += char;
          }
        }
        finalValue = validatedValue;
      }

      if (result.error) {
        showAlert("Error", `Failed to update: ${result.error}`, "error");
      } else {
        showAlert("Success", "Employee updated successfully!", "success");
        setIsEditModalOpen(false);
        setProfilePicFile(null);
        // Refresh employee data
        setCurrentEmployeeId(employee.id);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      showAlert("Error", "Failed to update employee", "error");
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

    showConfirm(
      "Delete Employee",
      `Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`,
      async () => {
        const orgId = getOrgId();
        if (!orgId) {
          showAlert("Error", "Organization not found", "error");
          return;
        }

        try {
          const result = await employeeService.delete(orgId, employee.id);

          if (result.error) {
            showAlert("Error", `Failed to delete: ${result.error}`, "error");
          } else {
            showAlert("Success", "Employee deleted successfully!", "success");
            // Go back after deletion
            if (onBack) {
              onBack();
            } else {
              window.history.back();
            }
          }
        } catch (error) {
          console.error('Error deleting employee:', error);
          showAlert("Error", "Failed to delete employee. Check console for details.", "error");
        }
      }
    );
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
  }

  const handleAddWorkExperienceEntry = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { companyName: "", jobTitle: "", fromDate: "", toDate: "", currentlyWorkHere: false, jobDescription: "" }]
    }))
  }

  const handleRemoveWorkExperienceEntry = (index: number) => {
    setFormData(prev => ({ ...prev, workExperience: prev.workExperience.filter((_, i) => i !== index) }))
  }

  const handleWorkExperienceEntryChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) => i === index ? { ...exp, [field]: value } : exp)
    }))
  }

  const handleAddEducationEntry = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { instituteName: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "" }]
    }))
  }

  const handleRemoveEducationEntry = (index: number) => {
    setFormData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }))
  }

  const handleEducationEntryChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => i === index ? { ...edu, [field]: value } : edu)
    }))
  }

  const handleSave = async () => {
    try {
      const token = getAuthToken()
      const orgId = getOrgId()
      const employeeId = propEmployeeId || getEmployeeId()
      const apiUrl = getApiUrl()

      if (!token || !orgId || !employeeId) return

      const formDataToSend = new FormData()
      const readOnlyFields = ['department', 'designation', 'location', 'reportingTo', 'role']

      Object.keys(formData).forEach(key => {
        if (readOnlyFields.includes(key) && !propEmployeeId) return
        const value = formData[key as keyof FormData]
        if (['workExperience', 'education', 'presentAddress', 'permanentAddress', 'emergencyContact'].includes(key)) {
          formDataToSend.append(key, JSON.stringify(value))
        } else {
          formDataToSend.append(key, String(value ?? ''))
        }
      })

      if (selectedProfilePicFile) formDataToSend.append('profilePic', selectedProfilePicFile)

      await axios.put(`${apiUrl}/org/${orgId}/employees/${employeeId}`, formDataToSend, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      })

      setIsEditing(false)
      alert("Profile updated successfully!")
    } catch (error: any) {
      console.error("Failed to save profile:", error)
      alert(error.response?.data?.error || "Failed to save profile.")
    }
  }

  const handleBackClick = () => { if (onBack) onBack(); else router.back(); }

  const genders = ["Male", "Female", "Other"]
  const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"]
  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

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

        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Profile</h1>
            <p className="text-gray-600">View and manage employee profile information.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push("/employee/change-password")} variant="outline">Change Password</Button>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2" />Edit</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Picture */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
              {profilePicUrl ? <img src={profilePicUrl} className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-gray-400" />}
            </div>
            {isEditing && (
              <div>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="profile-pic" />
                <label htmlFor="profile-pic" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50">
                  <Upload className="w-4 h-4 mr-2" /> Upload New
                </label>
              </div>
            )}
          </div>
        </Card>

        {/* Personal Details */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input name="fullName" value={formData.fullName} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile Number</label>
              <Input name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <Select value={formData.gender} onValueChange={(v) => handleSelectChange(v, "gender")} disabled={!isEditing}>
                <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                <SelectContent>{genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Marital Status</label>
              <Select value={formData.maritalStatus} onValueChange={(v) => handleSelectChange(v, "maritalStatus")} disabled={!isEditing}>
                <SelectTrigger><SelectValue placeholder="Select Marital Status" /></SelectTrigger>
                <SelectContent>{maritalStatuses.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Blood Group</label>
              <Select value={formData.bloodGroup} onValueChange={(v) => handleSelectChange(v, "bloodGroup")} disabled={!isEditing}>
                <SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger>
                <SelectContent>{bloodGroups.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Employment Information (Admin only fields generally, but editable if propEmployeeId) */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">Employment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <Input name="role" value={formData.role} onChange={handleInputChange} disabled={!isEditing || !propEmployeeId} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <Input name="department" value={formData.department} onChange={handleInputChange} disabled={!isEditing || !propEmployeeId} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Designation</label>
              <Input name="designation" value={formData.designation} onChange={handleInputChange} disabled={!isEditing || !propEmployeeId} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input name="location" value={formData.location} onChange={handleInputChange} disabled={!isEditing || !propEmployeeId} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reporting To</label>
              <Input name="reportingTo" value={formData.reportingTo} onChange={handleInputChange} disabled={!isEditing || !propEmployeeId} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Shift</label>
              <Input name="shift" value={formData.shift} onChange={handleInputChange} disabled={!isEditing || !propEmployeeId} />
            </div>
          </div>
        </Card>

        {/* Identity Information */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">Identity Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">UAN</label>
              <Input name="uan" value={formData.uan} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PAN</label>
              <Input name="pan" value={formData.pan} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Aadhaar</label>
              <Input name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Passport</label>
              <Input name="passportNumber" value={formData.passportNumber} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Driving License</label>
              <Input name="drivingLicenseNumber" value={formData.drivingLicenseNumber} onChange={handleInputChange} disabled={!isEditing} />
            </div>
          </div>
        </Card>

        <Card className="mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddWorkExperienceEntry}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Experience
              </Button>
            )}
          </div>
          <div className="space-y-6">
            {formData.workExperience.map((exp, idx) => (
              <div key={idx} className="p-6 bg-white rounded-xl relative border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-4">
                  <h3 className="font-semibold text-gray-800">Add Work Experience</h3>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveWorkExperienceEntry(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter company name"
                      value={exp.companyName}
                      onChange={(e) => handleWorkExperienceEntryChange(idx, "companyName", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter job title"
                      value={exp.jobTitle}
                      onChange={(e) => handleWorkExperienceEntryChange(idx, "jobTitle", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      placeholder="mm/dd/yyyy"
                      value={exp.fromDate}
                      onChange={(e) => handleWorkExperienceEntryChange(idx, "fromDate", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      placeholder="mm/dd/yyyy"
                      value={exp.toDate}
                      onChange={(e) => handleWorkExperienceEntryChange(idx, "toDate", e.target.value)}
                      disabled={!isEditing || exp.currentlyWorkHere}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`curr-${idx}`}
                        checked={exp.currentlyWorkHere}
                        onCheckedChange={(v) => handleWorkExperienceEntryChange(idx, "currentlyWorkHere", !!v)}
                        disabled={!isEditing}
                      />
                      <label htmlFor={`curr-${idx}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                        I currently work here
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                    <textarea
                      placeholder="Brief description of your role and responsibilities"
                      value={exp.jobDescription}
                      onChange={(e) => handleWorkExperienceEntryChange(idx, "jobDescription", e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[100px]"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Education</h2>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddEducationEntry}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Education
              </Button>
            )}
          </div>
          <div className="space-y-6">
            {formData.education.map((edu, idx) => (
              <div key={idx} className="p-6 bg-white rounded-xl relative border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-4">
                  <h3 className="font-semibold text-gray-800">Add Education</h3>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEducationEntry(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-2">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institute Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter institute/university name"
                      value={edu.instituteName}
                      onChange={(e) => handleEducationEntryChange(idx, "instituteName", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Degree <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., B.Tech, M.Sc, MBA"
                      value={edu.degree}
                      onChange={(e) => handleEducationEntryChange(idx, "degree", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field of Study <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Computer Science, Business"
                      value={edu.fieldOfStudy}
                      onChange={(e) => handleEducationEntryChange(idx, "fieldOfStudy", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Year <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., 2018"
                      value={edu.startYear}
                      onChange={(e) => handleEducationEntryChange(idx, "startYear", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Year <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., 2022"
                      value={edu.endYear}
                      onChange={(e) => handleEducationEntryChange(idx, "endYear", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">Contact Information</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Present Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address Line 1</label>
                  <Input value={formData.presentAddress.addressLine1} onChange={(e) => handleInputChange(e, "presentAddress", "addressLine1")} disabled={!isEditing} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <Input value={formData.presentAddress.city} onChange={(e) => handleInputChange(e, "presentAddress", "city")} disabled={!isEditing} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PIN Code</label>
                  <Input value={formData.presentAddress.pinCode} onChange={(e) => handleInputChange(e, "presentAddress", "pinCode")} disabled={!isEditing} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="same" checked={formData.sameAsPresentAddress} onCheckedChange={(v) => {
                setFormData(prev => ({ ...prev, sameAsPresentAddress: !!v, permanentAddress: v ? { ...prev.presentAddress } : prev.permanentAddress }))
              }} disabled={!isEditing} />
              <label htmlFor="same" className="text-sm cursor-pointer">Permanent Address same as Present</label>
            </div>

            {!formData.sameAsPresentAddress && (
              <div>
                <h3 className="font-semibold mb-2">Permanent Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Address Line 1</label>
                    <Input value={formData.permanentAddress.addressLine1} onChange={(e) => handleInputChange(e, "permanentAddress", "addressLine1")} disabled={!isEditing} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <Input value={formData.permanentAddress.city} onChange={(e) => handleInputChange(e, "permanentAddress", "city")} disabled={!isEditing} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">PIN Code</label>
                    <Input value={formData.permanentAddress.pinCode} onChange={(e) => handleInputChange(e, "permanentAddress", "pinCode")} disabled={!isEditing} />
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input value={formData.emergencyContact.contactName} onChange={(e) => handleInputChange(e, "emergencyContact", "contactName")} disabled={!isEditing} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Relation</label>
                  <Input value={formData.emergencyContact.relation} onChange={(e) => handleInputChange(e, "emergencyContact", "relation")} disabled={!isEditing} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Number</label>
                  <Input value={formData.emergencyContact.contactNumber} onChange={(e) => handleInputChange(e, "emergencyContact", "contactNumber")} disabled={!isEditing} />
                </div>
              </div>
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

      <CustomAlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}
        title={alertState.title}
        description={alertState.description}
        variant={alertState.variant}
      />

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState(prev => ({ ...prev, open }))}
        title={confirmState.title}
        description={confirmState.description}
        onConfirm={() => {
          confirmState.onConfirm();
          setConfirmState(prev => ({ ...prev, open: false }));
        }}
        variant="destructive"
      />
    </div>
  )
}
