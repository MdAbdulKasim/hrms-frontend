"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { ChevronLeft, Edit, Upload, User, Plus, Trash2 } from "lucide-react"
import { getApiUrl, getAuthToken, getOrgId, getEmployeeId } from "@/lib/auth"
import { CustomAlertDialog } from "@/components/ui/custom-dialogs"

interface FormData {
  // Personal Details
  fullName: string
  emailAddress: string
  mobileNumber: string
  role: string
  department: string
  designation: string
  reportingTo: string
  teamPosition: string
  shift: string
  location: string
  timeZone: string
  dateOfBirth: string
  gender: string
  maritalStatus: string
  bloodGroup: string

  // Identity Information
  uan: string
  pan: string
  aadhaarNumber: string
  passportNumber: string
  drivingLicenseNumber: string

  // Work Experience
  workExperience: Array<{
    companyName: string
    jobTitle: string
    fromDate: string
    toDate: string
    currentlyWorkHere: boolean
    jobDescription: string
  }>

  // Contact Information
  presentAddress: {
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    country: string
    pinCode: string
  }
  sameAsPresentAddress: boolean
  permanentAddress: {
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    country: string
    pinCode: string
  }
  emergencyContact: {
    contactName: string
    relation: string
    contactNumber: string
  }

  // Education
  education: Array<{
    instituteName: string
    degree: string
    fieldOfStudy: string
    startYear: string
    endYear: string
  }>
}

const initialFormData: FormData = {
  fullName: "",
  emailAddress: "",
  mobileNumber: "",
  role: "",
  department: "",
  designation: "",
  reportingTo: "",
  teamPosition: "",
  shift: "",
  location: "",
  timeZone: "",
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  bloodGroup: "",
  uan: "",
  pan: "",
  aadhaarNumber: "",
  passportNumber: "",
  drivingLicenseNumber: "",
  workExperience: [],
  presentAddress: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  },
  sameAsPresentAddress: false,
  permanentAddress: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  },
  emergencyContact: {
    contactName: "",
    relation: "",
    contactNumber: "",
  },
  education: [],
}

