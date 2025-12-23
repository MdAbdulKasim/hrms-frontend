// types.ts
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  department: string;
  designation: string;
  zohoRole: string;
  employmentType: string;
  employeeStatus: string;
  sourceOfHire: string;
  dateOfJoining: string;
  currentExperience: string;
  totalExperience: string;
  location?: string;
  reportingManager: string;
  workPhone: string;
  personalMobile: string;
  extension: string;
  seatingLocation: string;
  shift: string;
  shiftTiming: string;
  presentAddress: string;
  permanentAddress?: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  maritalStatus: string;
  uan?: string;
  pan?: string;
  aadhaar?: string;
  profileImage?: string;
  checkInStatus: string;
}

export interface Education {
  instituteName: string;
  degree: string;
  specialization: string;
  dateOfCompletion?: string;
}

export interface WorkExperience {
  companyName: string;
  jobTitle: string;
  fromDate: string;
  toDate: string;
  jobDescription: string;
  relevant: boolean;
}

export interface Dependent {
  name: string;
  relationship: string;
  dateOfBirth: string;
}

export interface LeaveBalance {
  type: string;
  available: number;
  booked: number;
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'weekend' | 'holiday';
  checkIn?: string;
  checkOut?: string;
  hoursWorked: string;
}

export interface Peer {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  profileImage?: string;
  checkInStatus: string;
}