'use client';
import React from 'react';
import { Upload, Plus, Eye, EyeOff, Trash2, Search, Download, Filter, ArrowUp, ArrowDown, Pencil } from 'lucide-react';
import { Employee } from './types';

interface CandidateListProps {
    employees: Employee[];
    selectedIds: string[];
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectOne: (id: string) => void;
    showPAN: { [key: string]: boolean };
    setShowPAN: (val: { [key: string]: boolean }) => void;
    showAadhaar: { [key: string]: boolean };
    setShowAadhaar: (val: { [key: string]: boolean }) => void;
    showUAN: { [key: string]: boolean };
    setShowUAN: (val: { [key: string]: boolean }) => void;
    onAddCandidateClick: () => void;
    onBulkImportClick: () => void;
    onDelete: (id: string) => void;
    onView: (id: string) => void;
    onEdit: (id: string) => void;
    onBulkDelete: () => void;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    onExportCSV: () => void;
    sortConfig: { key: string; direction: 'asc' | 'desc' };
    setSortConfig: (val: { key: string; direction: 'asc' | 'desc' }) => void;
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
    onDelete,
    onView,
    onEdit,
    onBulkDelete,
    searchQuery,
    setSearchQuery,
    onExportCSV,
    sortConfig,
    setSortConfig,
}) => {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
                    <h1 className="text-2xl font-bold">Employee Onboarding</h1>
                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                        {selectedIds.length > 0 && (
                            <button
                                onClick={onBulkDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Selected ({selectedIds.length})
                            </button>
                        )}
                        <button
                            onClick={onExportCSV}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
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

                <div className="bg-white rounded-lg shadow mb-6 p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search employees by name, email or department..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <select
                                value={`${sortConfig.key}-${sortConfig.direction}`}
                                onChange={(e) => {
                                    const [key, direction] = e.target.value.split('-');
                                    setSortConfig({ key, direction: direction as 'asc' | 'desc' });
                                }}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="fullName-asc">Name (A-Z)</option>
                                <option value="fullName-desc">Name (Z-A)</option>
                                <option value="onboardingStatus-asc">Status (A-Z)</option>
                                <option value="onboardingStatus-desc">Status (Z-A)</option>
                                <option value="department-asc">Department (A-Z)</option>
                                <option value="department-desc">Department (Z-A)</option>
                            </select>
                        </div>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => setSortConfig({ key: 'fullName', direction: sortConfig.key === 'fullName' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                                        <div className="flex items-center gap-1">
                                            Full Name
                                            {sortConfig.key === 'fullName' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                                        </div>
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
                                        Passport number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        UAN number
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.length > 0 ? (
                                    employees.map((employee) => (
                                        <tr key={employee.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={selectedIds.includes(employee.id)}
                                                    onChange={() => onSelectOne(employee.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{employee.fullName || `${employee.firstName} ${employee.lastName}`}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{employee.emailId}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{employee.officialEmail}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{employee.onboardingStatus}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{employee.department}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{employee.sourceOfHire}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    {showPAN[employee.id] ? employee.panCard : '**********'}
                                                    <button onClick={() => setShowPAN({ ...showPAN, [employee.id]: !showPAN[employee.id] })}>
                                                        {showPAN[employee.id] ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    {showAadhaar[employee.id] ? employee.aadhaar : '**********'}
                                                    <button onClick={() => setShowAadhaar({ ...showAadhaar, [employee.id]: !showAadhaar[employee.id] })}>
                                                        {showAadhaar[employee.id] ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    {showUAN[employee.id] ? employee.uan : '**********'}
                                                    <button onClick={() => setShowUAN({ ...showUAN, [employee.id]: !showUAN[employee.id] })}>
                                                        {showUAN[employee.id] ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => onView(employee.id)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onEdit(employee.id)}
                                                        className="text-amber-600 hover:text-amber-800"
                                                        title="Edit Details"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(employee.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Delete Candidate"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={11} className="px-6 py-8 text-center text-gray-500 italic">
                                            No candidates found matching your criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateList;
