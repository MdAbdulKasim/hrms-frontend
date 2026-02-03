"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Edit, ChevronLeft, User, Camera, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getApiUrl, getAuthToken, getOrgId, getEmployeeId, getUserRole } from "@/lib/auth"
import { CustomAlertDialog } from "@/components/ui/custom-dialogs"
import EProfileForm from "./EProfileForm"
import { type FormData as ProfileFormData, initialFormData } from "./types"
import ChangePassword from "../../admin/profile/ChangePassword"
import ContractService from "@/lib/contractService"
import { getContractTypeLabel, getContractTypeValue } from "@/types/contractTypes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Mail, Phone, MapPin } from "lucide-react"

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
  const [contractId, setContractId] = useState<string | null>(null)

  // Alert State
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

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
          uid: employee.uidNumber || "",
          uidDocUrl: employee.uidCopyUrl || "",
          labourNumber: employee.labourNumber || "",
          labourDocUrl: employee.labourCardCopyUrl || "",
          emiratesId: employee.emiratesId || "",
          emiratesIdDocUrl: employee.emiratesIdCopyUrl || "",
          visaNumber: employee.visaNumber || "",
          visaDocUrl: employee.visaCopyUrl || "",
          passportNumber: employee.passportNumber || "",
          passportDocUrl: employee.passportCopyUrl || "",
          drivingLicenseNumber: employee.drivingLicenseNumber || "",
          drivingLicenseDocUrl: employee.drivingLicenseCopyUrl || "",
          iqamaId: employee.iqamaId || "",
          iqamaCopyUrl: employee.iqamaCopyUrl || "",
          basicSalary: employee.basicSalary || "",
          iban: employee.iban || "",
          ibanDocUrl: employee.ibanDocUrl || "",
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

        // Fetch contract data - fetch ALL contracts for Admin (to see future ones), Active for Employee
        if (employee.employeeNumber) {
          try {
            let latestContract: any = null;
            const currentRole = getUserRole(); // Get role synchronously

            if (currentRole === 'admin') {
              // Admin can see all contracts, so we fetch all to find the latest (even if future dated)
              const contracts = await ContractService.getAllContracts(employee.employeeNumber);
              if (contracts && contracts.length > 0) {
                // Sort by startDate descending
                const sortedContracts = contracts.sort((a: any, b: any) =>
                  new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                );
                latestContract = sortedContracts[0];
              }
            } else {
              // Employee can only see their Active contract (backend restriction)
              latestContract = await ContractService.getActiveContract(employee.employeeNumber);
            }

            if (latestContract) {
              // Update form data with contract information
              setContractId(latestContract.id)
              setFormData(prev => ({
                ...prev,
                contractType: getContractTypeLabel(latestContract.contractType),
                contractStartDate: sanitizeDate(latestContract.startDate),
                contractEndDate: sanitizeDate(latestContract.endDate),
              }))
            }
          } catch (error) {
            console.log("Failed to fetch contract data", error)
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
      setIsLoading(true)
      fetchEmployeeData().finally(() => setIsLoading(false))
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

      if (name === 'uid') {
        finalValue = value.replace(/[^0-9]/g, '').slice(0, 9);
      } else if (name === 'labourNumber') {
        finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      } else if (name === 'emiratesId') {
        let val = value.replace(/\D/g, "");
        if (val.length > 15) val = val.slice(0, 15);
        let formatted = val;
        if (val.length > 3) formatted = val.slice(0, 3) + "-" + val.slice(3);
        if (val.length > 7) formatted = formatted.slice(0, 8) + "-" + formatted.slice(8);
        if (val.length > 14) formatted = formatted.slice(0, 16) + "-" + formatted.slice(16);
        finalValue = formatted;
      } else if (name === 'iqamaId') {
        let digits = value.replace(/[^0-9]/g, '').slice(0, 10);
        if (digits.length > 0 && digits[0] !== '2') return;
        finalValue = digits;
      } else if (name === 'passportNumber' || name === 'drivingLicenseNumber') {
        finalValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15);
      } else if (name === 'visaNumber') {
        finalValue = value.replace(/[^0-9]/g, '').slice(0, 15);
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
        // If it was marked for deletion, clear that mark by setting a placeholder or removing from null
        const mapping: { [key: string]: keyof ProfileFormData } = {
          'uidCopy': 'uidDocUrl',
          'labourCardCopy': 'labourDocUrl',
          'emiratesIdCopy': 'emiratesIdDocUrl',
          'visaCopy': 'visaDocUrl',
          'passportCopy': 'passportDocUrl',
          'drivingLicenseCopy': 'drivingLicenseDocUrl',
          'ibanDoc': 'ibanDocUrl',
          'iqamaCopy': 'iqamaCopyUrl'
        }
        const formField = mapping[fieldName || '']
        if (formField) {
          setFormData(prev => ({ ...prev, [formField]: 'pending_upload' }))
        }
      }
    }
  }

  const handleDeleteFile = (fieldName: string) => {
    if (fieldName === "profilePic") {
      setSelectedProfilePicFile(null)
      setProfilePicUrl(null)
    } else {
      setSelectedFiles(prev => {
        const next = { ...prev }
        delete next[fieldName]
        return next
      })
      // Clear the URL in formData to signal deletion
      const mapping: { [key: string]: keyof ProfileFormData } = {
        'uidCopy': 'uidDocUrl',
        'labourCardCopy': 'labourDocUrl',
        'emiratesIdCopy': 'emiratesIdDocUrl',
        'visaCopy': 'visaDocUrl',
        'passportCopy': 'passportDocUrl',
        'drivingLicenseCopy': 'drivingLicenseDocUrl',
        'ibanDoc': 'ibanDocUrl',
        'iqamaCopy': 'iqamaCopyUrl'
      }
      const formField = mapping[fieldName]
      if (formField) {
        setFormData(prev => ({ ...prev, [formField]: null as any }))
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

        if ([
          'employeeNumber', 'role', 'department', 'designation', 'reportingTo',
          'location', 'site', 'building', 'employeeStatus',
          'uidDocUrl', 'labourDocUrl', 'emiratesIdDocUrl', 'visaDocUrl',
          'passportDocUrl', 'drivingLicenseDocUrl', 'ibanDocUrl',
          'basicSalary'
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
          if (key === 'uid') {
            formDataToSend.append('uidNumber', String(value));
          } else if (typeof value === 'boolean') {
            formDataToSend.append(key, String(value));
          } else {
            formDataToSend.append(key, String(value))
          }
        }
      })

      // Handle document deletions - mapping frontend docUrl fields to backend copyUrl fields
      const deletionMapping: { [key: string]: string } = {
        'uidDocUrl': 'uidCopyUrl',
        'labourDocUrl': 'labourCardCopyUrl',
        'emiratesIdDocUrl': 'emiratesIdCopyUrl',
        'visaDocUrl': 'visaCopyUrl',
        'passportDocUrl': 'passportCopyUrl',
        'drivingLicenseDocUrl': 'drivingLicenseCopyUrl',
        'iqamaCopyUrl': 'iqamaCopyUrl',
        // 'ibanDocUrl' // Backend doesn't seem to have IBAN doc yet
      };

      Object.entries(deletionMapping).forEach(([formField, backendField]) => {
        if (formData[formField as keyof ProfileFormData] === null) {
          formDataToSend.append(backendField, '');
        }
      });

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

      // Handle Contract Update/Create (Admin only) - RESTORED
      if (userRole === 'admin') {
        // Only proceed if contract validation passes - start date is mandatory
        if (formData.contractType && formData.contractStartDate) {
          try {
            if (!formData.employeeNumber) {
              throw new Error("Employee Number is missing. Cannot save contract.");
            }

            const backendContractType = getContractTypeValue(formData.contractType);
            const contractPayload = {
              employeeNumber: formData.employeeNumber,
              contractType: backendContractType,
              startDate: formData.contractStartDate,
              endDate: formData.contractEndDate || undefined,
              basicSalary: Number(formData.basicSalary) || 0,
              allowances: {},
              deductions: {}
            };

            if (contractId) {
              await ContractService.updateContract(contractId, contractPayload);
            } else {
              const newContract = await ContractService.createContract(contractPayload);
              if (newContract && newContract.id) {
                setContractId(newContract.id);
              }
            }
          } catch (contractError: any) {
            console.error("Failed to save contract details:", contractError);
            throw new Error(`Profile saved, but Contract failed: ${contractError.message || "Unknown error"}`);
          }
        }
      }

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
        uid: employee.uidNumber || "",
        uidDocUrl: employee.uidCopyUrl || "",
        labourNumber: employee.labourNumber || "",
        labourDocUrl: employee.labourCardCopyUrl || "",
        emiratesId: employee.emiratesId || "",
        emiratesIdDocUrl: employee.emiratesIdCopyUrl || "",
        visaNumber: employee.visaNumber || "",
        visaDocUrl: employee.visaCopyUrl || "",
        iqamaId: employee.iqamaId || "",
        iqamaCopyUrl: employee.iqamaCopyUrl || "",
        passportNumber: employee.passportNumber || "",
        passportDocUrl: employee.passportCopyUrl || "",
        drivingLicenseNumber: employee.drivingLicenseNumber || "",
        drivingLicenseDocUrl: employee.drivingLicenseCopyUrl || "",
        basicSalary: employee.basicSalary || "",
        iban: employee.iban || "",
        ibanDocUrl: employee.ibanDocUrl || "",
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
          let latestContract: any = null;
          // userRole might be stale in closure, use getUserRole()
          const currentRole = getUserRole();

          if (currentRole === 'admin') {
            const contracts = await ContractService.getAllContracts(employee.employeeNumber);
            if (contracts && contracts.length > 0) {
              const sortedContracts = contracts.sort((a: any, b: any) =>
                new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
              );
              latestContract = sortedContracts[0];
            }
          } else {
            latestContract = await ContractService.getActiveContract(employee.employeeNumber);
          }

          if (latestContract) {
            setContractId(latestContract.id)
            setFormData(prev => ({
              ...prev,
              contractType: getContractTypeLabel(latestContract.contractType),
              contractStartDate: sanitizeDate(latestContract.startDate),
              contractEndDate: sanitizeDate(latestContract.endDate),
            }))
          }
        } catch (error) {
          console.log("Failed to fetch contract data", error)
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
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-4xl mx-auto">
          <ChangePassword onBack={() => setShowPasswordChange(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-2 text-gray-900">
      {/* Profile Header Banner */}
      <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-all"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-24">
        {/* Profile Info Card */}
        <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden mb-8">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 p-6 sm:p-8 bg-white">
              <div className="relative group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center transition-transform group-hover:scale-[1.02]">
                  {profilePicUrl ? (
                    <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-gray-300" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-110">
                    <Camera size={20} />
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </label>
                )}
              </div>

              <div className="flex-1 text-center md:text-left space-y-2 mb-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{formData.fullName || "Loading..."}</h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 italic">
                    {formData.employeeStatus || "Active"}
                  </span>
                </div>
                <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2">
                  <Briefcase size={16} />
                  {formData.designation} • {formData.department}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400 mt-4">
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} />
                    {formData.emailAddress}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} />
                    {formData.mobileNumber}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {formData.location}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-2">
                <Button onClick={() => setShowPasswordChange(true)} variant="outline" className="rounded-xl px-4 h-11 text-sm font-semibold">
                  Update Security
                </Button>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="rounded-xl px-8 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 text-sm font-semibold gap-2">
                    <Edit size={16} />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl px-6 h-11 text-sm font-semibold">
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="rounded-xl px-8 h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 text-sm font-semibold gap-2">
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start h-auto p-0 bg-gray-50/50 border-y border-gray-100 overflow-x-auto scrollbar-hide">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 px-8 py-4 text-sm font-semibold text-gray-500 transition-all font-inter"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="personal"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 px-8 py-4 text-sm font-semibold text-gray-500 transition-all font-inter"
                >
                  Personal Details
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 px-8 py-4 text-sm font-semibold text-gray-500 transition-all font-inter"
                >
                  Documents
                </TabsTrigger>
                <TabsTrigger
                  value="experience"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 px-8 py-4 text-sm font-semibold text-gray-500 transition-all font-inter"
                >
                  Professional
                </TabsTrigger>
              </TabsList>

              <div className="p-6 sm:p-8 bg-white">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-gray-400 font-medium">Restructuring profile data...</p>
                  </div>
                ) : (
                  <>
                    <TabsContent value="overview" className="mt-0">
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
                        handleDeleteFile={handleDeleteFile}
                        handleSave={handleSave}
                        employeeId={getEmployeeId() || ""}
                        activeSection="overview"
                      />
                    </TabsContent>
                    <TabsContent value="personal" className="mt-0">
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
                        handleDeleteFile={handleDeleteFile}
                        handleSave={handleSave}
                        employeeId={getEmployeeId() || ""}
                        activeSection="personal"
                      />
                    </TabsContent>
                    <TabsContent value="documents" className="mt-0">
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
                        handleDeleteFile={handleDeleteFile}
                        handleSave={handleSave}
                        employeeId={getEmployeeId() || ""}
                        activeSection="documents"
                      />
                    </TabsContent>
                    <TabsContent value="experience" className="mt-0">
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
                        handleDeleteFile={handleDeleteFile}
                        handleSave={handleSave}
                        employeeId={getEmployeeId() || ""}
                        activeSection="experience"
                      />
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
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
