export interface FormData {
    // Personal Details
    fullName: string
    emailAddress: string
    mobileNumber: string
    role: string
    department: string
    designation: string
    reportingTo: string
    teamPosition: string
    shift: string
    location: string
    timeZone: string
    dateOfBirth: string
    gender: string
    maritalStatus: string
    bloodGroup: string

    // Identity Information
    uan: string
    uanDocUrl?: string
    pan: string
    panDocUrl?: string
    aadhaarNumber: string
    aadhaarDocUrl?: string
    passportNumber: string
    passportDocUrl?: string
    drivingLicenseNumber: string
    drivingLicenseDocUrl?: string

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
    presentAddress: {
        addressLine1: string
        addressLine2: string
        city: string
        state: string
        country: string
        pinCode: string
    }
    sameAsPresentAddress: boolean
    permanentAddress: {
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
    emailAddress: "",
    mobileNumber: "",
    role: "",
    department: "",
    designation: "",
    reportingTo: "",
    teamPosition: "",
    shift: "",
    location: "",
    timeZone: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    bloodGroup: "",
    uan: "",
    uanDocUrl: "",
    pan: "",
    panDocUrl: "",
    aadhaarNumber: "",
    aadhaarDocUrl: "",
    passportNumber: "",
    passportDocUrl: "",
    drivingLicenseNumber: "",
    drivingLicenseDocUrl: "",
    workExperience: [],
    presentAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        country: "",
        pinCode: "",
    },
    sameAsPresentAddress: false,
    permanentAddress: {
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
