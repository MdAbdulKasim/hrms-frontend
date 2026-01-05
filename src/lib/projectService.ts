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

export interface Project {
  id?: string;
  name: string;
  description?: string;
  startDate?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  estimatedHours?: number;
  locationId?: string;
  departmentId?: string;
  organizationId?: string;
  createdBy?: any;
  createdAt?: string;
}

export interface ProjectResponse {
  success?: boolean;
  data?: Project | Project[];
  message?: string;
  error?: string;
}

export interface ProjectsListResponse {
  data?: Project[];
  page?: number;
  limit?: number;
  total?: number;
  error?: string;
}

export const projectService = {
  /**
   * Create a new project
   */
  async create(organizationId: string, data: {
    name: string;
    description?: string;
    startDate?: string;
    status?: string;
    estimatedHours?: number;
    locationId?: string;
    departmentId?: string;
  }): Promise<ProjectResponse> {
    try {
      const response = await api.post(
        `/org/${organizationId}/projects`,
        data
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create project',
      };
    }
  },

  /**
   * Get all projects
   */
  async getAll(
    organizationId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ProjectsListResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('q', search);

      const response = await api.get(
        `/org/${organizationId}/projects${params.toString() ? `?${params.toString()}` : ''}`
      );

      return {
        data: Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []),
        page: response.data.page || page,
        limit: response.data.limit || limit,
        total: response.data.total
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to fetch projects',
      };
    }
  },

  /**
   * Get a specific project by ID
   */
  async getById(organizationId: string, projectId: string): Promise<ProjectResponse> {
    try {
      const response = await api.get(
        `/org/${organizationId}/projects/${projectId}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch project',
      };
    }
  },

  /**
   * Update a project
   */
  async update(
    organizationId: string,
    projectId: string,
    data: Partial<Project>
  ): Promise<ProjectResponse> {
    try {
      const response = await api.put(
        `/org/${organizationId}/projects/${projectId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update project',
      };
    }
  },

  /**
   * Delete a project (admin only)
   */
  async delete(organizationId: string, projectId: string): Promise<{ message?: string; error?: string }> {
    try {
      const response = await api.delete(
        `/org/${organizationId}/projects/${projectId}`
      );
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to delete project',
      };
    }
  },
};

export default projectService;
