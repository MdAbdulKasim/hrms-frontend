export type ContractType = 'permanent' | 'temporary' | 'probation' | 'freelance';

export interface Contract {
    id: string;
    employeeNumber: string;
    contractType: ContractType;
    startDate: string | Date;
    endDate: string | Date | null;
    basicSalary: number;
    allowances?: {
        home?: { enabled: boolean; percentage: number; amount: number };
        food?: { enabled: boolean; percentage: number; amount: number };
        travel?: { enabled: boolean; percentage: number; amount: number };
        other?: Array<{ name: string; amount: number }>;
    };
    deductions?: {
        insurance?: { enabled: boolean; percentage: number; amount: number };
        other?: Array<{ name: string; amount: number }>;
    };
    createdAt: string | Date;
    updatedAt: string | Date;
}

// Map backend contract types to user-friendly display names
export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
    'permanent': 'Full Time',
    'temporary': 'Part Time',
    'probation': 'Probation',
    'freelance': 'Freelance'
};

// Reverse mapping for saving (display label -> backend value)
export const CONTRACT_TYPE_VALUES: Record<string, ContractType> = {
    'Full Time': 'permanent',
    'Part Time': 'temporary',
    'Probation': 'probation',
    'Freelance': 'freelance'
};

// Get display label from backend value
export function getContractTypeLabel(backendValue: ContractType | string): string {
    return CONTRACT_TYPE_LABELS[backendValue as ContractType] || backendValue;
}

// Get backend value from display label
export function getContractTypeValue(displayLabel: string): ContractType {
    return CONTRACT_TYPE_VALUES[displayLabel] || displayLabel as ContractType;
}
