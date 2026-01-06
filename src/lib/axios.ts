
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getApiUrl, getAuthToken, clearSetupData } from './auth';

// Create a custom axios instance
const axiosInstance: AxiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAuthToken();
        const apiUrl = getApiUrl();

        // If the URL is relative, prepend the API URL
        if (config.url && !config.url.startsWith('http') && !config.baseURL) {
            config.baseURL = apiUrl;
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401
axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            console.warn('Axios Interceptor: 401 Unauthorized detected. Redirecting to login...');

            // Clear all auth data
            clearSetupData();

            // Redirect to login page
            if (typeof window !== 'undefined') {
                // Determine if it was an admin or employee trying to access
                // This is a rough guess, ideally we'd check the current protected route
                const isEmployeePortal = window.location.pathname.includes('/my-space');

                if (isEmployeePortal) {
                    window.location.href = '/auth/login';
                } else {
                    window.location.href = '/auth/login'; // Default for admins too
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
