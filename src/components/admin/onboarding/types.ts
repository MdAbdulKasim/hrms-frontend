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
}

export interface CandidateForm {
    fullName: string;
    email: string;
    phoneNumber: string;
    role: string; // The UI might still call it role, but we'll use it for the API payload
    departmentId: string;
    designationId: string;
    locationId: string;
    reportingToId: string;
    teamPosition: 'member' | 'lead';
    shiftType: string;
    timeZone: string;
    empType: string;
    // Keep internal UI helper fields if needed
    mobileNumber?: string;
    employeeType?: string;
    employeeStatus?: string;
}

export type OnboardingView = 'list' | 'addCandidate' | 'bulkImport' | 'viewCandidate';
