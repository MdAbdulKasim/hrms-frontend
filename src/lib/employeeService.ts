import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from './auth';

export interface EmployeeUpdateData {
  // Basic Info
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: 'admin' | 'employee';
  profilePicUrl?: string;
  
  // Personal Info
  bloodGroup?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  maritalStatus?: 'single' | 'married';
  
  // Present Address
  presentAddressLine1?: string;
  presentAddressLine2?: string;
  presentCity?: string;
  presentState?: string;
  presentCountry?: string;
  presentPinCode?: string;
  
  // Permanent Address
  permanentAddressLine1?: string;
  permanentAddressLine2?: string;
  permanentCity?: string;
  permanentState?: string;
  permanentCountry?: string;
  permanentPinCode?: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactNumber?: string;
  
  // Work Info
  empType?: 'permanent' | 'temporary';
  shiftType?: 'morning' | 'evening' | 'night';
  timeZone?: string;
  status?: string;
  teamPosition?: 'lead' | 'member';
  dateOfJoining?: string;
  
  // Identity Documents
  UAN?: string;
  PAN?: string;
  aadharNumber?: string;
  passportNumber?: string;
  drivingLicenseNumber?: string;
  
  // Experience & Education
  experience?: Array<{
    company: string;
    designation: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    specialization?: string;
    startDate: string;
    endDate?: string;
  }>;
  
  // Relationships
  departmentId?: string;
  designationId?: string;
  locationId?: string;
  reportingToId?: string;
}

const employeeService = {
  /**
   * Get all employees for the organization
   */
  getAll: async (orgId: string, params?: { page?: number; limit?: number; q?: string }) => {
    try {
      const token = getAuthToken();
      const apiUrl = getApiUrl();
      
      if (!token) {
        return { error: 'Not authenticated' };
      }

      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.q) queryParams.append('q', params.q);

      const response = await axios.get(
        `${apiUrl}/org/${orgId}/employees${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return { data: response.data.data || response.data };
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      return { error: error.response?.data?.error || error.message };
    }
  },

  /**
   * Get employee by ID
   */
  getById: async (orgId: string, employeeId: string) => {
    try {
      const token = getAuthToken();
      const apiUrl = getApiUrl();
      
      if (!token) {
        return { error: 'Not authenticated' };
      }

      const response = await axios.get(
        `${apiUrl}/org/${orgId}/employees/${employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return { data: response.data.data || response.data };
    } catch (error: any) {
      console.error('Error fetching employee:', error);
      return { error: error.response?.data?.error || error.message };
    }
  },

  /**
   * Update employee details
   */
  update: async (orgId: string, employeeId: string, updateData: EmployeeUpdateData) => {
    try {
      const token = getAuthToken();
      const apiUrl = getApiUrl();
      
      if (!token) {
        return { error: 'Not authenticated' };
      }

      const response = await axios.put(
        `${apiUrl}/org/${orgId}/employees/${employeeId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return { data: response.data.data || response.data };
    } catch (error: any) {
      console.error('Error updating employee:', error);
      return { error: error.response?.data?.error || error.message };
    }
  },

  /**
   * Update employee with profile picture (uses FormData)
   */
  updateWithProfilePic: async (orgId: string, employeeId: string, updateData: EmployeeUpdateData, profilePic?: File) => {
    try {
      const token = getAuthToken();
      const apiUrl = getApiUrl();
      
      if (!token) {
        return { error: 'Not authenticated' };
      }

      const formData = new FormData();
      
      // Add profile picture if provided
      if (profilePic) {
        formData.append('profilePic', profilePic);
      }
      
      // Add other fields to FormData
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await axios.put(
        `${apiUrl}/org/${orgId}/employees/${employeeId}`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      return { data: response.data.data || response.data };
    } catch (error: any) {
      console.error('Error updating employee with profile pic:', error);
      return { error: error.response?.data?.error || error.message };
    }
  },

  /**
   * Delete employee
   */
  delete: async (orgId: string, employeeId: string) => {
    try {
      const token = getAuthToken();
      const apiUrl = getApiUrl();
      
      if (!token) {
        return { error: 'Not authenticated' };
      }

      const response = await axios.delete(
        `${apiUrl}/org/${orgId}/employees/${employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return { data: response.data };
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      return { error: error.response?.data?.error || error.message };
    }
  },

  /**
   * Get employee profile picture URL
   */
  getProfilePic: async (orgId: string, employeeId: string) => {
    try {
      const token = getAuthToken();
      const apiUrl = getApiUrl();
      
      if (!token) {
        return { error: 'Not authenticated' };
      }

      const response = await axios.get(
        `${apiUrl}/org/${orgId}/employees/${employeeId}/profile-pic`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return { data: response.data };
    } catch (error: any) {
      console.error('Error fetching profile pic:', error);
      return { error: error.response?.data?.error || error.message };
    }
  }
};

export default employeeService;
