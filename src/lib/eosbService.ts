import axios from 'axios';
import { getApiUrl, getAuthToken } from './auth';

export interface EOSBData {
    id?: string;
    employeeId: string;
    organizationId: string;
    amount: number;
    type: string;
    status: string;
    calculationDate: string;
    notes?: string;
}

export const eosbService = {
    /**
     * Get EOSB by Employee ID
     */
    getByEmployeeId: async (orgId: string, employeeId: string) => {
        try {
            const token = getAuthToken();
            const apiUrl = getApiUrl();

            if (!token) {
                return { error: 'Not authenticated' };
            }

            // backend might not have this endpoint yet, so we fail safe
            try {
                const response = await axios.get(
                    `${apiUrl}/org/${orgId}/eosb/${employeeId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                return { data: response.data };
            } catch (innerError) {
                // If endpoint doesn't exist or fails, return null data to unblock UI
                return { data: null };
            }
        } catch (error: any) {
            console.error('Error fetching EOSB:', error);
            // Return null data instead of error to prevent UI crash
            return { data: null };
        }
    },

    /**
     * Create EOSB record
     */
    create: async (orgId: string, data: any) => {
        try {
            const token = getAuthToken();
            const apiUrl = getApiUrl();

            if (!token) {
                return { error: 'Not authenticated' };
            }

            const response = await axios.post(
                `${apiUrl}/org/${orgId}/eosb`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return { data: response.data };
        } catch (error: any) {
            console.error('Error creating EOSB:', error);
            return { error: error.response?.data?.error || error.message };
        }
    },

    /**
     * Update EOSB record
     */
    update: async (orgId: string, id: string, data: any) => {
        try {
            const token = getAuthToken();
            const apiUrl = getApiUrl();

            if (!token) {
                return { error: 'Not authenticated' };
            }

            const response = await axios.put(
                `${apiUrl}/org/${orgId}/eosb/${id}`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return { data: response.data };
        } catch (error: any) {
            console.error('Error updating EOSB:', error);
            return { error: error.response?.data?.error || error.message };
        }
    }
};
