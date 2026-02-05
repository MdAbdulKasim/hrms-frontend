import React from 'react';
import { Users, Briefcase, Globe, MoreHorizontal } from 'lucide-react';
import { CandidateForm, Employee } from './types';

interface CandidateSourceProps {
    candidateForm: CandidateForm;
    onInputChange: (field: keyof CandidateForm, value: any) => void;
    employees?: Employee[];
}

const sourceOptions = [
    { id: 'Employee Reference', label: 'Employee Reference', icon: Users },
    { id: 'Walk-in', label: 'Walk-in', icon: Briefcase },
    { id: 'Website', label: 'Company Website', icon: Globe },
    { id: 'Job Portal', label: 'Job Portal', icon: Briefcase },
    { id: 'Other', label: 'Other', icon: MoreHorizontal },
];

const CandidateSource: React.FC<CandidateSourceProps> = ({
    candidateForm,
    onInputChange,
    employees = [],
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">Candidate Source</h2>
                    <p className="text-sm text-gray-500 mt-0.5">How did the candidate hear about us?</p>
                </div>
            </div>

            <div className="mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {sourceOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = candidateForm.candidateSource === option.id;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                    onInputChange('candidateSource', option.id);
                                    if (candidateForm.candidateSource !== option.id) {
                                        onInputChange('referredById', '');
                                        onInputChange('referenceAmount', '');
                                        onInputChange('sourceSummary', '');
                                    }
                                }}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 gap-2 ${isSelected
                                    ? 'border-purple-500 bg-purple-50 text-purple-600 shadow-sm'
                                    : 'border-gray-200 bg-white text-gray-500 hover:border-purple-200 hover:bg-purple-50/30'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                                <span className="text-xs font-medium text-center leading-tight">{option.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Conditional Fields based on Source */}
                {candidateForm.candidateSource && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Employee Reference */}
                        {candidateForm.candidateSource === 'Employee Reference' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Referred By
                                    </label>
                                    <select
                                        value={candidateForm.referredById || ''}
                                        onChange={(e) => onInputChange('referredById', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                                    >
                                        <option value="">Select employee</option>
                                        {employees.map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reference Amount (One-time Bonus)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={candidateForm.referenceAmount || ''}
                                            onChange={(e) => onInputChange('referenceAmount', e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-8 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1"> credited once on the contract start month.</p>
                                </div>
                            </div>
                        )}

                        {/* Job Portal */}
                        {candidateForm.candidateSource === 'Job Portal' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Job Portal
                                </label>
                                <select
                                    value={candidateForm.sourceSummary || ''}
                                    onChange={(e) => onInputChange('sourceSummary', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                                >
                                    <option value="">Select Portal</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="Naukri">Naukri</option>
                                    <option value="Indeed">Indeed</option>
                                    <option value="Glassdoor">Glassdoor</option>
                                    <option value="Monster">Monster</option>
                                    <option value="Hirist">Hirist</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        )}

                        {/* Walk-in / Website / Other */}
                        {['Walk-in', 'Website', 'Other'].includes(candidateForm.candidateSource) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {candidateForm.candidateSource === 'Other' ? 'Please Specify' : 'Source Summary / Details'}
                                </label>
                                <textarea
                                    value={candidateForm.sourceSummary || ''}
                                    onChange={(e) => onInputChange('sourceSummary', e.target.value)}
                                    placeholder={candidateForm.candidateSource === 'Website' ? "e.g. Applied via Careers page" : "Provide additional details..."}
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidateSource;
