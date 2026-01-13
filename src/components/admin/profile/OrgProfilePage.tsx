"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth"
import OrgProfileForm from "./OrgProfileForm"
import { type OrgFormData, initialOrgFormData } from "./orgTypes"
import { CustomAlertDialog } from "@/components/ui/custom-dialogs"

interface OrgProfilePageProps {
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
}

export default function OrgProfilePage({ isEditing, setIsEditing }: OrgProfilePageProps) {
    const [formData, setFormData] = useState<OrgFormData>(initialOrgFormData)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
        open: false, title: "", description: "", variant: "info"
    });

    const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
        setAlertState({ open: true, title, description, variant });
    };

    useEffect(() => {
        const fetchOrgData = async () => {
            try {
                const orgId = getOrgId()
                const apiUrl = getApiUrl()
                const token = getAuthToken()

                if (!orgId || !token) return;

                // Fetch basic org data
                const response = await axios.get(`${apiUrl}/org/${orgId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                const org = response.data?.data || response.data

                // Try to fetch the signed logo URL
                let signedLogoUrl = org.logoUrl || ""
                try {
                    const logoResponse = await axios.get(`${apiUrl}/org/${orgId}/logo`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    if (logoResponse.data?.success && logoResponse.data?.logoUrl) {
                        signedLogoUrl = logoResponse.data.logoUrl
                    }
                } catch (logoErr) {
                    console.log("No custom logo found or failed to fetch logo URL")
                }

                setFormData({
                    name: org.name || "",
                    address: org.address || "",
                    orgType: org.orgType || "",
                    contactMail: org.contactMail || "",
                    contactPerson: org.contactPerson || "",
                    contactNumber: org.contactNumber || "",
                    logoUrl: signedLogoUrl,
                    orgWebsite: org.orgWebsite || "",
                    molCode: org.molCode || "",
                })
            } catch (error) {
                console.error("Failed to fetch organization data:", error)
                showAlert("Error", "Failed to load organization profile", "error")
            }
        }

        fetchOrgData()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setLogoFile(file)
            const previewUrl = URL.createObjectURL(file)
            setFormData(prev => ({ ...prev, logoUrl: previewUrl }))
        }
    }

    const handleSave = async () => {
        try {
            const orgId = getOrgId()
            const apiUrl = getApiUrl()
            const token = getAuthToken()

            if (!orgId || !token) return;

            const sendData = new FormData()

            // Backend expects fields directly, and logo as "logo"
            Object.keys(formData).forEach(key => {
                if (key !== 'logoUrl') {
                    sendData.append(key, (formData as any)[key])
                }
            })

            if (logoFile) {
                sendData.append('logo', logoFile)
            }

            await axios.put(`${apiUrl}/org/${orgId}`, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            // Refresh logo URL after save to get the new S3 signed URL if updated
            if (logoFile) {
                try {
                    const logoResponse = await axios.get(`${apiUrl}/org/${orgId}/logo`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    if (logoResponse.data?.success && logoResponse.data?.logoUrl) {
                        setFormData(prev => ({ ...prev, logoUrl: logoResponse.data.logoUrl }))
                    }
                } catch (e) { }
            }

            setIsEditing(false)
            showAlert("Success", "Organization profile updated successfully!", "success")
        } catch (error) {
            console.error("Failed to save organization data:", error)
            showAlert("Error", "Failed to update organization profile", "error")
        }
    }

    return (
        <>
            <OrgProfileForm
                formData={formData}
                isEditing={isEditing}
                handleInputChange={handleInputChange}
                handleFileChange={handleFileChange}
                handleSave={handleSave}
            />

            <CustomAlertDialog
                open={alertState.open}
                onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}
                title={alertState.title}
                description={alertState.description}
                variant={alertState.variant}
            />
        </>
    )
}
