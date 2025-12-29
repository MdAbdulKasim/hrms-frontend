'use client';
import React from 'react';
import { X, ChevronDown, Search, Check } from 'lucide-react';
import { CandidateForm } from './types';

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { id: string; label: string }[];
    placeholder: string;
    label: string;
    disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    value,
    onChange,
    options,
    placeholder,
    label,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.id === value);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 bg-white ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
            >
                <span className={`truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-sm p-1"
                            autoFocus
                        />
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={() => {
                                        onChange(option.id);
                                        setIsOpen(false);
                                        setSearchQuery('');
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
                </div>
            )}
        </div>
    );
};

interface AddCandidateFormProps {
    candidateForm: CandidateForm;
    onInputChange: (field: keyof CandidateForm, value: string) => void;
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
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl md:text-2xl font-bold">{isEditing ? 'Edit Employee' : 'Add Candidate'}</h1>
                    <button
                        onClick={onCancel}
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

                        <SearchableSelect
                            label="Role"
                            value={candidateForm.designationId || ''}
                            onChange={(val) => onInputChange('designationId', val)}
                            placeholder="Select Role"
                            options={designations.map(desig => ({
                                id: desig.id || desig._id,
                                label: desig.designationName || desig.name
                            }))}
                        />

                        <SearchableSelect
                            label="Reporting To"
                            value={candidateForm.reportingToId || ''}
                            onChange={(val) => onInputChange('reportingToId', val)}
                            placeholder={reportingManagers.length === 0 ? "No employees yet (First employee)" : "Select manager"}
                            disabled={reportingManagers.length === 0}
                            options={reportingManagers.map(mgr => ({
                                id: mgr.id || mgr._id,
                                label: mgr.fullName || `${mgr.firstName} ${mgr.lastName}`
                            }))}
                        />

                        <SearchableSelect
                            label="Department"
                            value={candidateForm.departmentId || ''}
                            onChange={(val) => onInputChange('departmentId', val)}
                            placeholder="Select department"
                            options={departments.map(dept => ({
                                id: dept.id || dept._id,
                                label: dept.departmentName || dept.name
                            }))}
                        />

                        <SearchableSelect
                            label="Employee Type"
                            value={candidateForm.empType || ''}
                            onChange={(val) => onInputChange('empType', val)}
                            placeholder="Select type"
                            options={[
                                { id: 'temporary', label: 'Temporary' },
                                { id: 'permanent', label: 'Permanent' },
                            ]}
                        />

                        <SearchableSelect
                            label="Employee Status"
                            value={candidateForm.employeeStatus || ''}
                            onChange={(val) => onInputChange('employeeStatus', val)}
                            placeholder="Select status"
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

                        <SearchableSelect
                            label="Shift"
                            value={candidateForm.shiftType || ''}
                            onChange={(val) => onInputChange('shiftType', val)}
                            placeholder="Select shift"
                            options={shifts.length > 0 ? shifts.map(shift => ({
                                id: shift.id || shift._id,
                                label: shift.shiftName || shift.name
                            })) : [
                                { id: 'morning', label: 'Morning' },
                                { id: 'evening', label: 'Evening' },
                                { id: 'night', label: 'Night' }
                            ]}
                        />

                        <SearchableSelect
                            label="Location"
                            value={candidateForm.locationId || ''}
                            onChange={(val) => onInputChange('locationId', val)}
                            placeholder="Select location"
                            options={locations.map(loc => ({
                                id: loc.id || loc._id,
                                label: loc.locationName || loc.name
                            }))}
                        />

                        <SearchableSelect
                            label="Time Zone"
                            value={candidateForm.timeZone || ''}
                            onChange={(val) => onInputChange('timeZone', val)}
                            placeholder="Select timezone"
                            options={[
                                { id: 'Asia/Kolkata', label: 'IST (Asia/Kolkata)' },
                                { id: 'America/New_York', label: 'EST (America/New_York)' },
                                { id: 'America/Los_Angeles', label: 'PST (America/Los_Angeles)' },
                                { id: 'Europe/London', label: 'GMT (Europe/London)' },
                                { id: 'UTC', label: 'UTC' }
                            ]}
                        />

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

                    <button
                        onClick={onAddCandidate}
                        disabled={isLoading}
                        className={`mt-8 px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 flex items-center justify-center w-full sm:w-auto gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
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
            </div>
        </div>
    );
};

export default AddCandidateForm;
