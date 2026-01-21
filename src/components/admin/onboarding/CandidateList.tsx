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
        <div className="h-full bg-white p-1 sm:p-4 md:p-8 flex flex-col">
            <style jsx>{`
                @media (max-width: 480px) {
                    .responsive-table {
                        font-size: 12px;
                    }
                    .responsive-text {
                        font-size: 11px;
                    }
                    .responsive-padding {
                        padding-left: 0.25rem;
                        padding-right: 0.25rem;
                    }
                    .responsive-button {
                        padding-left: 0.5rem;
                        padding-right: 0.5rem;
                        padding-top: 0.25rem;
                        padding-bottom: 0.25rem;
                    }
                    .responsive-header {
                        font-size: 10px;
                        padding-left: 0.25rem;
                        padding-right: 0.25rem;
                    }
                    .responsive-cell {
                        padding-left: 0.25rem;
                        padding-right: 0.25rem;
                        padding-top: 0.5rem;
                        padding-bottom: 0.5rem;
                    }
                    .responsive-input {
                        font-size: 12px;
                    }
                    .responsive-search {
                        font-size: 11px;
                    }
                    .responsive-gap {
                        gap: 0.25rem;
                    }
                }
                
                @media (max-width: 300px) {
                    .responsive-table {
                        font-size: 10px;
                    }
                    .responsive-text {
                        font-size: 9px;
                    }
                    .responsive-padding {
                        padding-left: 0.125rem;
                        padding-right: 0.125rem;
                    }
                    .responsive-header {
                        font-size: 8px;
                        padding-left: 0.125rem;
                        padding-right: 0.125rem;
                    }
                    .responsive-cell {
                        padding-left: 0.125rem;
                        padding-right: 0.125rem;
                        padding-top: 0.25rem;
                        padding-bottom: 0.25rem;
                    }
                    .responsive-input {
                        font-size: 10px;
                    }
                    .responsive-search {
                        font-size: 9px;
                    }
                    .responsive-icon {
                        width: 10px;
                        height: 10px;
                    }
                    .responsive-gap {
                        gap: 0.125rem;
                    }
                }
                
                @media (min-width: 300px) and (max-width: 640px) {
                    .responsive-select {
                        font-size: 12px;
                    }
                }
            `}</style>

            <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 sm:mb-6 gap-2 md:gap-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold responsive-text">Employee Onboarding</h1>
                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-1 sm:gap-3 responsive-gap">

                        <button
                            onClick={onExportCSV}
                            className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1 sm:gap-2 w-full sm:w-auto text-xs responsive-text responsive-button"
                        >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                            <span className="whitespace-nowrap">Export CSV</span>
                        </button>
                        <button
                            onClick={onBulkImportClick}
                            className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1 sm:gap-2 w-full sm:w-auto text-xs responsive-text responsive-button"
                        >
                            <Upload className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                            <span className="whitespace-nowrap">Bulk Import</span>
                        </button>
                        <button
                            onClick={onAddCandidateClick}
                            className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 sm:gap-2 w-full sm:w-auto text-xs responsive-text responsive-button"
                        >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                            <span className="whitespace-nowrap">Add Candidate</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg mb-2 sm:mb-6 w-fit">
                    <button
                        onClick={() => setStatusFilter('Active')}
                        className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md text-[9px] xs:text-[10px] sm:text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === 'Active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setStatusFilter('Inactive')}
                        className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md text-[9px] xs:text-[10px] sm:text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === 'Inactive' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                    >
                        Inactive
                    </button>
                    <button
                        onClick={() => setStatusFilter('All')}
                        className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md text-[9px] xs:text-[10px] sm:text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === 'All' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                    >
                        All
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow mb-2 sm:mb-6 p-2 sm:p-3 md:p-4">
                    <div className="flex flex-col md:flex-row gap-2 sm:gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 responsive-icon" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-6 sm:pl-8 md:pl-10 pr-2 sm:pr-3 md:pr-4 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 responsive-input responsive-search"
                            />
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 w-full md:w-auto">
                            <Filter className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-500 responsive-icon" />
                            <select
                                value={`${sortConfig.key}-${sortConfig.direction}`}
                                onChange={(e) => {
                                    const [key, direction] = e.target.value.split('-');
                                    setSortConfig({ key, direction: direction as 'asc' | 'desc' });
                                }}
                                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 flex-1 w-full md:w-auto responsive-select"
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
                    <div className="overflow-x-auto max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)] overflow-y-auto">
                        <table className="w-full whitespace-nowrap responsive-table">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                <tr>

                                    <th className="px-1 sm:px-2 md:px-6 py-2 sm:py-3 text-left text-[9px] xs:text-[10px] sm:text-xs font-medium text-black uppercase tracking-wider cursor-pointer hover:bg-gray-100 responsive-header" onClick={() => setSortConfig({ key: 'employeeNumber', direction: sortConfig.key === 'employeeNumber' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                            Emp ID
                                            {sortConfig.key === 'employeeNumber' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-2 h-2 sm:w-3 sm:h-3" /> : <ArrowDown className="w-2 h-2 sm:w-3 sm:h-3" />)}
                                        </div>
                                    </th>
                                    <th className="px-1 sm:px-2 md:px-6 py-2 sm:py-3 text-left text-[9px] xs:text-[10px] sm:text-xs font-medium text-black uppercase tracking-wider cursor-pointer hover:bg-gray-100 responsive-header" onClick={() => setSortConfig({ key: 'fullName', direction: sortConfig.key === 'fullName' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                            Full Name
                                            {sortConfig.key === 'fullName' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-2 h-2 sm:w-3 sm:h-3" /> : <ArrowDown className="w-2 h-2 sm:w-3 sm:h-3" />)}
                                        </div>
                                    </th>
                                    <th className="px-1 sm:px-2 md:px-6 py-2 sm:py-3 text-left text-[9px] xs:text-[10px] sm:text-xs font-medium text-black uppercase tracking-wider responsive-header">
                                        Email
                                    </th>
                                    <th className="px-1 sm:px-2 md:px-6 py-2 sm:py-3 text-left text-[9px] xs:text-[10px] sm:text-xs font-medium text-black uppercase tracking-wider responsive-header">
                                        Phone
                                    </th>
                                    <th className="px-1 sm:px-2 md:px-6 py-2 sm:py-3 text-left text-[9px] xs:text-[10px] sm:text-xs font-medium text-black uppercase tracking-wider responsive-header">
                                        Designation
                                    </th>
                                    <th className="px-1 sm:px-2 md:px-6 py-2 sm:py-3 text-left text-[9px] xs:text-[10px] sm:text-xs font-medium text-black uppercase tracking-wider responsive-header">
                                        Department
                                    </th>
                                    <th className="px-1 sm:px-2 md:px-6 py-2 sm:py-3 text-left text-[9px] xs:text-[10px] sm:text-xs font-medium text-black uppercase tracking-wider responsive-header">
                                        Location
                                    </th>
                                    <th className="px-1 sm:px-2 md:px-6 py-2 sm:py-3 text-left text-[9px] xs:text-[10px] sm:text-xs font-medium text-black uppercase tracking-wider responsive-header">
                                        DOJ
                                    </th>
                                    <th className="px-1 sm:px-2 md:px-6 py-2 sm:py-3 text-center text-[9px] xs:text-[10px] sm:text-xs font-medium text-black uppercase tracking-wider responsive-header">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentEmployees.length > 0 ? (
                                    currentEmployees.map((employee) => (
                                        <tr key={employee.id} className="hover:bg-gray-50">

                                            <td className="px-1 sm:px-2 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium responsive-cell">{employee.employeeNumber}</td>
                                            <td className="px-1 sm:px-2 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 responsive-cell">{employee.fullName || `${employee.firstName} ${employee.lastName}`}</td>
                                            <td className="px-1 sm:px-2 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 responsive-cell truncate max-w-[80px] sm:max-w-none">{employee.officialEmail || employee.emailId}</td>
                                            <td className="px-1 sm:px-2 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 responsive-cell">{employee.phoneNumber || 'N/A'}</td>
                                            <td className="px-1 sm:px-2 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 responsive-cell truncate max-w-[60px] sm:max-w-none">{employee.designation || 'N/A'}</td>
                                            <td className="px-1 sm:px-2 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 responsive-cell truncate max-w-[60px] sm:max-w-none">{employee.department}</td>
                                            <td className="px-1 sm:px-2 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 responsive-cell truncate max-w-[60px] sm:max-w-none">{employee.location || 'N/A'}</td>
                                            <td className="px-1 sm:px-2 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 responsive-cell truncate max-w-[70px] sm:max-w-none">{employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-1 sm:px-2 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 responsive-cell">
                                                <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3">
                                                    <button
                                                        onClick={() => onView(employee.id)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                                                    </button>
                                                    <button
                                                        onClick={() => onEdit(employee.id)}
                                                        className="text-amber-600 hover:text-amber-800"
                                                        title="Edit Details"
                                                    >
                                                        <Pencil className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                                                    </button>
                                                    {/* <button
                                                        onClick={() => onDelete(employee.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Delete Candidate"
                                                    >
                                                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 responsive-icon" />
                                                    </button> */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="px-2 sm:px-4 md:px-6 py-6 sm:py-8 text-center text-gray-500 italic text-sm responsive-text">
                                            No candidates found matching your criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {employees.length > 0 && (
                        <div className="px-1 sm:px-2 md:px-6 py-2 sm:py-3 md:py-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-4">
                            <div className="text-xs sm:text-sm text-gray-500 responsive-text">
                                Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{employees.length}</span> entries
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-0.5 sm:p-1 px-2 sm:px-3 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-medium responsive-text"
                                >
                                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Prev
                                </button>

                                <div className="flex items-center gap-0.5 sm:gap-1">
                                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (totalPages > 3) {
                                            if (currentPage > 2) {
                                                if (currentPage >= totalPages - 1) {
                                                    pageNum = totalPages - 2 + i;
                                                } else {
                                                    pageNum = currentPage - 1 + i;
                                                }
                                            }
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`min-w-[24px] sm:min-w-[32px] h-6 sm:h-8 rounded border text-xs sm:text-sm flex items-center justify-center font-medium transition-colors
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
                                    className="p-0.5 sm:p-1 px-2 sm:px-3 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-medium responsive-text"
                                >
                                    Next
                                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
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