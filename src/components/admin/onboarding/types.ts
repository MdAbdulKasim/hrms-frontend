export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    emailId: string;
    officialEmail: string;
    onboardingStatus: string;
    department: string;
    sourceOfHire: string;
    panCard: string;
    aadhaar: string;
    uan: string;
    fullName?: string;
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
    employeeId?: string; // Auto-generated employee ID (e.g., EMP 001)
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
    // Compensation & Benefits
    basicSalary: string;
    accommodationAllowances: AccommodationAllowance[];
    insurances: Insurance[];
    // Bank Details
    bankDetails: BankDetails;
    // Keep internal UI helper fields if needed
    mobileNumber?: string;
    employeeType?: string;
    employeeStatus?: string;
}

export type OnboardingView = 'list' | 'addCandidate' | 'bulkImport' | 'viewCandidate' | 'editCandidate';
