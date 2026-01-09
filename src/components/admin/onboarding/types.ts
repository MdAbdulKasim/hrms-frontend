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
    // panCard: string;
    // aadhaar: string;
    // uan: string;
    fullName?: string;
    employeeNumber?: string;
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
    // Contract Details
    contractStartDate?: string;
    contractEndDate?: string;
    contractType?: string;
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
}

export type OnboardingView = 'list' | 'addCandidate' | 'bulkImport' | 'viewCandidate' | 'editCandidate';
