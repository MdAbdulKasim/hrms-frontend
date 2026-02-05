import axios from './axios';
import { getApiUrl, getAuthToken, getOrgId } from './auth';

export interface Contractor {
    id?: string;
    contractorName: string;
    organizationId: string;
    startDate?: Date | string;
    endDate: Date | string;
    contractDocumentUrl?: string;
    status?: 'active' | 'expired' | 'terminated' | 'extended';
    createdAt?: Date;
    updatedAt?: Date;
}

export const ContractorService = {
    /**
     * Create a new contractor
     * @param contractorData - Contractor details
     * @returns The created contractor
     */
    async createContractor(contractorData: FormData | {
        contractorName: string;
        startDate?: Date | string;
        endDate: Date | string;
        contractDocumentUrl?: string;
    }): Promise<Contractor> {
        const apiUrl = getApiUrl();
        const orgId = getOrgId();
        const token = getAuthToken();

        if (!apiUrl || !orgId || !token) {
            throw new Error('Missing required parameters for contractor creation');
        }

        const isFormData = contractorData instanceof FormData;
        const headers: any = { Authorization: `Bearer ${token}` };

        if (isFormData) {
            headers['Content-Type'] = 'multipart/form-data';
        }

        const response = await axios.post(
            `${apiUrl}/org/${orgId}/contractors`,
            contractorData,
            { headers }
        );

        return response.data.data || response.data;
    },

    /**
     * Get all contractors for the organization
     * @returns Array of contractors
     */
    async getAllContractors(): Promise<Contractor[]> {
        const apiUrl = getApiUrl();
        const orgId = getOrgId();
        const token = getAuthToken();

        if (!apiUrl || !orgId || !token) {
            throw new Error('Missing required parameters for contractors fetch');
        }

        const response = await axios.get(
            `${apiUrl}/org/${orgId}/contractors`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        return response.data.data || response.data || [];
    },

    /**
     * Update an existing contractor
     * @param contractorId - The contractor ID
     * @param contractorData - Partial contractor details to update
     * @returns The updated contractor
     */
    async updateContractor(contractorId: string, contractorData: FormData | Partial<Contractor>): Promise<Contractor> {
        const apiUrl = getApiUrl();
        const orgId = getOrgId();
        const token = getAuthToken();

        if (!apiUrl || !orgId || !token || !contractorId) {
            throw new Error('Missing required parameters for contractor update');
        }

        const isFormData = contractorData instanceof FormData;
        const headers: any = { Authorization: `Bearer ${token}` };

        if (isFormData) {
            headers['Content-Type'] = 'multipart/form-data';
        }

        const response = await axios.put(
            `${apiUrl}/org/${orgId}/contractors/${contractorId}`,
            contractorData,
            { headers }
        );

        return response.data.data || response.data;
    }
};

export default ContractorService;
