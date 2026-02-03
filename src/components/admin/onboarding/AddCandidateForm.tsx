'use client';
import React from 'react';
import { X, ChevronDown, Check, Plus, Trash2 } from 'lucide-react';
import { CandidateForm, AccommodationAllowance, Insurance, BankDetails } from './types';
import SuccessDialog from './SuccessDialog';
import { getAuthToken, getOrgId, getApiUrl } from '@/lib/auth';

interface ComboboxProps {
    value: string;
    onChange: (value: string) => void;
    options: { id: string; label: string }[];
    placeholder: string;
    label: string;
    disabled?: boolean;
}

const Combobox: React.FC<ComboboxProps> = ({
    value,
    onChange,
    options,
    placeholder,
    label,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    // Filter options based on input
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setInputValue('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type="text"
                    value={isOpen ? inputValue : (selectedOption?.label || '')}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-75' : 'bg-white'}`}
                />
                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform pointer-events-none ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option.id}
                                onClick={() => {
                                    onChange(option.id);
                                    setIsOpen(false);
                                    setInputValue('');
                                }}
                                className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-blue-50 ${value === option.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                            >
                                <span className="truncate">{option.label}</span>
                                {value === option.id && <Check className="w-4 h-4" />}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center italic">
                            No results found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface FileUploaderProps {
    label: string;
    value: string | File | null;
    onChange: (file: File | null) => void;
    fieldName: string;
    onView?: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ label, value, onChange, fieldName, onView }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onChange(e.target.files[0]);
        }
    };

    const getFileName = () => {
        if (!value) return '';
        if (value instanceof File) return value.name;
        if (typeof value === 'string') return value.split('/').pop() || 'Uploaded Document';
        return '';
    };

    const handleView = () => {
        if (!value) return;

        if (onView) {
            onView();
            return;
        }

        if (value instanceof File) {
            const url = URL.createObjectURL(value);
            window.open(url, '_blank');
        } else if (typeof value === 'string') {
            // Fallback if no specific view handler provided
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const cleanValue = value.startsWith('/') ? value.substring(1) : value;
            // This fallback is likely what was failing, but we keep it for now or prefer onView
            // Actually, we should probably warn or remove this if we want to force API usage
            // But leaving it for backward compat where direct link might surely fail
            window.open(`${apiUrl}/uploads/${cleanValue}`, '_blank');
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {value ? 'Change File' : 'Upload File'}
                </button>
                {value && (
                    <>
                        <button
                            type="button"
                            onClick={handleView}
                            className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
                        >
                            View
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>

        </div>
    );
};

interface AddCandidateFormProps {
    candidateForm: CandidateForm;
    onInputChange: (field: keyof CandidateForm, value: any) => void;
    onAddCandidate: () => any | Promise<any>;
    onCancel: () => void;
    departments: any[];
    designations: any[];
    locations: any[];
    reportingManagers: any[];
    shifts: any[];
    isLoading: boolean;
    isEditing?: boolean;
    employees?: any[]; // For generating employee ID
    onSuccess?: () => void; // Optional success callback
    onComplete?: () => void; // Called after success dialog is closed
}

const AddCandidateForm: React.FC<AddCandidateFormProps> = ({
    candidateForm,
    onInputChange,
    onAddCandidate,
    onCancel,
    departments,
    designations,
    locations,
    reportingManagers,
    shifts,
    isLoading,
    isEditing = false,
    employees = [],
    onSuccess,
    onComplete,
}) => {
    // State for success dialog
    const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
    const [generatedId, setGeneratedId] = React.useState('');
    const [identityView, setIdentityView] = React.useState<'number' | 'documents'>(isEditing ? 'documents' : 'number');
    // Generate ID logic
    const handleGenerateEmployeeId = () => {
        const existingIds = (employees || []).map(emp => {
            const match = emp.employeeNumber?.match(/\d+/);
            return match ? parseInt(match[0], 10) : 0;
        });
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        const nextId = `EMP-${String(maxId + 1).padStart(3, '0')}`;
        onInputChange('employeeNumber', nextId);
    };

    // Calculate total salary
    const calculateTotalSalary = () => {
        const basic = parseFloat(candidateForm.basicSalary || '0') || 0;

        // Calculate allowances (added to salary)
        let allowanceTotal = 0;
        if (Array.isArray(candidateForm.accommodationAllowances)) {
            candidateForm.accommodationAllowances.forEach(allowance => {
                const percentage = parseFloat(allowance.percentage || '0') || 0;
                allowanceTotal += (basic * percentage) / 100;
            });
        }

        // Calculate insurance deductions (reduced from salary)
        let insuranceDeduction = 0;
        if (Array.isArray(candidateForm.insurances)) {
            candidateForm.insurances.forEach(insurance => {
                const percentage = parseFloat(insurance.percentage || '0') || 0;
                insuranceDeduction += (basic * percentage) / 100;
            });
        }

        const total = basic + allowanceTotal - insuranceDeduction;
        return {
            basic,
            allowanceTotal,
            insuranceDeduction,
            total: Math.max(0, total) // Ensure non-negative
        };
    };

    const salaryBreakdown = calculateTotalSalary();
    const handleAddAllowance = () => {
        const newAllowances = [...(candidateForm.accommodationAllowances || []), { type: '', percentage: '' }];
        onInputChange('accommodationAllowances', newAllowances);
    };

    const handleRemoveAllowance = (index: number) => {
        const newAllowances = candidateForm.accommodationAllowances.filter((_, i) => i !== index);
        onInputChange('accommodationAllowances', newAllowances);
    };

    const handleAllowanceChange = (index: number, field: 'type' | 'percentage', value: string) => {
        const newAllowances = [...candidateForm.accommodationAllowances];
        newAllowances[index] = { ...newAllowances[index], [field]: value };
        onInputChange('accommodationAllowances', newAllowances);
    };

    // Get available allowance types (excluding already selected ones)
    const getAvailableAllowanceTypes = (currentIndex: number) => {
        const allTypes = [
            { id: 'food', label: 'Food Allowance' },
            { id: 'travel', label: 'Travel Allowance' },
            { id: 'house', label: 'House Allowance' },
        ];

        const selectedTypes = candidateForm.accommodationAllowances
            ?.map((a, idx) => idx !== currentIndex ? a.type : null)
            .filter(Boolean) || [];

        return allTypes.filter(type => !selectedTypes.includes(type.id));
    };

    // Insurance handlers
    const handleAddInsurance = () => {
        const newInsurances = [...(candidateForm.insurances || []), { type: '', percentage: '' }];
        onInputChange('insurances', newInsurances);
    };

    const handleRemoveInsurance = (index: number) => {
        const newInsurances = candidateForm.insurances.filter((_, i) => i !== index);
        onInputChange('insurances', newInsurances);
    };

    const handleInsuranceChange = (index: number, field: 'type' | 'percentage', value: string) => {
        const newInsurances = [...candidateForm.insurances];
        newInsurances[index] = { ...newInsurances[index], [field]: value };
        onInputChange('insurances', newInsurances);
    };

    // Get available insurance types (excluding already selected ones)
    const getAvailableInsuranceTypes = (currentIndex: number) => {
        const allTypes = [
            { id: 'health_basic', label: 'Health Insurance' },
            { id: 'life', label: 'Life Insurance' },
            { id: 'accident', label: 'Accident Insurance' },
            { id: 'disability', label: 'Disability Insurance' },
        ];

        const selectedTypes = candidateForm.insurances
            ?.map((a, idx) => idx !== currentIndex ? a.type : null)
            .filter(Boolean) || [];

        return allTypes.filter(type => !selectedTypes.includes(type.id));
    };

    // Bank details handler
    const handleBankDetailsChange = (field: keyof BankDetails, value: string | File | null) => {
        const updatedBankDetails = {
            ...(candidateForm.bankDetails || {
                bankName: '',
                branchName: '',
                accountNumber: '',
                accountHolderName: '',
                ifscCode: ''
            }),
            [field]: value
        };
        onInputChange('bankDetails', updatedBankDetails);
    };

    // Education handlers
    const handleAddEducation = () => {
        const newEducation = [...(candidateForm.education || []), {
            instituteName: '',
            degree: '',
            fieldOfStudy: '',
            startYear: '',
            endYear: ''
        }];
        onInputChange('education', newEducation);
    };

    const handleRemoveEducation = (index: number) => {
        const newEducation = candidateForm.education?.filter((_, i) => i !== index);
        onInputChange('education', newEducation);
    };

    const handleEducationChange = (index: number, field: string, value: string) => {
        const newEducation = [...(candidateForm.education || [])];
        newEducation[index] = { ...newEducation[index], [field]: value };
        onInputChange('education', newEducation);
    };

    // Experience handlers
    const handleAddExperience = () => {
        const newExperience = [...(candidateForm.experience || []), {
            companyName: '',
            jobTitle: '',
            fromDate: '',
            toDate: '',
            currentlyWorking: false,
            jobDescription: ''
        }];
        onInputChange('experience', newExperience);
    };

    const handleRemoveExperience = (index: number) => {
        const newExperience = candidateForm.experience?.filter((_, i) => i !== index);
        onInputChange('experience', newExperience);
    };

    const handleExperienceChange = (index: number, field: string, value: any) => {
        const newExperience = [...(candidateForm.experience || [])];
        newExperience[index] = { ...newExperience[index], [field]: value };
        onInputChange('experience', newExperience);
    };

    const handleViewDocument = async (documentType: string) => {
        // If we are adding a NEW candidate (not editing), files are local File objects
        // and FileUploader handles them via URL.createObjectURL.
        // This function is for viewing EXISTING documents from the backend (editing mode).

        if (!isEditing || (!candidateForm.id && !candidateForm._id)) return; // Should allow local view if File object, but FileUploader handles that.

        try {
            // We need to fetch the presigned URL
            // Using the same endpoint pattern: /org/:orgId/employees/:employeeId/documents/:documentType
            // But here we need to know the employee ID. 
            // candidateForm typically has it. 
            // Let's assume candidateForm has 'id' or we use a prop?
            // Looking at usage, candidateForm matches the API response structure.

            // Wait, AddCandidateForm is used for adding AND editing.
            // If editing, we have an ID.
            const token = getAuthToken();
            const orgId = getOrgId();
            const apiUrl = getApiUrl();

            // Check if we have an employee ID
            const empId = candidateForm.id || candidateForm._id;

            if (!empId || !orgId || !token) {
                console.error("Missing ID or credentials for viewing document");
                return;
            }

            const response = await fetch(
                `${apiUrl}/org/${orgId}/employees/${empId}/documents/${documentType}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            const data = await response.json();

            if (data.success && data.documentUrl) {
                window.open(data.documentUrl, '_blank');
            } else {
                alert("Document not found");
            }

        } catch (error) {
            console.error("Error fetching document:", error);
            alert("Failed to open document");
        }
    };

    return (
        <div className="min-h-screen bg-white p-2 sm:p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6 gap-4">
                    <h1 className="text-xl md:text-2xl font-bold">{isEditing ? 'Edit Employee' : 'Add Candidate'}</h1>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-200 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 md:p-8 space-y-6 sm:space-y-8">
                    {/* Personal Details Section */}
                    <div>
                        {/* <div className="flex flex-col sm:flex-row items-center gap-8 mb-8 pb-8 border-b border-gray-100">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-3xl border-4 border-gray-50 shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {candidateForm.profilePicture ? (
                                        <img
                                            src={candidateForm.profilePicture instanceof File ? URL.createObjectURL(candidateForm.profilePicture) : (String(candidateForm.profilePicture).startsWith('http') ? String(candidateForm.profilePicture) : `${getApiUrl()}/uploads/${candidateForm.profilePicture}`)}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-gray-300">
                                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                                    <Plus className="w-5 h-5" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                onInputChange('profilePicture', e.target.files[0]);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <div className="flex-1 text-center sm:text-left space-y-1">
                                <h3 className="font-bold text-gray-800">Profile Picture</h3>
                                <p className="text-sm text-gray-500">Upload a professional photo. Supports JPG, PNG. Max 5MB.</p>
                            </div>
                        </div> */}

                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold">Personal Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Employee Number <span className="text-gray-400 text-xs ">({isEditing ? 'Existing' : 'Mandatory'})</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="EMP-001"
                                    value={candidateForm.employeeNumber || ''}
                                    onChange={(e) => onInputChange('employeeNumber', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={candidateForm.fullName || ''}
                                    onChange={(e) => onInputChange('fullName', e.target.value)}
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
                                    value={candidateForm.email || ''}
                                    onChange={(e) => onInputChange('email', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Enter mobile number"
                                    value={candidateForm.phoneNumber || candidateForm.mobileNumber || ''}
                                    onChange={(e) => onInputChange('phoneNumber', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <Combobox
                                label="Gender"
                                value={candidateForm.gender || ''}
                                onChange={(val) => onInputChange('gender', val)}
                                placeholder="Select gender..."
                                options={[
                                    { id: 'male', label: 'Male' },
                                    { id: 'female', label: 'Female' },
                                    { id: 'other', label: 'Other' },
                                ]}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={candidateForm.dateOfBirth || ''}
                                    onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <Combobox
                                label="Marital Status"
                                value={candidateForm.maritalStatus || ''}
                                onChange={(val) => onInputChange('maritalStatus', val)}
                                placeholder="Select status..."
                                options={[
                                    { id: 'single', label: 'Single' },
                                    { id: 'married', label: 'Married' },
                                    { id: 'divorced', label: 'Divorced' },
                                    { id: 'widowed', label: 'Widowed' },
                                ]}
                            />

                            <Combobox
                                label="Blood Group"
                                value={candidateForm.bloodGroup || ''}
                                onChange={(val) => onInputChange('bloodGroup', val)}
                                placeholder="Select blood group..."
                                options={[
                                    { id: 'A+', label: 'A+' }, { id: 'A-', label: 'A-' },
                                    { id: 'B+', label: 'B+' }, { id: 'B-', label: 'B-' },
                                    { id: 'O+', label: 'O+' }, { id: 'O-', label: 'O-' },
                                    { id: 'AB+', label: 'AB+' }, { id: 'AB-', label: 'AB-' },
                                ]}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold">Identity Information</h2>
                            </div>
                            <div className="flex bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() => setIdentityView('number')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${identityView === 'number' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Number
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIdentityView('documents')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${identityView === 'documents' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Documents
                                </button>
                            </div>
                        </div>

                        {identityView === 'number' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">IBAN Number</label>
                                    <input
                                        type="text"
                                        placeholder="AE07 0331 1234 5678 9012 345"
                                        value={candidateForm.iban || ''}
                                        onChange={(e) => onInputChange('iban', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">UID Number</label>
                                    <input
                                        type="text"
                                        placeholder="Enter UID number"
                                        value={candidateForm.uid || ''}
                                        onChange={(e) => onInputChange('uid', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Labour Number</label>
                                    <input
                                        type="text"
                                        placeholder="Enter labour number"
                                        value={candidateForm.labourNumber || ''}
                                        onChange={(e) => onInputChange('labourNumber', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Emirates ID (EID)</label>
                                    <input
                                        type="text"
                                        placeholder="784-YYYY-XXXXXXX-X"
                                        value={candidateForm.eid || ''}
                                        onChange={(e) => onInputChange('eid', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Visa Number</label>
                                    <input
                                        type="text"
                                        placeholder="Enter visa number"
                                        value={candidateForm.visaNumber || ''}
                                        onChange={(e) => onInputChange('visaNumber', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Iqama ID</label>
                                    <input
                                        type="text"
                                        placeholder="Starts with 2 (10 digits)"
                                        value={candidateForm.iqamaId || ''}
                                        onChange={(e) => onInputChange('iqamaId', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                                    <input
                                        type="text"
                                        placeholder="Enter passport number"
                                        value={candidateForm.passportNumber || ''}
                                        onChange={(e) => onInputChange('passportNumber', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Driving License Number</label>
                                    <input
                                        type="text"
                                        placeholder="Enter driving license number"
                                        value={candidateForm.drivingLicenseNumber || ''}
                                        onChange={(e) => onInputChange('drivingLicenseNumber', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                                <FileUploader
                                    label="IBAN Copy"
                                    value={candidateForm.ibanCopy || ''}
                                    onChange={(file) => onInputChange('ibanCopy', file)}
                                    fieldName="ibanCopy"
                                    onView={typeof candidateForm.ibanCopy === 'string' ? () => handleViewDocument('iban') : undefined}
                                />
                                <FileUploader
                                    label="UID Copy"
                                    value={candidateForm.uidCopy || ''}
                                    onChange={(file) => onInputChange('uidCopy', file)}
                                    fieldName="uidCopy"
                                    onView={typeof candidateForm.uidCopy === 'string' ? () => handleViewDocument('uid') : undefined}
                                />
                                <FileUploader
                                    label="Labour Card Copy"
                                    value={candidateForm.labourCardCopy || ''}
                                    onChange={(file) => onInputChange('labourCardCopy', file)}
                                    fieldName="labourCardCopy"
                                    onView={typeof candidateForm.labourCardCopy === 'string' ? () => handleViewDocument('labourCard') : undefined}
                                />
                                <FileUploader
                                    label="Emirates ID Copy"
                                    value={candidateForm.emiratesIdCopy || ''}
                                    onChange={(file) => onInputChange('emiratesIdCopy', file)}
                                    fieldName="emiratesIdCopy"
                                    onView={typeof candidateForm.emiratesIdCopy === 'string' ? () => handleViewDocument('emiratesId') : undefined}
                                />
                                <FileUploader
                                    label="Visa Copy"
                                    value={candidateForm.visaCopy || ''}
                                    onChange={(file) => onInputChange('visaCopy', file)}
                                    fieldName="visaCopy"
                                    onView={typeof candidateForm.visaCopy === 'string' ? () => handleViewDocument('visa') : undefined}
                                />
                                <FileUploader
                                    label="Passport Copy"
                                    value={candidateForm.passportCopy || ''}
                                    onChange={(file) => onInputChange('passportCopy', file)}
                                    fieldName="passportCopy"
                                    onView={typeof candidateForm.passportCopy === 'string' ? () => handleViewDocument('passport') : undefined}
                                />
                                <FileUploader
                                    label="Driving License Copy"
                                    value={candidateForm.drivingLicenseCopy || ''}
                                    onChange={(file) => onInputChange('drivingLicenseCopy', file)}
                                    fieldName="drivingLicenseCopy"
                                    onView={typeof candidateForm.drivingLicenseCopy === 'string' ? () => handleViewDocument('drivingLicense') : undefined}
                                />
                                <FileUploader
                                    label="Iqama Copy"
                                    value={candidateForm.iqamaCopy || ''}
                                    onChange={(file) => onInputChange('iqamaCopy', file)}
                                    fieldName="iqamaCopy"
                                    onView={typeof candidateForm.iqamaCopy === 'string' ? () => handleViewDocument('iqama') : undefined}
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold">Employment Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Combobox
                                label="Role"
                                value={candidateForm.designationId || ''}
                                onChange={(val) => onInputChange('designationId', val)}
                                placeholder="Type to search role..."
                                options={designations.map(desig => ({
                                    id: desig.id || desig._id,
                                    label: desig.designationName || desig.name
                                }))}
                            />

                            <Combobox
                                label="Department"
                                value={candidateForm.departmentId || ''}
                                onChange={(val) => onInputChange('departmentId', val)}
                                placeholder="Type to search department..."
                                options={departments.map(dept => ({
                                    id: dept.id || dept._id,
                                    label: dept.departmentName || dept.name
                                }))}
                            />

                            <Combobox
                                label="Location"
                                value={candidateForm.locationId || ''}
                                onChange={(val) => {
                                    onInputChange('locationId', val);
                                    onInputChange('siteId', '');
                                    onInputChange('buildingId', '');
                                }}
                                placeholder="Type to search location..."
                                options={locations.map(loc => ({
                                    id: loc.id || loc._id,
                                    label: loc.locationName || loc.name
                                }))}
                            />

                            <Combobox
                                label="Site"
                                value={candidateForm.siteId || ''}
                                onChange={(val) => {
                                    onInputChange('siteId', val);
                                    onInputChange('buildingId', '');
                                }}
                                placeholder={candidateForm.locationId ? "Select Site" : "Select Location first"}
                                disabled={!candidateForm.locationId}
                                options={(locations.find(l => (l.id === candidateForm.locationId || l._id === candidateForm.locationId))?.sites || []).map((s: any) => ({
                                    id: s.id || s._id || s.name,
                                    label: s.name || s.siteName
                                }))}
                            />

                            <Combobox
                                label="Building / Area"
                                value={candidateForm.buildingId || ''}
                                onChange={(val) => onInputChange('buildingId', val)}
                                placeholder={candidateForm.siteId ? "Select Building" : "Select Site first"}
                                disabled={!candidateForm.siteId}
                                options={(
                                    (locations.find(l => (l.id === candidateForm.locationId || l._id === candidateForm.locationId))?.sites || [])
                                        .find((s: any) => (s.id === candidateForm.siteId || s._id === candidateForm.siteId || s.name === candidateForm.siteId))
                                        ?.buildings || []
                                ).map((b: any) => ({
                                    id: b.id || b._id || b.name,
                                    label: b.name || b.buildingName
                                }))}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Team Position</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Lead, Senior, Associate"
                                    value={candidateForm.teamPosition || ''}
                                    onChange={(e) => onInputChange('teamPosition', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <Combobox
                                label="Reporting To"
                                value={candidateForm.reportingToId || ''}
                                onChange={(val) => onInputChange('reportingToId', val)}
                                placeholder={reportingManagers.length === 0 ? "No employees yet" : "Type to search manager..."}
                                disabled={reportingManagers.length === 0}
                                options={reportingManagers.map(mgr => ({
                                    id: mgr.id || mgr._id,
                                    label: mgr.fullName || `${mgr.firstName} ${mgr.lastName}`
                                }))}
                            />

                            <Combobox
                                label="Employee Type"
                                value={candidateForm.empType || ''}
                                onChange={(val) => onInputChange('empType', val)}
                                placeholder="Select type..."
                                options={[
                                    { id: 'temporary', label: 'Temporary' },
                                    { id: 'permanent', label: 'Permanent' },
                                ]}
                            />

                            <Combobox
                                label="Employee Status"
                                value={candidateForm.employeeStatus || ''}
                                onChange={(val) => onInputChange('employeeStatus', val)}
                                placeholder="Select status..."
                                options={[
                                    { id: 'active', label: 'active' },
                                    { id: 'Inactive', label: 'Inactive' }
                                ]}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Joining
                                </label>
                                <input
                                    type="date"
                                    value={candidateForm.dateOfJoining || ''}
                                    onChange={(e) => onInputChange('dateOfJoining', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <Combobox
                                label="Shift"
                                value={candidateForm.shiftType || ''}
                                onChange={(val) => onInputChange('shiftType', val)}
                                placeholder="Select shift..."
                                options={shifts.length > 0 ? shifts.map(shift => ({
                                    id: shift.id || shift._id,
                                    label: shift.shiftName || shift.name
                                })) : [
                                    { id: 'morning', label: 'Morning' },
                                    { id: 'evening', label: 'Evening' },
                                    { id: 'night', label: 'Night' }
                                ]}
                            />

                            <Combobox
                                label="Contract Type"
                                value={candidateForm.contractType || ''}
                                onChange={(val) => onInputChange('contractType', val)}
                                placeholder="Select contract type..."
                                options={[
                                    { id: 'fixed-term', label: 'Fixed Term' },
                                    { id: 'consultant', label: 'Consultant' },
                                    { id: 'freelance', label: 'Freelance' },
                                    { id: 'internship', label: 'Internship' },
                                ]}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contract Start Date
                                </label>
                                <input
                                    type="date"
                                    value={candidateForm.contractStartDate || ''}
                                    onChange={(e) => onInputChange('contractStartDate', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contract End Date
                                </label>
                                <input
                                    type="date"
                                    value={candidateForm.contractEndDate || ''}
                                    onChange={(e) => onInputChange('contractEndDate', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <Combobox
                                label="Time Zone"
                                value={candidateForm.timeZone || ''}
                                onChange={(val) => onInputChange('timeZone', val)}
                                placeholder="Select timezone..."
                                options={[
                                    { id: 'Asia/Kolkata', label: 'IST (Asia/Kolkata)' },
                                    { id: 'America/New_York', label: 'EST (America/New_York)' },
                                    { id: 'America/Los_Angeles', label: 'PST (America/Los_Angeles)' },
                                    { id: 'Europe/London', label: 'GMT (Europe/London)' },
                                    { id: 'UTC', label: 'UTC' }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Address Information Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold">Address Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Present Address */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Present Address</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                                        <input
                                            type="text"
                                            value={candidateForm.presentAddress?.addressLine1 || ''}
                                            onChange={(e) => onInputChange('presentAddress', { ...candidateForm.presentAddress, addressLine1: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                                        <input
                                            type="text"
                                            value={candidateForm.presentAddress?.addressLine2 || ''}
                                            onChange={(e) => onInputChange('presentAddress', { ...candidateForm.presentAddress, addressLine2: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                value={candidateForm.presentAddress?.city || ''}
                                                onChange={(e) => onInputChange('presentAddress', { ...candidateForm.presentAddress, city: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                            <input
                                                type="text"
                                                value={candidateForm.presentAddress?.state || ''}
                                                onChange={(e) => onInputChange('presentAddress', { ...candidateForm.presentAddress, state: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                            <input
                                                type="text"
                                                value={candidateForm.presentAddress?.country || ''}
                                                onChange={(e) => onInputChange('presentAddress', { ...candidateForm.presentAddress, country: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
                                            <input
                                                type="text"
                                                value={candidateForm.presentAddress?.pinCode || ''}
                                                onChange={(e) => onInputChange('presentAddress', { ...candidateForm.presentAddress, pinCode: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Permanent Address */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Permanent Address</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                                        <input
                                            type="text"
                                            value={candidateForm.permanentAddress?.addressLine1 || ''}
                                            onChange={(e) => onInputChange('permanentAddress', { ...candidateForm.permanentAddress, addressLine1: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                                        <input
                                            type="text"
                                            value={candidateForm.permanentAddress?.addressLine2 || ''}
                                            onChange={(e) => onInputChange('permanentAddress', { ...candidateForm.permanentAddress, addressLine2: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                value={candidateForm.permanentAddress?.city || ''}
                                                onChange={(e) => onInputChange('permanentAddress', { ...candidateForm.permanentAddress, city: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                            <input
                                                type="text"
                                                value={candidateForm.permanentAddress?.state || ''}
                                                onChange={(e) => onInputChange('permanentAddress', { ...candidateForm.permanentAddress, state: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                            <input
                                                type="text"
                                                value={candidateForm.permanentAddress?.country || ''}
                                                onChange={(e) => onInputChange('permanentAddress', { ...candidateForm.permanentAddress, country: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
                                            <input
                                                type="text"
                                                value={candidateForm.permanentAddress?.pinCode || ''}
                                                onChange={(e) => onInputChange('permanentAddress', { ...candidateForm.permanentAddress, pinCode: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold">Emergency Contact</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter name"
                                    value={candidateForm.emergencyContact?.contactName || ''}
                                    onChange={(e) => onInputChange('emergencyContact', { ...candidateForm.emergencyContact, contactName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Spouse, Parent"
                                    value={candidateForm.emergencyContact?.relation || ''}
                                    onChange={(e) => onInputChange('emergencyContact', { ...candidateForm.emergencyContact, relation: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                                <input
                                    type="tel"
                                    placeholder="Enter phone number"
                                    value={candidateForm.emergencyContact?.contactNumber || ''}
                                    onChange={(e) => onInputChange('emergencyContact', { ...candidateForm.emergencyContact, contactNumber: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Education Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold">Education</h2>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddEducation}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                            >
                                <Plus className="w-4 h-4" />
                                Add Education
                            </button>
                        </div>

                        <div className="space-y-4">
                            {candidateForm.education?.map((edu: any, index: number) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveEducation(index)}
                                        className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Institute Name</label>
                                            <input
                                                type="text"
                                                value={edu.instituteName || ''}
                                                onChange={(e) => handleEducationChange(index, 'instituteName', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                                            <input
                                                type="text"
                                                value={edu.degree || ''}
                                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                                            <input
                                                type="text"
                                                value={edu.fieldOfStudy || ''}
                                                onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                                            <input
                                                type="text"
                                                value={edu.startYear || ''}
                                                onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                                            <input
                                                type="text"
                                                value={edu.endYear || ''}
                                                onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!candidateForm.education || candidateForm.education.length === 0) && (
                                <div className="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-lg">
                                    No education records added.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Work Experience Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold">Work Experience</h2>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddExperience}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                            >
                                <Plus className="w-4 h-4" />
                                Add Experience
                            </button>
                        </div>

                        <div className="space-y-4">
                            {candidateForm.experience?.map((exp: any, index: number) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExperience(index)}
                                        className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                            <input
                                                type="text"
                                                value={exp.companyName || ''}
                                                onChange={(e) => handleExperienceChange(index, 'companyName', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                            <input
                                                type="text"
                                                value={exp.jobTitle || ''}
                                                onChange={(e) => handleExperienceChange(index, 'jobTitle', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                            <input
                                                type="date"
                                                value={exp.fromDate ? new Date(exp.fromDate).toISOString().split('T')[0] : ''}
                                                onChange={(e) => handleExperienceChange(index, 'fromDate', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                            <input
                                                type="date"
                                                disabled={exp.currentlyWorking}
                                                value={exp.toDate ? new Date(exp.toDate).toISOString().split('T')[0] : ''}
                                                onChange={(e) => handleExperienceChange(index, 'toDate', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200"
                                            />
                                            <div className="mt-2 flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={exp.currentlyWorking || false}
                                                    onChange={(e) => handleExperienceChange(index, 'currentlyWorking', e.target.checked)}
                                                    className="rounded border-gray-300"
                                                />
                                                <span className="text-xs text-gray-500">Currently working here</span>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                                            <textarea
                                                value={exp.jobDescription || ''}
                                                onChange={(e) => handleExperienceChange(index, 'jobDescription', e.target.value)}
                                                rows={2}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!candidateForm.experience || candidateForm.experience.length === 0) && (
                                <div className="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-lg">
                                    No experience records added.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Compensation & Benefits Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold">Compensation & Benefits</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Basic Salary
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Enter basic salary"
                                        value={candidateForm.basicSalary || ''}
                                        onChange={(e) => onInputChange('basicSalary', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Allowances Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Allowances
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddAllowance}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add More
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {Array.isArray(candidateForm.accommodationAllowances) && candidateForm.accommodationAllowances.map((allowance, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg relative">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                                <Combobox
                                                    label=""
                                                    value={allowance.type}
                                                    onChange={(val) => handleAllowanceChange(index, 'type', val)}
                                                    placeholder="Type to search allowance..."
                                                    options={getAvailableAllowanceTypes(index)}
                                                />

                                                <div>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            placeholder="Percentage"
                                                            value={allowance.percentage}
                                                            onChange={(e) => handleAllowanceChange(index, 'percentage', e.target.value)}
                                                            className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Added to salary
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAllowance(index)}
                                                className="absolute top-2 right-2 sm:static p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {(!Array.isArray(candidateForm.accommodationAllowances) || candidateForm.accommodationAllowances.length === 0) && (
                                        <div className="text-center py-8 text-gray-400 text-sm italic">
                                            No allowances added. Click "Add More" to add one.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Insurance Section */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Insurance
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddInsurance}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add More
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {Array.isArray(candidateForm.insurances) && candidateForm.insurances.map((insurance, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg relative font-sans">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                                <Combobox
                                                    label=""
                                                    value={insurance.type}
                                                    onChange={(val) => handleInsuranceChange(index, 'type', val)}
                                                    placeholder="Type to search insurance..."
                                                    options={getAvailableInsuranceTypes(index)}
                                                />

                                                <div>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            placeholder="Deduction Percentage"
                                                            value={insurance.percentage}
                                                            onChange={(e) => handleInsuranceChange(index, 'percentage', e.target.value)}
                                                            className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Reduced from salary monthly
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveInsurance(index)}
                                                className="absolute top-2 right-2 sm:static p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {(!Array.isArray(candidateForm.insurances) || candidateForm.insurances.length === 0) && (
                                        <div className="text-center py-8 text-gray-400 text-sm italic">
                                            No insurance added. Click "Add More" to add one.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Salary Summary */}
                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Salary Summary
                            </label>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-700">Basic Salary:</span>
                                    <span className="font-medium">₹{salaryBreakdown.basic.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                {salaryBreakdown.allowanceTotal > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-700">Allowances (+):</span>
                                        <span className="font-medium text-green-600">+₹{salaryBreakdown.allowanceTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                {salaryBreakdown.insuranceDeduction > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-700">Insurance Deductions (-):</span>
                                        <span className="font-medium text-red-600">-₹{salaryBreakdown.insuranceDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-bold pt-2 border-t border-blue-300">
                                    <span className="text-gray-900">Total Salary:</span>
                                    <span className="text-blue-700">₹{salaryBreakdown.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bank Details Section */}
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold">Employee Bank Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bank Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter bank name"
                                value={candidateForm.bankDetails?.bankName || ''}
                                onChange={(e) => handleBankDetailsChange('bankName', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Branch Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter branch name"
                                value={candidateForm.bankDetails?.branchName || ''}
                                onChange={(e) => handleBankDetailsChange('branchName', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Number
                            </label>
                            <input
                                type="text"
                                placeholder="Enter account number"
                                value={candidateForm.bankDetails?.accountNumber || ''}
                                onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Holder Name <span className="text-gray-500 font-normal">(same as bank passbook)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter account holder name"
                                value={candidateForm.bankDetails?.accountHolderName || ''}
                                onChange={(e) => handleBankDetailsChange('accountHolderName', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                IFSC Code
                            </label>
                            <input
                                type="text"
                                placeholder="Enter IFSC code"
                                value={candidateForm.bankDetails?.ifscCode || ''}
                                onChange={(e) => handleBankDetailsChange('ifscCode', e.target.value.toUpperCase())}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                maxLength={11}
                            />
                        </div>

                    </div>
                </div>

                <button
                    onClick={async () => {
                        try {
                            // Call the parent's onAddCandidate handler
                            const result = onAddCandidate() as any;
                            // If it returns a promise, wait for it
                            if (result && typeof result.then === 'function') {
                                const response: any = await result;
                                // Capture generated ID if available
                                if (response && response.employeeId) {
                                    setGeneratedId(response.employeeId);
                                }
                            }
                            // Show success dialog after successful submission (only for new candidates)
                            if (!isEditing) {
                                setShowSuccessDialog(true);
                            }
                            // Call optional onSuccess callback
                            if (onSuccess) {
                                onSuccess();
                            }
                        } catch (error) {
                            // Error handling is done in parent component
                            console.error('Error adding candidate:', error);
                        }
                    }}
                    disabled={isLoading}
                    className={`mt-8 px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 flex items-center justify-center w-full sm:w-auto gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Employee' : 'Add Candidate')}
                </button>
            </div>

            {/* Success Dialog */}
            <SuccessDialog
                open={showSuccessDialog}
                onOpenChange={setShowSuccessDialog}
                title="Successfully Completed"
                message={`Candidate "${candidateForm.fullName || 'Employee'}" has been added successfully!${candidateForm.employeeNumber ? ` Assigned ID: ${candidateForm.employeeNumber}.` : ''} An onboarding invitation email has been sent.`}
                onClose={() => {
                    setShowSuccessDialog(false);
                    if (onComplete) onComplete();
                }}
            />
        </div>
    );
};

export default AddCandidateForm;
