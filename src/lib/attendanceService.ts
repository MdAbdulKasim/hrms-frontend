import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from './auth';

const api = axios.create({
  baseURL: getApiUrl(),
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AttendanceRecord {
  id?: string;
  employeeId?: string;
  date?: string;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: string;
  status?: 'Present' | 'Late' | 'Leave' | 'Weekend' | 'Absent';
}

export interface AttendanceResponse {
  success?: boolean;
  data?: AttendanceRecord | AttendanceRecord[];
  message?: string;
  error?: string;
}

export const attendanceService = {
  /**
   * Check in for the day
   */
  async checkIn(organizationId: string): Promise<AttendanceResponse> {
    try {
      const response = await api.post(
        `/org/${organizationId}/attendance/check-in`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Check-in failed',
      };
    }
  },

  /**
   * Check out from work
   */
  async checkOut(organizationId: string): Promise<AttendanceResponse> {
    try {
      const response = await api.post(
        `/org/${organizationId}/attendance/check-out`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Check-out failed',
      };
    }
  },

  /**
   * Get current attendance status for today
   */
  async getStatus(organizationId: string): Promise<AttendanceResponse> {
    try {
      const response = await api.get(
        `/org/${organizationId}/attendance/my-status`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch status',
      };
    }
  },

  /**
   * Get personal attendance history
   */
  async getMyHistory(
    organizationId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceResponse> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(
        `/org/${organizationId}/attendance/my-history${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch history',
      };
    }
  },

  /**
   * Get daily attendance for all employees (admin only)
   */
  async getDailyAttendance(
    organizationId: string,
    date?: string
  ): Promise<AttendanceResponse> {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);

      const response = await api.get(
        `/org/${organizationId}/attendance/admin/daily${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch daily attendance',
      };
    }
  },

  /**
   * Search attendance records (admin only)
   */
  async searchAttendance(
    organizationId: string,
    query?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceResponse> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(
        `/org/${organizationId}/attendance/admin/search${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to search attendance',
      };
    }
  },

  /**
   * Get employee attendance history (admin only)
   */
  async getEmployeeHistory(
    organizationId: string,
    employeeId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceResponse> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(
        `/org/${organizationId}/attendance/admin/employee/${employeeId}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch employee history',
      };
    }
  },

  /**
   * Get all attendance records for the organization (admin only)
   */
  async getAllAttendance(
    organizationId: string
  ): Promise<AttendanceResponse> {
    try {
      const response = await api.get(
        `/org/${organizationId}/attendance/admin/all`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch all attendance',
      };
    }
  },
};

export default attendanceService;
