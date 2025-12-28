"use client"

import type React from "react"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { ChevronLeft, Edit, Upload, User } from "lucide-react"
import { getApiUrl, getAuthToken, getOrgId, getEmployeeId } from "@/lib/auth"

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
          console.error("Authentication, organization ID, or employee ID missing")
          return
        }

        // Fetch employee data using the correct endpoint with employee ID
        const response = await axios.get(`${apiUrl}/org/${orgId}/employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const employee = response.data

        // Map API response fields to form data interface
        setFormData({
          fullName: employee.fullName || "",
          emailAddress: employee.email || "",
          mobileNumber: employee.phoneNumber || "",
          role: employee.role || "",
          department: employee.department?.name || "",
          designation: employee.designation?.name || "",
          reportingTo: employee.reportingTo?.fullName || "",
          teamPosition: employee.teamPosition || "",
          shift: employee.shiftType || "",
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

        // Fetch profile picture
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
      setFormData((prev) => ({
        ...prev,
        [name]: value,
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

  const handleAddWorkExperience = () => {
    if (currentExperience.companyName && currentExperience.jobTitle && currentExperience.fromDate) {
      setFormData((prev) => ({
        ...prev,
        workExperience: [...prev.workExperience, currentExperience],
      }))
      setCurrentExperience({
        companyName: "",
        jobTitle: "",
        fromDate: "",
        toDate: "",
        currentlyWorkHere: false,
        jobDescription: "",
      })
    }
  }

  const handleAddEducation = () => {
    if (currentEducation.instituteName && currentEducation.degree) {
      setFormData((prev) => ({
        ...prev,
        education: [...prev.education, currentEducation],
      }))
      setCurrentEducation({
        instituteName: "",
        degree: "",
        fieldOfStudy: "",
        startYear: "",
        endYear: "",
      })
    }
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

      // Append all primitive fields
      Object.keys(formData).forEach(key => {
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

      // Send profile update to API using the correct endpoint with employee ID
      // Change to FormData and allow multipart/form-data
      const response = await axios.put(`${apiUrl}/org/${orgId}/employees/${employeeId}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      })

      console.log("Profile saved successfully:", response.data)
      setIsEditing(false)

      // Update the profile pic url from response if available (optional)
      // or re-fetch logic if needed. For now relying on local preview or persistence.
    } catch (error) {
      console.error("Failed to save profile:", error)
      alert("Failed to save profile. Please try again.")
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
            Back to steps
          </button>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
              <p className="text-gray-600">Please complete these steps to finish your employee profile setup.</p>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}
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

        {/* Work Experience Section */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Work Experience</h2>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Add Work Experience</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter company name"
                  value={currentExperience.companyName}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, companyName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter job title"
                  value={currentExperience.jobTitle}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, jobTitle: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={currentExperience.fromDate}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, fromDate: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={currentExperience.toDate}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, toDate: e.target.value })}
                  disabled={!isEditing || currentExperience.currentlyWorkHere}
                />
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <Checkbox
                id="currentlyWorkHere"
                checked={currentExperience.currentlyWorkHere}
                onCheckedChange={(checked: boolean) =>
                  setCurrentExperience({ ...currentExperience, currentlyWorkHere: checked as boolean })
                }
                disabled={!isEditing}
              />
              <label htmlFor="currentlyWorkHere" className="text-sm font-medium text-gray-700 cursor-pointer">
                I currently work here
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
              <textarea
                placeholder="Brief description of your role and responsibilities"
                value={currentExperience.jobDescription}
                onChange={(e) => setCurrentExperience({ ...currentExperience, jobDescription: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
          </div>

          {formData.workExperience.map((exp, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3">
              <p className="font-semibold text-gray-900">{exp.jobTitle}</p>
              <p className="text-sm text-gray-600">{exp.companyName}</p>
            </div>
          ))}
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

        {/* Education Section */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Education</h2>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Add Education</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institute Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter institute/university name"
                value={currentEducation.instituteName}
                onChange={(e) => setCurrentEducation({ ...currentEducation, instituteName: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Degree <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., B.Tech, M.Sc, MBA"
                  value={currentEducation.degree}
                  onChange={(e) => setCurrentEducation({ ...currentEducation, degree: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field of Study <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., Computer Science, Business"
                  value={currentEducation.fieldOfStudy}
                  onChange={(e) => setCurrentEducation({ ...currentEducation, fieldOfStudy: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Year <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., 2018"
                  value={currentEducation.startYear}
                  onChange={(e) => setCurrentEducation({ ...currentEducation, startYear: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Year <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., 2022"
                  value={currentEducation.endYear}
                  onChange={(e) => setCurrentEducation({ ...currentEducation, endYear: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {formData.education.map((edu, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3">
              <p className="font-semibold text-gray-900">
                {edu.degree} in {edu.fieldOfStudy}
              </p>
              <p className="text-sm text-gray-600">{edu.instituteName}</p>
              <p className="text-xs text-gray-500">
                {edu.startYear} - {edu.endYear}
              </p>
            </div>
          ))}
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
    </div>
  )
}
