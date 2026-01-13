export interface OrgFormData {
    name: string;
    address: string;
    orgType: string;
    contactMail: string;
    contactPerson: string;
    contactNumber: string;
    logoUrl: string;
    orgWebsite: string;
    molCode: string;
}

export const initialOrgFormData: OrgFormData = {
    name: "",
    address: "",
    orgType: "",
    contactMail: "",
    contactPerson: "",
    contactNumber: "",
    logoUrl: "",
    orgWebsite: "",
    molCode: "",
};
