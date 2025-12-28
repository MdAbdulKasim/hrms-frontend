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

export interface QuickLink {
  id?: string;
  name: string;
  title?: string;
  url: string;
  icon?: string;
}

export interface QuickLinkResponse {
  success?: boolean;
  data?: QuickLink | QuickLink[];
  message?: string;
  error?: string;
}

export interface QuickLinksListResponse {
  data?: QuickLink[];
  page?: number;
  limit?: number;
  total?: number;
  error?: string;
}

export const quickLinkService = {
  /**
   * Create a new quick link (admin only)
   */
  async create(organizationId: string, data: { name: string; url: string }): Promise<QuickLinkResponse> {
    try {
      const response = await api.post(
        `/org/${organizationId}/quick-links`,
        data
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create quick link',
      };
    }
  },

  /**
   * Get all quick links for the organization
   */
  async getAll(
    organizationId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<QuickLinksListResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('q', search);

      const response = await api.get(
        `/org/${organizationId}/quick-links${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      return {
        data: Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []),
        page: response.data.page || page,
        limit: response.data.limit || limit,
        total: response.data.total
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to fetch quick links',
      };
    }
  },
};

export default quickLinkService;
