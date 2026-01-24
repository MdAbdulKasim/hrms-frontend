export interface FormData {
    // Personal Details
    fullName: string
    employeeNumber: string
    emailAddress: string
    mobileNumber: string
    role: string
    department: string
    designation: string
    reportingTo: string
    teamPosition: string
    shift: string
    location: string
    site: string
    building: string
    timeZone: string
    dateOfBirth: string
    gender: string
    maritalStatus: string
    bloodGroup: string
    empType: string
    employeeStatus: string
    dateOfJoining: string

    // Contract Details
    contractType: string
    contractStartDate: string
    contractEndDate: string

    // Identity Information
    uid: string
    uidDocUrl?: string
    labourNumber: string
    labourNumberDocUrl?: string
    eidNumber: string
    eidNumberDocUrl?: string
    visaNumber: string
    visaNumberDocUrl?: string
    iban: string
    ibanDocUrl?: string
    passportNumber: string
    passportDocUrl?: string
    drivingLicenseNumber: string
    drivingLicenseDocUrl?: string
    iqamaId: string
    iqamaCopyUrl?: string

    // Salary & Bank Details
    basicSalary: string
    bankDetails: {
        bankName: string
        branchName: string
        accountNumber: string
        accountHolderName: string
        ifscCode: string
    }

    // Work Experience
    workExperience: Array<{
        companyName: string
        jobTitle: string
        fromDate: string
        toDate: string
        currentlyWorkHere: boolean
        jobDescription: string
        documentUrl?: string
    }>

    // Contact Information
    address: {
        addressLine1: string
        addressLine2: string
        city: string
        state: string
        country: string
        pinCode: string
    }
    emergencyContact: {
        contactName: string
        relation: string
        contactNumber: string
    }

    // Education
    education: Array<{
        instituteName: string
        degree: string
        fieldOfStudy: string
        startYear: string
        endYear: string
        documentUrl?: string
    }>
}

export const initialFormData: FormData = {
    fullName: "",
    employeeNumber: "",
    emailAddress: "",
    mobileNumber: "",
    role: "",
    department: "",
    designation: "",
    reportingTo: "",
    teamPosition: "",
    shift: "",
    location: "",
    site: "",
    building: "",
    timeZone: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    bloodGroup: "",
    empType: "",
    employeeStatus: "",
    dateOfJoining: "",
    contractType: "",
    contractStartDate: "",
    contractEndDate: "",
    uid: "",
    uidDocUrl: "",
    labourNumber: "",
    labourNumberDocUrl: "",
    eidNumber: "",
    eidNumberDocUrl: "",
    visaNumber: "",
    visaNumberDocUrl: "",
    iban: "",
    ibanDocUrl: "",
    passportNumber: "",
    passportDocUrl: "",
    drivingLicenseNumber: "",
    drivingLicenseDocUrl: "",
    iqamaId: "",
    iqamaCopyUrl: "",
    basicSalary: "",
    bankDetails: {
        bankName: "",
        branchName: "",
        accountNumber: "",
        accountHolderName: "",
        ifscCode: ""
    },
    workExperience: [],
    address: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        country: "",
        pinCode: "",
    },
    emergencyContact: {
        contactName: "",
        relation: "",
        contactNumber: "",
    },
    education: [],
}
