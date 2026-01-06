'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    X, Download, FileText, FileSpreadsheet, Upload, Check,
    AlertCircle, ArrowRight, ArrowLeft, Layers, Table as TableIcon,
    ChevronDown, Info, Loader2, Sparkles, CheckCircle2
} from 'lucide-react';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import { CandidateForm } from './types';
import * as XLSX from 'xlsx';

interface BulkImportProps {
    importType: string;
    setImportType: (type: string) => void;
    uploadedFile: File | null;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
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

interface ColumnMap {
    systemField: string;
    fileHeader: string;
    required: boolean;
}

const STEPS = [
    { id: 1, name: 'Upload', icon: Upload },
    { id: 2, name: 'Review', icon: TableIcon },
    { id: 3, name: 'Import', icon: CheckCircle2 },
];

const SYSTEM_FIELDS = [
    { key: 'fullName', label: 'Full Name', required: true },
    { key: 'email', label: 'Email Address', required: true },
    { key: 'phoneNumber', label: 'Mobile Number', required: true },
    { key: 'role', label: 'Role/Designation', required: true },
    { key: 'department', label: 'Department', required: true },
    { key: 'location', label: 'Location', required: true },
    { key: 'site', label: 'Site', required: false },
    { key: 'building', label: 'Building / Area', required: false },
    { key: 'reportingTo', label: 'Reporting Manager', required: false },
    { key: 'empType', label: 'Employee Type (Permanent/Temporary)', required: false },
    { key: 'employeeStatus', label: 'Employee Status (Active/Inactive)', required: false },
    { key: 'dateOfJoining', label: 'Date of Joining', required: true },
    { key: 'shift', label: 'Shift', required: false },
    { key: 'contractType', label: 'Contract Type', required: false },
    { key: 'contractStartDate', label: 'Contract Start Date', required: false },
    { key: 'contractEndDate', label: 'Contract End Date', required: false },
    { key: 'timeZone', label: 'Time Zone', required: false },
    { key: 'basicSalary', label: 'Basic Salary', required: false },
    { key: 'employeeNumber', label: 'Employee ID (for Updates)', required: false },
    { key: 'bankName', label: 'Bank Name', required: false },
    { key: 'branchName', label: 'Branch Name', required: false },
    { key: 'accountNumber', label: 'Account Number', required: false },
    { key: 'accountHolderName', label: 'Account Holder Name', required: false },
    { key: 'ifscCode', label: 'IFSC Code', required: false },
];

const BulkImport: React.FC<BulkImportProps> = ({
    importType,
    setImportType,
    uploadedFile,
    onFileUpload,
    onCancel,
    departments,
    designations,
    locations,
    reportingManagers,
    shifts,
    employees = [],
    onSuccess,
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedEmployee[]>([]);
    const [fileHeaders, setFileHeaders] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<string[]>([]);
    const [successCount, setSuccessCount] = useState(0);

    // Initial parsing to get headers
    useEffect(() => {
        if (uploadedFile) {
            handleInitialParse(uploadedFile);
        }
    }, [uploadedFile]);

    const handleInitialParse = async (file: File) => {
        setIsLoading(true);
        setErrors([]);
        try {
            const data = await parseFile(file);
            if (data.length > 0) {
                const headers = Object.keys(data[0]);
                setFileHeaders(headers);
                setParsedData(data);

                // Auto-map headers
                const mapping: Record<string, string> = {};
                SYSTEM_FIELDS.forEach(field => {
                    const match = headers.find(h =>
                        h.toLowerCase().includes(field.label.toLowerCase()) ||
                        h.toLowerCase() === field.key.toLowerCase() ||
                        h.toLowerCase().replace(/\s+/g, '') === field.key.toLowerCase()
                    );
                    if (match) mapping[field.key] = match;
                });
                setColumnMapping(mapping);
                setCurrentStep(2);
            } else {
                setErrors(['No data found in file']);
            }
        } catch (error: any) {
            setErrors([`Failed to parse file: ${error.message}`]);
        } finally {
            setIsLoading(false);
        }
    };

    const parseFile = async (file: File): Promise<ParsedEmployee[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, {
                        type: 'array',
                        cellDates: true,
                        cellNF: false,
                        cellText: false
                    });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    // Use raw: false to get formatted strings if possible, or handle Date objects
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        defval: '',
                        raw: false,
                        dateNF: 'yyyy-mm-dd'
                    });
                    resolve(jsonData as ParsedEmployee[]);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const handleInternalDownloadTemplate = (format: 'csv' | 'excel') => {
        const headers = SYSTEM_FIELDS.map(f => f.label);
        let rows: any[][] = [];

        if (importType === 'new') {
            // Generate 10 unique dummy employees with timestamps to avoid collisions
            const timestamp = Date.now().toString().slice(-4);
            const dummyNames = [
                'John Doe', 'Jane Smith', 'Robert Brown', 'Emily Davis', 'Michael Wilson',
                'Sarah Miller', 'David Taylor', 'Jessica Anderson', 'Christopher Thomas', 'Ashley Jackson'
            ];

            rows = dummyNames.map((name, i) => [
                `${name} ${timestamp}`, // Full Name
                `${name.toLowerCase().replace(' ', '.')}.${timestamp}${i}@example.com`, // Email Address
                `9876${timestamp}${i}`, // Mobile Number
                designations[0]?.designationName || 'Software Engineer', // Role
                departments[0]?.departmentName || 'Engineering', // Department
                locations[0]?.locationName || 'Bangalore', // Location
                locations[0]?.sites?.[0]?.siteName || '', // Site
                locations[0]?.sites?.[0]?.buildings?.[0]?.buildingName || '', // Building
                reportingManagers[0]?.fullName || '', // Reporting Manager
                'Permanent', // Employee Type
                'Active', // Employee Status
                new Date().toISOString().split('T')[0], // Date of Joining
                shifts[0]?.shiftName || 'Morning', // Shift
                'fixed-term', // Contract Type
                new Date().toISOString().split('T')[0], // Contract Start Date
                '', // Contract End Date
                'Asia/Kolkata', // Time Zone
                '50000', // Basic Salary
                '', // Employee ID (for Updates)
                'State Bank of India', // Bank Name
                'Main Branch', // Branch Name
                `12345${timestamp}${i}`, // Account Number
                `${name} ${timestamp}`, // Account Holder Name
                'SBIN0001234' // IFSC Code
            ]);
        } else {
            // Map existing employees
            rows = (employees || []).map(emp => {
                const getDesignation = () => {
                    if (typeof emp.designation === 'string') return emp.designation;
                    return emp.designation?.designationName || emp.designation?.name || '';
                };
                const getDepartment = () => {
                    if (typeof emp.department === 'string') return emp.department;
                    return emp.department?.departmentName || emp.department?.name || '';
                };
                const getLocation = () => {
                    if (typeof emp.location === 'string') return emp.location;
                    return emp.location?.locationName || emp.location?.name || '';
                };

                return [
                    emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
                    emp.emailId || emp.email || '',
                    emp.phoneNumber || emp.mobileNumber || '',
                    getDesignation(),
                    getDepartment(),
                    getLocation(),
                    emp.siteId || '',
                    emp.buildingId || '',
                    emp.reportingTo?.fullName || '',
                    emp.empType || 'permanent',
                    emp.employeeStatus || 'Active',
                    emp.dateOfJoining || '',
                    emp.shift?.shiftName || emp.shift || '',
                    emp.contractType || '',
                    emp.contractStartDate || '',
                    emp.contractEndDate || '',
                    emp.timeZone || 'Asia/Kolkata',
                    emp.basicSalary || '',
                    emp.employeeNumber || emp.employeeId || emp.id || '',
                    emp.bankDetails?.bankName || '',
                    emp.bankDetails?.branchName || '',
                    emp.bankDetails?.accountNumber || '',
                    emp.bankDetails?.accountHolderName || '',
                    emp.bankDetails?.ifscCode || ''
                ];
            });
        }

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
        const filename = `${importType}_employee_template.${format === 'excel' ? 'xlsx' : 'csv'}`;
        XLSX.writeFile(workbook, filename, { bookType: format === 'excel' ? 'xlsx' : 'csv' });
    };

