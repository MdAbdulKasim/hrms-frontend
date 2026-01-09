"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Edit, ArrowLeft } from "lucide-react"
import { getApiUrl, getAuthToken, getOrgId, getEmployeeId, getUserRole } from "@/lib/auth"
import { CustomAlertDialog } from "@/components/ui/custom-dialogs"
import ChangePassword from "./ChangePassword"
import ProfileForm from "./ProfileForm"
import { type FormData as ProfileFormData, initialFormData } from "./types"

const sanitizeDate = (val: any) => {
  if (!val) return "";
  const str = String(val);
  if (str.includes("NaN")) return "";
  return str.split("T")[0];
};

const sanitizeYear = (val: any) => {
  if (!val) return "";
  const d = new Date(val);
  const year = d.getFullYear();
  return isNaN(year) ? "" : year.toString();
};


interface Props {
  employeeId?: string
  onBack?: () => void
}

export default function EmployeeProfileForm({ employeeId: propEmployeeId, onBack }: Props) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData)
  const [userRole, setUserRole] = useState<'admin' | 'employee' | string | null>(null)

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
    const employeeId = propEmployeeId || getEmployeeId()
    setUserRole(getUserRole())

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
          employeeNumber: employee.employeeNumber || employee.employeeId || "",
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
          shift: employee.shiftType || employee.shift?.name || employee.shift || "",
          location: employee.location?.name || "",
          site: employee.site?.name || employee.site || "",
          building: employee.building?.name || employee.building || "",
          timeZone: employee.timeZone || "",
          dateOfBirth: sanitizeDate(employee.dateOfBirth),
          gender: employee.gender || "",
          maritalStatus: employee.maritalStatus || "",
          bloodGroup: employee.bloodGroup || "",
          empType: employee.empType || "",
          employeeStatus: employee.employeeStatus || employee.status || "",
          dateOfJoining: sanitizeDate(employee.dateOfJoining),
          contractType: employee.contractType || "",
          contractStartDate: sanitizeDate(employee.contractStartDate),
          contractEndDate: sanitizeDate(employee.contractEndDate),
          uid: employee.uid || "",
          uidDocUrl: employee.uidDocUrl || "",
          labourNumber: employee.labourNumber || "",
          labourNumberDocUrl: employee.labourNumberDocUrl || "",
          eidNumber: employee.eidNumber || employee.eid || "",
          eidNumberDocUrl: employee.eidNumberDocUrl || "",
          visaNumber: employee.visaNumber || "",
          visaNumberDocUrl: employee.visaNumberDocUrl || "",
          iban: employee.iban || "",
          ibanDocUrl: employee.ibanDocUrl || "",
          passportNumber: employee.passportNumber || "",
          passportDocUrl: employee.passportDocUrl || "",
          drivingLicenseNumber: employee.drivingLicenseNumber || "",
          drivingLicenseDocUrl: employee.drivingLicenseDocUrl || "",
          basicSalary: employee.basicSalary || "",
          bankDetails: {
            bankName: employee.bankDetails?.bankName || employee.bankName || "",
            branchName: employee.bankDetails?.branchName || employee.branchName || "",
            accountNumber: employee.bankDetails?.accountNumber || employee.accountNumber || "",
            accountHolderName: employee.bankDetails?.accountHolderName || employee.accountHolderName || "",
            ifscCode: employee.bankDetails?.ifscCode || employee.ifscCode || "",
          },
          workExperience: (employee.experience || []).map((exp: any) => ({
            companyName: exp.companyName || "",
            jobTitle: exp.jobTitle || "",
            fromDate: sanitizeDate(exp.fromDate),
            toDate: sanitizeDate(exp.toDate),
            currentlyWorkHere: !exp.toDate,
            jobDescription: exp.jobDescription || "",
            documentUrl: exp.documentUrl || "",
          })),
          education: (employee.education || []).map((edu: any) => ({
            instituteName: edu.instituteName || "",
            degree: edu.degree || "",
            fieldOfStudy: edu.specialization || edu.fieldOfStudy || "",
            startYear: sanitizeYear(edu.startyear || edu.startYear),
            endYear: sanitizeYear(edu.dateOfCompletion || edu.endyear || edu.endYear),
            documentUrl: edu.documentUrl || "",
          })),
          address: {
            addressLine1: employee.presentAddressLine1 || employee.presentAddress?.addressLine1 || "",
            addressLine2: employee.presentAddressLine2 || employee.presentAddress?.addressLine2 || "",
            city: employee.presentCity || employee.presentAddress?.city || "",
            state: employee.presentState || employee.presentAddress?.state || "",
            country: employee.presentCountry || employee.presentAddress?.country || "",
            pinCode: employee.presentPinCode || employee.presentAddress?.pinCode || "",
          },
          emergencyContact: {
            contactName: employee.emergencyContactName || employee.emergencyContact?.contactName || "",
            relation: employee.emergencyContactRelation || employee.emergencyContact?.relation || "",
            contactNumber: employee.emergencyContactNumber || employee.emergencyContact?.contactNumber || "",
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
      } catch (error: any) {
        console.error("Failed to fetch employee data:", error)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.push('/auth/login')
        }
      }
    }

    if (employeeId && orgId && employeeId !== "undefined" && orgId !== "undefined") {
      fetchEmployeeData()
    }
  }, [propEmployeeId])

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
    } else if (section === "bankDetails") {
      setFormData((prev) => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [field || name]: value },
      }))
    } else {
      let finalValue = value;

      if (name === 'mobileNumber' || name === 'pinCode') {
        finalValue = value.replace(/[^0-9]/g, '');
        if (name === 'pinCode') finalValue = finalValue.slice(0, 6);
        if (name === 'mobileNumber') finalValue = finalValue.slice(0, 15);
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
      const employeeId = propEmployeeId || getEmployeeId()
      const apiUrl = getApiUrl()


      if (!token || !orgId || !employeeId) {
        console.error("Authentication, organization ID, or employee ID missing")
        return
      }

      const formDataToSend = new FormData()

      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof ProfileFormData]

        // Backend expects 'presentAddress' for the address fields, not 'address'
        if (key === 'address') {
          formDataToSend.append('presentAddress', JSON.stringify(value))
          return
        }

        // Handle bankDetails: Send as JSON array to match backend expectation
        if (key === 'bankDetails') {
          // Backend expects an array of bank details
          const bankDetailsArray = Array.isArray(value) ? value : [value];
          formDataToSend.append('bankDetails', JSON.stringify(bankDetailsArray))
          return
        }

        // Handle site and building mapping to match backend entity (siteId, buildingId)
        if (key === 'site') {
          formDataToSend.append('siteId', String(value || ''))
          return
        }
        if (key === 'building') {
          formDataToSend.append('buildingId', String(value || ''))
          return
        }

        // Map employeeStatus -> status
        if (key === 'employeeStatus') {
          formDataToSend.append('status', String(value || ''))
          return
        }

        // Exclude fields not present in backend entity to prevent 500 errors
        if ([
          'contractType', 'contractStartDate', 'contractEndDate',
          'uidDocUrl', 'labourNumberDocUrl', 'eidNumberDocUrl',
          'visaNumberDocUrl', 'passportDocUrl', 'drivingLicenseDocUrl', 'ibanDocUrl',
          'uid', 'labourNumber', 'eidNumber', 'visaNumber'
        ].includes(key)) {
          return
        }

        // Map employeeStatus -> status
        if (key === 'employeeStatus') {
          formDataToSend.append('status', String(value || ''))
          return
        }

        // Handle numeric fields: Don't send empty strings for decimal columns
        if ((key === 'basicSalary' || key === 'salary') && !value) {
          return
        }

        if (
          key === 'workExperience' ||
          key === 'education' ||
          key === 'emergencyContact'
        ) {
          formDataToSend.append(key, JSON.stringify(value))
        } else {
          // Robust handling for dates and numeric fields to prevent 500 errors
          const dateFields = ['dateOfBirth', 'dateOfJoining', 'contractStartDate', 'contractEndDate'];
          const numericFields = ['basicSalary', 'salary', 'totalExperience', 'currentExperience'];

          const isDate = dateFields.includes(key);
          const isNumeric = numericFields.includes(key);

          if (isDate && (value === "" || String(value).includes("NaN"))) {
            return;
          }

          if (isNumeric && (!value || value === "" || isNaN(Number(value)))) {
            return;
          }

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
          Authorization: `Bearer ${token}`
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
        employeeNumber: refreshedEmployee.employeeNumber || refreshedEmployee.employeeId || prev.employeeNumber,
        emailAddress: refreshedEmployee.email || prev.emailAddress,
        mobileNumber: refreshedEmployee.phoneNumber || refreshedEmployee.mobileNumber || prev.mobileNumber,
        department: refreshedEmployee.department?.departmentName || refreshedEmployee.department?.name || prev.department,
        designation: refreshedEmployee.designation?.name || prev.designation,
        reportingTo: refreshedEmployee.reportingTo?.fullName ||
          (refreshedEmployee.reportingTo?.firstName && refreshedEmployee.reportingTo?.lastName
            ? `${refreshedEmployee.reportingTo.firstName} ${refreshedEmployee.reportingTo.lastName}`.trim()
            : refreshedEmployee.reportingTo?.name || prev.reportingTo),
        location: refreshedEmployee.location?.name || prev.location,
        site: refreshedEmployee.site?.name || refreshedEmployee.site || prev.site,
        building: refreshedEmployee.building?.name || refreshedEmployee.building || prev.building,
        role: refreshedEmployee.role || prev.role,
        shift: refreshedEmployee.shiftType || refreshedEmployee.shift?.name || refreshedEmployee.shift || prev.shift,
        uid: refreshedEmployee.uid || prev.uid,
        uidDocUrl: refreshedEmployee.uidDocUrl || prev.uidDocUrl,
        labourNumber: refreshedEmployee.labourNumber || prev.labourNumber,
        labourNumberDocUrl: refreshedEmployee.labourNumberDocUrl || prev.labourNumberDocUrl,
        eidNumber: refreshedEmployee.eidNumber || prev.eidNumber,
        eidNumberDocUrl: refreshedEmployee.eidNumberDocUrl || prev.eidNumberDocUrl,
        visaNumber: refreshedEmployee.visaNumber || prev.visaNumber,
        visaNumberDocUrl: refreshedEmployee.visaNumberDocUrl || prev.visaNumberDocUrl,
        iban: refreshedEmployee.iban || prev.iban,
        ibanDocUrl: refreshedEmployee.ibanDocUrl || prev.ibanDocUrl,
        passportDocUrl: refreshedEmployee.passportDocUrl || prev.passportDocUrl,
        drivingLicenseDocUrl: refreshedEmployee.drivingLicenseDocUrl || prev.drivingLicenseDocUrl,
        basicSalary: refreshedEmployee.basicSalary || prev.basicSalary,
        bankDetails: {
          bankName: refreshedEmployee.bankDetails?.bankName || refreshedEmployee.bankName || prev.bankDetails.bankName,
          branchName: refreshedEmployee.bankDetails?.branchName || refreshedEmployee.branchName || prev.bankDetails.branchName,
          accountNumber: refreshedEmployee.bankDetails?.accountNumber || refreshedEmployee.accountNumber || prev.bankDetails.accountNumber,
          accountHolderName: refreshedEmployee.bankDetails?.accountHolderName || refreshedEmployee.accountHolderName || prev.bankDetails.accountHolderName,
          ifscCode: refreshedEmployee.bankDetails?.ifscCode || refreshedEmployee.ifscCode || prev.bankDetails.ifscCode,
        },
        workExperience: (refreshedEmployee.experience || []).map((exp: any) => ({
          companyName: exp.companyName || "",
          jobTitle: exp.jobTitle || "",
          fromDate: sanitizeDate(exp.fromDate),
          toDate: sanitizeDate(exp.toDate),
          currentlyWorkHere: !exp.toDate,
          jobDescription: exp.jobDescription || "",
          documentUrl: exp.documentUrl || "",
        })),
        education: (refreshedEmployee.education || []).map((edu: any) => ({
          instituteName: edu.instituteName || "",
          degree: edu.degree || "",
          fieldOfStudy: edu.specialization || edu.fieldOfStudy || "",
          startYear: sanitizeYear(edu.startyear || edu.startYear),
          endYear: sanitizeYear(edu.dateOfCompletion || edu.endyear || edu.endYear),
          documentUrl: edu.documentUrl || "",
        })),

        address: {
          addressLine1: refreshedEmployee.presentAddressLine1 || refreshedEmployee.presentAddress?.addressLine1 || "",
          addressLine2: refreshedEmployee.presentAddressLine2 || refreshedEmployee.presentAddress?.addressLine2 || "",
          city: refreshedEmployee.presentCity || refreshedEmployee.presentAddress?.city || "",
          state: refreshedEmployee.presentState || refreshedEmployee.presentAddress?.state || "",
          country: refreshedEmployee.presentCountry || refreshedEmployee.presentAddress?.country || "",
          pinCode: refreshedEmployee.presentPinCode || refreshedEmployee.presentAddress?.pinCode || "",
        },
        emergencyContact: {
          contactName: refreshedEmployee.emergencyContactName || refreshedEmployee.emergencyContact?.contactName || "",
          relation: refreshedEmployee.emergencyContactRelation || refreshedEmployee.emergencyContact?.relation || "",
          contactNumber: refreshedEmployee.emergencyContactNumber || refreshedEmployee.emergencyContact?.contactNumber || "",
        },
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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4 pl-0 hover:bg-transparent hover:text-gray-900 text-gray-600 gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Button>
          )}
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
          userRole={userRole}
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