export default function EmployeeProfileForm() {
  const router = useRouter();
  const [alertState, setAlertState] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    title: '',
    description: '',
    variant: 'info'
  });

  const showAlert = (title: string, description: string, variant: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setAlertState({ open: true, title, description, variant });
  };

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [currentExperience, setCurrentExperience] = useState({
    companyName: "",
    jobTitle: "",
    fromDate: "",
    toDate: "",
    currentlyWorkHere: false,
    jobDescription: "",
  })
  const [currentEducation, setCurrentEducation] = useState({
    instituteName: "",
    degree: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: "",
  })
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    identity: true,
    workExperience: true,
    contact: true,
    education: true,
  })

  // Profile Picture State
  const [selectedProfilePicFile, setSelectedProfilePicFile] = useState<File | null>(null)
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null)

  // Fetch employee profile data on component mount
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = getAuthToken()
        const orgId = getOrgId()
        const employeeId = getEmployeeId()
        const apiUrl = getApiUrl()

        if (!token || !orgId || !employeeId) {
          console.error("Authentication, organization ID, or employee ID missing", { token: !!token, orgId, employeeId })
          return
        }

        console.log("Fetching employee data:", { apiUrl, orgId, employeeId })

        // Fetch employee data using the /:id endpoint (self-access)
        const response = await axios.get(`${apiUrl}/org/${orgId}/employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const employee = response.data?.data || response.data

        // Map API response fields to form data interface
        // Ensure we show names instead of UUIDs
        setFormData({
          fullName: employee.fullName ||
            (employee.firstName && employee.lastName
              ? `${employee.firstName} ${employee.lastName}`.trim()
              : ""),
          emailAddress: employee.email || "",
          mobileNumber: employee.phoneNumber || employee.mobileNumber || "",
          role: employee.role || "",
          department: employee.department?.departmentName || employee.department?.name || "",
          designation: employee.designation?.name || "",
          reportingTo: employee.reportingTo?.fullName ||
            (employee.reportingTo?.firstName && employee.reportingTo?.lastName
              ? `${employee.reportingTo.firstName} ${employee.reportingTo.lastName}`.trim()
              : employee.reportingTo?.name || ""),
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

        // Fetch profile picture using employee ID from response
        try {
          const empId = employee.id || employeeId;
          if (empId) {
            const picResponse = await axios.get(`${apiUrl}/org/${orgId}/employees/${empId}/profile-pic`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (picResponse.data.success && picResponse.data.imageUrl) {
              setProfilePicUrl(picResponse.data.imageUrl)
            }
          }
        } catch (error) {
          console.error("Failed to fetch profile picture:", error)
        }

      } catch (error: any) {
        console.error("Failed to fetch employee data:", error)
        console.error("Error details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        })
        if (error.response?.status === 404) {
          showAlert("Error", "Employee profile not found. Please contact your administrator.", "error")
        } else if (error.response?.status === 403) {
          showAlert("Permission Denied", "You don't have permission to access this profile.", "error")
        } else {
          showAlert("Error", "Failed to load profile. Please try again.", "error")
        }
      }
    }

    fetchEmployeeData()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: string,
    field?: string,
  ) => {
    const { name, value } = e.target

    if (section === "presentAddress") {
      setFormData((prev) => ({
        ...prev,
        presentAddress: { ...prev.presentAddress, [field || name]: value },
      }))
      if (formData.sameAsPresentAddress) {
        setFormData((prev) => ({
          ...prev,
          permanentAddress: { ...prev.permanentAddress, [field || name]: value },
        }))
      }
    } else if (section === "permanentAddress") {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: { ...prev.permanentAddress, [field || name]: value },
      }))
    } else if (section === "emergencyContact") {
      setFormData((prev) => ({
        ...prev,
        emergencyContact: { ...prev.emergencyContact, [field || name]: value },
      }))
    } else {
      // Input Validation Logic
      let finalValue = value;

      // Numeric only validation
      if (name === 'uan' || name === 'mobileNumber' || name === 'pinCode' || name === 'phoneNumber' || name === 'aadhaarNumber') {
        finalValue = value.replace(/[^0-9]/g, '');
        if (name === 'uan') finalValue = finalValue.slice(0, 12);
        if (name === 'pinCode') finalValue = finalValue.slice(0, 6);
        if (name === 'mobileNumber' || name === 'phoneNumber') finalValue = finalValue.slice(0, 15);
        if (name === 'aadhaarNumber') finalValue = finalValue.slice(0, 12);
      }

      // Strict Alphanumeric validation for PAN (5 letters, 4 numbers, 1 letter)
      if (name === 'pan') {
        const uppercaseValue = value.toUpperCase();
        let validatedValue = '';
        for (let i = 0; i < Math.min(uppercaseValue.length, 10); i++) {
          const char = uppercaseValue[i];
          if (i < 5 || i === 9) {
            // Must be a letter
            if (/[A-Z]/.test(char)) validatedValue += char;
          } else if (i >= 5 && i <= 8) {
            // Must be a digit
            if (/[0-9]/.test(char)) validatedValue += char;
          }
        }
        finalValue = validatedValue;
      }

      // General Alphanumeric validation for Passport/License
      if (name === 'passportNumber' || name === 'drivingLicenseNumber') {
        finalValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      }

      setFormData((prev) => ({
        ...prev,
        [name]: finalValue,
      }))
    }
  }

  const handleSelectChange = (value: string, fieldName: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedProfilePicFile(file)
      // Create local preview URL
      const previewUrl = URL.createObjectURL(file)
      setProfilePicUrl(previewUrl)
    }
  }

  const handleAddWorkExperienceEntry = () => {
    setFormData((prev) => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        {
          companyName: "",
          jobTitle: "",
          fromDate: "",
          toDate: "",
          currentlyWorkHere: false,
          jobDescription: "",
        },
      ],
    }))
  }

  const handleRemoveWorkExperienceEntry = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index),
    }))
  }

  const handleWorkExperienceEntryChange = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }))
  }

  const handleAddEducationEntry = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          instituteName: "",
          degree: "",
          fieldOfStudy: "",
          startYear: "",
          endYear: "",
        },
      ],
    }))
  }

  const handleRemoveEducationEntry = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
  }

  const handleEducationEntryChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }))
  }

  const handleSameAsPresent = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sameAsPresentAddress: checked,
      permanentAddress: checked ? { ...prev.presentAddress } : prev.permanentAddress,
    }))
  }

  const handleSave = async () => {
    try {
      const token = getAuthToken()
      const orgId = getOrgId()
      const employeeId = getEmployeeId()
      const apiUrl = getApiUrl()

      if (!token || !orgId || !employeeId) {
        console.error("Authentication, organization ID, or employee ID missing")
        return
      }

      // Convert to FormData
      const formDataToSend = new FormData()

      // Fields that should NOT be sent (read-only, managed by admin)
      const readOnlyFields = ['department', 'designation', 'location', 'reportingTo', 'role']

      // Append all primitive fields (excluding read-only fields)
      Object.keys(formData).forEach(key => {
        // Skip read-only fields
        if (readOnlyFields.includes(key)) {
          return
        }

        const value = formData[key as keyof FormData]
        if (
          key === 'workExperience' ||
          key === 'education' ||
          key === 'presentAddress' ||
          key === 'permanentAddress' ||
          key === 'emergencyContact'
        ) {
          // Send complex objects as JSON strings
          formDataToSend.append(key, JSON.stringify(value))
        } else {
          // Check if value is boolean, convert to string
          if (typeof value === 'boolean') {
            formDataToSend.append(key, String(value));
          } else {
            formDataToSend.append(key, String(value || ''))
          }
        }
      })

      // Append profile pic file if it exists
      if (selectedProfilePicFile) {
        formDataToSend.append('profilePic', selectedProfilePicFile)
      }

      // Send profile update to API using the /:id endpoint (self-access)
      const response = await axios.put(`${apiUrl}/org/${orgId}/employees/${employeeId}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      })

      console.log("Profile saved successfully:", response.data)
      setIsEditing(false)

      // Refresh the employee data after successful update
      const refreshResponse = await axios.get(`${apiUrl}/org/${orgId}/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const refreshedEmployee = refreshResponse.data?.data || refreshResponse.data

      // Update form data with refreshed employee info
      setFormData(prev => ({
        ...prev,
        fullName: refreshedEmployee.fullName ||
          (refreshedEmployee.firstName && refreshedEmployee.lastName
            ? `${refreshedEmployee.firstName} ${refreshedEmployee.lastName}`.trim()
            : prev.fullName),
        emailAddress: refreshedEmployee.email || prev.emailAddress,
        mobileNumber: refreshedEmployee.phoneNumber || refreshedEmployee.mobileNumber || prev.mobileNumber,
        department: refreshedEmployee.department?.departmentName || refreshedEmployee.department?.name || prev.department,
        designation: refreshedEmployee.designation?.name || prev.designation,
        reportingTo: refreshedEmployee.reportingTo?.fullName ||
          (refreshedEmployee.reportingTo?.firstName && refreshedEmployee.reportingTo?.lastName
            ? `${refreshedEmployee.reportingTo.firstName} ${refreshedEmployee.reportingTo.lastName}`.trim()
            : refreshedEmployee.reportingTo?.name || prev.reportingTo),
        location: refreshedEmployee.location?.name || prev.location,
        role: refreshedEmployee.role || prev.role,
      }))

      // Refresh profile picture if it was updated
      if (selectedProfilePicFile) {
        const empId = refreshedEmployee.id || getEmployeeId();
        if (empId) {
          try {
            const picResponse = await axios.get(`${apiUrl}/org/${orgId}/employees/${empId}/profile-pic`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (picResponse.data.success && picResponse.data.imageUrl) {
              setProfilePicUrl(picResponse.data.imageUrl)
            }
          } catch (picError) {
            console.error("Failed to refresh profile picture:", picError)
          }
        }
        setSelectedProfilePicFile(null)
      }

      showAlert("Success", "Profile updated successfully!", "success")
    } catch (error: any) {
      console.error("Failed to save profile:", error)
      showAlert("Error", error.response?.data?.error || "Failed to save profile. Please try again.", "error")
    }
  }

  // Dynamic dropdown data states
  const [states, setStates] = useState<string[]>(["Select State"])
  const [countries, setCountries] = useState<string[]>(["Select Country"])
  const [genders] = useState<string[]>(["Select Gender", "Male", "Female", "Other"])
  const [maritalStatuses] = useState<string[]>(["Select Marital Status", "Single", "Married", "Divorced", "Widowed"])
  const [bloodGroups] = useState<string[]>(["Select Blood Group", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"])

  // Fetch dropdown options
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const token = getAuthToken()
        const orgId = getOrgId()
        const apiUrl = getApiUrl()

        if (!token || !orgId) return

        // Fetch states
        try {
          const statesRes = await axios.get(`${apiUrl}/org/${orgId}/states`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (statesRes.data && Array.isArray(statesRes.data)) {
            setStates(["Select State", ...statesRes.data.map((s: any) => s.name || s)])
          }
        } catch (error) {
          console.log("States API not available, using defaults")
        }

        // Fetch countries
        try {
          const countriesRes = await axios.get(`${apiUrl}/org/${orgId}/countries`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (countriesRes.data && Array.isArray(countriesRes.data)) {
            setCountries(["Select Country", ...countriesRes.data.map((c: any) => c.name || c)])
          }
        } catch (error) {
          console.log("Countries API not available, using defaults")
        }
      } catch (error) {
        console.error("Error fetching dropdown options:", error)
      }
    }

    fetchDropdownOptions()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" />

          </button>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
              <p className="text-gray-600">Please complete these steps to finish your employee profile setup.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => router.push("/employee/change-password")} variant="outline" className="flex items-center gap-2">
                Change Password
              </Button>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Picture Section */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative">
              {profilePicUrl ? (
                <img
                  src={profilePicUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-600 mb-2">
                  Upload a profile picture. Max size 10MB.
                  <br />
                  Allowed formats: JPG, PNG, GIF.
                </p>

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="profile-pic-upload"
                    disabled={!isEditing}
                  />
                  <label
                    htmlFor="profile-pic-upload"
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select Image
                  </label>
                </div>
                {selectedProfilePicFile && (
                  <p className="text-xs text-green-600 mt-1">
                    Selected: {selectedProfilePicFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Details Section */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Personal Details</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <Input
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Email Address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <Input
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Mobile Number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <Input
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Role"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <Input
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Department"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
              <Input
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Designation"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reporting To</label>
              <Input
                name="reportingTo"
                value={formData.reportingTo}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Reporting To"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Position</label>
              <Input
                name="teamPosition"
                value={formData.teamPosition}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Team Position"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
              <Input
                name="shift"
                value={formData.shift}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Shift"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Location"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
              <Input
                name="timeZone"
                value={formData.timeZone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Time Zone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2"></label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
              <Input
                name="timeZone"
                value={formData.timeZone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Time Zone"
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Additional Personal Information (Please complete)
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <Input
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange(value, "gender")}
                disabled={!isEditing}
              >
                <SelectTrigger disabled={!isEditing}>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marital Status <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.maritalStatus}
                onValueChange={(value) => handleSelectChange(value, "maritalStatus")}
                disabled={!isEditing}
              >
                <SelectTrigger disabled={!isEditing}>
                  <SelectValue placeholder="Select Marital Status" />
                </SelectTrigger>
                <SelectContent>
                  {maritalStatuses.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
              <Select
                value={formData.bloodGroup}
                onValueChange={(value) => handleSelectChange(value, "bloodGroup")}
                disabled={!isEditing}
              >
                <SelectTrigger disabled={!isEditing}>
                  <SelectValue placeholder="Select Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Identity Information Section */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Identity Information</h2>
          <p className="text-sm text-gray-600 mb-6">
            Please provide your identity documents information. These details are required for official records.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UAN (Universal Account Number) <span className="text-red-500">*</span>
              </label>
              <Input
                name="uan"
                value={formData.uan}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter UAN"
              />
              <p className="text-xs text-gray-500 mt-1">12-digit UAN for EPF</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN (Permanent Account Number) <span className="text-red-500">*</span>
              </label>
              <Input
                name="pan"
                value={formData.pan}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter PAN"
              />
              <p className="text-xs text-gray-500 mt-1">10-character alphanumeric PAN</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aadhaar Number <span className="text-red-500">*</span>
              </label>
              <Input
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter Aadhaar Number"
              />
              <p className="text-xs text-gray-500 mt-1">12-digit Aadhaar number</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
              <Input
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter Passport Number (Optional)"
              />
              <p className="text-xs text-gray-500 mt-1">Optional - if available</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Driving License Number</label>
            <Input
              name="drivingLicenseNumber"
              value={formData.drivingLicenseNumber}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter Driving License (Optional)"
            />
            <p className="text-xs text-gray-500 mt-1">Optional - if available</p>
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
            {formData.workExperience.map((exp, index) => (
              <div key={index} className="p-6 bg-white rounded-xl relative border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-4">
                  <h3 className="font-semibold text-gray-800">Add Work Experience</h3>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveWorkExperienceEntry(index)}
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
                      onChange={(e) => handleWorkExperienceEntryChange(index, "companyName", e.target.value)}
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
                      onChange={(e) => handleWorkExperienceEntryChange(index, "jobTitle", e.target.value)}
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
                      onChange={(e) => handleWorkExperienceEntryChange(index, "fromDate", e.target.value)}
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
                      onChange={(e) => handleWorkExperienceEntryChange(index, "toDate", e.target.value)}
                      disabled={!isEditing || exp.currentlyWorkHere}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`currentlyWorkHere-${index}`}
                        checked={exp.currentlyWorkHere}
                        onCheckedChange={(checked) => handleWorkExperienceEntryChange(index, "currentlyWorkHere", checked as boolean)}
                        disabled={!isEditing}
                      />
                      <label htmlFor={`currentlyWorkHere-${index}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                        I currently work here
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                    <textarea
                      placeholder="Brief description of your role and responsibilities"
                      value={exp.jobDescription}
                      onChange={(e) => handleWorkExperienceEntryChange(index, "jobDescription", e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[100px]"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.workExperience.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                No work experience history added.
              </div>
            )}
          </div>
        </Card>

        {/* Contact Information Section */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Contact Information</h2>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">Present Address</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.presentAddress.addressLine1}
              onChange={(e) => handleInputChange(e, "presentAddress", "addressLine1")}
              disabled={!isEditing}
              placeholder="Enter address line 1"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
            <Input
              value={formData.presentAddress.addressLine2}
              onChange={(e) => handleInputChange(e, "presentAddress", "addressLine2")}
              disabled={!isEditing}
              placeholder="Enter address line 2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.presentAddress.city}
                onChange={(e) => handleInputChange(e, "presentAddress", "city")}
                disabled={!isEditing}
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.presentAddress.state}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    presentAddress: { ...prev.presentAddress, state: value },
                    permanentAddress: formData.sameAsPresentAddress
                      ? { ...prev.permanentAddress, state: value }
                      : prev.permanentAddress,
                  }))
                }}
                disabled={!isEditing}
              >
                <SelectTrigger disabled={!isEditing}>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.presentAddress.country}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    presentAddress: { ...prev.presentAddress, country: value },
                    permanentAddress: formData.sameAsPresentAddress
                      ? { ...prev.permanentAddress, country: value }
                      : prev.permanentAddress,
                  }))
                }}
                disabled={!isEditing}
              >
                <SelectTrigger disabled={!isEditing}>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.presentAddress.pinCode}
                onChange={(e) => handleInputChange(e, "presentAddress", "pinCode")}
                disabled={!isEditing}
                placeholder="Enter PIN code"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <Checkbox
              checked={formData.sameAsPresentAddress}
              onCheckedChange={handleSameAsPresent}
              disabled={!isEditing}
            />
            <label className="text-sm text-gray-700">Same as Present Address</label>
          </div>

          {!formData.sameAsPresentAddress && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Permanent Address</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.permanentAddress.addressLine1}
                  onChange={(e) => handleInputChange(e, "permanentAddress", "addressLine1")}
                  disabled={!isEditing}
                  placeholder="Enter address line 1"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                <Input
                  value={formData.permanentAddress.addressLine2}
                  onChange={(e) => handleInputChange(e, "permanentAddress", "addressLine2")}
                  disabled={!isEditing}
                  placeholder="Enter address line 2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.permanentAddress.city}
                    onChange={(e) => handleInputChange(e, "permanentAddress", "city")}
                    disabled={!isEditing}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.permanentAddress.state}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, permanentAddress: { ...prev.permanentAddress, state: value } }))
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger disabled={!isEditing}>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.permanentAddress.country}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        permanentAddress: { ...prev.permanentAddress, country: value },
                      }))
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger disabled={!isEditing}>
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.permanentAddress.pinCode}
                    onChange={(e) => handleInputChange(e, "permanentAddress", "pinCode")}
                    disabled={!isEditing}
                    placeholder="Enter PIN code"
                  />
                </div>
              </div>
            </>
          )}

          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.emergencyContact.contactName}
                onChange={(e) => handleInputChange(e, "emergencyContact", "contactName")}
                disabled={!isEditing}
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relation <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.emergencyContact.relation}
                onChange={(e) => handleInputChange(e, "emergencyContact", "relation")}
                disabled={!isEditing}
                placeholder="e.g. Father, Mother, Spouse"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.emergencyContact.contactNumber}
                onChange={(e) => handleInputChange(e, "emergencyContact", "contactNumber")}
                disabled={!isEditing}
                placeholder="Enter phone number"
              />
            </div>
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
            {formData.education.map((edu, index) => (
              <div key={index} className="p-6 bg-white rounded-xl relative border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-4">
                  <h3 className="font-semibold text-gray-800">Add Education</h3>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEducationEntry(index)}
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
                      onChange={(e) => handleEducationEntryChange(index, "instituteName", e.target.value)}
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
                      onChange={(e) => handleEducationEntryChange(index, "degree", e.target.value)}
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
                      onChange={(e) => handleEducationEntryChange(index, "fieldOfStudy", e.target.value)}
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
                      onChange={(e) => handleEducationEntryChange(index, "startYear", e.target.value)}
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
                      onChange={(e) => handleEducationEntryChange(index, "endYear", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.education.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                No education history added.
              </div>
            )}
          </div>
        </Card>

        {/* Save and Cancel buttons after Education section */}
        {isEditing && (
          <div className="flex gap-3 justify-end mt-8">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save
            </Button>
          </div>
        )}
      </div>
      <CustomAlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}
        title={alertState.title}
        description={alertState.description}
        variant={alertState.variant}
      />
    </div>
  )
}
