'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Employee, CandidateForm, OnboardingView } from './types';
import CandidateList from './CandidateList';
import AddCandidateForm from './AddCandidateForm';
import BulkImport from './BulkImport';
import ViewCandidate from './ViewCandidate';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';

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
    insuranceType: '',
    insurancePercentage: ''
  });

  useEffect(() => {
    const orgId = getOrgId();
    console.log("ONBOARDING MOUNT: OrgId detected:", orgId);
    if (orgId) {
      fetchOnboardingData();
      fetchEmployees();
    } else {
      console.warn("ONBOARDING MOUNT: No OrgId found, skipping fetch.");
    }
  }, []); // Run on mount

  const fetchOnboardingData = async () => {
    const orgId = getOrgId();
    const token = getAuthToken();
    const apiUrl = getApiUrl();
    if (!orgId || !token) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [deptRes, desigRes, locRes, shiftRes] = await Promise.all([
        axios.get(`${apiUrl}/org/${orgId}/departments`, { headers }),
        axios.get(`${apiUrl}/org/${orgId}/designations`, { headers }),
        axios.get(`${apiUrl}/org/${orgId}/locations`, { headers }),
        axios.get(`${apiUrl}/org/${orgId}/shifts`, { headers }).catch(() => ({ data: { data: [] } }))
      ]);

      setDepartments(deptRes.data.data || deptRes.data || []);
      setDesignations(desigRes.data.data || desigRes.data || []);
      setLocations(locRes.data.data || locRes.data || []);
      setShifts(shiftRes.data.data || shiftRes.data || []);
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
    }
  };

  const fetchEmployees = async () => {
    const orgId = getOrgId();
    const token = getAuthToken();
    const apiUrl = getApiUrl();
    console.log("FETCH EMPLOYEES: Config:", { apiUrl, orgId, hasToken: !!token });
    if (!orgId || !token) return;

    try {
      const res = await axios.get(`${apiUrl}/org/${orgId}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("FETCH EMPLOYEES: Response status:", res.status);
      const employeeData = res.data.data || res.data || [];
      console.log("FETCH EMPLOYEES: Raw data count:", Array.isArray(employeeData) ? employeeData.length : "Not an array");
      const employeeList = Array.isArray(employeeData) ? employeeData : [];

      const formattedEmployees = employeeList.map((emp: any) => ({
        id: emp.id || emp._id || String(Math.random()),
        fullName: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unnamed Employee',
        firstName: emp.firstName || emp.fullName?.split(' ')[0] || '',
        lastName: emp.lastName || emp.fullName?.split(' ').slice(1).join(' ') || '',
        emailId: emp.email || emp.emailId || '',
        officialEmail: emp.officialEmail || emp.email || '',
        onboardingStatus: String(emp.onboardingStatus || emp.status || 'Active'),
        department: String(emp.department?.departmentName || emp.department?.name || emp.department || ''),
        sourceOfHire: String(emp.sourceOfHire || 'Direct'),
        panCard: emp.panCard || '**********',
        aadhaar: emp.aadhaar || '**********',
        uan: emp.uan || '**********'
      }));

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

    alert(`Onboarding invitation sent to ${email}`);
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
      alert(`Please complete the following required fields: \n- ${missingFields.join('\n- ')}`);
      return;
    }

    const orgId = getOrgId();
    const token = getAuthToken();
    const apiUrl = getApiUrl();

    if (!orgId || !token) {
      alert("Authentication error. Please log in again.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        fullName: candidateForm.fullName,
        email: candidateForm.email,
        phoneNumber: candidateForm.phoneNumber || candidateForm.mobileNumber,
        role: "employee",
        departmentId: candidateForm.departmentId,
        designationId: candidateForm.designationId,
        locationId: candidateForm.locationId,
        reportingToId: reportingManagers.length > 0 ? candidateForm.reportingToId : null,
        dateOfJoining: candidateForm.dateOfJoining,
        shiftType: candidateForm.shiftType,
        timeZone: candidateForm.timeZone,
        empType: candidateForm.empType,
        siteId: candidateForm.siteId,
        buildingId: candidateForm.buildingId,
        basicSalary: candidateForm.basicSalary,
        accommodationAllowances: candidateForm.accommodationAllowances,
        insuranceType: candidateForm.insuranceType,
        insurancePercentage: candidateForm.insurancePercentage
      };

      console.log("ONBOARDING DEBUG:", {
        apiUrl,
        orgId,
        token: token ? "Token present" : "Token missing",
        payload
      });

      const response = await axios.post(
        `${apiUrl}/org/${orgId}/employees`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Employee onboarded successfully! An invitation email has been sent.");

        // Refresh employee list
        fetchEmployees();

        // Reset form and view
        setCandidateForm({
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
          insuranceType: '',
          insurancePercentage: ''
        });
        setCurrentView('list');
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
      alert(`Failed to onboard employee: ${errorMessage}`);
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
      const response = await axios.get(`${apiUrl}/org/${orgId}/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.data || response.data;
      // Handle the case where the API might return an array or a single object
      const emp = Array.isArray(data) ? data[0] : data;

      if (!emp) throw new Error("Employee not found");

      setCandidateForm({
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
        accommodationAllowances: emp.accommodationAllowances || [],
        insuranceType: emp.insuranceType || '',
        insurancePercentage: emp.insurancePercentage || ''
      });
      setEditingEmployeeId(id);
      setCurrentView('addCandidate');
    } catch (err: any) {
      console.error(err);
      alert(`Failed to fetch employee details: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCandidate = async () => {
    const orgId = getOrgId();
    const token = getAuthToken();
    const apiUrl = getApiUrl();

    if (!orgId || !token || !editingEmployeeId) {
      alert("Authentication or operation error. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        fullName: candidateForm.fullName,
        email: candidateForm.email,
        phoneNumber: candidateForm.phoneNumber || candidateForm.mobileNumber,
        role: "employee",
        departmentId: candidateForm.departmentId,
        designationId: candidateForm.designationId,
        locationId: candidateForm.locationId,
        reportingToId: candidateForm.reportingToId || null,
        dateOfJoining: candidateForm.dateOfJoining,
        shiftType: candidateForm.shiftType,
        timeZone: candidateForm.timeZone,
        empType: candidateForm.empType,
        siteId: candidateForm.siteId,
        buildingId: candidateForm.buildingId,
        basicSalary: candidateForm.basicSalary,
        accommodationAllowances: candidateForm.accommodationAllowances,
        insuranceType: candidateForm.insuranceType,
        insurancePercentage: candidateForm.insurancePercentage
      };

      await axios.patch(
        `${apiUrl}/org/${orgId}/employees/${editingEmployeeId}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert("Employee details updated successfully!");
      fetchEmployees();
      setCandidateForm({
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
        insuranceType: '',
        insurancePercentage: ''
      });
      setEditingEmployeeId(null);
      setCurrentView('list');
    } catch (error: any) {
      console.error('Update ERROR:', error);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      alert(`Failed to update employee: ${errorMessage}`);
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
      const response = await axios.get(`${apiUrl}/org/${orgId}/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const emp = response.data.data || response.data;

      // Map to CandidateForm
      const form: CandidateForm = {
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
        accommodationAllowances: emp.accommodationAllowances || [],
        insuranceType: emp.insuranceType || '',
        insurancePercentage: emp.insurancePercentage || ''
      };
      setSelectedCandidate(form);
      setCurrentView('viewCandidate');
    } catch (err) {
      console.error(err);
      alert("Failed to fetch employee details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee? This action cannot be undone.")) return;

    const orgId = getOrgId();
    const token = getAuthToken();
    const apiUrl = getApiUrl();
    if (!orgId || !token) return;

    setIsLoading(true);
    try {
      await axios.delete(`${apiUrl}/org/${orgId}/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Employee deleted successfully");
      fetchEmployees();
      // If deleted item was selected, remove it
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(sid => sid !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete employee");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} employees? This action cannot be undone.`)) return;

    const orgId = getOrgId();
    const token = getAuthToken();
    const apiUrl = getApiUrl();
    if (!orgId || !token) return;

    setIsLoading(true);
    // Execute multiple deletes
    // Ideally backend should support bulk delete, but looping for now
    let successCount = 0;
    try {
      await Promise.all(selectedIds.map(id =>
        axios.delete(`${apiUrl}/org/${orgId}/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(() => { successCount++; })
      ));

      alert(`Successfully deleted ${successCount} employees.`);
      fetchEmployees();
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      alert(`Some deletions failed. Deleted ${successCount} out of ${selectedIds.length}.`);
      fetchEmployees(); // Refresh likely partial state
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = (format: 'csv' | 'excel') => {
    let headers: string[] = [];

    if (importType === 'new') {
      headers = [
        'Full Name', 'Email Address', 'Role', 'Reporting To', 'Department',
        'Date of Joining', 'Shift', 'Location', 'Time Zone', 'Mobile Number',
        'Employee Type', 'Employee Status'
      ];
    } else {
      headers = [
        'Employee ID', 'Full Name', 'Email ID', 'Official Email', 'Date of Joining',
        'Total Experience', 'Date of Birth', 'Marital Status', 'PAN Number', 'UAN',
        'Identity Proof', 'Role', 'Department', 'Reporting To',
        'Shift', 'Location', 'Employee Type', 'Employee Status', 'Mobile Number',
        'Present Address', 'Previous Company Name', 'Job Title', 'From Date',
        'To Date', 'Job Description', 'Institute Name', 'Degree', 'Diploma',
        'Specialization', 'Date of Completion'
      ];
    }

    const csvContent = headers.join(',');
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
        alert(`File "${file.name}" uploaded successfully!`);
      } else {
        alert('Please upload a valid CSV or Excel file.');
      }
    }
  };

  const handleImportEmployees = () => {
    if (!uploadedFile) {
      alert('Please upload a file first.');
      return;
    }

    alert(`Processing ${uploadedFile.name}...\n\nEmployees will be imported and ${importType === 'new' ? 'onboarding invitations will be sent' : 'existing records will be updated'}.`);

    setUploadedFile(null);
    setCurrentView('list');
  };

  const handleExportCSV = () => {
    if (employees.length === 0) {
      alert("No data to export");
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
          departments={departments}
          designations={designations}
          locations={locations}
          reportingManagers={reportingManagers}
          shifts={shifts}
          isLoading={isLoading}
          isEditing={!!editingEmployeeId}
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
          onCancel={() => setCurrentView('list')}
        />
      )}
    </>
  );
};

export default EmployeeOnboardingSystem;