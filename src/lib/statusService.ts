import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from './auth';

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

export interface Status {
  id?: string;
  content?: string;
  title?: string;
  text?: string;
  createdBy?: any;
  createdAt?: string;
  updatedAt?: string;
  locationId?: string;
}

export interface StatusReply {
  id?: string;
  content?: string;
  text?: string;
  statusId?: string;
  createdBy?: any;
  createdAt?: string;
}

export interface StatusResponse {
  success?: boolean;
  data?: Status | Status[];
  message?: string;
  error?: string;
}

export interface RepliesResponse {
  success?: boolean;
  data?: StatusReply | StatusReply[];
  message?: string;
  error?: string;
}

export interface StatusListResponse {
  data?: Status[];
  page?: number;
  limit?: number;
  total?: number;
  error?: string;
}

export const statusService = {
  /**
   * Create a new status (requires locationId)
   */
  async createStatus(
    organizationId: string,
    locationId: string,
    data: { content?: string; title?: string; text?: string }
  ): Promise<StatusResponse> {
    try {
      const response = await api.post(
        `/org/${organizationId}/locations/${locationId}/statuses`,
        data
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create status',
      };
    }
  },

  /**
   * Get statuses for a location
   */
  async getStatuses(
    organizationId: string,
    locationId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<StatusListResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('q', search);

      const response = await api.get(
        `/org/${organizationId}/locations/${locationId}/statuses${params.toString() ? `?${params.toString()}` : ''}`
      );

      return {
        data: Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []),
        page: response.data.page || page,
        limit: response.data.limit || limit,
        total: response.data.total
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to fetch statuses',
      };
    }
  },

  /**
   * Reply to a status
   */
  async createReply(
    organizationId: string,
    locationId: string,
    statusId: string,
    data: { content?: string; text?: string }
  ): Promise<RepliesResponse> {
    try {
      const response = await api.post(
        `/org/${organizationId}/locations/${locationId}/statuses/${statusId}/reply`,
        data
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create reply',
      };
    }
  },

  /**
   * Get replies for a status
   */
  async getReplies(
    organizationId: string,
    locationId: string,
    statusId: string
  ): Promise<RepliesResponse> {
    try {
      const response = await api.get(
        `/org/${organizationId}/locations/${locationId}/statuses/${statusId}/replies`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch replies',
      };
    }
  },
};

export default statusService;
