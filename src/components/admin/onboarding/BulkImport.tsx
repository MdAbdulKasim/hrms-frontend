'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Download, FileText, FileSpreadsheet, Upload, Check, AlertCircle } from 'lucide-react';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import { CandidateForm } from './types';

interface BulkImportProps {
    importType: string;
    setImportType: (type: string) => void;
    uploadedFile: File | null;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDownloadTemplate: (format: 'csv' | 'excel') => void;
    onImport: () => void;
    onCancel: () => void;
    departments: any[];
    designations: any[];
    locations: any[];
    reportingManagers: any[];
    shifts: any[];
    employees?: any[];
    onSuccess?: () => void;
}

interface ParsedEmployee {
    [key: string]: any;
}

const BulkImport: React.FC<BulkImportProps> = ({
    importType,
    setImportType,
    uploadedFile,
    onFileUpload,
    onDownloadTemplate,
    onCancel,
    departments,
    designations,
    locations,
    reportingManagers,
    shifts,
    employees = [],
    onSuccess,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedEmployee[]>([]);
    const [previewData, setPreviewData] = useState<ParsedEmployee[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [successCount, setSuccessCount] = useState(0);
    const [errorCount, setErrorCount] = useState(0);

    // Parse CSV file with proper handling of quoted fields
    const parseCSV = (text: string): ParsedEmployee[] => {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];

        // Helper function to parse CSV line with quoted fields
        const parseCSVLine = (line: string): string[] => {
            const result: string[] = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const nextChar = line[i + 1];

                if (char === '"') {
                    if (inQuotes && nextChar === '"') {
                        current += '"';
                        i++; // Skip next quote
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result;
        };

        // Parse header
        const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ''));
        
        // Parse data rows
        const data: ParsedEmployee[] = [];
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, ''));
            if (values.length > 0 && values.some(v => v)) {
                const row: ParsedEmployee = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                data.push(row);
            }
        }
        return data;
    };

    // Parse Excel file (basic CSV-like parsing for .xlsx/.xls)
    const parseExcel = async (file: File): Promise<ParsedEmployee[]> => {
        // For Excel files, we'll read as text and parse as CSV
        // In production, you might want to use a library like xlsx
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const data = parseCSV(text);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };

    // Handle file parsing when file is uploaded
    useEffect(() => {
        if (uploadedFile) {
            handleParseFile(uploadedFile);
        }
    }, [uploadedFile, importType]);

    const handleParseFile = async (file: File) => {
        setIsLoading(true);
        setErrors([]);
        setParsedData([]);
        setPreviewData([]);
        setShowPreview(false);

        try {
            let data: ParsedEmployee[] = [];

            if (file.name.endsWith('.csv')) {
                const text = await file.text();
                data = parseCSV(text);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                data = await parseExcel(file);
            } else {
                setErrors(['Unsupported file format. Please use CSV or Excel files.']);
                setIsLoading(false);
                return;
            }

            if (data.length === 0) {
                setErrors(['No data found in the file. Please check the file format.']);
                setIsLoading(false);
                return;
            }

            setParsedData(data);
            setPreviewData(data.slice(0, 5)); // Show first 5 rows as preview
            setShowPreview(true);
        } catch (error: any) {
            setErrors([`Error parsing file: ${error.message}`]);
        } finally {
            setIsLoading(false);
        }
    };

    // Map CSV columns to API fields for new employees
    const mapToNewEmployeeData = (row: ParsedEmployee): Partial<CandidateForm> => {
        const findIdByName = (name: string, items: any[], nameField: string = 'name'): string => {
            if (!name) return '';
            const item = items.find(item => {
                const itemName = (item[nameField] || item.designationName || item.departmentName || item.locationName || item.shiftName || item.fullName || '').toLowerCase().trim();
                return itemName === name.toLowerCase().trim();
            });
            return item?.id || item?._id || '';
        };

        return {
            fullName: row['Full Name'] || row['fullName'] || '',
            email: row['Email Address'] || row['Email'] || row['email'] || '',
            phoneNumber: row['Mobile Number'] || row['Phone Number'] || row['phoneNumber'] || '',
            designationId: row['Role'] ? findIdByName(row['Role'], designations, 'designationName') : '',
            departmentId: row['Department'] ? findIdByName(row['Department'], departments, 'departmentName') : '',
            locationId: row['Location'] ? findIdByName(row['Location'], locations, 'locationName') : '',
            reportingToId: row['Reporting To'] ? findIdByName(row['Reporting To'], reportingManagers, 'fullName') : '',
            dateOfJoining: row['Date of Joining'] || row['dateOfJoining'] || '',
            shiftType: row['Shift'] ? findIdByName(row['Shift'], shifts, 'shiftName') : '',
            timeZone: row['Time Zone'] || row['timeZone'] || 'Asia/Kolkata',
            empType: row['Employee Type'] || row['employeeType'] || 'permanent',
            employeeStatus: row['Employee Status'] || row['employeeStatus'] || 'Active',
            basicSalary: row['Basic Salary'] || row['basicSalary'] || '',
        };
    };

    // Map CSV columns to API fields for existing employees
    const mapToExistingEmployeeData = (row: ParsedEmployee, employeeId: string): any => {
        const findIdByName = (name: string, items: any[], nameField: string = 'name'): string => {
            if (!name) return '';
            const item = items.find(item => {
                const itemName = (item[nameField] || item.designationName || item.departmentName || item.locationName || item.shiftName || item.fullName || '').toLowerCase().trim();
                return itemName === name.toLowerCase().trim();
            });
            return item?.id || item?._id || '';
        };

        const updateData: any = {};
        
        if (row['Full Name']) updateData.fullName = row['Full Name'];
        if (row['Email ID'] || row['Email Address'] || row['Email']) updateData.email = row['Email ID'] || row['Email Address'] || row['Email'];
        if (row['Mobile Number'] || row['Phone Number']) updateData.phoneNumber = row['Mobile Number'] || row['Phone Number'];
        if (row['Role']) updateData.designationId = findIdByName(row['Role'], designations, 'designationName');
        if (row['Department']) updateData.departmentId = findIdByName(row['Department'], departments, 'departmentName');
        if (row['Location']) updateData.locationId = findIdByName(row['Location'], locations, 'locationName');
        if (row['Reporting To']) updateData.reportingToId = findIdByName(row['Reporting To'], reportingManagers, 'fullName');
        if (row['Date of Joining']) updateData.dateOfJoining = row['Date of Joining'];
        if (row['Shift']) updateData.shiftType = findIdByName(row['Shift'], shifts, 'shiftName');
        if (row['Time Zone']) updateData.timeZone = row['Time Zone'];
        if (row['Employee Type']) updateData.empType = row['Employee Type'];
        if (row['Employee Status']) updateData.employeeStatus = row['Employee Status'];
        if (row['Basic Salary']) updateData.basicSalary = row['Basic Salary'];

        return updateData;
    };

    // Generate employee ID for bulk import
    const generateEmployeeIds = (count: number, existingEmployees: any[]): string[] => {
        // Find the highest employee number from existing employees
        let maxNumber = 0;
        
        existingEmployees.forEach(emp => {
            const empId = emp.employeeId || emp.id || emp._id;
            if (empId) {
                const match = String(empId).match(/EMP\s*(\d+)/i);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNumber) maxNumber = num;
                }
            }
        });
        
        // Generate IDs for all new employees
        const employeeIds: string[] = [];
        for (let i = 1; i <= count; i++) {
            const nextNumber = maxNumber + i;
            employeeIds.push(`EMP ${String(nextNumber).padStart(3, '0')}`);
        }
        
        return employeeIds;
    };

    // Handle bulk import for new employees
    const handleBulkCreate = async () => {
        if (parsedData.length === 0) {
            setErrors(['No data to import. Please upload a valid file.']);
            return;
        }

        const orgId = getOrgId();
        const token = getAuthToken();
        const apiUrl = getApiUrl();

        if (!orgId || !token) {
            setErrors(['Authentication error. Please log in again.']);
            return;
        }

        setIsLoading(true);
        setErrors([]);
        setSuccessCount(0);
        setErrorCount(0);

        try {
            // Filter valid entries first
            const validRows = parsedData.filter(row => row['Full Name'] || row['fullName'] || row['Email Address'] || row['Email'] || row['email']);
            
            if (validRows.length === 0) {
                setErrors(['No valid employee data found. Please check your file.']);
                setIsLoading(false);
                return;
            }

            // Generate employee IDs for all new employees
            const employeeIds = generateEmployeeIds(validRows.length, employees);
            
            // Map data and assign employee IDs
            const employeesData = validRows.map((row, index) => {
                const mapped = mapToNewEmployeeData(row);
                return {
                    ...mapped,
                    employeeId: employeeIds[index], // Assign generated employee ID
                    organizationId: orgId,
                    role: 'employee',
                };
            }).filter(emp => emp.fullName && emp.email); // Final filter

            const response = await axios.post(
                `${apiUrl}/org/${orgId}/employees/bulk`,
                employeesData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 201 || response.status === 200) {
                setSuccessCount(employeesData.length);
                if (onSuccess) onSuccess();
                setTimeout(() => {
                    onCancel();
                }, 2000);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to import employees';
            setErrors([errorMessage]);
            setErrorCount(parsedData.length);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle bulk update for existing employees
    const handleBulkUpdate = async () => {
        if (parsedData.length === 0) {
            setErrors(['No data to import. Please upload a valid file.']);
            return;
        }

        const orgId = getOrgId();
        const token = getAuthToken();
        const apiUrl = getApiUrl();

        if (!orgId || !token) {
            setErrors(['Authentication error. Please log in again.']);
            return;
        }

        setIsLoading(true);
        setErrors([]);
        setSuccessCount(0);
        setErrorCount(0);

        try {
            const updatePromises = parsedData.map(async (row) => {
                const employeeId = row['Employee ID'] || row['employeeId'] || row['id'] || row['EmployeeID'];
                if (!employeeId) {
                    return { success: false, error: 'Employee ID missing in row' };
                }

                const updateData = mapToExistingEmployeeData(row, employeeId);

                try {
                    await axios.put(
                        `${apiUrl}/org/${orgId}/employees/${employeeId}`,
                        updateData,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    return { success: true };
                } catch (error: any) {
                    return { 
                        success: false, 
                        error: error.response?.data?.error || error.message || 'Update failed' 
                    };
                }
            });

            const results = await Promise.all(updatePromises);
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            setSuccessCount(successful);
            setErrorCount(failed);

            if (failed > 0) {
                const errorMessages = results
                    .filter(r => !r.success)
                    .map(r => r.error)
                    .slice(0, 5);
                setErrors(errorMessages);
            }

            if (successful > 0 && onSuccess) {
                onSuccess();
                setTimeout(() => {
                    onCancel();
                }, 2000);
            }
        } catch (error: any) {
            setErrors([error.message || 'Failed to update employees']);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
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

                    {/* Preview parsed data */}
                    {showPreview && previewData.length > 0 && (
                        <div className="mt-6 bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold mb-2">Preview (First 5 rows)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            {Object.keys(previewData[0]).map((key) => (
                                                <th key={key} className="px-2 py-1 text-left">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((row, idx) => (
                                            <tr key={idx} className="border-t">
                                                {Object.values(row).map((val, i) => (
                                                    <td key={i} className="px-2 py-1">{String(val)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Total rows: {parsedData.length}
                            </p>
                        </div>
                    )}

                    {/* Error messages */}
                    {errors.length > 0 && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-red-800 mb-1">Errors</h4>
                                    <ul className="text-sm text-red-700 list-disc list-inside">
                                        {errors.map((error, idx) => (
                                            <li key={idx}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success message */}
                    {successCount > 0 && (
                        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-600" />
                                <p className="text-sm text-green-800">
                                    Successfully {importType === 'new' ? 'imported' : 'updated'} {successCount} employee(s)!
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-2">
                        <div className="w-5 h-5 text-orange-600 mt-0.5 shrink-0">ⓘ</div>
                        <p className="text-sm text-orange-800">
                            {importType === 'new' 
                                ? 'New employees will receive onboarding invitations via email after import.'
                                : 'Make sure your file includes Employee ID column for updating existing employees.'}
                        </p>
                    </div>

                    <button
                        onClick={importType === 'new' ? handleBulkCreate : handleBulkUpdate}
                        disabled={!uploadedFile || isLoading || parsedData.length === 0}
                        className={`mt-6 w-full px-6 py-3 text-white rounded-lg flex items-center justify-center gap-2 ${
                            uploadedFile && !isLoading && parsedData.length > 0
                                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            `Import ${importType === 'new' ? 'New' : 'Existing'} Employees`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkImport;
