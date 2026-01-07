import axiosInstance from './axios';
import { getApiUrl, getAuthToken, getOrgId } from './auth';

const api = axiosInstance;

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
  async checkIn(organizationId: string, checkInTime?: string): Promise<AttendanceResponse> {
    try {
      const payload: { checkInTime?: string } = {};
      if (checkInTime) {
        payload.checkInTime = checkInTime;
      }
      const response = await api.post(
        `/org/${organizationId}/attendence/check-in`,
        Object.keys(payload).length > 0 ? payload : undefined
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
  async checkOut(organizationId: string, checkOutTime?: string): Promise<AttendanceResponse> {
    try {
      const payload: { checkOutTime?: string } = {};
      if (checkOutTime) {
        payload.checkOutTime = checkOutTime;
      }
      const response = await api.post(
        `/org/${organizationId}/attendence/check-out`,
        Object.keys(payload).length > 0 ? payload : undefined
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
        `/org/${organizationId}/attendence/my-status`
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
        `/org/${organizationId}/attendence/my-history${params.toString() ? `?${params.toString()}` : ''}`
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
        `/org/${organizationId}/attendence/admin/daily${params.toString() ? `?${params.toString()}` : ''}`
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
        `/org/${organizationId}/attendence/admin/search${params.toString() ? `?${params.toString()}` : ''}`
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
        `/org/${organizationId}/attendence/admin/employee/${employeeId}${params.toString() ? `?${params.toString()}` : ''}`
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
        `/org/${organizationId}/attendence/admin/all`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch all attendance',
      };
    }
  },

  /**
   * Admin/Manager check-in for a specific employee
   */
  async adminCheckIn(
    organizationId: string,
    employeeId: string,
    checkInTime?: string // Expected as ISO string or valid date string
  ): Promise<AttendanceResponse> {
    try {
      const response = await api.post(
        `/org/${organizationId}/attendence/manager-checkin`,
        { employeeId, checkInTime }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to check in employee',
      };
    }
  },

  /**
   * Admin/Manager check-out for a specific employee
   */
  async adminCheckOut(
    organizationId: string,
    employeeId: string,
    checkOutTime?: string // Expected as ISO string or valid date string
  ): Promise<AttendanceResponse> {
    try {
      const response = await api.post(
        `/org/${organizationId}/attendence/manager-checkout`,
        { employeeId, checkOutTime }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to check out employee',
      };
    }
  },

  /**
   * Bulk check-in by manager
   */
  async bulkCheckIn(
    organizationId: string,
    employeeIds: string[],
    checkInTime: string
  ): Promise<AttendanceResponse> {
    try {
      console.log('Bulk check-in request:', { organizationId, employeeIds, checkInTime });
      const response = await api.post(
        `/org/${organizationId}/attendence/bulk-manager-checkin`,
        { employeeIds, checkInTime }
      );
      return response.data;
    } catch (error: any) {
      console.error('Bulk check-in error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        headers: error.response?.headers
      });
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.message || 'Bulk check-in failed',
      };
    }
  },

  /**
   * Bulk check-out by manager
   */
  async bulkCheckOut(
    organizationId: string,
    employeeIds: string[],
    checkOutTime: string
  ): Promise<AttendanceResponse> {
    try {
      const response = await api.post(
        `/org/${organizationId}/attendence/bulk-manager-checkout`,
        { employeeIds, checkOutTime }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Bulk check-out failed',
      };
    }
  },

  /**
   * Get pending check-ins
   */
  async getPendingCheckIns(
    organizationId: string,
    date?: string,
    includeAll: boolean = false
  ): Promise<AttendanceResponse> {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (includeAll) params.append('includeAll', 'true');

      const response = await api.get(
        `/org/${organizationId}/attendence/pending-checkins${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch pending check-ins',
      };
    }
  },
};

export default attendanceService;
