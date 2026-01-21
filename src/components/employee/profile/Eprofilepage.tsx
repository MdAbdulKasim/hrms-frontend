"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Edit, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getApiUrl, getAuthToken, getOrgId, getEmployeeId, getUserRole } from "@/lib/auth"
import { CustomAlertDialog } from "@/components/ui/custom-dialogs"
import EProfileForm from "./EProfileForm"
import { type FormData as ProfileFormData, initialFormData } from "./types"
import ChangePassword from "../../admin/profile/ChangePassword"

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


export default function EmployeeProfilePage() {
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
    const employeeId = getEmployeeId()
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

        // Handle bankDetails - backend can return it as array or object
        const bankData = (employee.bankDetails && Array.isArray(employee.bankDetails) && employee.bankDetails.length > 0)
          ? employee.bankDetails[0]
          : (typeof employee.bankDetails === 'object' && employee.bankDetails !== null && !Array.isArray(employee.bankDetails))
            ? employee.bankDetails
            : null

        // Helper function to get site name from location
        const getSiteName = (loc: any, siteId: string) => {
          if (!loc || !loc.sites || !siteId) return "";
          const site = loc.sites.find((s: any) => s.id === siteId || s._id === siteId || s.name === siteId);
          return site ? (site.name || site.siteName || "") : siteId;
        };

        // Helper function to get building name from location
        const getBuildingName = (loc: any, siteId: string, buildingId: string) => {
          if (!loc || !loc.sites || !siteId || !buildingId) return "";
          const site = loc.sites.find((s: any) => s.id === siteId || s._id === siteId || s.name === siteId);
          if (!site || !site.buildings) return buildingId;
          const building = site.buildings.find((b: any) => b.id === buildingId || b._id === buildingId || b.name === buildingId);
          return building ? (building.name || building.buildingName || "") : buildingId;
        };

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
          site: getSiteName(employee.location, employee.siteId) || "",
          building: getBuildingName(employee.location, employee.siteId, employee.buildingId) || "",
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
          // uan: employee.UAN || employee.uan || "",
          // uanDocUrl: employee.uanDocUrl || "",
          iban: employee.iban || "",
          ibanDocUrl: employee.ibanDocUrl || "",
          // pan: employee.PAN || employee.panCard || employee.pan || "",
          // panDocUrl: employee.panDocUrl || "",
          // aadhaarNumber: employee.aadharNumber || employee.aadhaar || "",
          // aadhaarDocUrl: employee.aadharDocUrl || "",
          passportNumber: employee.passportNumber || "",
          passportDocUrl: employee.passportDocUrl || "",
          drivingLicenseNumber: employee.drivingLicenseNumber || "",
          drivingLicenseDocUrl: employee.drivingLicenseDocUrl || "",
          basicSalary: employee.basicSalary || "",
          bankDetails: {
            bankName: bankData?.bankName || employee.bankName || "",
            branchName: bankData?.branchName || employee.branchName || "",
            accountNumber: bankData?.accountNumber || employee.accountNumber || "",
            accountHolderName: bankData?.accountHolderName || employee.accountHolderName || "",
            ifscCode: bankData?.ifscCode || employee.ifscCode || "",
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

        // Fetch contract data
        if (employee.employeeNumber) {
          try {
            const contractResponse = await axios.get(`${apiUrl}/org/${orgId}/contracts/employee/${employee.employeeNumber}/active`, {
              headers: { Authorization: `Bearer ${token}` },
            })

            if (contractResponse.data && typeof contractResponse.data !== 'string') {
              const contract = contractResponse.data.data || contractResponse.data

              // Update form data with contract information
              setFormData(prev => ({
                ...prev,
                contractType: contract.contractType || "",
                contractStartDate: sanitizeDate(contract.startDate),
                contractEndDate: sanitizeDate(contract.endDate),
              }))
            }
          } catch (error) {
            console.log("No active contract found or failed to fetch contract data")
            // Contract is optional, so we don't show an error
          }
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
    } else if (section === "bankDetails") {
      setFormData((prev) => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [field || name]: value },
      }))
    } else {
      let finalValue = value;

      if (name === 'mobileNumber' || name === 'pinCode') {
        finalValue = value.replace(/[^0-9]/g, '');
        // if (name === 'uan') finalValue = finalValue.slice(0, 12);
        if (name === 'pinCode') finalValue = finalValue.slice(0, 6);
        if (name === 'mobileNumber') finalValue = finalValue.slice(0, 15);
      }

      // if (name === 'pan') {
      //   const uppercaseValue = value.toUpperCase();
      //   let validatedValue = '';
      //   for (let i = 0; i < Math.min(uppercaseValue.length, 10); i++) {
      //     const char = uppercaseValue[i];
      //     if (i < 5 || i === 9) {
      //       if (/[A-Z]/.test(char)) validatedValue += char;
      //     } else if (i >= 5 && i <= 8) {
      //       if (/[0-9]/.test(char)) validatedValue += char;
      //     }
      //   }
      //   finalValue = validatedValue;
      // }

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
        const value = formData[key as keyof ProfileFormData]

        // Backend expects 'presentAddress' for the address fields
        if (key === 'address') {
          formDataToSend.append('presentAddress', JSON.stringify(value))
          return
        }

        // Handle emergencyContact - backend expects specific field names
        if (key === 'emergencyContact') {
          formDataToSend.append('emergencyContact', JSON.stringify(value))
          return
        }

        // Handle bankDetails - send as object, not array
        if (key === 'bankDetails') {
          formDataToSend.append('bankDetails', JSON.stringify(value))
          return
        }

        // Handle workExperience - backend expects 'experience'
        if (key === 'workExperience') {
          formDataToSend.append('workExperience', JSON.stringify(value))
          return
        }

        // Handle education
        if (key === 'education') {
          formDataToSend.append('education', JSON.stringify(value))
          return
        }

        // Exclude read-only fields and document URLs (handled separately)
        if ([
          'employeeNumber', 'role', 'department', 'designation', 'reportingTo',
          'location', 'site', 'building', 'employeeStatus',
          'contractType', 'contractStartDate', 'contractEndDate',
          'uanDocUrl', 'panDocUrl', 'aadhaarDocUrl',
          'passportDocUrl', 'drivingLicenseDocUrl', 'ibanDocUrl',
          'uan', 'pan', 'aadhaarNumber', 'basicSalary'
        ].includes(key)) {
          return
        }

        // Handle date fields - only send if valid
        const dateFields = ['dateOfBirth', 'dateOfJoining'];
        if (dateFields.includes(key)) {
          if (value && value !== "" && !String(value).includes("NaN")) {
            formDataToSend.append(key, String(value))
          }
          return
        }

        // Send all other editable fields
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'boolean') {
            formDataToSend.append(key, String(value));
          } else {
            formDataToSend.append(key, String(value))
          }
        }
      })

      // Add profile picture if selected
      if (selectedProfilePicFile) {
        formDataToSend.append('profilePic', selectedProfilePicFile)
      }

      // Add other document files
      Object.keys(selectedFiles).forEach(fieldName => {
        formDataToSend.append(fieldName, selectedFiles[fieldName])
      })

      // Send update request
      await axios.put(`${apiUrl}/org/${orgId}/employees/${employeeId}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      })

      setIsEditing(false)
      setSelectedFiles({})

      // Refresh employee data
      const refreshResponse = await axios.get(`${apiUrl}/org/${orgId}/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const employee = refreshResponse.data?.data || refreshResponse.data

      // Handle bankDetails - backend can return it as array or object
      const bankData = (employee.bankDetails && Array.isArray(employee.bankDetails) && employee.bankDetails.length > 0)
        ? employee.bankDetails[0]
        : (typeof employee.bankDetails === 'object' && employee.bankDetails !== null && !Array.isArray(employee.bankDetails))
          ? employee.bankDetails
          : null

      // Helper function to get site name from location
      const getSiteName = (loc: any, siteId: string) => {
        if (!loc || !loc.sites || !siteId) return "";
        const site = loc.sites.find((s: any) => s.id === siteId || s._id === siteId || s.name === siteId);
        return site ? (site.name || site.siteName || "") : siteId;
      };

      // Helper function to get building name from location
      const getBuildingName = (loc: any, siteId: string, buildingId: string) => {
        if (!loc || !loc.sites || !siteId || !buildingId) return "";
        const site = loc.sites.find((s: any) => s.id === siteId || s._id === siteId || s.name === siteId);
        if (!site || !site.buildings) return buildingId;
        const building = site.buildings.find((b: any) => b.id === buildingId || b._id === buildingId || b.name === buildingId);
        return building ? (building.name || building.buildingName || "") : buildingId;
      };

      // Update form data with refreshed data
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
        site: getSiteName(employee.location, employee.siteId) || "",
        building: getBuildingName(employee.location, employee.siteId, employee.buildingId) || "",
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
        iban: employee.iban || "",
        ibanDocUrl: employee.ibanDocUrl || "",
        passportNumber: employee.passportNumber || "",
        passportDocUrl: employee.passportDocUrl || "",
        drivingLicenseNumber: employee.drivingLicenseNumber || "",
        drivingLicenseDocUrl: employee.drivingLicenseDocUrl || "",
        basicSalary: employee.basicSalary || "",
        bankDetails: {
          bankName: bankData?.bankName || employee.bankName || "",
          branchName: bankData?.branchName || employee.branchName || "",
          accountNumber: bankData?.accountNumber || employee.accountNumber || "",
          accountHolderName: bankData?.accountHolderName || employee.accountHolderName || "",
          ifscCode: bankData?.ifscCode || employee.ifscCode || "",
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

      // Refresh profile picture
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

      // Refresh contract data
      if (employee.employeeNumber) {
        try {
          const contractResponse = await axios.get(`${apiUrl}/org/${orgId}/contracts/employee/${employee.employeeNumber}/active`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (contractResponse.data && typeof contractResponse.data !== 'string') {
            const contract = contractResponse.data.data || contractResponse.data

            // Update form data with contract information
            setFormData(prev => ({
              ...prev,
              contractType: contract.contractType || "",
              contractStartDate: sanitizeDate(contract.startDate),
              contractEndDate: sanitizeDate(contract.endDate),
            }))
          }
        } catch (error) {
          console.log("No active contract found or failed to fetch contract data")
          // Contract is optional, so we don't show an error
        }
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
          <button onClick={() => router.back()} className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">View and manage your personal information.</p>
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

        <EProfileForm
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
