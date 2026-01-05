"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { getApiUrl, getAuthToken, getOrgId, getEmployeeId } from "@/lib/auth"
import { CustomAlertDialog } from "@/components/ui/custom-dialogs"
import ChangePassword from "./ChangePassword"
import ProfileForm from "./ProfileForm"
import { type FormData, initialFormData } from "./types"

export default function EmployeeProfileForm() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)

  // Alert State
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

  // Profile Picture State
  const [selectedProfilePicFile, setSelectedProfilePicFile] = useState<File | null>(null)
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({})

  // Fetch employee profile data on component mount
  useEffect(() => {
    const orgId = getOrgId()
    const employeeId = getEmployeeId()

    const fetchEmployeeData = async () => {
      try {
        const token = getAuthToken()
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
          uanDocUrl: employee.uanDocUrl || "",
          pan: employee.PAN || "",
          panDocUrl: employee.panDocUrl || "",
          aadhaarNumber: employee.aadharNumber || "",
          aadhaarDocUrl: employee.aadharDocUrl || "",
          passportNumber: employee.passportNumber || "",
          passportDocUrl: employee.passportDocUrl || "",
          drivingLicenseNumber: employee.drivingLicenseNumber || "",
          drivingLicenseDocUrl: employee.drivingLicenseDocUrl || "",
          workExperience: (employee.experience || []).map((exp: any) => ({
            companyName: exp.companyName || "",
            jobTitle: exp.jobTitle || "",
            fromDate: exp.fromDate ? exp.fromDate.split("T")[0] : "",
            toDate: exp.toDate ? exp.toDate.split("T")[0] : "",
            currentlyWorkHere: !exp.toDate,
            jobDescription: exp.jobDescription || "",
            documentUrl: exp.documentUrl || "",
          })),
          education: (employee.education || []).map((edu: any) => ({
            instituteName: edu.instituteName || "",
            degree: edu.degree || "",
            fieldOfStudy: edu.specialization || edu.fieldOfStudy || "",
            startYear: edu.startyear || edu.startYear || "",
            endYear: edu.dateOfCompletion || edu.endyear || edu.endYear ? new Date(edu.dateOfCompletion || edu.endyear || edu.endYear).getFullYear().toString() : "",
            documentUrl: edu.documentUrl || "",
          })),
          address: {
            addressLine1: employee.presentAddressLine1 || "",
            addressLine2: employee.presentAddressLine2 || "",
            city: employee.presentCity || "",
            state: employee.presentState || "",
            country: employee.presentCountry || "",
            pinCode: employee.presentPinCode || "",
          },
          emergencyContact: {
            contactName: employee.emergencyContactName || "",
            relation: employee.emergencyContactRelation || "",
            contactNumber: employee.emergencyContactNumber || "",
          },
        })

        if (employee.profilePicUrl) {
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
        } else {
          setProfilePicUrl(null)
        }
      } catch (error) {
        console.error("Failed to fetch employee data:", error)
      }
    }

    if (employeeId && orgId && employeeId !== "undefined" && orgId !== "undefined") {
      fetchEmployeeData()
    }
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: string,
    field?: string,
  ) => {
    const { name, value } = e.target

    if (section === "address") {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field || name]: value },
      }))
    } else if (section === "emergencyContact") {
      setFormData((prev) => ({
        ...prev,
        emergencyContact: { ...prev.emergencyContact, [field || name]: value },
      }))
    } else {
      let finalValue = value;

      if (name === 'uan' || name === 'mobileNumber' || name === 'pinCode') {
        finalValue = value.replace(/[^0-9]/g, '');
        if (name === 'uan') finalValue = finalValue.slice(0, 12);
        if (name === 'pinCode') finalValue = finalValue.slice(0, 6);
        if (name === 'mobileNumber') finalValue = finalValue.slice(0, 15);
      }

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
    if (fieldName.includes('.')) {
      const [section, field] = fieldName.split('.')
      setFormData((prev: any) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName?: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!fieldName || fieldName === "profilePic") {
        setSelectedProfilePicFile(file)
        const previewUrl = URL.createObjectURL(file)
        setProfilePicUrl(previewUrl)
      } else {
        setSelectedFiles(prev => ({ ...prev, [fieldName]: file }))
        // Update local state to show "Uploaded" status immediately if needed
        // but since we check for existance of file in handleSave, we just keep it in selectedFiles
      }
    }
  }

  const handleAddWorkExperienceEntry = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        { companyName: "", jobTitle: "", fromDate: "", toDate: "", currentlyWorkHere: false, jobDescription: "", documentUrl: "" }
      ]
    }))
  }

  const handleRemoveWorkExperienceEntry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }))
  }

  const handleWorkExperienceEntryChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newExp = [...prev.workExperience]
      newExp[index] = { ...newExp[index], [field]: value }
      if (field === "currentlyWorkHere" && value === true) {
        newExp[index].toDate = ""
      }
      return { ...prev, workExperience: newExp }
    })
  }

  const handleAddEducationEntry = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { instituteName: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "", documentUrl: "" }
      ]
    }))
  }

  const handleRemoveEducationEntry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const handleEducationEntryChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newEdu = [...prev.education]
      newEdu[index] = { ...newEdu[index], [field]: value }
      return { ...prev, education: newEdu }
    })
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

      const formDataToSend = new FormData()

      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof FormData]
        if (
          key === 'workExperience' ||
          key === 'education' ||
          key === 'address' ||
          key === 'emergencyContact'
        ) {
          formDataToSend.append(key, JSON.stringify(value))
        } else {
          if (typeof value === 'boolean') {
            formDataToSend.append(key, String(value));
          } else {
            formDataToSend.append(key, String(value || ''))
          }
        }
      })

      if (selectedProfilePicFile) {
        formDataToSend.append('profilePic', selectedProfilePicFile)
      }

      // Append all other documents
      Object.keys(selectedFiles).forEach(fieldName => {
        formDataToSend.append(fieldName, selectedFiles[fieldName])
      })

      const response = await axios.put(`${apiUrl}/org/${orgId}/employees/${employeeId}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      })

      setIsEditing(false)
      setSelectedFiles({}) // Reset selected files on success

      const refreshResponse = await axios.get(`${apiUrl}/org/${orgId}/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const refreshedEmployee = refreshResponse.data?.data || refreshResponse.data

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
        shift: refreshedEmployee.shiftType || refreshedEmployee.shift || prev.shift,
        uanDocUrl: refreshedEmployee.uanDocUrl || prev.uanDocUrl,
        panDocUrl: refreshedEmployee.panDocUrl || prev.panDocUrl,
        aadhaarDocUrl: refreshedEmployee.aadharDocUrl || prev.aadhaarDocUrl,
        passportDocUrl: refreshedEmployee.passportDocUrl || prev.passportDocUrl,
        drivingLicenseDocUrl: refreshedEmployee.drivingLicenseDocUrl || prev.drivingLicenseDocUrl,
        workExperience: (refreshedEmployee.experience || []).map((exp: any) => ({
          companyName: exp.companyName || "",
          jobTitle: exp.jobTitle || "",
          fromDate: exp.fromDate ? exp.fromDate.split("T")[0] : "",
          toDate: exp.toDate ? exp.toDate.split("T")[0] : "",
          currentlyWorkHere: !exp.toDate,
          jobDescription: exp.jobDescription || "",
          documentUrl: exp.documentUrl || "",
        })),
        education: (refreshedEmployee.education || []).map((edu: any) => ({
          instituteName: edu.instituteName || "",
          degree: edu.degree || "",
          fieldOfStudy: edu.specialization || edu.fieldOfStudy || "",
          startYear: edu.startyear || edu.startYear || "",
          endYear: edu.dateOfCompletion || edu.endyear || edu.endYear ? new Date(edu.dateOfCompletion || edu.endyear || edu.endYear).getFullYear().toString() : "",
          documentUrl: edu.documentUrl || "",
        })),
      }))

      if (refreshedEmployee?.profilePicUrl) {
        try {
          const picResponse = await axios.get(`${apiUrl}/org/${orgId}/employees/${employeeId}/profile-pic`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (picResponse.data.success && picResponse.data.imageUrl) {
            setProfilePicUrl(picResponse.data.imageUrl)
          }
        } catch (picError) {
          console.error("Failed to refresh profile picture:", picError)
        }
        setSelectedProfilePicFile(null)
      }

      showAlert("Success", "Profile updated successfully!", "success")
    } catch (error: any) {
      console.error("Failed to save profile:", error)
      showAlert("Error", error.response?.data?.error || "Failed to save profile. Please try again.", "error")
    }
  }

  if (showPasswordChange) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <ChangePassword onBack={() => setShowPasswordChange(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
              <p className="text-gray-600">Please complete these steps to finish your employee profile setup.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowPasswordChange(true)} variant="outline" className="flex items-center gap-2">
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

        <ProfileForm
          formData={formData}
          isEditing={isEditing}
          profilePicUrl={profilePicUrl}
          selectedProfilePicFile={selectedProfilePicFile}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          handleFileChange={handleFileChange}
          handleAddWorkExperienceEntry={handleAddWorkExperienceEntry}
          handleRemoveWorkExperienceEntry={handleRemoveWorkExperienceEntry}
          handleWorkExperienceEntryChange={handleWorkExperienceEntryChange}
          handleAddEducationEntry={handleAddEducationEntry}
          handleRemoveEducationEntry={handleRemoveEducationEntry}
          handleEducationEntryChange={handleEducationEntryChange}
          handleSave={handleSave}
        />
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
