import axios from './axios';
import { getApiUrl, getAuthToken, getOrgId } from './auth';
import type { Contract } from '@/types/contractTypes';

export const ContractService = {
    /**
     * Get the active contract for an employee
     * @param employeeNumber - The employee number
     * @returns The active contract or null
     */
    async getActiveContract(employeeNumber: string): Promise<Contract | null> {
        try {
            const apiUrl = getApiUrl();
            const orgId = getOrgId();
            const token = getAuthToken();

            if (!apiUrl || !orgId || !token || !employeeNumber) {
                throw new Error('Missing required parameters for contract fetch');
            }

            const response = await axios.get(
                `${apiUrl}/org/${orgId}/contracts/employee/${employeeNumber}/active`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return response.data.data || response.data;
        } catch (error: any) {
            // Return null if no contract found (404) or other errors
            if (error.response?.status === 404) {
                return null;
            }
            console.error('Error fetching active contract:', error);
            throw error;
        }
    },

    /**
     * Get all contracts for an employee
     * @param employeeNumber - The employee number
     * @returns Array of contracts
     */
    async getAllContracts(employeeNumber: string): Promise<Contract[]> {
        try {
            const apiUrl = getApiUrl();
            const orgId = getOrgId();
            const token = getAuthToken();

            if (!apiUrl || !orgId || !token || !employeeNumber) {
                throw new Error('Missing required parameters for contracts fetch');
            }

            const response = await axios.get(
                `${apiUrl}/org/${orgId}/contracts/employee/${employeeNumber}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return response.data.data || response.data || [];
        } catch (error: any) {
            console.error('Error fetching contracts:', error);
            return [];
        }
    },

    /**
     * Create a new contract for an employee
     * @param contractData - Contract details
     * @returns The created contract
     */
    async createContract(contractData: {
        employeeNumber: string;
        contractType: string;
        startDate: Date | string;
        endDate?: Date | string;
        basicSalary: number;
        allowances?: any;
        deductions?: any;
    }) {
        const apiUrl = getApiUrl();
        const orgId = getOrgId();
        const token = getAuthToken();

        const response = await axios.post(
            `${apiUrl}/org/${orgId}/contracts`,
            contractData,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        return response.data.data || response.data;
    },

    /**
     * Update an existing contract
     * @param contractId - The contract ID
     * @param contractData - Partial contract details to update
     * @returns The updated contract
     */
    async updateContract(contractId: string, contractData: Partial<Contract> & { basicSalary?: number }) {
        const apiUrl = getApiUrl();
        const orgId = getOrgId();
        const token = getAuthToken();

        if (!apiUrl || !orgId || !token || !contractId) {
            throw new Error('Missing required parameters for contract update');
        }

        const response = await axios.put(
            `${apiUrl}/org/${orgId}/contracts/${contractId}`,
            contractData,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        return response.data.data || response.data;
    }
};

export default ContractService;
