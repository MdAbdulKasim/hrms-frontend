"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Edit, ArrowLeft, Loader2, Camera, Mail, Phone, MapPin, Briefcase, Calendar, ShieldCheck, User, X, ChevronLeft } from "lucide-react"
import { getApiUrl, getAuthToken, getOrgId, getEmployeeId, getUserRole } from "@/lib/auth"
import { CustomAlertDialog } from "@/components/ui/custom-dialogs"
import ChangePassword from "./ChangePassword"
import ProfileForm from "./ProfileForm"
import OrgProfilePage from "./OrgProfilePage"
import { type FormData as ProfileFormData, initialFormData } from "./types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import ContractService from "@/lib/contractService"
import { getContractTypeLabel } from "@/types/contractTypes"

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
  const [isLoading, setIsLoading] = useState(true)

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
      setIsLoading(true);
      try {
        const token = getAuthToken()
        const apiUrl = getApiUrl()

        if (!token || !orgId || !employeeId) {
          console.error("Authentication, organization ID, or employee ID missing")
          setIsLoading(false);
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
          site: getSiteName(employee.location, employee.siteId) || employee.site?.name || employee.site || "",
          building: getBuildingName(employee.location, employee.siteId, employee.buildingId) || employee.building?.name || employee.building || "",
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
          uid: employee.uidNumber || employee.uid || "",
          uidDocUrl: employee.uidCopyUrl || employee.uidDocUrl || "",
          labourNumber: employee.labourNumber || "",
          labourNumberDocUrl: employee.labourCardCopyUrl || employee.labourNumberDocUrl || "",
          eidNumber: employee.emiratesId || employee.eidNumber || employee.eid || "",
          eidNumberDocUrl: employee.emiratesIdCopyUrl || employee.eidNumberDocUrl || "",
          visaNumber: employee.visaNumber || "",
          visaNumberDocUrl: employee.visaCopyUrl || employee.visaNumberDocUrl || "",
          iban: employee.iban || "",
          ibanDocUrl: employee.ibanDocUrl || "",
          passportNumber: employee.passportNumber || "",
          passportDocUrl: employee.passportCopyUrl || employee.passportDocUrl || "",
          drivingLicenseNumber: employee.drivingLicenseNumber || "",
          drivingLicenseDocUrl: employee.drivingLicenseCopyUrl || employee.drivingLicenseDocUrl || "",
          iqamaId: employee.iqamaId || "",
          iqamaCopyUrl: employee.iqamaCopyUrl || "",
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
            const contract = await ContractService.getActiveContract(employee.employeeNumber);

            if (contract) {
              // Update form data with contract information
              setFormData(prev => ({
                ...prev,
                contractType: getContractTypeLabel(contract.contractType),
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
      } finally {
        setIsLoading(false);
      }
    }

    if (employeeId && orgId && employeeId !== "undefined" && orgId !== "undefined") {
      fetchEmployeeData()
    } else {
      setIsLoading(false);
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

      if (name === 'uid') {
        finalValue = value.replace(/[^0-9]/g, '').slice(0, 9);
      } else if (name === 'labourNumber') {
        finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      } else if (name === 'eidNumber') {
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
        // If it was marked for deletion, clear that mark
        const mapping: { [key: string]: keyof ProfileFormData } = {
          'uidDoc': 'uidDocUrl',
          'labourNumberDoc': 'labourNumberDocUrl',
          'eidNumberDoc': 'eidNumberDocUrl',
          'visaNumberDoc': 'visaNumberDocUrl',
          'passportDoc': 'passportDocUrl',
          'drivingLicenseDoc': 'drivingLicenseDocUrl',
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
        'uidDoc': 'uidDocUrl',
        'labourNumberDoc': 'labourNumberDocUrl',
        'eidNumberDoc': 'eidNumberDocUrl',
        'visaNumberDoc': 'visaNumberDocUrl',
        'passportDoc': 'passportDocUrl',
        'drivingLicenseDoc': 'drivingLicenseDocUrl',
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
      const employeeId = propEmployeeId || getEmployeeId()
      const apiUrl = getApiUrl()


      if (!token || !orgId || !employeeId) {
        console.error("Authentication, organization ID, or employee ID missing")
        return
      }

      const formDataToSend = new FormData()

      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof ProfileFormData]

        // Flatten address fields to match backend entity individual columns
        if (key === 'address') {
          const addr = value as any;
          if (addr.addressLine1) formDataToSend.append('presentAddressLine1', String(addr.addressLine1));
          if (addr.addressLine2) formDataToSend.append('presentAddressLine2', String(addr.addressLine2));
          if (addr.city) formDataToSend.append('presentCity', String(addr.city));
          if (addr.state) formDataToSend.append('presentState', String(addr.state));
          if (addr.country) formDataToSend.append('presentCountry', String(addr.country));
          if (addr.pinCode) formDataToSend.append('presentPinCode', String(addr.pinCode));
          return
        }

        // Handle bankDetails: Send as JSON array to match backend expectation
        if (key === 'bankDetails') {
          // Backend expects an array of bank details - also populate individual fields for backward compatibility
          const bank = value as any;
          formDataToSend.append('bankDetails', JSON.stringify([bank]));
          formDataToSend.append('bankName', String(bank.bankName || ''));
          formDataToSend.append('branchName', String(bank.branchName || ''));
          formDataToSend.append('accountNumber', String(bank.accountNumber || ''));
          formDataToSend.append('accountHolderName', String(bank.accountHolderName || ''));
          formDataToSend.append('ifscCode', String(bank.ifscCode || ''));
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

        // Map frontend ID fields to backend field names
        if (key === 'uid') {
          formDataToSend.append('uidNumber', String(value || ''))
          return
        }
        if (key === 'eidNumber') {
          formDataToSend.append('emiratesId', String(value || ''))
          return
        }
        if (key === 'iqamaId') {
          formDataToSend.append('iqamaId', String(value || ''))
          return
        }

        // Exclude fields not present in backend entity to prevent 500 errors
        if ([
          'contractType', 'contractStartDate', 'contractEndDate',
          'uidDocUrl', 'labourNumberDocUrl', 'eidNumberDocUrl',
          'visaNumberDocUrl', 'passportDocUrl', 'drivingLicenseDocUrl', 'ibanDocUrl', 'iqamaCopyUrl'
        ].includes(key)) {
          return
        }

        // Handle numeric fields: Don't send empty strings for decimal columns
        if ((key === 'basicSalary' || key === 'salary') && !value) {
          return
        }

        // Map specific frontend fields to backend column names
        if (key === 'workExperience') {
          formDataToSend.append('experience', JSON.stringify(value))
          return
        }

        if (key === 'education') {
          formDataToSend.append('education', JSON.stringify(value))
          return
        }

        if (key === 'emergencyContact') {
          const contact = value as any;
          formDataToSend.append('emergencyContactName', String(contact.contactName || ''));
          formDataToSend.append('emergencyContactRelation', String(contact.relation || ''));
          formDataToSend.append('emergencyContactNumber', String(contact.contactNumber || ''));
          return
        }

        if (key === 'emailAddress') {
          formDataToSend.append('email', String(value || ''));
          return
        }

        if (key === 'mobileNumber') {
          formDataToSend.append('phoneNumber', String(value || ''));
          return
        }
        // Generic handling for other fields
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

      })

      // Handle document deletions - mapping frontend docUrl fields to backend copyUrl fields
      const deletionMapping: { [key: string]: string } = {
        'uidDocUrl': 'uidCopyUrl',
        'labourNumberDocUrl': 'labourCardCopyUrl',
        'eidNumberDocUrl': 'emiratesIdCopyUrl',
        'visaNumberDocUrl': 'visaCopyUrl',
        'passportDocUrl': 'passportCopyUrl',
        'drivingLicenseDocUrl': 'drivingLicenseCopyUrl',
        'iqamaCopyUrl': 'iqamaCopyUrl',
      };

      Object.entries(deletionMapping).forEach(([formField, backendField]) => {
        if (formData[formField as keyof ProfileFormData] === null) {
          formDataToSend.append(backendField, '');
        }
      });

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

      // Handle bankDetails - backend can return it as array or object
      const bankData = (refreshedEmployee.bankDetails && Array.isArray(refreshedEmployee.bankDetails) && refreshedEmployee.bankDetails.length > 0)
        ? refreshedEmployee.bankDetails[0]
        : (typeof refreshedEmployee.bankDetails === 'object' && refreshedEmployee.bankDetails !== null && !Array.isArray(refreshedEmployee.bankDetails))
          ? refreshedEmployee.bankDetails
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
        site: getSiteName(refreshedEmployee.location, refreshedEmployee.siteId) || refreshedEmployee.site?.name || refreshedEmployee.site || prev.site,
        building: getBuildingName(refreshedEmployee.location, refreshedEmployee.siteId, refreshedEmployee.buildingId) || refreshedEmployee.building?.name || refreshedEmployee.building || prev.building,
        role: refreshedEmployee.role || prev.role,
        shift: refreshedEmployee.shiftType || refreshedEmployee.shift?.name || refreshedEmployee.shift || prev.shift,
        uid: refreshedEmployee.uidNumber || refreshedEmployee.uid || prev.uid,
        uidDocUrl: refreshedEmployee.uidCopyUrl || refreshedEmployee.uidDocUrl || prev.uidDocUrl,
        labourNumber: refreshedEmployee.labourNumber || prev.labourNumber,
        labourNumberDocUrl: refreshedEmployee.labourCardCopyUrl || refreshedEmployee.labourNumberDocUrl || prev.labourNumberDocUrl,
        eidNumber: refreshedEmployee.emiratesId || refreshedEmployee.eidNumber || prev.eidNumber,
        eidNumberDocUrl: refreshedEmployee.emiratesIdCopyUrl || refreshedEmployee.eidNumberDocUrl || prev.eidNumberDocUrl,
        visaNumber: refreshedEmployee.visaNumber || prev.visaNumber,
        visaNumberDocUrl: refreshedEmployee.visaCopyUrl || refreshedEmployee.visaNumberDocUrl || prev.visaNumberDocUrl,
        iban: refreshedEmployee.iban || prev.iban,
        ibanDocUrl: refreshedEmployee.ibanDocUrl || prev.ibanDocUrl,
        passportNumber: refreshedEmployee.passportNumber || prev.passportNumber,
        passportDocUrl: refreshedEmployee.passportCopyUrl || refreshedEmployee.passportDocUrl || prev.passportDocUrl,
        drivingLicenseNumber: refreshedEmployee.drivingLicenseNumber || prev.drivingLicenseNumber,
        drivingLicenseDocUrl: refreshedEmployee.drivingLicenseCopyUrl || refreshedEmployee.drivingLicenseDocUrl || prev.drivingLicenseDocUrl,
        iqamaId: refreshedEmployee.iqamaId || prev.iqamaId,
        iqamaCopyUrl: refreshedEmployee.iqamaCopyUrl || prev.iqamaCopyUrl,
        basicSalary: refreshedEmployee.basicSalary || prev.basicSalary,
        bankDetails: {
          bankName: bankData?.bankName || refreshedEmployee.bankName || prev.bankDetails.bankName,
          branchName: bankData?.branchName || refreshedEmployee.branchName || prev.bankDetails.branchName,
          accountNumber: bankData?.accountNumber || refreshedEmployee.accountNumber || prev.bankDetails.accountNumber,
          accountHolderName: bankData?.accountHolderName || refreshedEmployee.accountHolderName || prev.bankDetails.accountHolderName,
          ifscCode: bankData?.ifscCode || refreshedEmployee.ifscCode || prev.bankDetails.ifscCode,
        },
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

      // Refresh profile picture
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
      }
      setSelectedProfilePicFile(null)

      // Refresh contract data
      if (refreshedEmployee.employeeNumber) {
        try {
          const contract = await ContractService.getActiveContract(refreshedEmployee.employeeNumber);

          if (contract) {
            // Update form data with contract information
            setFormData(prev => ({
              ...prev,
              contractType: getContractTypeLabel(contract.contractType),
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
    <div className="min-h-screen bg-white p-0 text-gray-900">
      {/* Profile Header Banner */}
      <div className="h-30 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
        <button
          onClick={onBack || (() => router.back())}
          className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-all"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 -mt-24">
        {/* Profile Info Card */}
        <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden mb-8">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 p-6 sm:p-8 bg-white">
              <div className="relative group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  {profilePicUrl ? (
                    <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-gray-300" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-2 right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg cursor-pointer transition-all">
                    <Camera size={18} />
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
                <Button onClick={() => setShowPasswordChange(true)} variant="outline" className="rounded-xl px-6 h-11 text-sm font-semibold">
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
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 px-8 py-4 text-sm font-semibold text-gray-500 transition-all"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="personal"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 px-8 py-4 text-sm font-semibold text-gray-500 transition-all"
                >
                  Personal Details
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 px-8 py-4 text-sm font-semibold text-gray-500 transition-all"
                >
                  Documents
                </TabsTrigger>
                <TabsTrigger
                  value="experience"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 px-8 py-4 text-sm font-semibold text-gray-500 transition-all"
                >
                  Professional
                </TabsTrigger>
                {userRole === 'admin' && (
                  <TabsTrigger
                    value="org"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 px-8 py-4 text-sm font-semibold text-gray-500 transition-all"
                  >
                    Organization
                  </TabsTrigger>
                )}
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
                        handleDeleteFile={handleDeleteFile}
                        handleSave={handleSave}
                        employeeId={propEmployeeId || getEmployeeId() || ""}
                        activeSection="overview"
                      />
                    </TabsContent>
                    <TabsContent value="personal" className="mt-0">
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
                        handleDeleteFile={handleDeleteFile}
                        handleSave={handleSave}
                        employeeId={propEmployeeId || getEmployeeId() || ""}
                        activeSection="personal"
                      />
                    </TabsContent>
                    <TabsContent value="documents" className="mt-0">
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
                        handleDeleteFile={handleDeleteFile}
                        handleSave={handleSave}
                        employeeId={propEmployeeId || getEmployeeId() || ""}
                        activeSection="documents"
                      />
                    </TabsContent>
                    <TabsContent value="experience" className="mt-0">
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
                        handleDeleteFile={handleDeleteFile}
                        handleSave={handleSave}
                        employeeId={propEmployeeId || getEmployeeId() || ""}
                        activeSection="experience"
                      />
                    </TabsContent>
                    {userRole === 'admin' && (
                      <TabsContent value="org" className="mt-0">
                        <OrgProfilePage
                          isEditing={isEditing}
                          setIsEditing={setIsEditing}
                        />
                      </TabsContent>
                    )}
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
