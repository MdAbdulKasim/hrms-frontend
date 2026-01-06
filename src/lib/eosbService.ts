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

            // Assuming endpoint is merged under employee route as per typical controller structure
            // or mounted under org/eosb by convention.
            // Based on controller comment: // GET /org/:organizationId/employees/:employeeId/eosb
            // And route: router.get("/:employeeId")
            // This implies mounting at /org/:organizationId/employees
            // Wait, if mounted at .../employees, then the route would be just /eosb
            // But user passed router.get("/:employeeId"). 
            // Re-evaluating: If mounted at /org/:organizationId/eosb, then request is /org/1/eosb/emp1.

            // Let's try the path that matches the controller arg /:employeeId
            const response = await axios.get(
                `${apiUrl}/org/${orgId}/eosb/${employeeId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return { data: response.data };
        } catch (error: any) {
            if (error.response?.status === 404) {
                return { data: null }; // No record found is not an error for our logic
            }
            console.error('Error fetching EOSB:', error);
            return { error: error.response?.data?.error || error.message };
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
