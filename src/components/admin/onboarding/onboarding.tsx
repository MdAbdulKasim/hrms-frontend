'use client';
import React, { useState } from 'react';
import { Employee, CandidateForm, OnboardingView } from './types';
import CandidateList from './CandidateList';
import AddCandidateForm from './AddCandidateForm';
import BulkImport from './BulkImport';

const EmployeeOnboardingSystem: React.FC = () => {
  const [currentView, setCurrentView] = useState<OnboardingView>('list');
  const [showPAN, setShowPAN] = useState<{ [key: number]: boolean }>({});
  const [showAadhaar, setShowAadhaar] = useState<{ [key: number]: boolean }>({});
  const [showUAN, setShowUAN] = useState<{ [key: number]: boolean }>({});
  const [importType, setImportType] = useState('new');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // New state for row selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Sanders',
      emailId: 'sarahsanders@zy...',
      officialEmail: '',
      onboardingStatus: '',
      department: '',
      sourceOfHire: '',
      panCard: '**********',
      aadhaar: '**********',
      uan: '**********'
    },
    {
      id: 2,
      firstName: 'Rose',
      lastName: 'Stacy',
      emailId: 'rosestacy@zylker...',
      officialEmail: '',
      onboardingStatus: '',
      department: '',
      sourceOfHire: '',
      panCard: '**********',
      aadhaar: '**********',
      uan: '**********'
    },
    {
      id: 3,
      firstName: 'Mathew',
      lastName: 'Morales',
      emailId: 'mathewmorales...',
      officialEmail: '',
      onboardingStatus: '',
      department: '',
      sourceOfHire: '',
      panCard: '**********',
      aadhaar: '**********',
      uan: '**********'
    },
    {
      id: 4,
      firstName: 'Kevin',
      lastName: 'Parker',
      emailId: 'kevinparker@zylk...',
      officialEmail: '',
      onboardingStatus: '',
      department: '',
      sourceOfHire: '',
      panCard: '**********',
      aadhaar: '**********',
      uan: '**********'
    },
    {
      id: 5,
      firstName: 'David',
      lastName: 'Rickman',
      emailId: 'davidrickman@zy...',
      officialEmail: '',
      onboardingStatus: '',
      department: '',
      sourceOfHire: '',
      panCard: '**********',
      aadhaar: '**********',
      uan: '**********'
    }
  ]);

  const [candidateForm, setCandidateForm] = useState<CandidateForm>({
    fullName: '',
    email: '',
    role: '',
    reportingTo: '',
    department: '',
    teamPosition: 'member',
    shift: '',
    location: '',
    timeZone: '',
    mobileNumber: '',
    employeeType: '',
    employeeStatus: ''
  });

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

  const handleAddCandidate = () => {
    if (candidateForm.fullName && candidateForm.email) {
      const nameParts = candidateForm.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const newEmployee: Employee = {
        id: employees.length + 1,
        firstName: firstName,
        lastName: lastName,
        emailId: candidateForm.email,
        officialEmail: candidateForm.email,
        onboardingStatus: 'Invitation Sent',
        department: candidateForm.department,
        sourceOfHire: 'Manual Entry',
        panCard: '**********',
        aadhaar: '**********',
        uan: '**********'
      };

      setEmployees(prev => [...prev, newEmployee]);

      sendOnboardingEmail(candidateForm.fullName, candidateForm.email, candidateForm.role, candidateForm.department);

      setCandidateForm({
        fullName: '',
        email: '',
        role: '',
        reportingTo: '',
        department: '',
        teamPosition: 'member',
        shift: '',
        location: '',
        timeZone: '',
        mobileNumber: '',
        employeeType: '',
        employeeStatus: ''
      });

      setCurrentView('list');
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

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDownloadTemplate = (format: 'csv' | 'excel') => {
    let headers: string[] = [];

    if (importType === 'new') {
      headers = [
        'Full Name', 'Email Address', 'Role', 'Reporting To', 'Department',
        'Team Position', 'Shift', 'Location', 'Time Zone', 'Mobile Number',
        'Employee Type', 'Employee Status'
      ];
    } else {
      headers = [
        'Employee ID', 'Full Name', 'Email ID', 'Official Email', 'Date of Joining',
        'Total Experience', 'Date of Birth', 'Marital Status', 'PAN Number', 'UAN',
        'Identity Proof', 'Role', 'Department', 'Reporting To', 'Team Position',
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

  return (
    <>
      {currentView === 'list' && (
        <CandidateList
          employees={employees}
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
        />
      )}
      {currentView === 'addCandidate' && (
        <AddCandidateForm
          candidateForm={candidateForm}
          onInputChange={handleInputChange}
          onAddCandidate={handleAddCandidate}
          onCancel={() => setCurrentView('list')}
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