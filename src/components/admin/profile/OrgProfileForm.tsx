"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Upload, Building2, Globe, Mail, Phone, User, MapPin, Briefcase, Plus, X } from "lucide-react"
import type { OrgFormData } from "./orgTypes"

interface OrgProfileFormProps {
    formData: OrgFormData
    isEditing: boolean
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleSave: () => void
}

export default function OrgProfileForm({
    formData,
    isEditing,
    handleInputChange,
    handleFileChange,
    handleSave
}: OrgProfileFormProps) {
    return (
        <div className="space-y-8">
            {/* Organization Logo Section */}
            <div className="bg-white border rounded-xl overflow-hidden">
                <div className="p-6 border-b bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">Organization Logo</h2>
                </div>
                <div className="p-6 flex flex-col sm:flex-row items-center gap-8">
                    <div className="w-40 h-40 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 relative group shadow-inner">
                        {formData.logoUrl ? (
                            <img
                                src={formData.logoUrl}
                                alt="Organization Logo"
                                className="w-full h-full object-contain p-2"
                            />
                        ) : (
                            <Building2 className="w-16 h-16 text-gray-300" />
                        )}
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label htmlFor="org-logo-upload" className="cursor-pointer p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors">
                                    <Upload className="w-6 h-6 text-white" />
                                </label>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Branding</h3>
                        <p className="text-sm text-gray-500 mb-4 max-w-md">
                            Upload a high-resolution logo for your organization. This will be used in reports, emails, and the dashboard.
                        </p>

                        <div className="flex flex-col items-center sm:items-start gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="org-logo-upload"
                                disabled={!isEditing}
                            />
                            {isEditing && (
                                <label
                                    htmlFor="org-logo-upload"
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-all"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Change Logo
                                </label>
                            )}
                            <p className="text-xs text-gray-400">
                                Recommended size: 512x512px. Formats: PNG, JPG, SVG.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Organization Details Section */}
            <div className="bg-white border rounded-xl overflow-hidden">
                <div className="p-6 border-b bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">Organization Details</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Organization Name</label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="bg-white"
                                placeholder="Organization Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Organization Type</label>
                            <Input
                                name="orgType"
                                value={formData.orgType}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="bg-white"
                                placeholder="Organization Type"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-600">Full Business Address</label>
                            <Input
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="bg-white"
                                placeholder="Address"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Official Website</label>
                            <Input
                                name="orgWebsite"
                                value={formData.orgWebsite}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="bg-white"
                                placeholder="Website"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">MOL Code</label>
                            <Input
                                name="molCode"
                                value={formData.molCode}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="bg-white"
                                placeholder="MOL Code"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white border rounded-xl overflow-hidden">
                <div className="p-6 border-b bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Contact Person</label>
                            <Input
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="bg-white"
                                placeholder="Contact Person"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Contact Email</label>
                            <Input
                                name="contactMail"
                                value={formData.contactMail}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="bg-white"
                                placeholder="Contact Email"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Contact Number</label>
                            <Input
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="bg-white"
                                placeholder="Contact Number"
                            />
                        </div>
                    </div>
                </div>
            </div>


            {isEditing && (
                <div className="flex justify-end gap-3 mt-8">
                    <Button
                        variant="default"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg transition-all shadow-md"
                        onClick={handleSave}
                    >
                        Save Organization Changes
                    </Button>
                </div>
            )}
        </div>
    )
}
