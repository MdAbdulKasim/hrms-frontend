'use client';
import React from 'react';
import { X, ChevronDown } from 'lucide-react';
import { CandidateForm } from './types';

interface AddCandidateFormProps {
    candidateForm: CandidateForm;
    onInputChange: (field: keyof CandidateForm, value: string) => void;
    onAddCandidate: () => void;
    onCancel: () => void;
}

const AddCandidateForm: React.FC<AddCandidateFormProps> = ({
    candidateForm,
    onInputChange,
    onAddCandidate,
    onCancel,
}) => {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl md:text-2xl font-bold">Add Candidate</h1>
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
                                value={candidateForm.fullName}
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
                                value={candidateForm.email}
                                onChange={(e) => onInputChange('email', e.target.value)}
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
                                    onChange={(e) => onInputChange('role', e.target.value)}
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
                                    onChange={(e) => onInputChange('reportingTo', e.target.value)}
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
                                    onChange={(e) => onInputChange('department', e.target.value)}
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
                                Employee Type
                            </label>
                            <div className="relative">
                                <select
                                    value={candidateForm.employeeType}
                                    onChange={(e) => onInputChange('employeeType', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select type</option>
                                    <option value="Temporary">Temporary</option>
                                    <option value="Permanent">Permanent</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Employee Status
                            </label>
                            <div className="relative">
                                <select
                                    value={candidateForm.employeeStatus}
                                    onChange={(e) => onInputChange('employeeStatus', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
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
                                        onChange={(e) => onInputChange('teamPosition', e.target.value)}
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
                                        onChange={(e) => onInputChange('teamPosition', e.target.value)}
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
                                    onChange={(e) => onInputChange('shift', e.target.value)}
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
                                    onChange={(e) => onInputChange('location', e.target.value)}
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
                                    onChange={(e) => onInputChange('timeZone', e.target.value)}
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
                                onChange={(e) => onInputChange('mobileNumber', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={onAddCandidate}
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
};

export default AddCandidateForm;
