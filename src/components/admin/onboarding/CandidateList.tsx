'use client';
import React from 'react';
import { Upload, Plus, Eye, EyeOff } from 'lucide-react';
import { Employee } from './types';

interface CandidateListProps {
    employees: Employee[];
    selectedIds: number[];
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectOne: (id: number) => void;
    showPAN: { [key: number]: boolean };
    setShowPAN: (val: { [key: number]: boolean }) => void;
    showAadhaar: { [key: number]: boolean };
    setShowAadhaar: (val: { [key: number]: boolean }) => void;
    showUAN: { [key: number]: boolean };
    setShowUAN: (val: { [key: number]: boolean }) => void;
    onAddCandidateClick: () => void;
    onBulkImportClick: () => void;
}

const CandidateList: React.FC<CandidateListProps> = ({
    employees,
    selectedIds,
    onSelectAll,
    onSelectOne,
    showPAN,
    setShowPAN,
    showAadhaar,
    setShowAadhaar,
    showUAN,
    setShowUAN,
    onAddCandidateClick,
    onBulkImportClick,
}) => {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
                    <h1 className="text-2xl font-bold">Employee Onboarding</h1>
                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                        <button
                            onClick={onBulkImportClick}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <Upload className="w-4 h-4" />
                            Bulk Import
                        </button>
                        <button
                            onClick={onAddCandidateClick}
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
                                        <input
                                            type="checkbox"
                                            className="rounded"
                                            checked={employees.length > 0 && selectedIds.length === employees.length}
                                            onChange={onSelectAll}
                                        />
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
                                            <input
                                                type="checkbox"
                                                className="rounded"
                                                checked={selectedIds.includes(employee.id)}
                                                onChange={() => onSelectOne(employee.id)}
                                            />
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
};

export default CandidateList;
