import axios from 'axios';
import { getApiUrl, getAuthToken } from './auth';

const api = axios.create({
  baseURL: getApiUrl(),
});

// Interceptor to add auth token to every request
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/* =======================
   Types
======================= */

export interface LeaveRecord {
  id?: string;
  employeeId?: string;
  employeeName?: string;
  leaveTypeCode: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: 'approved' | 'rejected' | 'pending';
  reason?: string;
}

export interface LeaveType {
  code: string;
  name: string;
  maxDays?: number;
}

export interface LeaveResponse {
  success?: boolean;
  data?: LeaveRecord | LeaveRecord[] | LeaveType[];
  message?: string;
  error?: string;
}

/* =======================
   Service
======================= */

export const leaveService = {
  /**
   * Apply for leave
   */
  async applyLeave(
    organizationId: string,
    payload: {
      leaveTypeCode: string;
      startDate: string;
      endDate: string;
      reason?: string;
      dayType?: string;
    }
  ): Promise<LeaveResponse> {
    try {
      const response = await api.post(
        `/org/${organizationId}/leaves/apply`,
        payload
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Leave application failed',
      };
    }
  },

  /**
   * Get my leave history
   */
  async getMyHistory(
    organizationId: string
  ): Promise<LeaveResponse> {
    try {
      const response = await api.get(
        `/org/${organizationId}/leaves/my-history`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to fetch leave history',
      };
    }
  },

  /**
   * Get pending leave requests (manager/admin)
   */
  async getPendingLeaves(
    organizationId: string
  ): Promise<LeaveResponse> {
    try {
      const response = await api.get(
        `/org/${organizationId}/leaves/pending`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to fetch pending leaves',
      };
    }
  },

  /**
   * Approve / Reject leave
   */
  async updateLeaveStatus(
    organizationId: string,
    leaveRequestId: string,
    payload: {
      status: 'approved' | 'rejected';
      rejectionReason?: string;
    }
  ): Promise<LeaveResponse> {
    try {
      const response = await api.put(
        `/org/${organizationId}/leaves/${leaveRequestId}/status`,
        payload
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to update leave status',
      };
    }
  },

  /**
   * Get available leave types
   */
  async getLeaveTypes(
    organizationId: string
  ): Promise<LeaveResponse> {
    try {
      const response = await api.get(
        `/org/${organizationId}/leaves/types`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to fetch leave types',
      };
    }
  },

  /**
   * Get all leave records (admin report)
   * UPDATED: Now uses /admin/all endpoint
   */
  async getLeaveReport(
    organizationId: string
  ): Promise<LeaveResponse> {
    try {
      const response = await api.get(
        `/org/${organizationId}/leaves/admin/all`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to fetch leave report',
      };
    }
  },
};

export default leaveService;