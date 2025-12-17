'use client';
import React, { useState } from 'react';
import { X, Upload, Download, FileText, Eye, EyeOff, ChevronDown, Plus, FileSpreadsheet } from 'lucide-react';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  emailId: string;
  officialEmail: string;
  onboardingStatus: string;
  department: string;
  sourceOfHire: string;
  panCard: string;
  aadhaar: string;
  uan: string;
}

interface CandidateForm {
  fullName: string;
  email: string;
  role: string;
  reportingTo: string;
  department: string;
  teamPosition: string;
  shift: string;
  location: string;
  timeZone: string;
  mobileNumber: string;
}

type View = 'list' | 'addCandidate' | 'bulkImport';

const EmployeeOnboardingSystem: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('list');
  const [showPAN, setShowPAN] = useState<{ [key: number]: boolean }>({});
  const [showAadhaar, setShowAadhaar] = useState<{ [key: number]: boolean }>({});
  const [showUAN, setShowUAN] = useState<{ [key: number]: boolean }>({});
  const [importType, setImportType] = useState('new');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
    mobileNumber: ''
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
        mobileNumber: ''
      });
      
      setCurrentView('list');
    }
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

  const renderEmployeeListView = () => (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Responsive Header: Stack vertically on mobile, row on desktop */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
          <h1 className="text-2xl font-bold">Employee Onboarding</h1>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            <button
              onClick={() => setCurrentView('bulkImport')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Upload className="w-4 h-4" />
              Bulk Import
            </button>
            <button
              onClick={() => setCurrentView('addCandidate')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Candidate
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Official Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Onboarding Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source of Hire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PAN card number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aadhaar card number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UAN number
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{employee.firstName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{employee.lastName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{employee.emailId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{employee.officialEmail}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{employee.onboardingStatus}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{employee.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{employee.sourceOfHire}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {showPAN[employee.id] ? 'ABCDE1234F' : employee.panCard}
                        <button onClick={() => setShowPAN({ ...showPAN, [employee.id]: !showPAN[employee.id] })}>
                          {showPAN[employee.id] ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {showAadhaar[employee.id] ? '1234 5678 9012' : employee.aadhaar}
                        <button onClick={() => setShowAadhaar({ ...showAadhaar, [employee.id]: !showAadhaar[employee.id] })}>
                          {showAadhaar[employee.id] ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {showUAN[employee.id] ? '123456789012' : employee.uan}
                        <button onClick={() => setShowUAN({ ...showUAN, [employee.id]: !showUAN[employee.id] })}>
                          {showUAN[employee.id] ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddCandidateView = () => (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold">Add Candidate</h1>
          <button
            onClick={() => setCurrentView('list')}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Candidate Details</h2>
          </div>

          {/* Responsive Grid: 1 column on mobile, 2 columns on medium screens and up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                value={candidateForm.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter email"
                value={candidateForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="relative">
                <select 
                  value={candidateForm.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select role</option>
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="Manager">Manager</option>
                  <option value="Analyst">Analyst</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reporting To
              </label>
              <div className="relative">
                <select
                  value={candidateForm.reportingTo}
                  onChange={(e) => handleInputChange('reportingTo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select manager</option>
                  <option value="John Doe">John Doe</option>
                  <option value="Jane Smith">Jane Smith</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <div className="relative">
                <select
                  value={candidateForm.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Position
              </label>
              <div className="flex flex-wrap gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="teamPosition"
                    value="lead"
                    checked={candidateForm.teamPosition === 'lead'}
                    onChange={(e) => handleInputChange('teamPosition', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Team Lead</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="teamPosition"
                    value="member"
                    checked={candidateForm.teamPosition === 'member'}
                    onChange={(e) => handleInputChange('teamPosition', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Member</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift
              </label>
              <div className="relative">
                <select
                  value={candidateForm.shift}
                  onChange={(e) => handleInputChange('shift', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select shift</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <select
                  value={candidateForm.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select location</option>
                  <option value="New York">New York</option>
                  <option value="San Francisco">San Francisco</option>
                  <option value="London">London</option>
                  <option value="Remote">Remote</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Zone
              </label>
              <div className="relative">
                <select
                  value={candidateForm.timeZone}
                  onChange={(e) => handleInputChange('timeZone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select timezone</option>
                  <option value="EST">EST (UTC-5)</option>
                  <option value="PST">PST (UTC-8)</option>
                  <option value="GMT">GMT (UTC+0)</option>
                  <option value="IST">IST (UTC+5:30)</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="Enter mobile number"
                value={candidateForm.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button 
            onClick={handleAddCandidate}
            className="mt-8 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center justify-center w-full sm:w-auto gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Send Onboarding Invitation
          </button>
        </div>
      </div>
    </div>
  );

  const renderBulkImportView = () => (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold">Bulk Import</h1>
          <button
            onClick={() => setCurrentView('list')}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Responsive Grid for options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Download Template</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Download the template file and fill in employee details. Supported formats: CSV, Excel.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Download CSV
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Download Excel
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Import Type</h2>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="importType"
                  value="new"
                  checked={importType === 'new'}
                  onChange={(e) => setImportType(e.target.value)}
                  className="mt-1 w-4 h-4 text-blue-600 shrink-0"
                />
                <div>
                  <div className="font-medium text-gray-900">New Employees</div>
                  <div className="text-sm text-gray-600">
                    Import new employees who will receive onboarding invitations
                  </div>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="importType"
                  value="existing"
                  checked={importType === 'existing'}
                  onChange={(e) => setImportType(e.target.value)}
                  className="mt-1 w-4 h-4 text-blue-600 shrink-0"
                />
                <div>
                  <div className="font-medium text-gray-900">Existing Employees</div>
                  <div className="text-sm text-gray-600">
                    Update data for existing employees in the system
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Upload File</h2>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-12 text-center">
            <input
              type="file"
              id="fileUpload"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="fileUpload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 mb-2">Drop your file here or click to browse</p>
              <p className="text-sm text-gray-500">Supports CSV and Excel files</p>
              {uploadedFile && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 inline-block max-w-full">
                  <p className="text-sm text-green-800 flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">{uploadedFile.name}</span>
                  </p>
                </div>
              )}
            </label>
          </div>

          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-2">
            <div className="w-5 h-5 text-orange-600 mt-0.5 shrink-0">ⓘ</div>
            <p className="text-sm text-orange-800">
              New employees will receive onboarding invitations via email after import.
            </p>
          </div>

          <button 
            onClick={handleImportEmployees}
            className={`mt-6 w-full px-6 py-3 text-white rounded-lg flex items-center justify-center gap-2 ${
              uploadedFile ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!uploadedFile}
          >
            <Upload className="w-5 h-5" />
            Import Employees
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {currentView === 'list' && renderEmployeeListView()}
      {currentView === 'addCandidate' && renderAddCandidateView()}
      {currentView === 'bulkImport' && renderBulkImportView()}
    </>
  );
};

export default EmployeeOnboardingSystem;