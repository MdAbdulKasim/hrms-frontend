import React, { useRef, useState, useEffect } from 'react';
import { Users, Briefcase, Globe, Linkedin, MoreHorizontal, FileText, Upload, X, File, HelpCircle } from 'lucide-react';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import { CandidateForm, Employee } from './types';
import { ContractorService, Contractor } from '@/lib/contractorService';
interface ContractDetailsProps {
    candidateForm: CandidateForm;
    onInputChange: (field: keyof CandidateForm, value: any) => void;
    employees?: Employee[]; // List of employees for "Referred By" dropdown
}

const ContractDetails: React.FC<ContractDetailsProps> = ({
    candidateForm,
    onInputChange,
    employees = [],
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [contractors, setContractors] = useState<Contractor[]>([]);
    const [loadingContractors, setLoadingContractors] = useState(false);

    useEffect(() => {
        const fetchContractors = async () => {
            try {
                setLoadingContractors(true);
                const data = await ContractorService.getAllContractors();
                setContractors(data);
            } catch (error) {
                console.error("Failed to fetch contractors for dropdown", error);
            } finally {
                setLoadingContractors(false);
            }
        };
        fetchContractors();
    }, []);

    // Handle contract documents as an array
    const contractDocuments: File[] = candidateForm.contractDocuments || [];

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files);
        const updatedFiles = [...contractDocuments, ...newFiles];
        onInputChange('contractDocuments', updatedFiles);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const removeFile = (index: number) => {
        const updatedFiles = contractDocuments.filter((_, i) => i !== index);
        onInputChange('contractDocuments', updatedFiles);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">Contract Details</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Employment contract information and terms</p>
                </div>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md uppercase tracking-wide">
                    Optional
                </span>
            </div>

            {/* Contract Information Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Contractor Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                        Contractor / Vendor
                        <div className="relative group">
                            <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                                Select the external vendor if this employee is sourced through a staffing agency.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                            </div>
                        </div>
                    </label>
                    <select
                        value={candidateForm.contractorId || ''}
                        onChange={(e) => onInputChange('contractorId', e.target.value)}
                        disabled={loadingContractors}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                    >
                        <option value="">{loadingContractors ? "Loading..." : "Select Contractor"}</option>
                        {contractors.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.contractorName}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={candidateForm.contractStartDate || ''}
                        onChange={(e) => onInputChange('contractStartDate', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                    </label>
                    <input
                        type="date"
                        value={candidateForm.contractEndDate || ''}
                        onChange={(e) => onInputChange('contractEndDate', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                </div>
            </div>

            {/* Contract Documents Section */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Contract Documents
                </label>

                {/* Upload Area */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30'
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                    />
                    <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                    <p className="text-sm text-gray-600">
                        Drag and drop files here, or <span className="text-blue-600 font-medium">browse</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Supported: Offer Letter, Agreement, NDA, etc. (PDF, DOC, Images)
                    </p>
                </div>

                {/* Uploaded Files Information */}
                {(contractDocuments.length > 0 || (candidateForm.contractDocumentUrls && candidateForm.contractDocumentUrls.length > 0)) && (
                    <div className="mt-6 space-y-4">
                        {/* Existing Documents from Backend */}
                        {candidateForm.contractDocumentUrls && candidateForm.contractDocumentUrls.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Existing Documents</h3>
                                {candidateForm.contractDocumentUrls.map((url, index) => (
                                    <div
                                        key={`existing-${index}`}
                                        className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100"
                                    >
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{`Contract Document ${index + 1}`}</p>
                                            <p className="text-xs text-gray-500">Previously uploaded</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                const orgId = getOrgId();
                                                const token = getAuthToken();
                                                const apiUrl = getApiUrl();

                                                if (!orgId || !token) return;

                                                try {
                                                    const response = await fetch(`${apiUrl}/org/${orgId}/documents/presigned?key=${url}`, {
                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                    });
                                                    const data = await response.json();
                                                    if (data.success && data.url) {
                                                        window.open(data.url, '_blank');
                                                    } else {
                                                        alert("Could not get document link");
                                                    }
                                                } catch (err) {
                                                    console.error("View Contract Doc Error", err);
                                                }
                                            }}
                                            className="px-3 py-1.5 text-xs bg-white text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors font-medium shadow-sm"
                                        >
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* New Files Pending Upload */}
                        {contractDocuments.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New Files to Upload</h3>
                                {contractDocuments.map((file, index) => (
                                    <div
                                        key={`new-${index}`}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <File className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile(index);
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContractDetails;
