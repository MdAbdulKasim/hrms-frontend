"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Edit, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getApiUrl, getAuthToken, getOrgId, getEmployeeId } from "@/lib/auth"
import { CustomAlertDialog } from "@/components/ui/custom-dialogs"
import EProfileForm from "./EProfileForm"
import { type FormData, initialFormData } from "./types"

export default function EmployeeProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [selectedProfilePicFile, setSelectedProfilePicFile] = useState<File | null>(null)
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({})

  // Alert State
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

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
          site: employee.site || employee.siteId || "",
          building: employee.building || "",
          empType: employee.employeeType || employee.empType || "",
          employeeStatus: employee.status || employee.employeeStatus || "",
          contractType: employee.contractType || "",
          contractStartDate: employee.contractStartDate ? employee.contractStartDate.split("T")[0] : "",
          contractEndDate: employee.contractEndDate ? employee.contractEndDate.split("T")[0] : "",
          basicSalary: employee.basicSalary || "",
          bankDetails: {
            bankName: employee.bankDetails?.[0]?.bankName || employee.bankDetails?.bankName || "",
            branchName: employee.bankDetails?.[0]?.branchName || employee.bankDetails?.branchName || "",
            accountNumber: employee.bankDetails?.[0]?.accountNumber || employee.bankDetails?.accountNumber || "",
            accountHolderName: employee.bankDetails?.[0]?.accountHolderName || employee.bankDetails?.accountHolderName || "",
            ifscCode: employee.bankDetails?.[0]?.ifscCode || employee.bankDetails?.ifscCode || "",
          },
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
            fieldOfStudy: edu.specialization || edu.fieldOfStudy || "",
            startYear: edu.startyear || edu.startYear || "",
            endYear: edu.dateOfCompletion || edu.endyear || edu.endYear ? new Date(edu.dateOfCompletion || edu.endyear || edu.endYear).getFullYear().toString() : "",
            documentUrl: edu.documentUrl || "",
          })),
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
        }
      } catch (error) {
        console.error("Failed to fetch employee data:", error)
      }
    }
    fetchEmployeeData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section?: string, field?: string) => {
    const { name, value } = e.target
    if (section && field) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...(prev[section as keyof FormData] as any), [field]: value }
      }))
      if (section === "presentAddress" && formData.sameAsPresentAddress) {
        setFormData(prev => ({
          ...prev,
          permanentAddress: { ...prev.permanentAddress, [field]: value }
        }))
      }
    } else {
      let finalValue = value
      if (['uan', 'mobileNumber', 'pinCode', 'aadhaarNumber'].includes(name)) {
        finalValue = value.replace(/[^0-9]/g, '')
      }
      setFormData(prev => ({ ...prev, [name]: finalValue }))
    }
  }

  const handleSelectChange = (value: string, fieldName: string) => {
    if (fieldName.includes('.')) {
      const [section, field] = fieldName.split('.')
      setFormData(prev => ({
        ...prev,
        [section]: { ...(prev[section as keyof FormData] as any), [field]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [fieldName]: value }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName?: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!fieldName || fieldName === "profilePic") {
        setSelectedProfilePicFile(file)
        setProfilePicUrl(URL.createObjectURL(file))
      } else {
        setSelectedFiles(prev => ({ ...prev, [fieldName]: file }))
      }
    }
  }

  const handleAddWorkExperienceEntry = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { companyName: "", jobTitle: "", fromDate: "", toDate: "", currentlyWorkHere: false, jobDescription: "", documentUrl: "" }]
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
      if (field === "currentlyWorkHere" && value === true) newExp[index].toDate = ""
      return { ...prev, workExperience: newExp }
    })
  }

  const handleAddEducationEntry = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { instituteName: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "", documentUrl: "" }]
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

  const handleSameAsPresent = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sameAsPresentAddress: checked,
      permanentAddress: checked ? { ...prev.presentAddress } : prev.permanentAddress
    }))
  }

  const handleSave = async () => {
    try {
      const token = getAuthToken()
      const orgId = getOrgId()
      const employeeId = getEmployeeId()
      const apiUrl = getApiUrl()

      if (!token || !orgId || !employeeId) return

      const formDataToSend = new FormData()
      const readOnlyFields = [
        'role', 'department', 'designation', 'reportingTo', 'teamPosition',
        'shift', 'location', 'timeZone', 'site', 'building',
        'empType', 'employeeStatus', 'contractType', 'contractStartDate', 'contractEndDate',
        'basicSalary', 'bankDetails'
      ]

      Object.keys(formData).forEach(key => {
        if (readOnlyFields.includes(key)) return
        const value = formData[key as keyof FormData]
        if (['workExperience', 'education', 'presentAddress', 'permanentAddress', 'emergencyContact'].includes(key)) {
          formDataToSend.append(key, JSON.stringify(value))
        } else {
          formDataToSend.append(key, String(value ?? ''))
        }
      })

      if (selectedProfilePicFile) formDataToSend.append('profilePic', selectedProfilePicFile)
      Object.keys(selectedFiles).forEach(fieldName => {
        formDataToSend.append(fieldName, selectedFiles[fieldName])
      })

      await axios.put(`${apiUrl}/org/${orgId}/employees/${employeeId}`, formDataToSend, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      })

      setIsEditing(false)
      setSelectedFiles({})
      showAlert("Success", "Profile updated successfully!", "success")

      // Re-fetch to sync
      router.refresh()
    } catch (error: any) {
      console.error("Failed to save profile:", error)
      showAlert("Error", error.response?.data?.error || "Failed to save profile.", "error")
    }
  }

  // Dropdown Data
  const [states, setStates] = useState<string[]>(["Select State"])
  const [countries, setCountries] = useState<string[]>(["Select Country"])
  const genders = ["Select Gender", "Male", "Female", "Other"]
  const maritalStatuses = ["Select Marital Status", "Single", "Married", "Divorced", "Widowed"]
  const bloodGroups = ["Select Blood Group", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

  useEffect(() => {
    const fetchDropdowns = async () => {
      const token = getAuthToken()
      const orgId = getOrgId()
      const apiUrl = getApiUrl()
      if (!token || !orgId) return
      try {
        const s = await axios.get(`${apiUrl}/org/${orgId}/states`, { headers: { Authorization: `Bearer ${token}` } })
        if (s.data) setStates(["Select State", ...s.data.map((x: any) => x.name || x)])
        const c = await axios.get(`${apiUrl}/org/${orgId}/countries`, { headers: { Authorization: `Bearer ${token}` } })
        if (c.data) setCountries(["Select Country", ...c.data.map((x: any) => x.name || x)])
      } catch (e) { console.error(e) }
    }
    fetchDropdowns()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button onClick={() => router.back()} className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">View and manage your personal information.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => router.push("/employee/change-password")} variant="outline">Change Password</Button>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" /> Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        <EProfileForm
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
          handleSameAsPresent={handleSameAsPresent}
          handleSave={handleSave}
          states={states}
          countries={countries}
          genders={genders}
          maritalStatuses={maritalStatuses}
          bloodGroups={bloodGroups}
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
