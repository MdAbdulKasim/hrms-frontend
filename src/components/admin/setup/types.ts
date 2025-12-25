// types.ts - Add these new interfaces

// Existing types...
export interface SetupStep {
  id: number;
  title: string;
  completed: boolean;
}

export interface OrganizationData {
  name: string;
  website: string;
  type: string;
  contactPerson: string;
  contactNumber: string;
  contactEmail: string;
  address: string;
  logoUrl?: string; // Added to support potential future logo handling
}

export interface Location {
  id: string;
  name: string;
  code: string;
  organizationId?: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  state: string;
  postalCode: string;
  timeZone: string;
}

export interface Department {
  id: string;
  departmentName: string;
  code: string;
  organizationId: string;
  locationId: string;
}

export interface Designation {
  id: string;
  name: string;
  code: string;
  description: string;
  organizationId: string;
  locationId: string;
  departmentId: string;
}

// NEW: Employee Setup Types
export interface EmployeePersonalDetails {
  // From Admin (Disabled)
  fullName: string;
  email: string;
  mobileNumber: string;
  role: string;
  department: string;
  reportingTo: string;
  teamPosition: string;
  shift: string;
  location: string;
  timeZone: string;

  // Employee Fills
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  bloodGroup: string;
}

export interface EmployeeContactDetails {
  presentAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  permanentAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  sameAsPresent: boolean;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactNumber: string;
}

export interface EmployeeIdentityInfo {
  uan: string;
  pan: string;
  aadhar: string;
  passport: string;
  drivingLicense: string;
}

export interface WorkExperience {
  id: string;
  companyName: string;
  jobTitle: string;
  fromDate: string;
  toDate: string;
  currentlyWorking: boolean;
  jobDescription: string;
}

export interface Education {
  id: string;
  instituteName: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
}

export interface EmployeeSetupData {
  personalDetails: EmployeePersonalDetails;
  contactDetails: EmployeeContactDetails;
  identityInfo: EmployeeIdentityInfo;
  workExperience: WorkExperience[];
  education: Education[];
  allStepsCompleted?: boolean;
  completedAt?: string;
}