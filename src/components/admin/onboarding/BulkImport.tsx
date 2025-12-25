'use client';
import React from 'react';
import { X, Download, FileText, FileSpreadsheet, Upload } from 'lucide-react';

interface BulkImportProps {
    importType: string;
    setImportType: (type: string) => void;
    uploadedFile: File | null;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDownloadTemplate: (format: 'csv' | 'excel') => void;
    onImport: () => void;
    onCancel: () => void;
}

const BulkImport: React.FC<BulkImportProps> = ({
    importType,
    setImportType,
    uploadedFile,
    onFileUpload,
    onDownloadTemplate,
    onImport,
    onCancel,
}) => {
    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl md:text-2xl font-bold">Bulk Import</h1>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-200 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Download className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg font-semibold">Download Template</h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            Download the template file and fill in employee details. Supported formats: CSV, Excel.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => onDownloadTemplate('csv')}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                Download CSV
                            </button>
                            <button
                                onClick={() => onDownloadTemplate('excel')}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                Download Excel
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Import Type</h2>
                        <div className="space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="importType"
                                    value="new"
                                    checked={importType === 'new'}
                                    onChange={(e) => setImportType(e.target.value)}
                                    className="mt-1 w-4 h-4 text-blue-600 shrink-0"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">New Employees</div>
                                    <div className="text-sm text-gray-600">
                                        Import new employees who will receive onboarding invitations
                                    </div>
                                </div>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="importType"
                                    value="existing"
                                    checked={importType === 'existing'}
                                    onChange={(e) => setImportType(e.target.value)}
                                    className="mt-1 w-4 h-4 text-blue-600 shrink-0"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">Existing Employees</div>
                                    <div className="text-sm text-gray-600">
                                        Update data for existing employees in the system
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Upload className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-semibold">Upload File</h2>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-12 text-center">
                        <input
                            type="file"
                            id="fileUpload"
                            accept=".csv,.xlsx,.xls"
                            onChange={onFileUpload}
                            className="hidden"
                        />
                        <label htmlFor="fileUpload" className="cursor-pointer">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-700 mb-2">Drop your file here or click to browse</p>
                            <p className="text-sm text-gray-500">Supports CSV and Excel files</p>
                            {uploadedFile && (
                                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 inline-block max-w-full">
                                    <p className="text-sm text-green-800 flex items-center gap-2 truncate">
                                        <FileText className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{uploadedFile.name}</span>
                                    </p>
                                </div>
                            )}
                        </label>
                    </div>

                    <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-2">
                        <div className="w-5 h-5 text-orange-600 mt-0.5 shrink-0">ⓘ</div>
                        <p className="text-sm text-orange-800">
                            New employees will receive onboarding invitations via email after import.
                        </p>
                    </div>

                    <button
                        onClick={onImport}
                        disabled={!uploadedFile}
                        className={`mt-6 w-full px-6 py-3 text-white rounded-lg flex items-center justify-center gap-2 ${uploadedFile ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Import Employees
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkImport;
