'use client';
import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { Employee, CandidateForm, OnboardingView } from './types';
import CandidateList from './CandidateList';
import AddCandidateForm from './AddCandidateForm';
import BulkImport from './BulkImport';
import ViewCandidate from './ViewCandidate';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import { ConfirmDialog, CustomAlertDialog } from '@/components/ui/custom-dialogs';
import ContractorService from '@/lib/contractorService';
import ContractService from '@/lib/contractService';

const EmployeeOnboardingSystem: React.FC = () => {
  const [currentView, setCurrentView] = useState<OnboardingView>('list');
  const [importType, setImportType] = useState('new');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // API Data States
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [reportingManagers, setReportingManagers] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

  // New state for row selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'fullName',
    direction: 'asc'
  });

  const [statusFilter, setStatusFilter] = useState('Active');

  const [selectedCandidate, setSelectedCandidate] = useState<CandidateForm | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [candidateForm, setCandidateForm] = useState<CandidateForm>({
    employeeNumber: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'employee',
    departmentId: '',
    designationId: '',
    locationId: '',
    reportingToId: '',
    dateOfJoining: '',
    shiftType: '',
    timeZone: 'Asia/Kolkata',
    empType: 'permanent',
    employeeStatus: 'Active',
    siteId: '',
    buildingId: '',
    basicSalary: '',
    accommodationAllowances: [],
    insurances: [],
    contractStartDate: '',
    contractEndDate: '',
    contractType: '',
    candidateSource: undefined,
    referredById: '',
    sourceSummary: '',
    bankDetails: {
      bankName: '',
      branchName: '',
      accountNumber: '',
      accountHolderName: '',
      ifscCode: ''
    },
    teamPosition: '',
    iban: '',
    ibanCopy: null,
    profilePicture: null
  });

  // Dialog States
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });
  const [confirmState, setConfirmState] = useState<{ open: boolean, title: string, description: string, onConfirm: () => void, variant: "default" | "destructive" | "blue" }>({
    open: false, title: "", description: "", onConfirm: () => { }, variant: "destructive"
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

  useEffect(() => {
    const orgId = getOrgId();
    console.log("ONBOARDING MOUNT: OrgId detected:", orgId);
    if (orgId) {
      // Fetch onboarding data first, then employees (so departments are available for lookup)
      fetchOnboardingData().then((metadata) => {
        if (metadata) {
          fetchEmployees(metadata.departments, metadata.designations, metadata.locations);
        } else {
          fetchEmployees();
        }
      });
    } else {
      console.warn("ONBOARDING MOUNT: No OrgId found, skipping fetch.");
    }
  }, []); // Run on mount

  // Fetch employees when status filter changes
  useEffect(() => {
    fetchEmployees();
  }, [statusFilter]);

  // Refresh employees when opening add candidate form to get latest employee IDs
  useEffect(() => {
    if (currentView === 'addCandidate' && !editingEmployeeId) {
      fetchEmployees();
    }
  }, [currentView, editingEmployeeId]);

  const fetchOnboardingData = async () => {
    const orgId = getOrgId();
    const token = getAuthToken();
    const apiUrl = getApiUrl();

    // Strict validation of orgId
    if (!orgId || orgId === 'undefined' || orgId === 'null' || !token) {
      console.warn("ONBOARDING: Skipped fetch due to invalid credentials", { orgId, hasToken: !!token });
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Log the URLs we are about to hit for debugging
      console.log(`ONBOARDING: Fetching from ${apiUrl}/org/${orgId}/departments`);

      // Fetch required data
      const [deptRes, desigRes, locRes] = await Promise.all([
        axios.get(`${apiUrl}/org/${orgId}/departments`),
        axios.get(`${apiUrl}/org/${orgId}/designations`),
        axios.get(`${apiUrl}/org/${orgId}/locations`)
      ]);

      const deptData = deptRes.data.data || deptRes.data || [];
      setDepartments(deptData);
      setDesignations(desigRes.data.data || desigRes.data || []);
      setLocations(locRes.data.data || locRes.data || []);
      // Shifts are handled via local defaults in the UI if not available from backend
      setShifts([]);

      console.log('FETCHED DEPARTMENTS:', deptData.length, deptData.map((d: any) => ({ id: d.id || d._id, name: d.departmentName || d.name })));

      // Return all data so fetchEmployees can use them immediately
      return {
        departments: deptData,
        designations: desigRes.data.data || desigRes.data || [],
        locations: locRes.data.data || locRes.data || []
      };
    } catch (error: any) {
      console.error('Error fetching onboarding data:', error);
      if (error.response?.status === 404) {
        console.error("ONBOARDING: 404 Error details:", {
          url: error.config?.url,
          method: error.config?.method,
          orgIdUsed: orgId
        });
      }
    }
  };

  const fetchEmployees = async (departmentsForLookup?: any[], designationsForLookup?: any[], locationsForLookup?: any[]) => {
    const orgId = getOrgId();
    const token = getAuthToken();
    const apiUrl = getApiUrl();
    console.log("FETCH EMPLOYEES: Config:", { apiUrl, orgId, hasToken: !!token });

    if (!orgId || orgId === 'undefined' || orgId === 'null' || !token) {
      console.warn("FETCH EMPLOYEES: Aborted due to missing/invalid orgId or token.");
      return;
    }

    // Use provided lookup data or fall back to state
    const currentDepartments = departmentsForLookup || departments;
    const currentDesignations = designationsForLookup || designations;
    const currentLocations = locationsForLookup || locations;

    try {
      // Determine query params for status
      const params: any = {
        limit: 1000,
        page: 1
      };

      if (statusFilter === 'Active') {
        params.status = 'active';
      } else if (statusFilter === 'Inactive') {
        params.status = 'inactive';
      }

      console.log("FETCH EMPLOYEES: Fetching with params:", params);
      const res = await axios.get(`${apiUrl}/org/${orgId}/employees`, { params });

      console.log("FETCH EMPLOYEES: Response status:", res.status);
      const employeeData = res.data.data || res.data || [];
      console.log("FETCH EMPLOYEES: Raw data count:", Array.isArray(employeeData) ? employeeData.length : "Not an array");
      const employeeList = Array.isArray(employeeData) ? employeeData : [];

      // Log first employee to see structure
      if (employeeList.length > 0) {
        console.log("FETCH EMPLOYEES: Sample employee structure:", {
          id: employeeList[0].id,
          departmentId: employeeList[0].departmentId,
          department: employeeList[0].department,
          hasDepartmentRelation: !!employeeList[0].department
        });
      }

      console.log('FORMATTING EMPLOYEES: Using departments count:', currentDepartments.length,
        'Provided:', !!departmentsForLookup, 'From state:', departments.length);

      const formattedEmployees = employeeList.map((emp: any) => {
        // Extract department name
        let departmentName = '';
        if (emp.department) {
          if (typeof emp.department === 'string') departmentName = emp.department;
          else departmentName = emp.department.departmentName || emp.department.name || '';
        }
        if (!departmentName && emp.departmentId) {
          const dept = currentDepartments.find((d: any) => String(d.id || d._id) === String(emp.departmentId));
          if (dept) departmentName = dept.departmentName || dept.name || '';
        }

        // Extract designation name
        let designationName = '';
        if (emp.designation) {
          if (typeof emp.designation === 'string') designationName = emp.designation;
          else designationName = emp.designation.designationName || emp.designation.name || '';
        }
        if (!designationName && emp.designationId) {
          const desig = currentDesignations.find((d: any) => String(d.id || d._id) === String(emp.designationId));
          if (desig) designationName = desig.designationName || desig.name || '';
        }

        // Extract location name
        let locationName = '';
        if (emp.location) {
          if (typeof emp.location === 'string') locationName = emp.location;
          else locationName = emp.location.name || '';
        }
        if (!locationName && emp.locationId) {
          const loc = currentLocations.find((l: any) => String(l.id || l._id) === String(emp.locationId));
          if (loc) locationName = loc.name || '';
        }

        return {
          ...emp,
          id: emp.id || emp._id || String(Math.random()),
          employeeNumber: emp.employeeNumber || emp.employeeId || '',
          fullName: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unnamed Employee',
          firstName: emp.firstName || emp.fullName?.split(' ')[0] || '',
          lastName: emp.lastName || emp.fullName?.split(' ').slice(1).join(' ') || '',
          emailId: emp.email || emp.emailId || '',
          officialEmail: emp.officialEmail || emp.email || '',
          phoneNumber: emp.phoneNumber || emp.mobileNumber || '',
          designation: designationName || '',
          department: departmentName || '',
          location: locationName || '',
          onboardingStatus: String(emp.onboardingStatus || emp.status || 'Active'),
          sourceOfHire: String(emp.sourceOfHire || 'Direct'),
          // Document Copies
          passportCopy: emp.passportCopyUrl || '',
          emiratesIdCopy: emp.emiratesIdCopyUrl || '',
          visaCopy: emp.visaCopyUrl || '',
          labourCardCopy: emp.labourCardCopyUrl || '',
          drivingLicenseCopy: emp.drivingLicenseCopyUrl || '',
          uidCopy: emp.uidCopyUrl || '',
        };
      });

      console.log("FETCH EMPLOYEES: Formatted count:", formattedEmployees.length);
      setReportingManagers(formattedEmployees);
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleInputChange = (field: keyof CandidateForm, value: any) => {
    let finalValue = value;

    // Formatting / Validation Masks
    if (field === 'uid') {
      finalValue = String(value).replace(/[^0-9]/g, '').slice(0, 9);
    } else if (field === 'labourNumber') {
      finalValue = String(value).replace(/[^0-9]/g, '').slice(0, 10);
    } else if (field === 'eid') {
      // Emirates ID Format: 784-YYYY-XXXXXXX-X
      let val = String(value).replace(/\D/g, "");
      if (val.length > 15) val = val.slice(0, 15);
      let formatted = val;
      if (val.length > 3) formatted = val.slice(0, 3) + "-" + val.slice(3);
      if (val.length > 7) formatted = formatted.slice(0, 8) + "-" + formatted.slice(8);
      if (val.length > 14) formatted = formatted.slice(0, 16) + "-" + formatted.slice(16);
      finalValue = formatted;
    } else if (field === 'iqamaId') {
      // 10 digits, starts with 2
      let digits = String(value).replace(/[^0-9]/g, '').slice(0, 10);
      if (digits.length > 0 && digits[0] !== '2') {
        return; // Don't allow if not starting with 2
      }
      finalValue = digits;
    } else if (field === 'passportNumber' || field === 'drivingLicenseNumber') {
      finalValue = String(value).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
    } else if (field === 'visaNumber') {
      finalValue = String(value).replace(/[^0-9]/g, '').slice(0, 15);
    }

    setCandidateForm(prev => ({ ...prev, [field]: finalValue }));
  };

  const sendOnboardingEmail = (name: string, email: string, role: string, department: string) => {
    const subject = `Welcome to Our Company - Onboarding Invitation`;
    const body = `Dear ${name},\n\nWelcome to our team! You have been selected for the role of ${role} in the ${department} department.\n\nPlease complete your onboarding process by clicking the link below:\n[Onboarding Portal Link]\n\nBest regards,\nHR Team`;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    showAlert("Success", `Onboarding invitation sent to ${email}`, "success");
  };

  const handleAddCandidate = async () => {
    // Basic validation for required fields
    const requiredFields: any = {
      fullName: 'Full Name',
      email: 'Email Address',
      phoneNumber: 'Mobile Number',
      departmentId: 'Department',
      designationId: 'Role/Designation',
      locationId: 'Location',
      shiftType: 'Shift Type',
      empType: 'Employee Type'
    };

    // Only require Reporting To if there are existing employees
    if (reportingManagers.length > 0) {
      requiredFields.reportingToId = 'Reporting Manager';
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !candidateForm[key as keyof CandidateForm])
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      showAlert("Missing Information", `Please complete the following required fields: \n- ${missingFields.join('\n- ')}`, "warning");
      return;
    }

    const orgId = getOrgId();
    const token = getAuthToken();
    const apiUrl = getApiUrl();

    if (!orgId || !token) {
      showAlert("Authentication Error", "Authentication error. Please log in again.", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Helper to handle empty strings for optional fields
      const cleanValue = (val: any) => (val === '' ? null : val);

      const formData = new FormData();

      // Append basic fields
      formData.append('fullName', candidateForm.fullName);
      formData.append('email', candidateForm.email);
      formData.append('phoneNumber', candidateForm.phoneNumber || candidateForm.mobileNumber || '');
      formData.append('status', candidateForm.employeeStatus || 'Active');
      formData.append('role', 'employee');

      const appendOptional = (key: string, val: any) => {
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, val);
        }
      };

      appendOptional('departmentId', candidateForm.departmentId);
      appendOptional('designationId', candidateForm.designationId);
      appendOptional('locationId', candidateForm.locationId);
      appendOptional('reportingToId', candidateForm.reportingToId);
      appendOptional('siteId', candidateForm.siteId);
      appendOptional('buildingId', candidateForm.buildingId);
      appendOptional('dateOfJoining', candidateForm.dateOfJoining);
      appendOptional('dateOfBirth', candidateForm.dateOfBirth);
      appendOptional('gender', candidateForm.gender);
      appendOptional('maritalStatus', candidateForm.maritalStatus);
      appendOptional('bloodGroup', candidateForm.bloodGroup);
      appendOptional('shiftType', candidateForm.shiftType);
      appendOptional('timeZone', candidateForm.timeZone);
      appendOptional('empType', candidateForm.empType);
      appendOptional('employeeNumber', candidateForm.employeeNumber);
      appendOptional('passportNumber', candidateForm.passportNumber);
      appendOptional('drivingLicenseNumber', candidateForm.drivingLicenseNumber);
      appendOptional('uidNumber', candidateForm.uid);
      appendOptional('labourNumber', candidateForm.labourNumber);
      appendOptional('emiratesId', candidateForm.eid);
      appendOptional('visaNumber', candidateForm.visaNumber);
      appendOptional('iqamaId', candidateForm.iqamaId);
      appendOptional('basicSalary', candidateForm.basicSalary);
      appendOptional('candidateSource', candidateForm.candidateSource);
      appendOptional('referredById', candidateForm.referredById);
      appendOptional('sourceSummary', candidateForm.sourceSummary);
      appendOptional('iban', candidateForm.iban);
      appendOptional('teamPosition', candidateForm.teamPosition);

      // NOTE: Contract fields removed from employee creation - will be created separately via Contract API

      // Append complex objects as JSON strings
      formData.append('experience', JSON.stringify(candidateForm.experience || []));
      formData.append('education', JSON.stringify(candidateForm.education || []));

      // Flatten Address fields
      if (candidateForm.presentAddress) {
        formData.append('presentAddressLine1', candidateForm.presentAddress.addressLine1 || '');
        formData.append('presentAddressLine2', candidateForm.presentAddress.addressLine2 || '');
        formData.append('presentCity', candidateForm.presentAddress.city || '');
        formData.append('presentState', candidateForm.presentAddress.state || '');
        formData.append('presentCountry', candidateForm.presentAddress.country || '');
        formData.append('presentPinCode', candidateForm.presentAddress.pinCode || '');
      }

      if (candidateForm.permanentAddress) {
        formData.append('permanentAddressLine1', candidateForm.permanentAddress.addressLine1 || '');
        formData.append('permanentAddressLine2', candidateForm.permanentAddress.addressLine2 || '');
        formData.append('permanentCity', candidateForm.permanentAddress.city || '');
        formData.append('permanentState', candidateForm.permanentAddress.state || '');
        formData.append('permanentCountry', candidateForm.permanentAddress.country || '');
        formData.append('permanentPinCode', candidateForm.permanentAddress.pinCode || '');
      }

      // Flatten Emergency Contact
      if (candidateForm.emergencyContact) {
        formData.append('emergencyContactName', candidateForm.emergencyContact.contactName || '');
        formData.append('emergencyContactRelation', candidateForm.emergencyContact.relation || '');
        formData.append('emergencyContactNumber', candidateForm.emergencyContact.contactNumber || '');
      }

      // Flatten Bank Details
      if (candidateForm.bankDetails) {
        formData.append('bankName', candidateForm.bankDetails.bankName || '');
        formData.append('branchName', candidateForm.bankDetails.branchName || '');
        formData.append('accountNumber', candidateForm.bankDetails.accountNumber || '');
        formData.append('accountHolderName', candidateForm.bankDetails.accountHolderName || '');
        formData.append('ifscCode', candidateForm.bankDetails.ifscCode || '');

        // Also send as JSON array for the bankDetails column
        formData.append('bankDetails', JSON.stringify([{
          bankName: candidateForm.bankDetails.bankName,
          branchName: candidateForm.bankDetails.branchName,
          accountNumber: candidateForm.bankDetails.accountNumber,
          accountHolderName: candidateForm.bankDetails.accountHolderName,
          ifscCode: candidateForm.bankDetails.ifscCode
        }]));
      }

      // Map allowances and deductions
      const allowances = (candidateForm.accommodationAllowances || []).reduce((acc: any, curr) => {
        if (curr.type && curr.percentage) {
          acc[curr.type] = { enabled: true, percentage: parseFloat(curr.percentage), amount: 0 };
        }
        return acc;
      }, {});
      formData.append('allowances', JSON.stringify(allowances));

      const deductions = (candidateForm.insurances || []).reduce((acc: any, curr) => {
        if (curr.type && curr.percentage) {
          acc[curr.type] = { enabled: true, percentage: parseFloat(curr.percentage), amount: 0 };
        }
        return acc;
      }, {});
      formData.append('deductions', JSON.stringify(deductions));

      // Append Files
      if (candidateForm.passportCopy instanceof File) formData.append('passportCopy', candidateForm.passportCopy);
      if (candidateForm.emiratesIdCopy instanceof File) formData.append('emiratesIdCopy', candidateForm.emiratesIdCopy);
      if (candidateForm.visaCopy instanceof File) formData.append('visaCopy', candidateForm.visaCopy);
      if (candidateForm.labourCardCopy instanceof File) formData.append('labourCardCopy', candidateForm.labourCardCopy);
      if (candidateForm.drivingLicenseCopy instanceof File) formData.append('drivingLicenseCopy', candidateForm.drivingLicenseCopy);
      if (candidateForm.uidCopy instanceof File) formData.append('uidCopy', candidateForm.uidCopy);
      if (candidateForm.iqamaCopy instanceof File) formData.append('iqamaCopy', candidateForm.iqamaCopy);
      if (candidateForm.ibanCopy instanceof File) formData.append('ibanCopy', candidateForm.ibanCopy);
      if (candidateForm.profilePicture instanceof File) formData.append('profilePic', candidateForm.profilePicture);

      console.log("ONBOARDING DEBUG: Sending FormData");

      const response = await axios.post(
        `${apiUrl}/org/${orgId}/employees`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.status === 200 || response.status === 201) {
        const createdEmployee = response.data.data || response.data;
        const employeeNumber = createdEmployee.employeeNumber || candidateForm.employeeNumber;

        // Create contract if contract details are provided
        if (employeeNumber && candidateForm.contractType && candidateForm.contractStartDate) {
          try {
            const contractFormData = new FormData();
            contractFormData.append('employeeNumber', employeeNumber);
            contractFormData.append('contractType', candidateForm.contractType);
            contractFormData.append('startDate', candidateForm.contractStartDate);
            if (candidateForm.contractEndDate) {
              contractFormData.append('endDate', candidateForm.contractEndDate);
            }
            contractFormData.append('basicSalary', String(candidateForm.basicSalary || 0));
            contractFormData.append('allowances', JSON.stringify(allowances));
            contractFormData.append('deductions', JSON.stringify(deductions));

            // Append contract documents here
            if (candidateForm.contractDocuments && candidateForm.contractDocuments.length > 0) {
              candidateForm.contractDocuments.forEach((file: File) => {
                contractFormData.append('contractDocuments', file);
              });
            }

            console.log("Creating contract with FormData");
            await ContractService.createContract(contractFormData);
            console.log("Contract created successfully");
          } catch (contractError: any) {
            console.error("Failed to create contract:", contractError);
            showAlert("Warning", `Employee created successfully but contract creation failed: ${contractError.message}`, "warning");
          }
        }

        // Refresh employee list
        fetchEmployees();

        // Reset form - but don't switch view yet, let AddCandidateForm show success dialog
        setCandidateForm({
          employeeNumber: '',
          fullName: '',
          email: '',
          phoneNumber: '',
          role: 'employee',
          departmentId: '',
          designationId: '',
          locationId: '',
          reportingToId: '',
          dateOfJoining: '',
          shiftType: '',
          timeZone: 'Asia/Kolkata',
          empType: 'permanent',
          employeeStatus: 'Active',
          siteId: '',
          buildingId: '',
          basicSalary: '',
          accommodationAllowances: [],
          insurances: [],
          contractStartDate: '',
          contractEndDate: '',
          contractType: '',
          candidateSource: undefined,
          referredById: '',
          sourceSummary: '',
          bankDetails: {
            bankName: '',
            branchName: '',
            accountNumber: '',
            accountHolderName: '',
            ifscCode: ''
          },
          iqamaId: '',
          iqamaCopy: '',
          teamPosition: '',
          iban: '',
          ibanCopy: null,
          profilePicture: null
        });

        return response.data.data || response.data;
      }
    } catch (error: any) {
      console.error('Onboarding ERROR OBJECT:', error);
      if (error.response) {
        console.error('Onboarding ERROR RESPONSE:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
      }

      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Unknown error";
      showAlert("Error", `Failed to onboard employee: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const mapEmployeeToForm = (emp: any, activeContract: any): CandidateForm => {
    const bankData = (emp.bankDetails && Array.isArray(emp.bankDetails) && emp.bankDetails.length > 0)
      ? emp.bankDetails[0]
      : (typeof emp.bankDetails === 'object' && emp.bankDetails !== null && !Array.isArray(emp.bankDetails))
        ? emp.bankDetails
        : {
          bankName: emp.bankName || '',
          branchName: emp.branchName || '',
          accountNumber: emp.accountNumber || '',
          accountHolderName: emp.accountHolderName || '',
          ifscCode: emp.ifscCode || ''
        };

    const getAllowances = () => {
      const allowancesSource = activeContract?.allowances || emp.allowances;
      if (!allowancesSource) return Array.isArray(emp.accommodationAllowances) ? emp.accommodationAllowances : [];

      const list: any[] = [];
      Object.keys(allowancesSource).forEach(key => {
        const val = allowancesSource[key];
        if (typeof val === 'object' && val !== null && val.enabled && !['homeClaimed', 'foodClaimed', 'travelClaimed'].includes(key)) {
          list.push({ type: key, percentage: String(val.percentage || 0) });
        }
      });

      if (list.length === 0) {
        if (allowancesSource.homeClaimed) list.push({ type: 'house', percentage: String(allowancesSource.homeAllowancePercentage || 0) });
        if (allowancesSource.foodClaimed) list.push({ type: 'food', percentage: String(allowancesSource.foodAllowancePercentage || 0) });
        if (allowancesSource.travelClaimed) list.push({ type: 'travel', percentage: String(allowancesSource.travelAllowancePercentage || 0) });
      }

      return list;
    };

    const getInsurances = () => {
      const deductionsSource = activeContract?.deductions || emp.deductions;
      if (!deductionsSource) {
        if (Array.isArray(emp.insurances)) return emp.insurances;
        if (emp.insuranceType) return [{ type: emp.insuranceType, percentage: String(emp.insurancePercentage || '') }];
        return [];
      }

      const list: any[] = [];
      Object.keys(deductionsSource).forEach(key => {
        const val = deductionsSource[key];
        if (typeof val === 'object' && val !== null && val.enabled && key !== 'insuranceDeductionPercentage') {
          list.push({ type: key, percentage: String(val.percentage || 0) });
        }
      });

      if (list.length === 0 && deductionsSource.insuranceDeductionPercentage > 0) {
        list.push({ type: 'health_basic', percentage: String(deductionsSource.insuranceDeductionPercentage) });
      }

      return list;
    };

    return {
      id: emp.id || emp._id,
      employeeNumber: emp.employeeNumber || emp.employeeId || '',
      fullName: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
      email: emp.email || emp.emailId || '',
      phoneNumber: emp.phoneNumber || emp.mobileNumber || '',
      role: emp.role || "employee",
      departmentId: emp.departmentId || emp.department?.id || emp.department?._id || (typeof emp.department === 'string' ? emp.department : ''),
      designationId: emp.designationId || emp.designation?.id || emp.designation?._id || (typeof emp.designation === 'string' ? emp.designation : ''),
      locationId: emp.locationId || emp.location?.id || emp.location?._id || (typeof emp.location === 'string' ? emp.location : ''),
      reportingToId: emp.reportingToId || emp.reportingTo?.id || emp.reportingTo?._id || (typeof emp.reportingTo === 'string' ? emp.reportingTo : ''),
      dateOfJoining: emp.dateOfJoining ? new Date(emp.dateOfJoining).toISOString().split('T')[0] : '',
      shiftType: emp.shiftType || emp.shift?.id || emp.shift?._id || emp.shift || 'morning',
      timeZone: emp.timeZone || 'Asia/Kolkata',
      empType: emp.empType || 'permanent',
      employeeStatus: emp.employeeStatus || emp.status || 'Active',
      siteId: emp.siteId || '',
      buildingId: emp.buildingId || '',
      basicSalary: activeContract?.basicSalary || emp.basicSalary || '',
      contractType: activeContract?.contractType || emp.contractType || '',
      contractStartDate: activeContract?.startDate ? new Date(activeContract.startDate).toISOString().split('T')[0] : (emp.contractStartDate ? new Date(emp.contractStartDate).toISOString().split('T')[0] : ''),
      contractEndDate: activeContract?.endDate ? new Date(activeContract.endDate).toISOString().split('T')[0] : (emp.contractEndDate ? new Date(emp.contractEndDate).toISOString().split('T')[0] : ''),

      // Candidate Source
      candidateSource: emp.candidateSource || '',
      referredById: emp.referredById || '',
      sourceSummary: emp.sourceSummary || '',
      referenceAmount: emp.referenceAmount || '',

      // Contractor
      contractorId: activeContract?.contractorId || emp.contractorId || '',
      contractId: activeContract?.id || '',
      accommodationAllowances: getAllowances(),
      insurances: getInsurances(),
      bankDetails: bankData,
      gender: emp.gender || '',
      maritalStatus: emp.maritalStatus || '',
      dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth).toISOString().split('T')[0] : '',
      bloodGroup: emp.bloodGroup || '',
      passportNumber: emp.passportNumber || '',
      drivingLicenseNumber: emp.drivingLicenseNumber || '',
      uid: emp.uidNumber || emp.uid || '',
      labourNumber: emp.labourNumber || '',
      eid: emp.emiratesId || emp.eid || '',
      visaNumber: emp.visaNumber || '',
      iqamaId: emp.iqamaId || '',
      iban: emp.iban || '',
      teamPosition: emp.teamPosition || '',
      presentAddress: {
        addressLine1: emp.presentAddressLine1 || '',
        addressLine2: emp.presentAddressLine2 || '',
        city: emp.presentCity || '',
        state: emp.presentState || '',
        country: emp.presentCountry || '',
        pinCode: emp.presentPinCode || ''
      },
      permanentAddress: {
        addressLine1: emp.permanentAddressLine1 || '',
        addressLine2: emp.permanentAddressLine2 || '',
        city: emp.permanentCity || '',
        state: emp.permanentState || '',
        country: emp.permanentCountry || '',
        pinCode: emp.permanentPinCode || ''
      },
      emergencyContact: {
        contactName: emp.emergencyContactName || emp.emergencyContact?.contactName || '',
        relation: emp.emergencyContactRelation || emp.emergencyContact?.relation || '',
        contactNumber: emp.emergencyContactNumber || emp.emergencyContact?.contactNumber || ''
      },
      education: emp.education || [],
      experience: emp.experience || [],
      passportCopy: emp.passportCopyUrl || '',
      emiratesIdCopy: emp.emiratesIdCopyUrl || '',
      visaCopy: emp.visaCopyUrl || '',
      labourCardCopy: emp.labourCardCopyUrl || '',
      drivingLicenseCopy: emp.drivingLicenseCopyUrl || '',
      uidCopy: emp.uidCopyUrl || '',
      iqamaCopy: emp.iqamaCopyUrl || '',
      ibanCopy: emp.ibanCopyUrl || '',
      profilePicture: emp.profilePictureUrl || '',
      contractDocumentUrls: activeContract?.contractDocumentUrls || []
    };
  };

  const handleViewEmployee = async (id: string) => {
    const orgId = getOrgId();
    const token = getAuthToken();
    const apiUrl = getApiUrl();
    if (!orgId || !token) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/org/${orgId}/employees/${id}`);
      const data = response.data.data || response.data;
      const emp = Array.isArray(data) ? data[0] : data;
      if (!emp) throw new Error("Employee not found");

      let activeContract = null;
      try {
        const contractRes = await axios.get(`${apiUrl}/org/${orgId}/contracts/employee/${emp.employeeNumber}/active`);
        activeContract = contractRes.data.data || contractRes.data;
      } catch (contractErr) {
        console.warn("Failed to fetch active contract for employee:", emp.employeeNumber);
      }

      const form = mapEmployeeToForm(emp, activeContract);
      setSelectedCandidate(form);
      setCurrentView('viewCandidate');
    } catch (err) {
      console.error(err);
      showAlert("Error", "Failed to fetch employee details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEmployee = async (id: string) => {
    const orgId = getOrgId();
    const token = getAuthToken();
    const apiUrl = getApiUrl();
    if (!orgId || !token) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/org/${orgId}/employees/${id}`);
      const data = response.data.data || response.data;
      const emp = Array.isArray(data) ? data[0] : data;
      if (!emp) throw new Error("Employee not found");

      let activeContract = null;
      try {
        const contractRes = await axios.get(`${apiUrl}/org/${orgId}/contracts/employee/${emp.employeeNumber}/active`);
        activeContract = contractRes.data.data || contractRes.data;
      } catch (contractErr) {
        console.warn("Failed to fetch active contract for employee edit:", emp.employeeNumber);
      }

      const form = mapEmployeeToForm(emp, activeContract);
      setCandidateForm(form);
      setEditingEmployeeId(id);
      setCurrentView('addCandidate');
    } catch (err: any) {
      console.error(err);
      showAlert("Error", `Failed to fetch employee details: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCandidate = async () => {
    const orgId = getOrgId();
    const token = getAuthToken();
    const apiUrl = getApiUrl();

    if (!orgId || !token || !editingEmployeeId) {
      showAlert("Error", "Authentication or operation error. Please try again.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const orgId = getOrgId();
      const apiUrl = getApiUrl();

      const formData = new FormData();

      // Append basic fields
      formData.append('fullName', candidateForm.fullName);
      formData.append('email', candidateForm.email);
      formData.append('phoneNumber', candidateForm.phoneNumber || candidateForm.mobileNumber || '');
      formData.append('status', candidateForm.employeeStatus || 'Active');
      formData.append('role', 'employee');

      const appendOptional = (key: string, val: any) => {
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, val);
        }
      };

      appendOptional('departmentId', candidateForm.departmentId);
      appendOptional('designationId', candidateForm.designationId);
      appendOptional('locationId', candidateForm.locationId);
      appendOptional('reportingToId', candidateForm.reportingToId);
      appendOptional('siteId', candidateForm.siteId);
      appendOptional('buildingId', candidateForm.buildingId);
      appendOptional('dateOfJoining', candidateForm.dateOfJoining);
      appendOptional('dateOfBirth', candidateForm.dateOfBirth);
      appendOptional('gender', candidateForm.gender);
      appendOptional('maritalStatus', candidateForm.maritalStatus);
      appendOptional('bloodGroup', candidateForm.bloodGroup);
      appendOptional('shiftType', candidateForm.shiftType);
      appendOptional('timeZone', candidateForm.timeZone);
      appendOptional('empType', candidateForm.empType);
      appendOptional('employeeNumber', candidateForm.employeeNumber);
      appendOptional('passportNumber', candidateForm.passportNumber);
      appendOptional('drivingLicenseNumber', candidateForm.drivingLicenseNumber);
      appendOptional('uidNumber', candidateForm.uid);
      appendOptional('labourNumber', candidateForm.labourNumber);
      appendOptional('emiratesId', candidateForm.eid);
      appendOptional('visaNumber', candidateForm.visaNumber);
      appendOptional('iqamaId', candidateForm.iqamaId);

      // Add missing fields
      appendOptional('basicSalary', candidateForm.basicSalary);
      appendOptional('iban', candidateForm.iban);
      appendOptional('teamPosition', candidateForm.teamPosition);
      appendOptional('candidateSource', candidateForm.candidateSource);
      appendOptional('referredById', candidateForm.referredById);
      appendOptional('sourceSummary', candidateForm.sourceSummary);

      // NOTE: Contract fields removed from employee update - will be updated separately via Contract API

      // Append complex objects as JSON strings
      formData.append('experience', JSON.stringify(candidateForm.experience || []));
      formData.append('education', JSON.stringify(candidateForm.education || []));

      // Flatten Address fields
      if (candidateForm.presentAddress) {
        formData.append('presentAddressLine1', candidateForm.presentAddress.addressLine1 || '');
        formData.append('presentAddressLine2', candidateForm.presentAddress.addressLine2 || '');
        formData.append('presentCity', candidateForm.presentAddress.city || '');
        formData.append('presentState', candidateForm.presentAddress.state || '');
        formData.append('presentCountry', candidateForm.presentAddress.country || '');
        formData.append('presentPinCode', candidateForm.presentAddress.pinCode || '');
      }

      if (candidateForm.permanentAddress) {
        formData.append('permanentAddressLine1', candidateForm.permanentAddress.addressLine1 || '');
        formData.append('permanentAddressLine2', candidateForm.permanentAddress.addressLine2 || '');
        formData.append('permanentCity', candidateForm.permanentAddress.city || '');
        formData.append('permanentState', candidateForm.permanentAddress.state || '');
        formData.append('permanentCountry', candidateForm.permanentAddress.country || '');
        formData.append('permanentPinCode', candidateForm.permanentAddress.pinCode || '');
      }

      // Flatten Emergency Contact
      if (candidateForm.emergencyContact) {
        formData.append('emergencyContactName', candidateForm.emergencyContact.contactName || '');
        formData.append('emergencyContactRelation', candidateForm.emergencyContact.relation || '');
        formData.append('emergencyContactNumber', candidateForm.emergencyContact.contactNumber || '');
      }

      // Flatten Bank Details
      if (candidateForm.bankDetails) {
        formData.append('bankName', candidateForm.bankDetails.bankName || '');
        formData.append('branchName', candidateForm.bankDetails.branchName || '');
        formData.append('accountNumber', candidateForm.bankDetails.accountNumber || '');
        formData.append('accountHolderName', candidateForm.bankDetails.accountHolderName || '');
        formData.append('ifscCode', candidateForm.bankDetails.ifscCode || '');

        // Also send as JSON array for the bankDetails column
        formData.append('bankDetails', JSON.stringify([{
          bankName: candidateForm.bankDetails.bankName,
          branchName: candidateForm.bankDetails.branchName,
          accountNumber: candidateForm.bankDetails.accountNumber,
          accountHolderName: candidateForm.bankDetails.accountHolderName,
          ifscCode: candidateForm.bankDetails.ifscCode
        }]));
      }

      // Map allowances and deductions
      const allowances = (candidateForm.accommodationAllowances || []).reduce((acc: any, curr) => {
        if (curr.type && curr.percentage) {
          acc[curr.type] = { enabled: true, percentage: parseFloat(curr.percentage), amount: 0 };
        }
        return acc;
      }, {});
      formData.append('allowances', JSON.stringify(allowances));

      const deductions = (candidateForm.insurances || []).reduce((acc: any, curr) => {
        if (curr.type && curr.percentage) {
          acc[curr.type] = { enabled: true, percentage: parseFloat(curr.percentage), amount: 0 };
        }
        return acc;
      }, {});
      formData.append('deductions', JSON.stringify(deductions));

      // Append Files or Deletion Signals
      if (candidateForm.passportCopy instanceof File) {
        formData.append('passportCopy', candidateForm.passportCopy);
      } else if (candidateForm.passportCopy === null) {
        formData.append('passportCopyUrl', '');
      }

      if (candidateForm.emiratesIdCopy instanceof File) {
        formData.append('emiratesIdCopy', candidateForm.emiratesIdCopy);
      } else if (candidateForm.emiratesIdCopy === null) {
        formData.append('emiratesIdCopyUrl', '');
      }

      if (candidateForm.visaCopy instanceof File) {
        formData.append('visaCopy', candidateForm.visaCopy);
      } else if (candidateForm.visaCopy === null) {
        formData.append('visaCopyUrl', '');
      }

      if (candidateForm.labourCardCopy instanceof File) {
        formData.append('labourCardCopy', candidateForm.labourCardCopy);
      } else if (candidateForm.labourCardCopy === null) {
        formData.append('labourCardCopyUrl', '');
      }

      if (candidateForm.drivingLicenseCopy instanceof File) {
        formData.append('drivingLicenseCopy', candidateForm.drivingLicenseCopy);
      } else if (candidateForm.drivingLicenseCopy === null) {
        formData.append('drivingLicenseCopyUrl', '');
      }

      if (candidateForm.uidCopy instanceof File) {
        formData.append('uidCopy', candidateForm.uidCopy);
      } else if (candidateForm.uidCopy === null) {
        formData.append('uidCopyUrl', '');
      }

      if (candidateForm.iqamaCopy instanceof File) {
        formData.append('iqamaCopy', candidateForm.iqamaCopy);
      } else if (candidateForm.iqamaCopy === null) {
        formData.append('iqamaCopyUrl', '');
      }

      if (candidateForm.ibanCopy instanceof File) {
        formData.append('ibanCopy', candidateForm.ibanCopy);
      } else if (candidateForm.ibanCopy === null) {
        formData.append('ibanCopyUrl', '');
      }

      if (candidateForm.profilePicture instanceof File) {
        formData.append('profilePic', candidateForm.profilePicture);
      } else if (candidateForm.profilePicture === null) {
        formData.append('profilePicUrl', '');
      }

      console.log('ONBOARDING UPDATE: Sending FormData');

      try {
        await axios.put(
          `${apiUrl}/org/${orgId}/employees/${editingEmployeeId}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } catch (putError: any) {
        if (putError.response && putError.response.status === 404) {
          console.warn("PUT update failed with 404, attempting PATCH fallback...");
          await axios.patch(
            `${apiUrl}/org/${orgId}/employees/${editingEmployeeId}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
        } else {
          throw putError;
        }
      }

      // Handle contract update/creation
      if (candidateForm.contractType && candidateForm.contractStartDate) {
        try {
          const contractFormData = new FormData();
          contractFormData.append('employeeNumber', candidateForm.employeeNumber || '');
          contractFormData.append('contractType', candidateForm.contractType || 'permanent');
          contractFormData.append('startDate', candidateForm.contractStartDate);
          if (candidateForm.contractEndDate) {
            contractFormData.append('endDate', candidateForm.contractEndDate);
          }
          contractFormData.append('basicSalary', String(candidateForm.basicSalary || 0));
          contractFormData.append('allowances', JSON.stringify(allowances));
          contractFormData.append('deductions', JSON.stringify(deductions));

          // Append contract documents
          if (candidateForm.contractDocuments && candidateForm.contractDocuments.length > 0) {
            candidateForm.contractDocuments.forEach((file: File) => {
              contractFormData.append('contractDocuments', file);
            });
          }

          // Check if contract ID exists (means we need to update)
          if (candidateForm.contractId) {
            console.log("Updating contract ID:", candidateForm.contractId, "with FormData");
            await ContractService.updateContract(candidateForm.contractId, contractFormData);
            console.log("Contract updated successfully");
          } else if (candidateForm.employeeNumber) {
            // Create new contract for existing employee
            console.log("Creating new contract for existing employee with FormData");
            await ContractService.createContract(contractFormData);
            console.log("Contract created successfully");
          }
        } catch (contractError: any) {
          console.error("Failed to update/create contract:", contractError);
          showAlert("Warning", `Employee updated successfully but contract update failed: ${contractError.message}`, "warning");
        }
      }

      showAlert("Success", "Employee details updated successfully!", "success");
      fetchEmployees();
      setCandidateForm({
        employeeNumber: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        role: 'employee',
        departmentId: '',
        designationId: '',
        locationId: '',
        reportingToId: '',
        dateOfJoining: '',
        shiftType: '',
        timeZone: 'Asia/Kolkata',
        empType: 'permanent',
        employeeStatus: 'Active',
        siteId: '',
        buildingId: '',
        basicSalary: '',
        accommodationAllowances: [],
        insurances: [],
        contractStartDate: '',
        contractEndDate: '',
        contractType: '',
        bankDetails: {
          bankName: '',
          branchName: '',
          accountNumber: '',
          accountHolderName: '',
          ifscCode: ''
        },
        iqamaId: '',
        iqamaCopy: ''
      });
      setEditingEmployeeId(null);
      setCurrentView('list');
    } catch (error: any) {
      console.error('Update ERROR:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Unknown error";
      showAlert("Error", `Failed to update employee: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = employees.map(emp => emp.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };


  const executeDeleteEmployee = async (id: string) => {

    const orgId = getOrgId();
    const token = getAuthToken();
    const apiUrl = getApiUrl();
    if (!orgId || !token) return;

    setIsLoading(true);
    setConfirmState(prev => ({ ...prev, open: false })); // Close dialog

    try {
      await axios.delete(`${apiUrl}/org/${orgId}/employees/${id}`);
      showAlert("Success", "Employee deleted successfully", "success");
      fetchEmployees();
      // If deleted item was selected, remove it
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(sid => sid !== id));
      }
    } catch (err) {
      console.error(err);
      showAlert("Error", "Failed to delete employee", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    setConfirmState({
      open: true,
      title: "Delete Employee?",
      description: "Are you sure you want to delete this employee? This action cannot be undone.",
      variant: "destructive",
      onConfirm: () => executeDeleteEmployee(id)
    });
  };

  const executeBulkDelete = async () => {
    const orgId = getOrgId();
    const token = getAuthToken();
    const apiUrl = getApiUrl();
    if (!orgId || !token) return;

    setIsLoading(true);
    setConfirmState(prev => ({ ...prev, open: false })); // Close dialog

    let successCount = 0;
    try {
      await Promise.all(selectedIds.map(id =>
        axios.delete(`${apiUrl}/org/${orgId}/employees/${id}`).then(() => { successCount++; })
      ));

      showAlert("Success", `Successfully deleted ${successCount} employees.`, "success");
      fetchEmployees();
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      showAlert("Warning", `Some deletions failed. Deleted ${successCount} out of ${selectedIds.length}.`, "warning");
      fetchEmployees(); // Refresh likely partial state
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = () => {
    setConfirmState({
      open: true,
      title: "Delete Employees?",
      description: `Are you sure you want to delete ${selectedIds.length} employees? This action cannot be undone.`,
      variant: "destructive",
      onConfirm: () => executeBulkDelete()
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setUploadedFile(file);
        showAlert("Success", `File "${file.name}" uploaded successfully!`, "success");
      } else {
        showAlert("Invalid File", 'Please upload a valid CSV or Excel file.', "error");
      }
    }
  };


  const handleExportCSV = () => {
    const dataToExport = selectedIds.length > 0
      ? employees.filter(emp => selectedIds.includes(emp.id))
      : employees;

    if (dataToExport.length === 0) {
      showAlert("Info", "No data to export. Please select employees first.", "info");
      return;
    }

    const headers = [
      'Employee ID', 'Full Name', 'Email Address', 'Mobile Number', 'Role/Designation',
      'Department', 'Location', 'Site', 'Building / Area', 'Reporting Manager',
      'Employee Type', 'Employee Status', 'Date of Joining', 'Shift', 'Contract Type',
      'Contract Start Date', 'Contract End Date', 'Time Zone', 'Basic Salary',
      'Insurance Type', 'Insurance Percentage', 'Allowance Type', 'Allowance Percentage',
      'Bank Name', 'Branch Name', 'Account Number', 'Account Holder Name', 'IFSC Code'
    ];

    const getManagerName = (id: string) => {
      const mgr = reportingManagers.find(m => String(m.id || m._id) === String(id));
      return mgr ? (mgr.fullName || `${mgr.firstName} ${mgr.lastName}`) : 'N/A';
    };

    const getShiftName = (id: string) => {
      if (id === 'morning') return 'Morning';
      if (id === 'evening') return 'Evening';
      if (id === 'night') return 'Night';
      const shift = shifts.find(s => String(s.id || s._id) === String(id));
      return shift ? (shift.shiftName || shift.name) : id || 'N/A';
    };

    const getSiteName = (locId: string, siteId: string) => {
      const loc = locations.find(l => String(l.id || l._id) === String(locId));
      if (!loc || !loc.sites) return siteId || 'N/A';
      const site = loc.sites.find((s: any) => String(s.id || s._id) === String(siteId) || s.name === siteId);
      return site ? (site.name || site.siteName) : siteId || 'N/A';
    };

    const getBuildingName = (locId: string, siteId: string, bldId: string) => {
      const loc = locations.find(l => String(l.id || l._id) === String(locId));
      if (!loc || !loc.sites) return bldId || 'N/A';
      const site = loc.sites.find((s: any) => String(s.id || s._id) === String(siteId) || s.name === siteId);
      if (!site || !site.buildings) return bldId || 'N/A';
      const bld = site.buildings.find((b: any) => String(b.id || b._id) === String(bldId) || b.name === bldId);
      return bld ? (bld.name || bld.buildingName) : bldId || 'N/A';
    };

    const csvRows = dataToExport.map(emp => {
      // Extract bank details
      const bank = emp.bankDetails?.[0] || emp.bankDetails || {};

      // Extract first allowance and insurance
      let allowanceType = 'N/A';
      let allowancePercent = '0';
      if (emp.allowances) {
        const firstType = Object.keys(emp.allowances).find(key =>
          typeof emp.allowances[key] === 'object' && emp.allowances[key]?.enabled && !['homeClaimed', 'foodClaimed', 'travelClaimed'].includes(key)
        );
        if (firstType) {
          allowanceType = firstType;
          allowancePercent = String(emp.allowances[firstType].percentage || 0);
        }
      } else if (Array.isArray(emp.accommodationAllowances) && emp.accommodationAllowances.length > 0) {
        allowanceType = emp.accommodationAllowances[0].type;
        allowancePercent = emp.accommodationAllowances[0].percentage;
      }

      let insuranceType = 'N/A';
      let insurancePercent = '0';
      if (emp.deductions) {
        const firstType = Object.keys(emp.deductions).find(key =>
          typeof emp.deductions[key] === 'object' && emp.deductions[key]?.enabled && key !== 'insuranceDeductionPercentage'
        );
        if (firstType) {
          insuranceType = firstType;
          insurancePercent = String(emp.deductions[firstType].percentage || 0);
        }
      } else if (Array.isArray(emp.insurances) && emp.insurances.length > 0) {
        insuranceType = emp.insurances[0].type;
        insurancePercent = emp.insurances[0].percentage;
      } else if (emp.insuranceType) {
        insuranceType = emp.insuranceType;
        insurancePercent = String(emp.insurancePercentage || 0);
      }

      const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        try {
          return new Date(dateStr).toLocaleDateString();
        } catch (e) {
          return dateStr;
        }
      };

      return [
        emp.employeeNumber || 'N/A',
        emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        emp.emailId || emp.email || 'N/A',
        emp.phoneNumber || emp.mobileNumber || 'N/A',
        emp.designation || 'N/A',
        emp.department || 'N/A',
        emp.location || 'N/A',
        getSiteName(emp.locationId || '', emp.siteId || ''),
        getBuildingName(emp.locationId || '', emp.siteId || '', emp.buildingId || ''),
        getManagerName(emp.reportingToId || ''),
        emp.empType || 'N/A',
        emp.onboardingStatus || emp.status || 'Active',
        formatDate(emp.dateOfJoining || ''),
        getShiftName(emp.shiftType || ''),
        emp.contractType || 'N/A',
        formatDate(emp.contractStartDate || ''),
        formatDate(emp.contractEndDate || ''),
        emp.timeZone || 'Asia/Kolkata',
        emp.basicSalary || '0',
        insuranceType,
        insurancePercent,
        allowanceType,
        allowancePercent,
        bank.bankName || emp.bankName || 'N/A',
        bank.branchName || emp.branchName || 'N/A',
        bank.accountNumber || emp.accountNumber || 'N/A',
        bank.accountHolderName || emp.accountHolderName || 'N/A',
        bank.ifscCode || emp.ifscCode || 'N/A'
      ].map(val => {
        const str = String(val === null || val === undefined ? '' : val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employee_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const filteredEmployees = employees
    .filter(emp => {
      const searchStr = searchQuery.toLowerCase();
      const fullName = (emp.fullName || `${emp.firstName} ${emp.lastName}`).toLowerCase();
      const email = (emp.emailId || '').toLowerCase();
      const dept = (emp.department || '').toLowerCase();

      return fullName.includes(searchStr) || email.includes(searchStr) || dept.includes(searchStr);
    })
    .sort((a: any, b: any) => {
      const valA = String(a[sortConfig.key] || '').toLowerCase();
      const valB = String(b[sortConfig.key] || '').toLowerCase();
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-white">
      {currentView === 'list' && (
        <div className="flex-1 overflow-hidden">
          <CandidateList
            employees={filteredEmployees}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onAddCandidateClick={() => setCurrentView('addCandidate')}
            onBulkImportClick={() => setCurrentView('bulkImport')}
            onDelete={handleDeleteEmployee}
            onView={handleViewEmployee}
            onEdit={handleEditEmployee}
            onBulkDelete={handleBulkDelete}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onExportCSV={handleExportCSV}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>
      )}
      {currentView === 'addCandidate' && (
        <div className="flex-1 overflow-y-auto">
          <AddCandidateForm
            candidateForm={candidateForm}
            onInputChange={handleInputChange}
            onAddCandidate={editingEmployeeId ? handleUpdateCandidate : handleAddCandidate}
            onCancel={() => {
              setEditingEmployeeId(null);
              setCurrentView('list');
            }}
            onComplete={() => {
              setEditingEmployeeId(null);
              setCurrentView('list');
            }}
            departments={departments}
            designations={designations}
            locations={locations}
            reportingManagers={reportingManagers}
            shifts={shifts}
            isLoading={isLoading}
            isEditing={!!editingEmployeeId}
            employees={employees}
          />
        </div>
      )}
      {currentView === 'viewCandidate' && selectedCandidate && (
        <div className="flex-1 overflow-y-auto">
          <ViewCandidate
            candidate={selectedCandidate}
            onClose={() => setCurrentView('list')}
            departments={departments}
            designations={designations}
            locations={locations}
            reportingManagers={reportingManagers}
            shifts={shifts}
          />
        </div>
      )}
      {currentView === 'bulkImport' && (
        <div className="flex-1 overflow-y-auto">
          <BulkImport
            importType={importType}
            setImportType={setImportType}
            uploadedFile={uploadedFile}
            onFileUpload={handleFileUpload}
            onCancel={() => {
              setCurrentView('list');
              setUploadedFile(null);
            }}
            departments={departments}
            designations={designations}
            locations={locations}
            reportingManagers={reportingManagers}
            shifts={shifts}
            employees={employees}
            onSuccess={() => {
              fetchEmployees();
              showAlert("Success", "Employees imported successfully!", "success");
            }}
          />
        </div>
      )}


      {/* Global Dialogs */}
      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState(prev => ({ ...prev, open }))}
        title={confirmState.title}
        description={confirmState.description}
        onConfirm={confirmState.onConfirm}
        variant={confirmState.variant}
        confirmText="Delete" // Assuming mainly used for deletion. If generic, use state prop.
      />

      <CustomAlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}
        title={alertState.title}
        description={alertState.description}
        variant={alertState.variant}
      />
    </div>
  );
};

export default EmployeeOnboardingSystem;