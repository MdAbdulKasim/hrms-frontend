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
  const [showPAN, setShowPAN] = useState<{ [key: string]: boolean }>({});
  const [showAadhaar, setShowAadhaar] = useState<{ [key: string]: boolean }>({});
  const [showUAN, setShowUAN] = useState<{ [key: string]: boolean }>({});
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
      fetchOnboardingData().then((deptData) => {
        // Pass departments directly to avoid state timing issues
        if (deptData) {
          fetchEmployees(deptData);
        } else {
          fetchEmployees();
        }
      });
    } else {
      console.warn("ONBOARDING MOUNT: No OrgId found, skipping fetch.");
    }
  }, []); // Run on mount

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

      // Return departments so fetchEmployees can use them
      return deptData;
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

  const fetchEmployees = async (departmentsForLookup?: any[]) => {
    const orgId = getOrgId();
    const token = getAuthToken();
    const apiUrl = getApiUrl();
    console.log("FETCH EMPLOYEES: Config:", { apiUrl, orgId, hasToken: !!token });

    if (!orgId || orgId === 'undefined' || orgId === 'null' || !token) {
      console.warn("FETCH EMPLOYEES: Aborted due to missing/invalid orgId or token.");
      return;
    }

    // Use provided departments or fall back to state
    const departmentsToUse = departmentsForLookup || departments;

    try {
      const res = await axios.get(`${apiUrl}/org/${orgId}/employees`);

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

      // Use provided departments or state for lookup
      const currentDepartments = departmentsToUse.length > 0 ? departmentsToUse : departments;
      console.log('FORMATTING EMPLOYEES: Using departments count:', currentDepartments.length,
        'Provided:', !!departmentsForLookup, 'From state:', departments.length);

      const formattedEmployees = employeeList.map((emp: any) => {
        // Extract department name with multiple fallback options
        let departmentName = '';

        // First, try to get department from the populated relation
        if (emp.department) {
          if (typeof emp.department === 'string') {
            departmentName = emp.department;
          } else if (emp.department.departmentName) {
            departmentName = emp.department.departmentName;
          } else if (emp.department.name) {
            departmentName = emp.department.name;
          } else if (emp.department.id || emp.department._id) {
            // If department object exists but no name, try lookup by ID
            const deptId = String(emp.department.id || emp.department._id || '').trim();
            const dept = currentDepartments.find(d => {
              const dId = String(d.id || d._id || '').trim();
              return dId === deptId && dId !== '';
            });
            if (dept) {
              departmentName = dept.departmentName || dept.name || '';
            }
          }
        }

        // If department is not populated but we have departmentId, try to find it from fetched departments
        if (!departmentName && emp.departmentId) {
          // Try multiple ways to match department - normalize IDs for comparison
          const empDeptId = String(emp.departmentId || '').trim();
          const dept = currentDepartments.find(d => {
            const deptId = String(d.id || d._id || '').trim();
            // Compare both normalized strings
            return deptId === empDeptId && deptId !== '';
          });

          if (dept) {
            departmentName = dept.departmentName || dept.name || '';
            console.log('✓ Department found via lookup:', {
              employee: emp.fullName,
              departmentId: empDeptId,
              departmentName: departmentName
            });
          } else if (currentDepartments.length > 0) {
            // Additional debug - show what we're comparing
            console.warn('✗ Department lookup failed:', {
              employeeName: emp.fullName,
              employeeDepartmentId: empDeptId,
              employeeDepartmentIdType: typeof emp.departmentId,
              availableDepartmentIds: currentDepartments.map(d => String(d.id || d._id || '').trim()),
              departmentsCount: currentDepartments.length
            });
          }
        }

        return {
          id: emp.id || emp._id || String(Math.random()),
          employeeNumber: emp.employeeNumber || emp.employeeId || '', // Use sequential ID if available, otherwise blank (avoiding UUID)
          fullName: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unnamed Employee',
          firstName: emp.firstName || emp.fullName?.split(' ')[0] || '',
          lastName: emp.lastName || emp.fullName?.split(' ').slice(1).join(' ') || '',
          emailId: emp.email || emp.emailId || '',
          officialEmail: emp.officialEmail || emp.email || '',
          onboardingStatus: String(emp.onboardingStatus || emp.status || 'Active'),
          department: departmentName || '',
          sourceOfHire: String(emp.sourceOfHire || 'Direct'),
          panCard: emp.panCard || emp.PAN || '**********',
          aadhaar: emp.aadhaar || emp.aadharNumber || '**********',
          uan: emp.uan || emp.UAN || '**********'
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
      const formData = new FormData();
      // Append top-level fields
      formData.append('employeeNumber', candidateForm.employeeNumber || '');
      formData.append('fullName', candidateForm.fullName);
      formData.append('email', candidateForm.email);
      formData.append('phoneNumber', candidateForm.phoneNumber || candidateForm.mobileNumber || '');
      formData.append('role', "employee");
      formData.append('departmentId', candidateForm.departmentId);
      formData.append('designationId', candidateForm.designationId);
      formData.append('locationId', candidateForm.locationId);
      formData.append('reportingToId', reportingManagers.length > 0 ? (candidateForm.reportingToId || '') : '');
      formData.append('dateOfJoining', candidateForm.dateOfJoining);
      formData.append('shiftType', candidateForm.shiftType);
      formData.append('timeZone', candidateForm.timeZone);
      formData.append('empType', candidateForm.empType);
      formData.append('buildingId', candidateForm.buildingId || '');
      formData.append('basicSalary', candidateForm.basicSalary);
      formData.append('contractStartDate', candidateForm.contractStartDate || '');
      formData.append('contractEndDate', candidateForm.contractEndDate || '');
      formData.append('contractType', candidateForm.contractType || '');

      // Append arrays as JSON strings
      formData.append('accommodationAllowances', JSON.stringify(candidateForm.accommodationAllowances));
      formData.append('insurances', JSON.stringify(candidateForm.insurances));

      // Append bank details
      const bankDetails: any = { ...candidateForm.bankDetails };
      const bankFile = bankDetails.bankPassbookFile;
      delete bankDetails.bankPassbookFile; // Don't include file in the JSON string

      formData.append('bankDetails', JSON.stringify(bankDetails));
      if (bankFile) {
        formData.append('bankPassbook', bankFile);
      }

      console.log("ONBOARDING DEBUG:", {
        apiUrl,
        orgId,
        token: token ? "Token present" : "Token missing",
        payload: Object.fromEntries(formData.entries())
      });

      const response = await axios.post(
        `${apiUrl}/org/${orgId}/employees`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
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
      // Handle the case where the API might return an array or a single object
      const emp = Array.isArray(data) ? data[0] : data;

      if (!emp) throw new Error("Employee not found");

      setCandidateForm({
        employeeNumber: emp.employeeNumber || emp.employeeId || '',
        fullName: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        email: emp.email || emp.emailId || '',
        phoneNumber: emp.phoneNumber || emp.mobileNumber || '',
        role: "employee",
        departmentId: emp.departmentId || emp.department?.id || emp.department?._id || emp.department || '',
        designationId: emp.designationId || emp.designation?.id || emp.designation?._id || emp.designation || '',
        locationId: emp.locationId || emp.location?.id || emp.location?._id || emp.location || '',
        reportingToId: emp.reportingToId || emp.reportingTo?.id || emp.reportingTo?._id || emp.reportingTo || '',
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
        bankDetails: emp.bankDetails || {
          bankName: emp.bankName || '',
          branchName: emp.branchName || '',
          accountNumber: emp.accountNumber || '',
          accountHolderName: emp.accountHolderName || '',
          ifscCode: emp.ifscCode || ''
        }
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
      const formData = new FormData();
      // Append top-level fields
      formData.append('employeeNumber', candidateForm.employeeNumber || '');
      formData.append('fullName', candidateForm.fullName);
      formData.append('email', candidateForm.email);
      formData.append('phoneNumber', candidateForm.phoneNumber || candidateForm.mobileNumber || '');
      formData.append('role', "employee");
      formData.append('departmentId', candidateForm.departmentId);
      formData.append('designationId', candidateForm.designationId);
      formData.append('locationId', candidateForm.locationId);
      formData.append('reportingToId', candidateForm.reportingToId || '');
      formData.append('dateOfJoining', candidateForm.dateOfJoining);
      formData.append('shiftType', candidateForm.shiftType);
      formData.append('timeZone', candidateForm.timeZone);
      formData.append('empType', candidateForm.empType);
      formData.append('buildingId', candidateForm.buildingId || '');
      formData.append('basicSalary', candidateForm.basicSalary);
      formData.append('contractStartDate', candidateForm.contractStartDate || '');
      formData.append('contractEndDate', candidateForm.contractEndDate || '');
      formData.append('contractType', candidateForm.contractType || '');

      // Append arrays as JSON strings
      formData.append('accommodationAllowances', JSON.stringify(candidateForm.accommodationAllowances));
      formData.append('insurances', JSON.stringify(candidateForm.insurances));

      // Append bank details
      const bankDetails: any = { ...candidateForm.bankDetails };
      const bankFile = bankDetails.bankPassbookFile;
      delete bankDetails.bankPassbookFile;

      formData.append('bankDetails', JSON.stringify(bankDetails));
      if (bankFile) {
        formData.append('bankPassbook', bankFile);
      }

      await axios.patch(
        `${apiUrl}/org/${orgId}/employees/${editingEmployeeId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

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
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
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
      const emp: any = response.data.data || response.data;

      // Map to CandidateForm
      const form: CandidateForm = {
        employeeNumber: emp.employeeNumber || emp.employeeId || '',
        fullName: emp.fullName || `${emp.firstName} ${emp.lastName}`,
        email: emp.email || emp.emailId,
        phoneNumber: emp.phoneNumber || emp.mobileNumber,
        role: "employee",
        departmentId: emp.departmentId || emp.department?.id || emp.department?._id || emp.department,
        designationId: emp.designationId || emp.designation?.id || emp.designation?._id || emp.designation,
        locationId: emp.locationId || emp.location?.id || emp.location?._id || emp.location,
        reportingToId: emp.reportingToId || emp.reportingTo?.id || emp.reportingTo?._id || emp.reportingTo,
        dateOfJoining: emp.dateOfJoining || '',
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
        bankDetails: emp.bankDetails || {
          bankName: emp.bankName || '',
          branchName: emp.branchName || '',
          accountNumber: emp.accountNumber || '',
          accountHolderName: emp.accountHolderName || '',
          ifscCode: emp.ifscCode || ''
        },
        // Personal Details
        gender: emp.gender,
        maritalStatus: emp.maritalStatus,
        dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth).toISOString().split('T')[0] : '',
        bloodGroup: emp.bloodGroup,
        // Identity Information
        uan: emp.uan || emp.UAN,
        pan: emp.pan || emp.PAN || emp.panCard,
        aadhaar: emp.aadhaar || emp.aadharNumber,
        passportNumber: emp.passportNumber,
        drivingLicenseNumber: emp.drivingLicenseNumber,
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

  const handleDownloadTemplate = (format: 'csv' | 'excel') => {
    let headers: string[] = [];
    let rows: string[] = [];

    if (importType === 'new') {
      headers = [
        'Full Name', 'Email Address', 'Mobile Number', 'Role', 'Department', 'Location', 'Site', 'Building / Area',
        'Reporting To', 'Date of Joining', 'Shift', 'Time Zone', 'Employee Type', 'Contract Type', 'Contract Start', 'Contract End', 'Employee Status', 'Basic Salary',
        'Allowances', 'Insurances', 'Bank Name', 'Branch Name', 'Account Number', 'Account Holder Name', 'IFSC Code'
      ];

      // Add sample data rows for new employees
      const sampleData = [
        [
          'John Doe',
          'john.doe@example.com',
          '9876543210',
          designations.length > 0 ? (designations[0].designationName || designations[0].name || 'Software Engineer') : 'Software Engineer',
          departments.length > 0 ? (departments[0].departmentName || departments[0].name || 'Engineering') : 'Engineering',
          locations.length > 0 ? (locations[0].locationName || locations[0].name || 'Bangalore') : 'Bangalore',
          '', // Site (optional)
          '', // Building / Area (optional)
          reportingManagers.length > 0 ? (reportingManagers[0].fullName || `${reportingManagers[0].firstName} ${reportingManagers[0].lastName}` || 'Manager Name') : '',
          new Date().toISOString().split('T')[0],
          shifts.length > 0 ? (shifts[0].shiftName || shifts[0].name || 'Morning') : 'Morning',
          'Asia/Kolkata',
          'permanent',
          'fixed-term', // Contract Type
          '', // Contract Start
          '', // Contract End
          'Active',
          '50000',
          'food:10|travel:5', // Allowances format: "type:percentage|type:percentage"
          'health_basic:5|life:2', // Insurances format: "type:percentage|type:percentage"
          'State Bank of India',
          'Main Branch',
          '1234567890',
          'John Doe',
          'SBIN0001234'
        ],
        [
          'Jane Smith',
          'jane.smith@example.com',
          '9876543211',
          designations.length > 1 ? (designations[1].designationName || designations[1].name || 'Product Manager') : 'Product Manager',
          departments.length > 1 ? (departments[1].departmentName || departments[1].name || 'Product') : 'Product',
          locations.length > 0 ? (locations[0].locationName || locations[0].name || 'Bangalore') : 'Bangalore',
          '', // Site (optional)
          '', // Building / Area (optional)
          reportingManagers.length > 0 ? (reportingManagers[0].fullName || `${reportingManagers[0].firstName} ${reportingManagers[0].lastName}` || 'Manager Name') : '',
          new Date().toISOString().split('T')[0],
          shifts.length > 0 ? (shifts[0].shiftName || shifts[0].name || 'Morning') : 'Morning',
          'Asia/Kolkata',
          'permanent',
          'Active',
          '60000',
          'house:15', // Single allowance
          'health_basic:5', // Single insurance
          'HDFC Bank',
          'Corporate Branch',
          '0987654321',
          'Jane Smith',
          'HDFC0005678'
        ]
      ];

      rows = sampleData.map(row =>
        row.map(cell => `"${cell}"`).join(',')
      );
    } else {
      headers = [
        'Employee Number', 'Full Name', 'Email ID', 'Mobile Number', 'Role', 'Department', 'Location', 'Site', 'Building / Area',
        'Reporting To', 'Date of Joining', 'Shift', 'Time Zone', 'Employee Type', 'Employee Status', 'Basic Salary',
        'Allowances', 'Insurances', 'Bank Name', 'Branch Name', 'Account Number', 'Account Holder Name', 'IFSC Code'
      ];

      // Add actual employee data for existing employees
      if (employees.length > 0) {
        rows = employees.map((emp: any) => {
          const getDesignationName = () => {
            if (emp.designation?.designationName) return emp.designation.designationName;
            if (emp.designation?.name) return emp.designation.name;
            if (typeof emp.designation === 'string') return emp.designation;
            return '';
          };

          const getDepartmentName = () => {
            // emp.department is a string in Employee type, but can be object in raw API response
            if (emp.department && typeof emp.department === 'object') {
              return emp.department.departmentName || emp.department.name || '';
            }
            if (typeof emp.department === 'string') return emp.department;
            return '';
          };

          const getLocationName = () => {
            if (emp.location?.locationName) return emp.location.locationName;
            if (emp.location?.name) return emp.location.name;
            if (typeof emp.location === 'string') return emp.location;
            return '';
          };

          const getReportingManagerName = () => {
            if (emp.reportingTo?.fullName) return emp.reportingTo.fullName;
            if (emp.reportingTo?.firstName && emp.reportingTo?.lastName) {
              return `${emp.reportingTo.firstName} ${emp.reportingTo.lastName}`;
            }
            return '';
          };

          const getShiftName = () => {
            if (emp.shift?.shiftName) return emp.shift.shiftName;
            if (emp.shift?.name) return emp.shift.name;
            if (typeof emp.shift === 'string') return emp.shift;
            if (emp.shiftType) return emp.shiftType;
            return '';
          };

          // Format allowances
          const formatAllowances = () => {
            if (emp.accommodationAllowances && Array.isArray(emp.accommodationAllowances) && emp.accommodationAllowances.length > 0) {
              return emp.accommodationAllowances.map((a: any) => `${a.type || ''}:${a.percentage || ''}`).join('|');
            }
            return '';
          };

          // Format insurances
          const formatInsurances = () => {
            if (emp.insurances && Array.isArray(emp.insurances) && emp.insurances.length > 0) {
              return emp.insurances.map((i: any) => `${i.type || ''}:${i.percentage || ''}`).join('|');
            }
            return '';
          };

          // Get site and building names
          const getSiteName = () => {
            if (emp.location?.sites && emp.siteId) {
              const site = emp.location.sites.find((s: any) => (s.id === emp.siteId || s._id === emp.siteId || s.name === emp.siteId));
              return site ? (site.name || site.siteName || '') : '';
            }
            return '';
          };

          const getBuildingName = () => {
            if (emp.location?.sites && emp.siteId && emp.buildingId) {
              const site = emp.location.sites.find((s: any) => (s.id === emp.siteId || s._id === emp.siteId || s.name === emp.siteId));
              if (site?.buildings) {
                const building = site.buildings.find((b: any) => (b.id === emp.buildingId || b._id === emp.buildingId || b.name === emp.buildingId));
                return building ? (building.name || building.buildingName || '') : '';
              }
            }
            return '';
          };

          return [
            emp.employeeNumber || emp.employeeId || emp.id || emp._id || '',
            emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || '',
            emp.emailId || emp.email || '',
            emp.phoneNumber || emp.mobileNumber || '',
            getDesignationName(),
            getDepartmentName(),
            getLocationName(),
            getSiteName(),
            getBuildingName(),
            getReportingManagerName(),
            emp.dateOfJoining || '',
            getShiftName(),
            emp.timeZone || 'Asia/Kolkata',
            emp.empType || emp.employeeType || '',
            emp.employeeStatus || emp.status || 'Active',
            emp.basicSalary || '',
            formatAllowances(),
            formatInsurances(),
            emp.bankDetails?.bankName || '',
            emp.bankDetails?.branchName || '',
            emp.bankDetails?.accountNumber || '',
            emp.bankDetails?.accountHolderName || '',
            emp.bankDetails?.ifscCode || ''
          ].map(cell => `"${cell}"`).join(',');
        });
      }
    }

    // Combine headers and rows
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${importType}_employee_template.${format === 'excel' ? 'csv' : 'csv'}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const handleImportEmployees = () => {
    if (!uploadedFile) {
      showAlert("Warning", 'Please upload a file first.', "warning");
      return;
    }

    showAlert("Processing", `Processing ${uploadedFile.name}...\n\nEmployees will be imported and ${importType === 'new' ? 'onboarding invitations will be sent' : 'existing records will be updated'}.`, "info");

    setUploadedFile(null);
    setCurrentView('list');
  };

  const handleExportCSV = () => {
    if (employees.length === 0) {
      showAlert("Info", "No data to export", "info");
      return;
    }

    const headers = [
      'Full Name', 'Email ID', 'Official Email', 'Onboarding Status', 'Department',
      'Source of Hire', 'PAN Card', 'Aadhaar', 'UAN'
    ];

    const csvRows = employees.map(emp => [
      emp.fullName || `${emp.firstName} ${emp.lastName}`,
      emp.emailId,
      emp.officialEmail,
      emp.onboardingStatus,
      emp.department,
      emp.sourceOfHire,
      emp.panCard,
      emp.aadhaar,
      emp.uan
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
    <>
      {currentView === 'list' && (
        <CandidateList
          employees={filteredEmployees}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          showPAN={showPAN}
          setShowPAN={setShowPAN}
          showAadhaar={showAadhaar}
          setShowAadhaar={setShowAadhaar}
          showUAN={showUAN}
          setShowUAN={setShowUAN}
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
        />
      )}
      {currentView === 'addCandidate' && (
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
      )}
      {currentView === 'viewCandidate' && selectedCandidate && (
        <ViewCandidate
          candidate={selectedCandidate}
          onClose={() => setCurrentView('list')}
          departments={departments}
          designations={designations}
          locations={locations}
          reportingManagers={reportingManagers}
          shifts={shifts}
        />
      )}
      {currentView === 'bulkImport' && (
        <BulkImport
          importType={importType}
          setImportType={setImportType}
          uploadedFile={uploadedFile}
          onFileUpload={handleFileUpload}
          onDownloadTemplate={handleDownloadTemplate}
          onImport={handleImportEmployees}
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
    </>
  );
};

export default EmployeeOnboardingSystem;