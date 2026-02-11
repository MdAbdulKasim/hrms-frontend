export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    emailId: string;
    officialEmail: string;
    onboardingStatus: string;
    department: string;
    designation?: string;
    location?: string;
    phoneNumber?: string;
    dateOfJoining?: string;
    sourceOfHire: string;
    fullName?: string;
    employeeNumber?: string;
    // Additional fields for export/UI
    mobileNumber?: string;
    email?: string;
    departmentId?: string;
    designationId?: string;
    locationId?: string;
    siteId?: string;
    buildingId?: string;
    reportingToId?: string;
    empType?: string;
    status?: string;
    shiftType?: string;
    contractType?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    timeZone?: string;
    basicSalary?: string;
    allowances?: any;
    deductions?: any;
    bankDetails?: any;
    insuranceType?: string;
    insurancePercentage?: number;
    accommodationAllowances?: AccommodationAllowance[];
    insurances?: Insurance[];
    bankName?: string;
    branchName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    ifscCode?: string;
    contractDocumentUrls?: string[];
}

export interface AccommodationAllowance {
    type: string; // 'food' | 'travel' | 'house'
    percentage: string;
}
export interface Insurance {
    type: string; // 'life' | 'health' | 'accident'
    percentage: string;
}

export interface BankDetails {
    bankName: string;
    branchName: string;
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
}

export interface Education {
    instituteName: string;
    degree: string;
    fieldOfStudy: string;
    startYear: string;
    endYear: string;
}

export interface WorkExperience {
    companyName: string;
    jobTitle: string;
    fromDate: string;
    toDate: string;
    currentlyWorking: boolean;
    jobDescription: string;
}

export interface CandidateForm {
    id?: string;
    _id?: string;
    employeeNumber?: string; // Auto-generated employee ID (e.g., EMP 001)
    fullName: string;
    email: string;
    phoneNumber: string;
    role: string; // The UI might still call it role, but we'll use it for the API payload
    departmentId: string;
    designationId: string;
    locationId: string;
    reportingToId: string;
    dateOfJoining: string;
    shiftType: string;
    timeZone: string;
    empType: string;
    siteId?: string;
    buildingId?: string;
    teamPosition?: string;
    // Contract Details
    contractId?: string; // To track existing contract for updates
    contractStartDate?: string;
    contractEndDate?: string;
    contractType?: string;
    candidateSource?: 'Employee Reference' | 'Walk-in' | 'Website' | 'LinkedIn' | 'Job Portal' | 'Other';
    referredById?: string;
    sourceSummary?: string;
    // Contractor Details (for external contractor management)
    contractorName?: string;
    contractDocumentUrl?: string;
    contractorId?: string; // To link with an existing contractor record
    contractDocuments?: File[]; // Multiple contract document uploads
    referenceAmount?: string; // One-time bonus for employee referral
    // Compensation & Benefits
    basicSalary: string;
    accommodationAllowances: AccommodationAllowance[];
    insurances: Insurance[];
    // Bank Details
    bankDetails: BankDetails;
    // Personal Details
    gender?: string;
    maritalStatus?: string;
    dateOfBirth?: string;
    bloodGroup?: string;
    // Identity Information
    // Identity Information
    uid?: string;
    labourNumber?: string;
    eid?: string;
    visaNumber?: string;
    passportNumber?: string;
    drivingLicenseNumber?: string;
    iqamaId?: string;
    iban?: string;
    // Identity Document Copies (File names or Keys from API)
    passportCopy?: string | File | null;
    emiratesIdCopy?: string | File | null;
    visaCopy?: string | File | null;
    labourCardCopy?: string | File | null;
    drivingLicenseCopy?: string | File | null;
    uidCopy?: string | File | null;
    iqamaCopy?: string | File | null;
    ibanCopy?: string | File | null;
    profilePicture?: string | File | null;
    // Address Information
    presentAddress?: {
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        country: string;
        pinCode: string;
    };
    permanentAddress?: {
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        country: string;
        pinCode: string;
    };
    // Emergency Contact
    emergencyContact?: {
        contactName: string;
        relation: string;
        contactNumber: string;
    };
    // Education & Experience
    education?: Education[];
    experience?: WorkExperience[];
    // Keep internal UI helper fields if needed
    mobileNumber?: string;
    employeeType?: string;
    employeeStatus?: string;
    contractDocumentUrls?: string[];
}

export type OnboardingView = 'list' | 'addCandidate' | 'bulkImport' | 'viewCandidate' | 'editCandidate';
