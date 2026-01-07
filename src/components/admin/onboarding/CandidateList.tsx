'use client';
import React from 'react';
import { Upload, Plus, Eye, EyeOff, Trash2, Search, Download, Filter, ArrowUp, ArrowDown, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { Employee } from './types';

interface CandidateListProps {
    employees: Employee[];
    selectedIds: string[];
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectOne: (id: string) => void;
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
    statusFilter: string;
    setStatusFilter: (val: string) => void;
}

const CandidateList: React.FC<CandidateListProps> = ({
    employees,
    selectedIds,
    onSelectAll,
    onSelectOne,
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
    statusFilter,
    setStatusFilter,
}) => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 5;

    // Reset to first page when search query or total items change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, employees.length]);

    // Calculate pagination values
    const totalPages = Math.ceil(employees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, employees.length);
    const currentEmployees = employees.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="h-full bg-white p-4 md:p-8 flex flex-col">
            <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
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

                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
                    <button
                        onClick={() => setStatusFilter('Active')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === 'Active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                    >
                        Active Employees
                    </button>
                    <button
                        onClick={() => setStatusFilter('Inactive')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === 'Inactive' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                    >
                        Inactive Employees
                    </button>
                    <button
                        onClick={() => setStatusFilter('All')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === 'All' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                    >
                        All Employees
                    </button>
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
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 flex-1 w-full md:w-auto"
                            >
                                <option value="fullName-asc">Name (A-Z)</option>
                                <option value="fullName-desc">Name (Z-A)</option>
                                <option value="department-asc">Department (A-Z)</option>
                                <option value="department-desc">Department (Z-A)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto max-h-[calc(100vh-250px)] overflow-y-auto">
                        <table className="w-full whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left bg-gray-50">
                                        <input
                                            type="checkbox"
                                            className="rounded"
                                            checked={employees.length > 0 && selectedIds.length === employees.length}
                                            onChange={onSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => setSortConfig({ key: 'employeeNumber', direction: sortConfig.key === 'employeeNumber' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                                        <div className="flex items-center gap-1">
                                            Emp ID
                                            {sortConfig.key === 'employeeNumber' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => setSortConfig({ key: 'fullName', direction: sortConfig.key === 'fullName' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                                        <div className="flex items-center gap-1">
                                            Full Name
                                            {sortConfig.key === 'fullName' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Phone No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Designation
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        DOJ
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentEmployees.length > 0 ? (
                                    currentEmployees.map((employee) => (
                                        <tr key={employee.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={selectedIds.includes(employee.id)}
                                                    onChange={() => onSelectOne(employee.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{employee.employeeNumber}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{employee.fullName || `${employee.firstName} ${employee.lastName}`}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{employee.officialEmail || employee.emailId}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{employee.phoneNumber || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{employee.designation || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{employee.department}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{employee.location || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A'}</td>
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
                                        <td colSpan={10} className="px-6 py-8 text-center text-gray-500 italic">
                                            No candidates found matching your criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {employees.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-500">
                                Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{employees.length}</span> entries
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-1 px-3 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>

                                <div className="hidden sm:flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (totalPages > 5) {
                                            if (currentPage > 3) {
                                                if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                            }
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`min-w-[32px] h-8 rounded border text-sm flex items-center justify-center font-medium transition-colors
                                                    ${currentPage === pageNum
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-1 px-3 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateList;
