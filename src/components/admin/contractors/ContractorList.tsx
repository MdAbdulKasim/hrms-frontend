"use client";

import { useState, useEffect } from "react";
import { Plus, Search, FileText, MoreVertical, AlertCircle, Calendar, Eye, Edit } from "lucide-react";
import ContractorService, { Contractor } from "@/lib/contractorService";
import { format } from "date-fns";
import CreateContractor from "./CreateContractor";
import ViewContractor from "./ViewContractor";
import EditContractor from "./EditContractor";

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export default function ContractorList() {
    const [contractors, setContractors] = useState<Contractor[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<ViewMode>('list');
    const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchContractors = async () => {
        try {
            setLoading(true);
            const data = await ContractorService.getAllContractors();
            setContractors(data);
        } catch (error) {
            console.error("Failed to fetch contractors", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContractors();
    }, []);

    const handleView = (contractor: Contractor) => {
        setSelectedContractor(contractor);
        setView('view');
    };

    const handleEdit = (contractor: Contractor) => {
        setSelectedContractor(contractor);
        setView('edit');
    };

    const handleBack = () => {
        setView('list');
        setSelectedContractor(null);
        fetchContractors();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'expired': return 'bg-red-100 text-red-700 border-red-200';
            case 'terminated': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'extended': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const filteredContractors = contractors.filter(c =>
        c.contractorName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === 'create') {
        return <CreateContractor onBack={handleBack} />;
    }

    if (view === 'view' && selectedContractor) {
        return <ViewContractor contractor={selectedContractor} onBack={handleBack} />;
    }

    if (view === 'edit' && selectedContractor) {
        return <EditContractor contractor={selectedContractor} onBack={handleBack} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Contractors</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage external contractors and their agreements</p>
                </div>
                <button
                    onClick={() => setView('create')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Contractor
                </button>
            </div>

            {/* Stats Cards - Optional for now, but nice for UI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Total Contractors</h3>
                            <p className="text-2xl font-bold text-slate-900">{contractors.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Active</h3>
                            <p className="text-2xl font-bold text-slate-900">{contractors.filter(c => c.status === 'active').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Expiring Soon</h3>
                            <p className="text-2xl font-bold text-slate-900">0</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Search & Filter */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search contractors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contractor</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Start Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">End Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading contractors...</td></tr>
                            ) : filteredContractors.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No contractors found.</td></tr>
                            ) : (
                                filteredContractors.map((contractor) => (
                                    <tr key={contractor.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                    {contractor.contractorName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{contractor.contractorName}</p>
                                                    
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-600">
                                                {contractor.startDate ? format(new Date(contractor.startDate), 'MMM dd, yyyy') : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-600">
                                                {contractor.endDate ? format(new Date(contractor.endDate), 'MMM dd, yyyy') : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(contractor.status || 'active')}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-60`} />
                                                {(contractor.status || 'Active').charAt(0).toUpperCase() + (contractor.status || 'Active').slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right ">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(contractor)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(contractor)}
                                                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                    title="Edit Contractor"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
