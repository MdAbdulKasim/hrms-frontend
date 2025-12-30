'use client';
import React from 'react';
import { X, ChevronDown, Check, Plus, Trash2 } from 'lucide-react';
import { CandidateForm, AccommodationAllowance } from './types';

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

interface AddCandidateFormProps {
    candidateForm: CandidateForm;
    onInputChange: (field: keyof CandidateForm, value: any) => void;
    onAddCandidate: () => void;
    onCancel: () => void;
    departments: any[];
    designations: any[];
    locations: any[];
    reportingManagers: any[];
    shifts: any[];
    isLoading: boolean;
    isEditing?: boolean;
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
}) => {
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

    const insuranceOptions = [
        { id: 'health_basic', label: 'Health Insurance' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl md:text-2xl font-bold">{isEditing ? 'Edit Employee' : 'Add Candidate'}</h1>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-200 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow p-4 md:p-8 space-y-8">
                    {/* Personal Details Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold">Personal Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        </div>
                    </div>

                    {/* Employment Details Section */}
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
                                    { id: 'Active', label: 'Active' },
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
                                    {candidateForm.accommodationAllowances?.map((allowance, index) => (
                                        <div key={index} className="flex gap-3 items-center p-4 bg-gray-50 rounded-lg">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {(!candidateForm.accommodationAllowances || candidateForm.accommodationAllowances.length === 0) && (
                                        <div className="text-center py-8 text-gray-400 text-sm italic">
                                            No allowances added. Click "Add More" to add one.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Insurance Section */}
                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    Insurance
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                                    <Combobox
                                        label="Insurance Type"
                                        value={candidateForm.insuranceType || ''}
                                        onChange={(val) => onInputChange('insuranceType', val)}
                                        placeholder="Type to search insurance..."
                                        options={insuranceOptions}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Deduction Percentage
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                placeholder="Percentage"
                                                value={candidateForm.insurancePercentage || ''}
                                                onChange={(e) => onInputChange('insurancePercentage', e.target.value)}
                                                className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                disabled={!candidateForm.insuranceType}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Reduced from salary monthly
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onAddCandidate}
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
            </div >
        </div >
    );
};

export default AddCandidateForm;
