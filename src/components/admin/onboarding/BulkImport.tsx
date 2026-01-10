'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    X, Download, FileText, FileSpreadsheet, Upload, Check,
    AlertCircle, ArrowRight, ArrowLeft, Layers, Table as TableIcon,
    ChevronDown, Info, Loader2, Sparkles, CheckCircle2
} from 'lucide-react';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
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

const STEPS = [
    { id: 1, name: 'Upload', icon: Upload },
    { id: 2, name: 'Review', icon: TableIcon },
    { id: 3, name: 'Import', icon: CheckCircle2 },
];

// Fields for New Employees (based on AddCandidateForm)
const NEW_EMPLOYEE_FIELDS = [
    { key: 'employeeNumber', label: 'Employee ID', required: false }, // Manually assigned ID
    { key: 'fullName', label: 'Full Name', required: true },
    { key: 'email', label: 'Email Address', required: true },
    { key: 'phoneNumber', label: 'Mobile Number', required: true },
    { key: 'role', label: 'Role/Designation', required: true },
    { key: 'department', label: 'Department', required: true },
    { key: 'location', label: 'Location', required: true },
    { key: 'site', label: 'Site', required: false },
    { key: 'building', label: 'Building / Area', required: false },
    { key: 'reportingTo', label: 'Reporting Manager', required: false },
    { key: 'empType', label: 'Employee Type', required: false }, // Permanent/Temporary
    { key: 'employeeStatus', label: 'Employee Status', required: false }, // Active/Inactive
    { key: 'dateOfJoining', label: 'Date of Joining', required: true },
    { key: 'shift', label: 'Shift', required: false },
    { key: 'contractType', label: 'Contract Type', required: false },
    { key: 'contractStartDate', label: 'Contract Start Date', required: false },
    { key: 'contractEndDate', label: 'Contract End Date', required: false },
    { key: 'timeZone', label: 'Time Zone', required: false },
    { key: 'basicSalary', label: 'Basic Salary', required: false },
    // Insurance & Allowances
    { key: 'insuranceType', label: 'Insurance Type', required: false },
    { key: 'insurancePercentage', label: 'Insurance Percentage', required: false },
    { key: 'allowanceType', label: 'Allowance Type', required: false },
    { key: 'allowancePercentage', label: 'Allowance Percentage', required: false },
    // Bank Details
    { key: 'bankName', label: 'Bank Name', required: false },
    { key: 'branchName', label: 'Branch Name', required: false },
    { key: 'accountNumber', label: 'Account Number', required: false },
    { key: 'accountHolderName', label: 'Account Holder Name', required: false },
    { key: 'ifscCode', label: 'IFSC Code', required: false },
];

