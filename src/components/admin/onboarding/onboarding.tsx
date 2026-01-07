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
    bankDetails: {
      bankName: '',
      branchName: '',
      accountNumber: '',
      accountHolderName: '',
      ifscCode: ''
    }
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

      // Shifts endpoint doesn't exist in backend, so skip fetching
      // Shifts are optional and have default values in the UI
      const shiftRes = { data: { data: [] } };

      const deptData = deptRes.data.data || deptRes.data || [];
      setDepartments(deptData);
      setDesignations(desigRes.data.data || desigRes.data || []);
      setLocations(locRes.data.data || locRes.data || []);
      setShifts(shiftRes.data.data || shiftRes.data || []);

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
      if (statusFilter !== 'All') {
        params.status = statusFilter;
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
          dateOfJoining: emp.dateOfJoining || '',
          onboardingStatus: String(emp.onboardingStatus || emp.status || 'Active'),
          sourceOfHire: String(emp.sourceOfHire || 'Direct')
        };
      });

      console.log("FETCH EMPLOYEES: Formatted count:", formattedEmployees.length);
      setReportingManagers(formattedEmployees);
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleInputChange = (field: keyof CandidateForm, value: string) => {
    setCandidateForm(prev => ({ ...prev, [field]: value }));
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

      const payload: any = {
        fullName: candidateForm.fullName,
        email: candidateForm.email,
        phoneNumber: candidateForm.phoneNumber || candidateForm.mobileNumber || '',
        status: candidateForm.employeeStatus || 'Active',
        role: "employee",
        departmentId: cleanValue(candidateForm.departmentId),
        designationId: cleanValue(candidateForm.designationId),
        locationId: cleanValue(candidateForm.locationId),
        reportingToId: cleanValue(candidateForm.reportingToId),
        siteId: cleanValue(candidateForm.siteId),
        buildingId: cleanValue(candidateForm.buildingId),
        dateOfJoining: cleanValue(candidateForm.dateOfJoining),
        dateOfBirth: cleanValue(candidateForm.dateOfBirth),
        gender: cleanValue(candidateForm.gender),
        maritalStatus: cleanValue(candidateForm.maritalStatus),
        bloodGroup: cleanValue(candidateForm.bloodGroup),
        shiftType: cleanValue(candidateForm.shiftType),
        timeZone: cleanValue(candidateForm.timeZone),
        empType: cleanValue(candidateForm.empType),
        employeeNumber: cleanValue(candidateForm.employeeNumber),
        experience: candidateForm.experience || [],
        education: candidateForm.education || [],
        // Include address and contact details
        presentAddress: candidateForm.presentAddress,
        permanentAddress: candidateForm.permanentAddress,
        emergencyContact: candidateForm.emergencyContact,
        passportNumber: candidateForm.passportNumber,
        drivingLicenseNumber: candidateForm.drivingLicenseNumber,
        // Remove fields not present in backend
        accommodationAllowances: candidateForm.accommodationAllowances || [],
        insurances: candidateForm.insurances || []
      };

      // Handle numeric fields: don't send empty strings
      if (candidateForm.basicSalary && candidateForm.basicSalary !== '') {
        payload.basicSalary = parseFloat(candidateForm.basicSalary);
      }

      // Handle bankDetails: backend expects an array of objects
      if (candidateForm.bankDetails) {
        payload.bankDetails = [candidateForm.bankDetails];
      }

      console.log("ONBOARDING DEBUG: Sending cleaned payload", payload);

      const response = await axios.post(
        `${apiUrl}/org/${orgId}/employees`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        // Don't show alert here - let AddCandidateForm show the success dialog
        // showAlert("Success", "Employee onboarded successfully! An invitation email has been sent.", "success");

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
          bankDetails: {
            bankName: '',
            branchName: '',
            accountNumber: '',
            accountHolderName: '',
            ifscCode: ''
          }
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

      // Handle the case where the API might return an array or a single object
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

      setCandidateForm({
        employeeNumber: emp.employeeNumber || emp.employeeId || '',
        fullName: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        email: emp.email || emp.emailId || '',
        phoneNumber: emp.phoneNumber || emp.mobileNumber || '',
        role: "employee",
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
        basicSalary: emp.basicSalary || '',
        contractStartDate: emp.contractStartDate ? new Date(emp.contractStartDate).toISOString().split('T')[0] : '',
        contractEndDate: emp.contractEndDate ? new Date(emp.contractEndDate).toISOString().split('T')[0] : '',
        contractType: emp.contractType || '',
        accommodationAllowances: emp.accommodationAllowances || [],
        insurances: emp.insurances || (emp.insuranceType ? [{ type: emp.insuranceType, percentage: emp.insurancePercentage || '' }] : []),
        bankDetails: bankData,
        // Add Identity fields for editing
        pan: emp.PAN || emp.panCard || emp.pan || '',
        aadhaar: emp.aadharNumber || emp.aadhaar || '',
        uan: emp.UAN || emp.uan || '',
        passportNumber: emp.passportNumber || '',
        drivingLicenseNumber: emp.drivingLicenseNumber || '',
        // Add Personal fields
        gender: emp.gender || '',
        maritalStatus: emp.maritalStatus || '',
        dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth).toISOString().split('T')[0] : '',
        bloodGroup: emp.bloodGroup || '',
        // Add Address fields
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
        // Add Emergency Contact
        emergencyContact: {
          contactName: emp.emergencyContactName || '',
          relation: emp.emergencyContactRelation || '',
          contactNumber: emp.emergencyContactNumber || ''
        },
        // Education & Experience
        education: emp.education || [],
        experience: emp.experience || []
      });
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

      // Helper to handle empty strings for optional fields
      const cleanValue = (val: any) => (val === '' ? null : val);

      // Prepare sanitized payload following the patterns in profilepage.tsx
      const payload: any = {
        fullName: candidateForm.fullName,
        email: candidateForm.email,
        phoneNumber: candidateForm.phoneNumber || candidateForm.mobileNumber || '',
        status: candidateForm.employeeStatus || 'Active',
        role: "employee",
        departmentId: cleanValue(candidateForm.departmentId),
        designationId: cleanValue(candidateForm.designationId),
        locationId: cleanValue(candidateForm.locationId),
        reportingToId: cleanValue(candidateForm.reportingToId),
        siteId: cleanValue(candidateForm.siteId),
        buildingId: cleanValue(candidateForm.buildingId),
        dateOfJoining: cleanValue(candidateForm.dateOfJoining),
        dateOfBirth: cleanValue(candidateForm.dateOfBirth),
        gender: cleanValue(candidateForm.gender),
        maritalStatus: cleanValue(candidateForm.maritalStatus),
        bloodGroup: cleanValue(candidateForm.bloodGroup),
        shiftType: cleanValue(candidateForm.shiftType),
        timeZone: cleanValue(candidateForm.timeZone),
        empType: cleanValue(candidateForm.empType),
        employeeNumber: cleanValue(candidateForm.employeeNumber),
        experience: candidateForm.experience || [],
        education: candidateForm.education || [],
        // Include address and contact details which were missing
        presentAddress: candidateForm.presentAddress,
        permanentAddress: candidateForm.permanentAddress,
        emergencyContact: candidateForm.emergencyContact,
        passportNumber: candidateForm.passportNumber,
        drivingLicenseNumber: candidateForm.drivingLicenseNumber,
        // Remove fields not present in backend Employee entity to prevent 500 error
        accommodationAllowances: candidateForm.accommodationAllowances || [],
        insurances: candidateForm.insurances || []
      };

      // Handle numeric fields: don't send empty strings
      if (candidateForm.basicSalary && candidateForm.basicSalary !== '') {
        payload.basicSalary = parseFloat(candidateForm.basicSalary);
      }

      // Handle bankDetails: backend expects an array of objects
      if (candidateForm.bankDetails) {
        payload.bankDetails = [candidateForm.bankDetails];
      }

      console.log('ONBOARDING UPDATE: Sending payload', payload);

      try {
        await axios.put(
          `${apiUrl}/org/${orgId}/employees/${editingEmployeeId}`,
          payload
        );
      } catch (putError: any) {
        if (putError.response && putError.response.status === 404) {
          console.warn("PUT update failed with 404, attempting PATCH fallback...");
          await axios.patch(
            `${apiUrl}/org/${orgId}/employees/${editingEmployeeId}`,
            payload
          );
        } else {
          throw putError;
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
        }
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

      // Map to CandidateForm
      const form: CandidateForm = {
        employeeNumber: emp.employeeNumber || emp.employeeId || '',
        fullName: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        email: emp.email || emp.emailId || '',
        phoneNumber: emp.phoneNumber || emp.mobileNumber || '',
        role: "employee",
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
        basicSalary: emp.basicSalary || '',
        contractStartDate: emp.contractStartDate ? new Date(emp.contractStartDate).toISOString().split('T')[0] : '',
        contractEndDate: emp.contractEndDate ? new Date(emp.contractEndDate).toISOString().split('T')[0] : '',
        contractType: emp.contractType || '',
        accommodationAllowances: emp.accommodationAllowances || [],
        insurances: emp.insurances || (emp.insuranceType ? [{ type: emp.insuranceType, percentage: emp.insurancePercentage || '' }] : []),
        bankDetails: bankData,
        // Personal Details
        gender: emp.gender || '',
        maritalStatus: emp.maritalStatus || '',
        dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth).toISOString().split('T')[0] : '',
        bloodGroup: emp.bloodGroup || '',
        // Identity Information
        uan: emp.UAN || emp.uan || '',
        pan: emp.PAN || emp.panCard || emp.pan || '',
        aadhaar: emp.aadhaar || emp.aadharNumber || '',
        passportNumber: emp.passportNumber || '',
        drivingLicenseNumber: emp.drivingLicenseNumber || '',
        // Address Information
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
        // Emergency Contact
        emergencyContact: {
          contactName: emp.emergencyContactName || '',
          relation: emp.emergencyContactRelation || '',
          contactNumber: emp.emergencyContactNumber || ''
        },
        // Education & Experience
        education: emp.education || [],
        experience: emp.experience || []
      };
      setSelectedCandidate(form);
      setCurrentView('viewCandidate');
    } catch (err) {
      console.error(err);
      showAlert("Error", "Failed to fetch employee details", "error");
    } finally {
      setIsLoading(false);
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
    if (employees.length === 0) {
      showAlert("Info", "No data to export", "info");
      return;
    }

    const headers = [
      'Full Name', 'Email ID', 'Official Email', 'Department'
    ];

    const csvRows = employees.map(emp => [
      emp.fullName || `${emp.firstName} ${emp.lastName}`,
      emp.emailId,
      emp.officialEmail,
      emp.department
    ].map(val => `"${val}"`).join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `onboarding_employees_${new Date().toISOString().split('T')[0]}.csv`;
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