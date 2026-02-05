"use client";

import { useState } from "react";
import { ArrowLeft, Save, Upload, Calendar as CalendarIcon, File as FileIcon, X } from "lucide-react";
import ContractorService from "@/lib/contractorService";

interface CreateContractorProps {
    onBack: () => void;
}

export default function CreateContractor({ onBack }: CreateContractorProps) {
    const [formData, setFormData] = useState({
        contractorName: "",
        startDate: "",
        endDate: "",
    });
    const [documents, setDocuments] = useState<{ type: string; file: File | null }[]>([
        { type: "Contract Agreement", file: null }
    ]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (file: File | null) => {
        const newDocs = [...documents];
        newDocs[0].file = file;
        setDocuments(newDocs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('contractorName', formData.contractorName);
            formDataToSend.append('startDate', formData.startDate);
            formDataToSend.append('endDate', formData.endDate);

            // Append file if exists
            const file = documents[0].file;
            if (file) {
                formDataToSend.append('contractDocument', file);
            }

            await ContractorService.createContractor(formDataToSend);

            onBack();
        } catch (error) {
            console.error("Failed to create contractor", error);
            alert("Failed to create contractor. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Add New Contractor</h1>
                    <p className="text-slate-500 text-sm">Create a new contractor profile and upload agreements.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Details */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <h2 className="font-semibold text-lg text-slate-800">Basic Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Contractor Name (Person or Company)</label>
                            <input
                                type="text"
                                required
                                value={formData.contractorName}
                                onChange={(e) => setFormData({ ...formData, contractorName: e.target.value })}
                                placeholder="Enter contractor name"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                            <input
                                type="date"
                                required
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <h2 className="font-semibold text-lg text-slate-800">Contract Document</h2>
                    <div className="max-w-md">
                        {documents[0].file ? (
                            <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                                        <FileIcon className="w-6 h-6" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-semibold text-slate-700 truncate">{documents[0].file.name}</p>
                                        <p className="text-xs text-slate-500">{documents[0].type}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleFileChange(null)}
                                    className="p-2 text-slate-400 hover:text-red-500 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-8 hover:bg-slate-50 transition-all flex flex-col items-center gap-3 group">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-all">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-slate-700">Upload Contract Document</p>
                                    <p className="text-xs text-slate-400 mt-1">PDF or Images supported</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,image/*"
                                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Create Contractor'}
                        <Save className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
