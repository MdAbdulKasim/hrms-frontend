// types.ts
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
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Location {
  id: string;
  locationName: string;
  locationCode: string;
  mailAlias: string;
  description: string;
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
  name: string;
  code: string;
  associatedUsers: number;
  mailAlias: string;
  departmentLead: string;
  parentDepartment: string;
}

export interface Designation {
  id: string;
  name: string;
  code: string;
  description: string;
}