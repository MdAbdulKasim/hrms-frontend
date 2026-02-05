"use client";

import { ArrowLeft, Calendar as CalendarIcon, File as FileIcon, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Contractor } from "@/lib/contractorService";

interface ViewContractorProps {
    contractor: Contractor;
    onBack: () => void;
}

export default function ViewContractor({ contractor, onBack }: ViewContractorProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'expired': return 'bg-red-100 text-red-700 border-red-200';
            case 'terminated': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'extended': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Contractor Details</h1>
                    <p className="text-slate-500 text-sm">Viewing profile: {contractor.contractorName}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-lg text-slate-800">Basic Information</h2>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(contractor.status || 'active')}`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-60`} />
                                {(contractor.status || 'Active').charAt(0).toUpperCase() + (contractor.status || 'Active').slice(1)}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Contractor Name</p>
                                <p className="text-slate-900 font-medium">{contractor.contractorName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                <p className="text-slate-900 font-medium capitalize">{contractor.status || 'Active'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3" /> Start Date
                                </p>
                                <p className="text-slate-900 font-medium">
                                    {contractor.startDate ? format(new Date(contractor.startDate), 'MMMM dd, yyyy') : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3" /> End Date
                                </p>
                                <p className="text-slate-900 font-medium">
                                    {contractor.endDate ? format(new Date(contractor.endDate), 'MMMM dd, yyyy') : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h2 className="font-semibold text-lg text-slate-800">Contract Documents</h2>
                        <div className="space-y-3">
                            {contractor.contractDocumentUrl ? (
                                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl group hover:border-blue-200 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <FileIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">Contract Agreement</p>
                                            <p className="text-xs text-slate-500">Document Uploaded</p>
                                        </div>
                                    </div>
                                    <a
                                        href={contractor.contractDocumentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <FileIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500 font-medium">No documents uploaded</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats/Info */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                        <h3 className="font-semibold mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-blue-100">
                                <span className="text-sm opacity-80">Days remaining</span>
                                <span className="font-bold">
                                    {contractor.endDate ? Math.max(0, Math.ceil((new Date(contractor.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))) : 0}
                                </span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full bg-opacity-80"
                                    style={{ width: '65%' }} // Placeholder progress
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">System Registered: {contractor.createdAt ? format(new Date(contractor.createdAt), 'MMM dd, yyyy') : 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
