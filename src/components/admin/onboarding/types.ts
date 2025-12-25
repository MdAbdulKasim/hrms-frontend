export interface Employee {
    id: number;
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
    role: string;
    reportingTo: string;
    department: string;
    teamPosition: string;
    shift: string;
    location: string;
    timeZone: string;
    mobileNumber: string;
    employeeType: string;
    employeeStatus: string;
}

export type OnboardingView = 'list' | 'addCandidate' | 'bulkImport';