// Fields for Existing Employees (based on ProfileForm)
const EXISTING_EMPLOYEE_FIELDS = [
    { key: 'employeeNumber', label: 'Employee ID', required: true }, // Crucial for update
    { key: 'fullName', label: 'Full Name', required: false },
    { key: 'email', label: 'Email Address', required: false },
    { key: 'phoneNumber', label: 'Mobile Number', required: false },
    { key: 'role', label: 'Role', required: false },
    { key: 'department', label: 'Department', required: false },
    { key: 'designation', label: 'Designation', required: false },
    { key: 'reportingTo', label: 'Reporting To', required: false },
    { key: 'teamPosition', label: 'Team Position', required: false },
    { key: 'shift', label: 'Shift', required: false },
    { key: 'location', label: 'Location', required: false },
    { key: 'site', label: 'Site', required: false },
    { key: 'building', label: 'Building / Area', required: false },
    { key: 'timeZone', label: 'Time Zone', required: false },
    { key: 'empType', label: 'Employee Type', required: false },
    { key: 'employeeStatus', label: 'Employee Status', required: false },
    { key: 'dateOfJoining', label: 'Date of Joining', required: false },
    { key: 'contractType', label: 'Contract Type', required: false },
    { key: 'contractStartDate', label: 'Contract Start Date', required: false },
    { key: 'contractEndDate', label: 'Contract End Date', required: false },
    // Personal & Identity
    { key: 'dateOfBirth', label: 'Date of Birth', required: false },
    { key: 'gender', label: 'Gender', required: false },
    { key: 'maritalStatus', label: 'Marital Status', required: false },
    { key: 'bloodGroup', label: 'Blood Group', required: false },
    { key: 'iban', label: 'IBAN', required: false },
    // Removed PAN, Aadhaar mappings
    // Removed PAN, Aadhaar, UAN mappings
    { key: 'passportNumber', label: 'Passport Number', required: false },
    { key: 'drivingLicenseNumber', label: 'Driving License', required: false },
    // Address
    { key: 'addressLine1', label: 'Address Line 1', required: false },
    { key: 'addressLine2', label: 'Address Line 2', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'state', label: 'State', required: false },
    { key: 'country', label: 'Country', required: false },
    { key: 'pinCode', label: 'Pin Code', required: false },
    // Emergency Contact
    { key: 'emergencyContactName', label: 'Emergency Contact Name', required: false },
    { key: 'emergencyContactNumber', label: 'Emergency Contact Number', required: false },
    { key: 'emergencyContactRelation', label: 'Emergency Contact Relation', required: false },
    // Bank Details
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

    const getActiveFields = () => importType === 'new' ? NEW_EMPLOYEE_FIELDS : EXISTING_EMPLOYEE_FIELDS;

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
                getActiveFields().forEach(field => {
                    const match = headers.find(h =>
                        h.toLowerCase().trim() === field.label.toLowerCase().trim() ||
                        h.toLowerCase().trim() === field.key.toLowerCase().trim() ||
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
                    // Use raw: false to get formatted strings if possible
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
        const fields = getActiveFields();
        const headers = fields.map(f => f.label);
        let rows: any[][] = [];

        if (importType === 'new') {
            // Sample Data for New Employees
            const timestamp = Date.now().toString().slice(-4);
            const dummyNames = [
                'John Doe', 'Jane Smith', 'Robert Brown', 'Emily Davis', 'Michael Wilson'
            ];

            rows = dummyNames.map((name, i) => {
                const rowData: Record<string, string> = {
                    'Employee ID': `EMP${timestamp}${i}`,
                    'Full Name': name,
                    'Email Address': `${name.toLowerCase().replace(/\s+/g, '.')}.${timestamp}${i}@example.com`,
                    'Mobile Number': `98700${Math.floor(10000 + Math.random() * 90000)}`,
                    'Role/Designation': designations[0]?.designationName || 'Software Engineer',
                    'Department': departments[0]?.departmentName || 'Engineering',
                    'Location': locations[0]?.locationName || 'Bangalore',
                    'Site': locations[0]?.sites?.[0]?.siteName || 'Main Campus',
                    'Building / Area': locations[0]?.sites?.[0]?.buildings?.[0]?.buildingName || 'Building A',
                    'Reporting Manager': reportingManagers[0]?.fullName || '',
                    'Employee Type': 'Permanent',
                    'Employee Status': 'Active',
                    'Date of Joining': new Date().toISOString().split('T')[0],
                    'Shift': shifts[0]?.shiftName || 'Morning',
                    'Contract Type': 'Fixed Term',
                    'Contract Start Date': new Date().toISOString().split('T')[0],
                    'Contract End Date': new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                    'Time Zone': 'Asia/Kolkata',
                    'Basic Salary': '50000',
                    'Insurance Type': 'GMB',
                    'Insurance Percentage': '10',
                    'Allowance Type': 'Housing',
                    'Allowance Percentage': '15',
                    'Bank Name': 'State Bank of India',
                    'Branch Name': 'Main Branch',
                    'Account Number': `12345${timestamp}${i}`,
                    'Account Holder Name': name,
                    'IFSC Code': 'SBIN0001234'
                };
                return fields.map(f => rowData[f.label] || '');
            });
        } else {
            // ... (Existing logic for 'existing' import type)
            // Existing Employees (for Update)
            rows = (employees || []).map(emp => {
                const getVal = (key: string) => {
                    // Helper to get nested properties safely
                    if (!emp) return '';
                    if (key === 'employeeNumber') return emp.employeeNumber || emp.employeeId || emp.id || '';
                    if (key === 'role') return typeof emp.role === 'string' ? emp.role : (emp.designation?.name || '');
                    if (key === 'designation') return emp.designation?.designationName || emp.designation?.name || emp.designation || '';
                    if (key === 'department') return emp.department?.departmentName || emp.department?.name || emp.department || '';
                    if (key === 'reportingTo') return emp.reportingTo?.fullName || emp.reportingTo?.name || emp.reportingTo || '';
                    if (key === 'location') return emp.location?.locationName || emp.location?.name || emp.location || '';
                    if (key === 'site') return emp.site?.siteName || emp.site?.name || emp.site || '';
                    if (key === 'building') return emp.building?.buildingName || emp.building?.name || emp.building || '';
                    if (key === 'shift') return emp.shift?.shiftName || emp.shift?.name || emp.shift || '';

                    // Bank Details
                    if (key.startsWith('bank')) return emp.bankDetails?.[key] || emp[key] || '';
                    if (key === 'ifscCode') return emp.bankDetails?.ifscCode || emp.ifscCode || '';
                    if (key === 'accountNumber') return emp.bankDetails?.accountNumber || emp.accountNumber || '';
                    if (key === 'accountHolderName') return emp.bankDetails?.accountHolderName || emp.accountHolderName || '';

                    // Address
                    if (key.includes('address') || key === 'city' || key === 'state' || key === 'country' || key === 'pinCode') {
                        const addr = emp.presentAddress || {};
                        if (key === 'addressLine1') return addr.addressLine1 || emp.presentAddressLine1 || '';
                        if (key === 'addressLine2') return addr.addressLine2 || emp.presentAddressLine2 || '';
                        if (key === 'city') return addr.city || emp.presentCity || '';
                        if (key === 'state') return addr.state || emp.presentState || '';
                        if (key === 'country') return addr.country || emp.presentCountry || '';
                        if (key === 'pinCode') return addr.pinCode || emp.presentPinCode || '';
                    }

                    // Emergency Contact
                    if (key.startsWith('emergency')) {
                        const ec = emp.emergencyContact || {};
                        if (key === 'emergencyContactName') return ec.contactName || ec.name || emp.emergencyContactName || '';
                        if (key === 'emergencyContactNumber') return ec.contactNumber || ec.phoneNumber || emp.emergencyContactNumber || '';
                        if (key === 'emergencyContactRelation') return ec.relation || emp.emergencyContactRelation || '';
                    }

                    // Identity
                    // Removed PAN, Aadhaar mapping logic

                    return emp[key] || '';
                };

                return fields.map(f => getVal(f.key));
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
        const fields = getActiveFields();

        if (importType === 'new') {
            try {
                const mappedData = parsedData.map(row => {
                    const getColVal = (key: string) => {
                        const col = columnMapping[key];
                        if (!col) return undefined;
                        return row[col];
                    };

                    const findId = (key: string, items: any[], nameProp: string) => {
                        const val = getColVal(key);
                        if (!val) return undefined;
                        const item = items.find(i =>
                            String(i[nameProp] || i.name || i.fullName || i.designationName || i.departmentName || i.locationName || i.shiftName || '').toLowerCase()
                            === String(val).toLowerCase().trim()
                        );
                        return item?.id || item?._id || undefined;
                    };

                    const desigId = findId('role', designations, 'designationName');
                    const deptId = findId('department', departments, 'departmentName');
                    const locId = findId('location', locations, 'locationName'); // Sets locationId

                    // Specific logic for site and building
                    let siteId;
                    let buildingId;
                    if (locId) {
                        const location = locations.find(l => (l.id === locId || l._id === locId));
                        if (location && location.sites) {
                            const siteVal = getColVal('site');
                            if (siteVal) {
                                const site = location.sites.find((s: any) =>
                                    String(s.siteName || s.name || '').toLowerCase() === String(siteVal).toLowerCase().trim()
                                );
                                if (site) {
                                    siteId = site.id || site._id || site.name;
                                    const bldgVal = getColVal('building');
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
                        employeeNumber: String(getColVal('employeeNumber') || '').trim(),
                        fullName: String(getColVal('fullName') || '').trim(),
                        email: String(getColVal('email') || '').trim().toLowerCase(),
                        organizationId: orgId,
                        role: 'employee',
                        empType: String(getColVal('empType') || 'permanent').trim().toLowerCase(),
                        timeZone: String(getColVal('timeZone') || 'Asia/Kolkata').trim(),
                        employeeStatus: String(getColVal('employeeStatus') || 'Active').trim(),
                        allowances: {
                            homeClaimed: false, homeAllowancePercentage: 0,
                            foodClaimed: false, foodAllowancePercentage: 0,
                            travelClaimed: false, travelAllowancePercentage: 0
                        },
                        deductions: {
                            insuranceDeductionPercentage: 0
                        }
                    };

                    // Only add IDs if they exist to avoid validation errors
                    if (desigId) emp.designationId = desigId;
                    if (deptId) emp.departmentId = deptId;
                    if (locId) emp.locationId = locId;
                    if (siteId) emp.siteId = siteId;
                    if (buildingId) emp.buildingId = buildingId;
                    if (repId) emp.reportingToId = repId;
                    if (shiftId) emp.shiftType = shiftId;

                    // Contract
                    if (getColVal('contractType')) emp.contractType = String(getColVal('contractType')).trim();
                    if (getColVal('contractStartDate')) emp.contractStartDate = String(getColVal('contractStartDate')).trim();
                    if (getColVal('contractEndDate')) emp.contractEndDate = String(getColVal('contractEndDate')).trim();

                    // Basic fields
                    const phone = getColVal('phoneNumber');
                    if (phone) emp.phoneNumber = String(phone).trim();

                    const doj = getColVal('dateOfJoining');
                    if (doj) emp.dateOfJoining = String(doj).trim();

                    const salary = getColVal('basicSalary');
                    if (salary) emp.basicSalary = String(salary).trim();

                    // Insurance & Allowances
                    const insType = getColVal('insuranceType');
                    if (insType) {
                        emp.deductions.insuranceDeductionPercentage = parseFloat(String(getColVal('insurancePercentage') || '0').trim()) || 0;
                    }

                    const allowType = String(getColVal('allowanceType') || '').toLowerCase().trim();
                    const allowPercent = parseFloat(String(getColVal('allowancePercentage') || '0').trim()) || 0;
                    if (allowType && allowPercent) {
                        if (allowType === 'house' || allowType === 'home') {
                            emp.allowances.homeClaimed = true;
                            emp.allowances.homeAllowancePercentage = allowPercent;
                        } else if (allowType === 'food') {
                            emp.allowances.foodClaimed = true;
                            emp.allowances.foodAllowancePercentage = allowPercent;
                        } else if (allowType === 'travel') {
                            emp.allowances.travelClaimed = true;
                            emp.allowances.travelAllowancePercentage = allowPercent;
                        }
                    }

                    // Bank Details
                    const bankName = getColVal('bankName');
                    if (bankName) {
                        emp.bankDetails = [{
                            bankName: String(bankName).trim(),
                            branchName: String(getColVal('branchName') || '').trim(),
                            accountNumber: String(getColVal('accountNumber') || '').trim(),
                            accountHolderName: String(getColVal('accountHolderName') || '').trim(),
                            ifscCode: String(getColVal('ifscCode') || '').trim(),
                        }]; // Backend expects array
                    }

                    return emp;
                }).filter(emp => emp.fullName && emp.email);

                // Duplicate Check
                const emails = mappedData.map(e => e.email);
                const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
                if (duplicateEmails.length > 0) {
                    setErrors([`Duplicate emails found in your file: ${Array.from(new Set(duplicateEmails)).join(', ')}`]);
                    setIsLoading(false);
                    return;
                }

                if (mappedData.length === 0) {
                    setErrors(['No valid employee records found to import. Checks logs or file headers.']);
                    setIsLoading(false);
                    return;
                }

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
                console.error('BULK IMPORT ERROR:', error);
                const serverError = error.response?.data?.error || error.response?.data?.message;
                if (String(serverError || error.message).includes('transaction is aborted')) {
                    setErrors(['Import failed: Database transaction error. Likely duplicate email or invalid data.']);
                } else {
                    setErrors([serverError || 'Import failed']);
                }
            } finally {
                setIsLoading(false);
            }
        } else {
            // Bulk Update Logic (Existing Employees)
            try {
                let successful = 0;
                let failed = 0;
                const updateErrors: string[] = [];

                for (const row of parsedData) {
                    const getColVal = (key: string) => {
                        const col = columnMapping[key];
                        if (!col) return undefined;
                        return row[col];
                    };

                    const employeeNumber = getColVal('employeeNumber');
                    if (!employeeNumber) {
                        // Skip rows without ID
                        continue;
                    }

                    // Helper to resolve IDs similar to 'new' logic
                    const findId = (key: string, items: any[], nameProp: string) => {
                        const val = getColVal(key);
                        if (!val) return undefined;
                        const item = items.find(i => String(i[nameProp] || i.name || '').toLowerCase() === String(val).toLowerCase().trim());
                        return item?.id || item?._id || '';
                    };

                    const updateData: any = {};

                    // Direct mappings
                    const directFields = ['fullName', 'email', 'phoneNumber', 'dateOfJoining', 'contractType',
                        'contractStartDate', 'contractEndDate', 'timeZone', 'employeeStatus', 'empType',
                        'dateOfBirth', 'gender', 'maritalStatus', 'bloodGroup', 'passportNumber', 'teamPosition',
                        'iban', 'drivingLicenseNumber'
                    ];

                    directFields.forEach(field => {
                        const val = getColVal(field);
                        if (val !== undefined && val !== '') updateData[field] = String(val).trim();
                    });

                    // Update Map for allowances and deductions
                    const allowType = String(getColVal('allowanceType') || '').toLowerCase().trim();
                    const allowPercent = parseFloat(String(getColVal('allowancePercentage') || '0').trim());
                    if (allowType && !isNaN(allowPercent)) {
                        updateData.allowances = {
                            homeClaimed: false, homeAllowancePercentage: 0,
                            foodClaimed: false, foodAllowancePercentage: 0,
                            travelClaimed: false, travelAllowancePercentage: 0
                        };
                        if (allowType === 'house' || allowType === 'home') {
                            updateData.allowances.homeClaimed = true;
                            updateData.allowances.homeAllowancePercentage = allowPercent;
                        } else if (allowType === 'food') {
                            updateData.allowances.foodClaimed = true;
                            updateData.allowances.foodAllowancePercentage = allowPercent;
                        } else if (allowType === 'travel') {
                            updateData.allowances.travelClaimed = true;
                            updateData.allowances.travelAllowancePercentage = allowPercent;
                        }
                    }

                    const insPercent = parseFloat(String(getColVal('insurancePercentage') || '0').trim());
                    if (!isNaN(insPercent) && insPercent > 0) {
                        updateData.deductions = {
                            insuranceDeductionPercentage: insPercent
                        };
                    }

                    // Removed PAN, Aadhaar, UAN update logic

                    // Resolvable IDs
                    const desigId = findId('designation', designations, 'designationName') || findId('role', designations, 'designationName');
                    if (desigId) updateData.designationId = desigId;

                    const deptId = findId('department', departments, 'departmentName');
                    if (deptId) updateData.departmentId = deptId;

                    const shiftId = findId('shift', shifts, 'shiftName');
                    if (shiftId) updateData.shiftType = shiftId;

                    const repId = findId('reportingTo', reportingManagers, 'fullName');
                    if (repId) updateData.reportingToId = repId;

                    // Location Hierarchy
                    const locId = findId('location', locations, 'locationName');
                    if (locId) {
                        updateData.locationId = locId;
                        const location = locations.find(l => (l.id === locId || l._id === locId));
                        if (location && location.sites) {
                            const siteVal = getColVal('site');
                            if (siteVal) {
                                const site = location.sites.find((s: any) =>
                                    String(s.siteName || s.name || '').toLowerCase() === String(siteVal).toLowerCase().trim()
                                );
                                if (site) {
                                    updateData.siteId = site.id || site._id || site.name;
                                    const bldgVal = getColVal('building');
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

                    // Nested Objects: Address
                    const addrFields = ['addressLine1', 'addressLine2', 'city', 'state', 'country', 'pinCode'];
                    const hasAddress = addrFields.some(f => getColVal(f));
                    if (hasAddress) {
                        updateData.presentAddress = {
                            addressLine1: String(getColVal('addressLine1') || ''),
                            addressLine2: String(getColVal('addressLine2') || ''),
                            city: String(getColVal('city') || ''),
                            state: String(getColVal('state') || ''),
                            country: String(getColVal('country') || ''),
                            pinCode: String(getColVal('pinCode') || '')
                        };
                    }

                    // Nested Objects: Emergency Contact
                    const ecName = getColVal('emergencyContactName');
                    if (ecName) {
                        updateData.emergencyContact = {
                            contactName: String(ecName),
                            contactNumber: String(getColVal('emergencyContactNumber') || ''),
                            relation: String(getColVal('emergencyContactRelation') || '')
                        };
                    }

                    // Nested Objects: Bank Details
                    const bankName = getColVal('bankName');
                    if (bankName) {
                        updateData.bankDetails = {
                            bankName: String(bankName).trim(),
                            branchName: String(getColVal('branchName') || '').trim(),
                            accountNumber: String(getColVal('accountNumber') || '').trim(),
                            accountHolderName: String(getColVal('accountHolderName') || '').trim(),
                            ifscCode: String(getColVal('ifscCode') || '').trim(),
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
                    <div className="flex items-center justify-between min-w-[200px] max-w-3xl mx-auto relative px-4">
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
                                <div className="space-y-4 sm:space-y-6">
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

                                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-amber-500" />
                                            Import Type
                                        </h3>
                                        <div className="space-y-3 sm:space-y-4">
                                            {['new', 'existing'].map((type) => (
                                                <label key={type} className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${importType === type ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200'}`}>
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
                                        <div className="-m-6 sm:-m-16 absolute inset-0 bg-white/0 pointer-events-none" />
                                        <div className="border-2 border-dashed border-gray-200 rounded-3xl p-6 sm:p-16 text-center group-hover:border-blue-400 transition-all duration-300 bg-gray-50/50 group-hover:bg-blue-50/30">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                                            </div>
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Click to upload or drag and drop</h3>
                                            <p className="text-xs sm:text-sm text-gray-500">Excel or CSV files only (Max. 10MB)</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

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
                                                {getActiveFields().filter(f => columnMapping[f.key]).map(f => (
                                                    <th key={f.key} className="px-6 py-4 font-bold text-gray-600 whitespace-nowrap">{f.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {parsedData.slice(0, 10).map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50">
                                                    {getActiveFields().filter(f => columnMapping[f.key]).map(f => (
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

                    {/* Step 3: Import Success */}
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