    const handleImport = async () => {
        setIsLoading(true);
        setErrors([]);

        const orgId = getOrgId();
        const token = getAuthToken();
        const apiUrl = getApiUrl();

        if (importType === 'new') {
            try {
                const mappedData = parsedData.map(row => {
                    const findId = (fieldName: string, items: any[], nameProp: string) => {
                        const colName = columnMapping[fieldName];
                        if (!colName) return undefined;
                        const value = row[colName];
                        if (!value) return undefined;

                        const item = items.find(i =>
                            String(i[nameProp] || i.name || i.fullName || i.designationName || i.departmentName || i.locationName || i.shiftName || '').toLowerCase()
                            === String(value).toLowerCase().trim()
                        );
                        return item?.id || item?._id || undefined;
                    };

                    const desigId = findId('role', designations, 'designationName');
                    const deptId = findId('department', departments, 'departmentName');
                    const locId = findId('location', locations, 'locationName');

                    // Specific logic for site and building
                    let siteId;
                    let buildingId;
                    if (locId) {
                        const location = locations.find(l => (l.id === locId || l._id === locId));
                        if (location && location.sites) {
                            const siteVal = row[columnMapping['site']];
                            if (siteVal) {
                                const site = location.sites.find((s: any) =>
                                    String(s.siteName || s.name || '').toLowerCase() === String(siteVal).toLowerCase().trim()
                                );
                                if (site) {
                                    siteId = site.id || site._id || site.name;
                                    const bldgVal = row[columnMapping['building']];
                                    if (bldgVal && site.buildings) {
                                        const bldg = site.buildings.find((b: any) =>
                                            String(b.buildingName || b.name || '').toLowerCase() === String(bldgVal).toLowerCase().trim()
                                        );
                                        if (bldg) buildingId = bldg.id || bldg._id || bldg.name;
                                    }
                                }
                            }
                        }
                    }

                    const repId = findId('reportingTo', reportingManagers, 'fullName');
                    const shiftId = findId('shift', shifts, 'shiftName');

                    const emp: any = {
                        fullName: String(row[columnMapping['fullName']] || '').trim(),
                        email: String(row[columnMapping['email']] || '').trim().toLowerCase(),
                        organizationId: orgId,
                        role: 'employee',
                        empType: String(row[columnMapping['empType']] || 'permanent').trim().toLowerCase(),
                        timeZone: String(row[columnMapping['timeZone']] || 'Asia/Kolkata').trim(),
                        employeeStatus: String(row[columnMapping['employeeStatus']] || 'Active').trim(),
                        accommodationAllowances: [],
                        insurances: [],
                    };

                    // Only add IDs if they exist to avoid UUID validation errors on empty strings
                    if (desigId) emp.designationId = desigId;
                    if (deptId) emp.departmentId = deptId;
                    if (locId) emp.locationId = locId;
                    if (siteId) emp.siteId = siteId;
                    if (buildingId) emp.buildingId = buildingId;
                    if (repId) emp.reportingToId = repId;
                    if (shiftId) emp.shiftType = shiftId;

                    // Contract
                    if (row[columnMapping['contractType']]) emp.contractType = String(row[columnMapping['contractType']]).trim();
                    if (row[columnMapping['contractStartDate']]) emp.contractStartDate = String(row[columnMapping['contractStartDate']]).trim();
                    if (row[columnMapping['contractEndDate']]) emp.contractEndDate = String(row[columnMapping['contractEndDate']]).trim();

                    // Only add fields if they have content
                    const phone = row[columnMapping['phoneNumber']] || row[columnMapping['mobileNumber']];
                    if (phone) emp.phoneNumber = String(phone).trim();

                    const doj = row[columnMapping['dateOfJoining']];
                    if (doj) emp.dateOfJoining = String(doj).trim();

                    const salary = row[columnMapping['basicSalary']];
                    if (salary) emp.basicSalary = String(salary).trim();

                    const bankName = row[columnMapping['bankName']];
                    const accNum = row[columnMapping['accountNumber']];
                    if (bankName || accNum) {
                        emp.bankDetails = {
                            bankName: String(bankName || '').trim(),
                            branchName: String(row[columnMapping['branchName']] || '').trim(),
                            accountNumber: String(accNum || '').trim(),
                            accountHolderName: String(row[columnMapping['accountHolderName']] || '').trim(),
                            ifscCode: String(row[columnMapping['ifscCode']] || '').trim(),
                        };
                    }

                    return emp;
                }).filter(emp => emp.fullName && emp.email);

                // Local duplicate check to prevent transaction aborts
                const emails = mappedData.map(e => e.email);
                const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
                if (duplicateEmails.length > 0) {
                    setErrors([`Duplicate emails found in your file: ${Array.from(new Set(duplicateEmails)).join(', ')}`]);
                    setIsLoading(false);
                    return;
                }

                if (mappedData.length === 0) {
                    setErrors(['No valid employee records found to import.']);
                    setIsLoading(false);
                    return;
                }

                console.log("BULK IMPORT PAYLOAD (CLEANED):", mappedData);

                const response = await axios.post(
                    `${apiUrl}/org/${orgId}/employees/bulk`,
                    mappedData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.status === 200 || response.status === 201) {
                    setSuccessCount(mappedData.length);
                    setCurrentStep(3);
                    if (onSuccess) onSuccess();
                }
            } catch (error: any) {
                console.error('BULK IMPORT ERROR:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message,
                });
                const serverError = error.response?.data?.error || error.response?.data?.message;

                if (String(serverError || error.message).includes('transaction is aborted')) {
                    setErrors(['Import failed: Database transaction error. This usually happens if an employee in your file already exists in the system (Duplicate Email) or has invalid IDs. Please check for existing records.']);
                } else {
                    setErrors([serverError || (error.message === 'Network Error' ? 'Server is unreachable' : 'Import failed')]);
                }
            } finally {
                setIsLoading(false);
            }
        } else {
            // Bulk Update Logic
            try {
                let successful = 0;
                let failed = 0;
                const updateErrors: string[] = [];

                for (const row of parsedData) {
                    const employeeNumber = row[columnMapping['employeeNumber']];
                    if (!employeeNumber) {
                        failed++;
                        continue;
                    }

                    const findId = (fieldName: string, items: any[], nameProp: string) => {
                        const value = row[columnMapping[fieldName]];
                        if (!value) return undefined;
                        const item = items.find(i => String(i[nameProp] || i.name || '').toLowerCase() === String(value).toLowerCase().trim());
                        return item?.id || item?._id || '';
                    };

                    const updateData: any = {};
                    if (row[columnMapping['fullName']]) updateData.fullName = row[columnMapping['fullName']];
                    if (row[columnMapping['email']]) updateData.email = row[columnMapping['email']];
                    if (row[columnMapping['phoneNumber']]) updateData.phoneNumber = row[columnMapping['phoneNumber']];

                    const desigId = findId('role', designations, 'designationName');
                    if (desigId) updateData.designationId = desigId;

                    const deptId = findId('department', departments, 'departmentName');
                    if (deptId) updateData.departmentId = deptId;

                    // Location, Site, Building for Update
                    const locId = findId('location', locations, 'locationName');
                    if (locId) {
                        updateData.locationId = locId;
                        const location = locations.find(l => (l.id === locId || l._id === locId));
                        if (location && location.sites) {
                            const siteVal = row[columnMapping['site']];
                            if (siteVal) {
                                const site = location.sites.find((s: any) =>
                                    String(s.siteName || s.name || '').toLowerCase() === String(siteVal).toLowerCase().trim()
                                );
                                if (site) {
                                    updateData.siteId = site.id || site._id || site.name;
                                    const bldgVal = row[columnMapping['building']];
                                    if (bldgVal && site.buildings) {
                                        const bldg = site.buildings.find((b: any) =>
                                            String(b.buildingName || b.name || '').toLowerCase() === String(bldgVal).toLowerCase().trim()
                                        );
                                        if (bldg) updateData.buildingId = bldg.id || bldg._id || bldg.name;
                                    }
                                }
                            }
                        }
                    }

                    if (row[columnMapping['empType']]) updateData.empType = String(row[columnMapping['empType']]).toLowerCase().trim();
                    if (row[columnMapping['employeeStatus']]) updateData.employeeStatus = String(row[columnMapping['employeeStatus']]).trim();
                    if (row[columnMapping['dateOfJoining']]) updateData.dateOfJoining = row[columnMapping['dateOfJoining']];

                    const shiftId = findId('shift', shifts, 'shiftName');
                    if (shiftId) updateData.shiftType = shiftId;

                    if (row[columnMapping['contractType']]) updateData.contractType = String(row[columnMapping['contractType']]).trim();
                    if (row[columnMapping['contractStartDate']]) updateData.contractStartDate = String(row[columnMapping['contractStartDate']]).trim();
                    if (row[columnMapping['contractEndDate']]) updateData.contractEndDate = String(row[columnMapping['contractEndDate']]).trim();
                    if (row[columnMapping['timeZone']]) updateData.timeZone = String(row[columnMapping['timeZone']]).trim();
                    if (row[columnMapping['basicSalary']]) updateData.basicSalary = row[columnMapping['basicSalary']];

                    const bankName = row[columnMapping['bankName']];
                    const accNum = row[columnMapping['accountNumber']];
                    if (bankName || accNum) {
                        updateData.bankDetails = {
                            bankName: String(bankName || '').trim(),
                            branchName: String(row[columnMapping['branchName']] || '').trim(),
                            accountNumber: String(accNum || '').trim(),
                            accountHolderName: String(row[columnMapping['accountHolderName']] || '').trim(),
                            ifscCode: String(row[columnMapping['ifscCode']] || '').trim(),
                        };
                    }

                    try {
                        await axios.put(
                            `${apiUrl}/org/${orgId}/employees/${employeeNumber}`,
                            updateData,
                            { headers: { 'Authorization': `Bearer ${token}` } }
                        );
                        successful++;
                    } catch (err: any) {
                        failed++;
                        updateErrors.push(`ID ${employeeNumber}: ${err.message}`);
                    }
                }

                setSuccessCount(successful);
                if (failed > 0) setErrors(updateErrors.slice(0, 5));
                setCurrentStep(4);
                if (successful > 0 && onSuccess) onSuccess();
            } catch (error: any) {
                setErrors([error.message || 'Update process failed']);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl h-[95vh] sm:h-[85vh] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                            Bulk Import Employees
                        </h2>
                    </div>
                    <button onClick={onCancel} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors group">
                        <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-gray-600" />
                    </button>
                </div>

                {/* Progress Stepper */}
                <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gray-50/50 border-b border-gray-100 overflow-x-auto no-scrollbar">
                    <div className="flex items-center justify-between min-w-[300px] max-w-3xl mx-auto relative">
                        {STEPS.map((step, idx) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center z-10">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${isActive ? 'bg-blue-600 text-white scale-110' :
                                            isCompleted ? 'bg-green-500 text-white' :
                                                'bg-white text-gray-400'
                                            }`}>
                                            {isCompleted ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : <Icon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        </div>
                                        <span className={`text-[10px] sm:text-xs font-semibold mt-2 sm:mt-3 ${isActive ? 'text-blue-600' : 'text-gray-400'} hidden xs:block`}>
                                            {step.name}
                                        </span>
                                    </div>
                                    {idx < STEPS.length - 1 && (
                                        <div className="flex-1 h-0.5 bg-gray-200 mx-2 sm:mx-4 -mt-5 sm:-mt-6">
                                            <div className="h-full bg-blue-600 transition-all duration-500" style={{
                                                width: currentStep > idx + 1 ? '100%' : '0%'
                                            }} />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/30">
                    {/* Step 1: Upload */}
                    {currentStep === 1 && (
                        <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Download className="w-5 h-5 text-blue-500" />
                                        Get Template
                                    </h3>
                                    <div className="flex flex-col gap-2 sm:gap-3">
                                        <button onClick={() => handleInternalDownloadTemplate('excel')} className="w-full py-2.5 sm:py-3 px-4 rounded-xl border border-blue-100 text-blue-600 bg-blue-50/50 hover:bg-blue-50 font-semibold flex items-center justify-center gap-2 transition-all text-xs sm:text-sm">
                                            <FileSpreadsheet className="w-4 h-4" /> Download Excel
                                        </button>
                                        <button onClick={() => handleInternalDownloadTemplate('csv')} className="w-full py-2.5 sm:py-3 px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold flex items-center justify-center gap-2 transition-all text-xs sm:text-sm">
                                            <FileText className="w-4 h-4" /> Download CSV
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-amber-500" />
                                        Import Type
                                    </h3>
                                    <div className="space-y-3 sm:space-y-4">
                                        {['new', 'existing'].map((type) => (
                                            <label key={type} className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${importType === type ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    name="importType"
                                                    checked={importType === type}
                                                    onChange={() => setImportType(type)}
                                                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
                                                />
                                                <div>
                                                    <span className="block font-bold capitalize text-sm sm:text-base text-gray-900">{type} Employees</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <input id="bulk-upload" type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={onFileUpload} />
                                <label htmlFor="bulk-upload" className="group cursor-pointer">
                                    <div className="border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300">
                                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 duration-300 transition-transform">
                                            <Upload className="w-10 h-10 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Upload your file</h3>
                                        <p className="text-gray-500">Drag and drop your Excel or CSV here, or click to browse</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Map Columns Step removed by user request */}

                    {/* Step 2: Review */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <TableIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Final Verification</h3>
                                        <p className="text-sm text-gray-500">{parsedData.length} records ready to import</p>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-xl font-bold text-sm">
                                    Validation Complete
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                {SYSTEM_FIELDS.filter(f => columnMapping[f.key]).map(f => (
                                                    <th key={f.key} className="px-6 py-4 font-bold text-gray-600">{f.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {parsedData.slice(0, 10).map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50">
                                                    {SYSTEM_FIELDS.filter(f => columnMapping[f.key]).map(f => (
                                                        <td key={f.key} className="px-6 py-4 text-gray-700 truncate max-w-[200px]">
                                                            {String(row[columnMapping[f.key]] || '-')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {parsedData.length > 10 && (
                                    <div className="p-4 text-center bg-gray-50/50 text-gray-400 text-xs font-medium">
                                        Showing first 10 rows of {parsedData.length} total records
                                    </div>
                                )}
                            </div>

                            {errors.length > 0 && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-2">
                                    <div className="flex items-center gap-2 text-rose-700 font-bold">
                                        <AlertCircle className="w-5 h-5" />
                                        Issues Detected
                                    </div>
                                    <ul className="list-disc list-inside text-sm text-rose-600">
                                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Import Success (formerly Step 4) */}
                    {currentStep === 3 && (
                        <div className="max-w-md mx-auto text-center py-16 space-y-8 animate-in zoom-in-95 duration-700">
                            <div className="relative inline-block">
                                <div className="w-32 h-32 bg-green-100 rounded-[40px] flex items-center justify-center animate-bounce-subtle">
                                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 sm:mb-4">Import Successful!</h3>
                                <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-sm mx-auto">
                                    We've successfully processed <span className="font-bold text-gray-900">{successCount}</span> employee records.
                                    {importType === 'new' ? ' Onboarding sequences have been triggered.' : ' Existing records have been synchronized.'}
                                </p>
                            </div>

                            <button
                                onClick={onCancel}
                                className="w-full py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-2xl transition-all"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                {currentStep < 3 && (
                    <div className="px-4 sm:px-8 py-4 sm:py-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-between items-center sticky bottom-0 z-10">
                        <button
                            onClick={currentStep === 1 ? onCancel : () => setCurrentStep(prev => prev - 1)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors order-2 sm:order-1"
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            {currentStep === 1 ? 'Cancel' : 'Back'}
                        </button>

                        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
                            {currentStep === 2 && (
                                <button
                                    onClick={handleImport}
                                    disabled={isLoading}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold bg-blue-600 text-white shadow-lg lg:hover:shadow-xl lg:hover:shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Complete Import <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s ease-in-out infinite;
                }
                @media (max-width: 400px) {
                    .xs\:block { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default BulkImport;

