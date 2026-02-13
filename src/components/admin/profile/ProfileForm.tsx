"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, User, Plus, Trash2, Calendar, Briefcase, Activity, Mail, Phone, MapPin, Camera, CreditCard, Lock, ShieldCheck } from "lucide-react"
import type { FormData } from "./types"
import SearchableDropdown from "@/components/ui/SearchableDropdown"
import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth"
import axios from "axios"

const genders = ["Male", "Female", "Other"]
const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"]
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
const employeeTypes = ["permanent", "temporary"]
const employeeStatuses = ["Active", "Inactive", "On Leave", "Terminated"]
// Contract types - display labels (will be mapped to backend values: permanent, temporary, probation, freelance)
const contractTypes = ["Full Time", "Part Time", "Probation", "Freelance"]
const countries = [
    "India", "USA", "UK", "Canada", "Australia", "UAE", "Saudi Arabia", "Qatar", "Singapore", "Germany", "France"
]
const states = [
    "California", "Texas", "New York", "Florida", // US
    "Dubai", "Abu Dhabi", "Sharjah", // UAE
    "London", "Manchester", // UK
    "Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", // India
    "Ontario", "British Columbia" // Canada
]

interface ProfileFormProps {
    formData: FormData
    isEditing: boolean
    userRole: 'admin' | 'employee' | string | null
    profilePicUrl: string | null
    selectedProfilePicFile: File | null
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section?: string, field?: string) => void
    handleSelectChange: (value: string, fieldName: string) => void
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, fieldName?: string) => void
    handleAddWorkExperienceEntry: () => void
    handleRemoveWorkExperienceEntry: (index: number) => void
    handleWorkExperienceEntryChange: (index: number, field: string, value: any) => void
    handleAddEducationEntry: () => void
    handleRemoveEducationEntry: (index: number) => void
    handleEducationEntryChange: (index: number, field: string, value: any) => void
    handleDeleteFile: (fieldName: string) => void
    handleSave: () => void
    employeeId: string // Added employeeId
    activeSection?: 'overview' | 'personal' | 'documents' | 'experience'
}


export default function ProfileForm({
    formData,
    isEditing,
    userRole,
    profilePicUrl,
    selectedProfilePicFile,
    handleInputChange,
    handleSelectChange,
    handleFileChange,
    handleAddWorkExperienceEntry,
    handleRemoveWorkExperienceEntry,
    handleWorkExperienceEntryChange,
    handleAddEducationEntry,
    handleRemoveEducationEntry,
    handleEducationEntryChange,
    handleDeleteFile,
    handleSave,
    employeeId,
    activeSection
}: ProfileFormProps) {
    const [identityView, setIdentityView] = useState<'number' | 'documents'>('number')
    const handleViewDocument = async (documentType: string) => {
        try {
            const token = getAuthToken();
            const orgId = getOrgId();
            const apiUrl = getApiUrl();

            if (!token || !orgId || !employeeId) {
                console.error("Missing credentials or ID");
                return;
            }

            const response = await axios.get(`${apiUrl}/org/${orgId}/employees/${employeeId}/documents/${documentType}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success && response.data.documentUrl) {
                window.open(response.data.documentUrl, '_blank');
            } else {
                alert("Document not found");
            }
        } catch (error) {
            console.error("Error viewing document", error);
            alert("Failed to view document");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Overview Section */}
            {(activeSection === 'overview' || !activeSection) && (
                <div className="space-y-8">
                    {/* Basic Info Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Employee ID', value: formData.employeeNumber, icon: User, color: 'blue' },
                            { label: 'Joining Date', value: formData.dateOfJoining, icon: Calendar, color: 'emerald' },
                            { label: 'Department', value: formData.department, icon: Briefcase, color: 'indigo' },
                        ].map((item, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-white text-${item.color}-600 shadow-sm`}>
                                    <item.icon size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{item.label}</p>
                                    <p className="text-sm font-bold text-gray-800">{item.value || 'N/A'}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* About Section */}
                    <Card className="border-none shadow-sm bg-gray-50/30">
                        <CardContent className="p-6 sm:p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Activity size={18} className="text-blue-600" />
                                Professional Summary
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {[
                                    { label: 'Reports To', value: formData.reportingTo },
                                    { label: 'Shift Type', value: formData.shift },
                                    { label: 'Office Location', value: formData.location },
                                    { label: 'Working Mode', value: formData.empType },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-4">
                                        <span className="text-sm text-gray-400 font-medium">{item.label}</span>
                                        <span className="text-sm font-bold text-gray-700">{item.value || 'Not Set'}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Personal Details Section */}
            {(activeSection === 'personal' || !activeSection) && (
                <div className="space-y-6">
                    {/* Profile Picture Card */}
                    <Card className="p-6 border-none shadow-sm overflow-hidden bg-white">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 border-b border-gray-50 pb-4">
                            <Camera size={20} className="text-blue-600" />
                            Profile Picture
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-3xl border-4 border-gray-50 shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center transition-transform group-hover:scale-[1.02]">
                                    {profilePicUrl ? (
                                        <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={64} className="text-gray-300" />
                                    )}
                                </div>
                                {isEditing && (
                                    <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-110">
                                        <Upload size={20} />
                                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                    </label>
                                )}
                            </div>
                            <div className="flex-1 space-y-2 text-center sm:text-left">
                                <h3 className="font-bold text-gray-800">Your Profile Image</h3>
                                <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                                    Display a professional photo so teammates and clients can recognize you.
                                    Supports JPG, PNG or GIF. Max size 10MB.
                                </p>
                                {selectedProfilePicFile && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-100 italic animate-in fade-in zoom-in duration-300">
                                        Selected: {selectedProfilePicFile.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Personal Details Card */}
                    <Card className="p-6 border-none shadow-sm bg-white">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 border-b border-gray-50 pb-4">
                            <User size={20} className="text-blue-600" />
                            Personal Details
                        </h2>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <Input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Full Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Employee Number</label>
                                <Input
                                    name="employeeNumber"
                                    value={formData.employeeNumber}
                                    onChange={handleInputChange}
                                    disabled={true}
                                    placeholder="e.g. EMP 001"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <Input
                                    name="emailAddress"
                                    value={formData.emailAddress}
                                    onChange={handleInputChange}
                                    disabled={true}
                                    placeholder="Email Address"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                                <Input
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Mobile Number"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <Input
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    disabled={true}
                                    placeholder="Role"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                <Input
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    disabled={true}
                                    placeholder="Department"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                                <Input
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleInputChange}
                                    disabled={true}
                                    placeholder="Designation"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reporting To</label>
                                <Input
                                    name="reportingTo"
                                    value={formData.reportingTo}
                                    onChange={handleInputChange}
                                    disabled={true}
                                    placeholder="Reporting To"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Team Position</label>
                                <Input
                                    name="teamPosition"
                                    value={formData.teamPosition}
                                    onChange={handleInputChange}
                                    disabled={true}
                                    placeholder="Team Position"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                                <Input
                                    name="shift"
                                    value={formData.shift}
                                    onChange={handleInputChange}
                                    disabled={true}
                                    placeholder="Shift"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <Input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    disabled={true}
                                    placeholder="Location"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                                <Input
                                    name="timeZone"
                                    value={formData.timeZone}
                                    onChange={handleInputChange}
                                    disabled={true}
                                    placeholder="Time Zone"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Site</label>
                                <Input
                                    name="site"
                                    value={formData.site}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Site"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Building / Area</label>
                                <Input
                                    name="building"
                                    value={formData.building}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Building / Area"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                Employment Status & Type
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Employee Type</label>
                                <SearchableDropdown
                                    options={employeeTypes}
                                    value={formData.empType}
                                    onChange={(value) => handleInputChange({ target: { name: 'empType', value: value as string } } as any)}
                                    disabled={true}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Employee Status</label>
                                <SearchableDropdown
                                    options={employeeStatuses}
                                    value={formData.employeeStatus}
                                    onChange={(value) => handleInputChange({ target: { name: 'employeeStatus', value: value as string } } as any)}
                                    disabled={true}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Joining</label>
                                <Input
                                    name="dateOfJoining"
                                    type="date"
                                    value={formData.dateOfJoining}
                                    onChange={handleInputChange}
                                    disabled={true}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contract Type</label>
                                <SearchableDropdown
                                    options={contractTypes}
                                    value={formData.contractType}
                                    onChange={(value) => handleInputChange({ target: { name: 'contractType', value: value as string } } as any)}
                                    disabled={true}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contract Start Date</label>
                                <Input
                                    name="contractStartDate"
                                    type="date"
                                    value={formData.contractStartDate}
                                    onChange={handleInputChange}
                                    disabled={true}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contract End Date</label>
                                <Input
                                    name="contractEndDate"
                                    type="date"
                                    value={formData.contractEndDate}
                                    onChange={handleInputChange}
                                    disabled={true}
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                Additional Personal Information (Please complete)
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    name="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <SearchableDropdown
                                    options={genders}
                                    value={formData.gender}
                                    onChange={(value) => handleInputChange({ target: { name: 'gender', value: value as string } } as any)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Marital Status <span className="text-red-500">*</span>
                                </label>
                                <SearchableDropdown
                                    options={maritalStatuses}
                                    value={formData.maritalStatus}
                                    onChange={(value) => handleInputChange({ target: { name: 'maritalStatus', value: value as string } } as any)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                                <SearchableDropdown
                                    options={bloodGroups}
                                    value={formData.bloodGroup}
                                    onChange={(value) => handleInputChange({ target: { name: 'bloodGroup', value: value as string } } as any)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Documents Section */}
            {(activeSection === 'documents') && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Identity Information Section */}
                    <Card className="mb-6 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Identity Information</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Please provide your identity documents information.
                                </p>
                            </div>
                            <div className="flex bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() => setIdentityView('number')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${identityView === 'number' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Number
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIdentityView('documents')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${identityView === 'documents' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Documents
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    IBAN <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    name="iban"
                                    value={formData.iban}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="e.g. AE07 0331 2345 6789 0123 456"
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-500">23-digit IBAN</p>
                                    <div className="flex items-center gap-2">
                                        <input type="file" id="ibanDoc" className="hidden" onChange={(e) => handleFileChange(e, "ibanDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                        <label htmlFor="ibanDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <Upload className="w-3 h-3" />
                                            {formData.ibanDocUrl ? 'Change' : 'Upload Doc'}
                                        </label>
                                        {formData.ibanDocUrl && (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleViewDocument('iban')} type="button" className="text-[10px] text-blue-600 font-medium hover:underline">
                                                    View Doc
                                                </button>
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteFile('ibanDoc')}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {identityView === 'number' ? (
                            <div className="animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">UID Number</label>
                                        <Input
                                            name="uid"
                                            value={formData.uid}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="e.g. 1234567"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Labour Number</label>
                                        <Input
                                            name="labourNumber"
                                            value={formData.labourNumber}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="e.g. 1234567"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Emirates ID</label>
                                        <Input
                                            name="eidNumber"
                                            value={formData.eidNumber}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="e.g. 784-1234-1234567-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Visa Number</label>
                                        <Input
                                            name="visaNumber"
                                            value={formData.visaNumber}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="e.g. 123/4567/8/9101112"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                                        <Input
                                            name="passportNumber"
                                            value={formData.passportNumber}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="e.g. A1234567"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Iqama ID</label>
                                        <Input
                                            name="iqamaId"
                                            value={formData.iqamaId}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="Starts with 2 (10 digits)"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Driving License</label>
                                        <Input
                                            name="drivingLicenseNumber"
                                            value={formData.drivingLicenseNumber}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="e.g. 1234567"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">UID Copy</label>
                                        <div className="flex items-center gap-2">
                                            <input type="file" id="uidDoc" className="hidden" onChange={(e) => handleFileChange(e, "uidDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                            <label htmlFor="uidDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <Upload className="w-3 h-3" />
                                                {formData.uidDocUrl ? 'Change' : 'Upload Doc'}
                                            </label>
                                            {formData.uidDocUrl && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleViewDocument('uid')} type="button" className="text-[10px] text-blue-600 font-medium hover:underline">
                                                        View Doc
                                                    </button>
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteFile('uidDoc')}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Labour Card Copy</label>
                                        <div className="flex items-center gap-2">
                                            <input type="file" id="labourNumberDoc" className="hidden" onChange={(e) => handleFileChange(e, "labourNumberDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                            <label htmlFor="labourNumberDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <Upload className="w-3 h-3" />
                                                {formData.labourNumberDocUrl ? 'Change' : 'Upload Doc'}
                                            </label>
                                            {formData.labourNumberDocUrl && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleViewDocument('labourCard')} type="button" className="text-[10px] text-blue-600 font-medium hover:underline">
                                                        View Doc
                                                    </button>
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteFile('labourNumberDoc')}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Emirates ID Copy</label>
                                        <div className="flex items-center gap-2">
                                            <input type="file" id="eidNumberDoc" className="hidden" onChange={(e) => handleFileChange(e, "eidNumberDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                            <label htmlFor="eidNumberDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <Upload className="w-3 h-3" />
                                                {formData.eidNumberDocUrl ? 'Change' : 'Upload Doc'}
                                            </label>
                                            {formData.eidNumberDocUrl && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleViewDocument('emiratesId')} type="button" className="text-[10px] text-blue-600 font-medium hover:underline">
                                                        View Doc
                                                    </button>
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteFile('eidNumberDoc')}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Visa Copy</label>
                                        <div className="flex items-center gap-2">
                                            <input type="file" id="visaNumberDoc" className="hidden" onChange={(e) => handleFileChange(e, "visaNumberDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                            <label htmlFor="visaNumberDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <Upload className="w-3 h-3" />
                                                {formData.visaNumberDocUrl ? 'Change' : 'Upload Doc'}
                                            </label>
                                            {formData.visaNumberDocUrl && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleViewDocument('visa')} type="button" className="text-[10px] text-blue-600 font-medium hover:underline">
                                                        View Doc
                                                    </button>
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteFile('visaNumberDoc')}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Passport Copy</label>
                                        <div className="flex items-center gap-2">
                                            <input type="file" id="passportDoc" className="hidden" onChange={(e) => handleFileChange(e, "passportDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                            <label htmlFor="passportDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <Upload className="w-3 h-3" />
                                                {formData.passportDocUrl ? 'Change' : 'Upload Doc'}
                                            </label>
                                            {formData.passportDocUrl && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleViewDocument('passport')} type="button" className="text-[10px] text-blue-600 font-medium hover:underline">
                                                        View Doc
                                                    </button>
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteFile('passportDoc')}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Driving License Copy</label>
                                        <div className="flex items-center gap-2">
                                            <input type="file" id="drivingLicenseDoc" className="hidden" onChange={(e) => handleFileChange(e, "drivingLicenseDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                            <label htmlFor="drivingLicenseDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <Upload className="w-3 h-3" />
                                                {formData.drivingLicenseDocUrl ? 'Change' : 'Upload Doc'}
                                            </label>
                                            {formData.drivingLicenseDocUrl && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleViewDocument('drivingLicense')} type="button" className="text-[10px] text-blue-600 font-medium hover:underline">
                                                        View Doc
                                                    </button>
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteFile('drivingLicenseDoc')}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Iqama Copy</label>
                                        <div className="flex items-center gap-2">
                                            <input type="file" id="iqamaCopy" className="hidden" onChange={(e) => handleFileChange(e, "iqamaCopy")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                            <label htmlFor="iqamaCopy" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <Upload className="w-3 h-3" />
                                                {formData.iqamaCopyUrl ? 'Change' : 'Upload Doc'}
                                            </label>
                                            {formData.iqamaCopyUrl && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleViewDocument('iqama')} type="button" className="text-[10px] text-blue-600 font-medium hover:underline">
                                                        View Doc
                                                    </button>
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteFile('iqamaCopy')}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* Experience Section */}
            {(activeSection === 'experience') && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Work Experience */}
                    <Card className="mb-6 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
                            {isEditing && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddWorkExperienceEntry}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Experience
                                </Button>
                            )}
                        </div>
                        <div className="space-y-6">
                            {formData.workExperience.map((exp, idx) => (
                                <div key={idx} className="p-6 bg-white rounded-xl relative border border-gray-100 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-4">
                                        <h3 className="font-semibold text-gray-800">Add Work Experience</h3>
                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveWorkExperienceEntry(idx)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Company Name <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="Enter company name"
                                                value={exp.companyName}
                                                onChange={(e) => handleWorkExperienceEntryChange(idx, "companyName", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Job Title <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="Enter job title"
                                                value={exp.jobTitle}
                                                onChange={(e) => handleWorkExperienceEntryChange(idx, "jobTitle", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                From Date <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="date"
                                                placeholder="mm/dd/yyyy"
                                                value={exp.fromDate}
                                                onChange={(e) => handleWorkExperienceEntryChange(idx, "fromDate", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                To Date <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="date"
                                                placeholder="mm/dd/yyyy"
                                                value={exp.toDate}
                                                onChange={(e) => handleWorkExperienceEntryChange(idx, "toDate", e.target.value)}
                                                disabled={!isEditing || exp.currentlyWorkHere}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`curr-${idx}`}
                                                    checked={exp.currentlyWorkHere}
                                                    onCheckedChange={(v) => handleWorkExperienceEntryChange(idx, "currentlyWorkHere", !!v)}
                                                    disabled={!isEditing}
                                                />
                                                <label htmlFor={`curr-${idx}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                                                    I currently work here
                                                </label>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                                            <textarea
                                                placeholder="Brief description of your role and responsibilities"
                                                value={exp.jobDescription}
                                                onChange={(e) => handleWorkExperienceEntryChange(idx, "jobDescription", e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[100px]"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Experience Certificate (Optional)</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="file"
                                                    id={`exp-cert-${idx}`}
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(e, `experience_${idx}_doc`)}
                                                    disabled={!isEditing}
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                />
                                                <label
                                                    htmlFor={`exp-cert-${idx}`}
                                                    className={`flex items-center gap-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50 cursor-pointer shadow-sm text-sm ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    {exp.documentUrl ? 'Change Certificate' : 'Upload Certificate'}
                                                </label>
                                                {exp.documentUrl && (
                                                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                                        ✓ Certificate Uploaded
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card >

                    {/* Education */}
                    < Card className="mb-6 p-6" >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Education</h2>
                            {isEditing && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddEducationEntry}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Education
                                </Button>
                            )}
                        </div>
                        <div className="space-y-6">
                            {formData.education.map((edu, idx) => (
                                <div key={idx} className="p-6 bg-white rounded-xl relative border border-gray-100 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-4">
                                        <h3 className="font-semibold text-gray-800">Add Education</h3>
                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEducationEntry(idx)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-2">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Institute Name <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="Enter institute/university name"
                                                value={edu.instituteName}
                                                onChange={(e) => handleEducationEntryChange(idx, "instituteName", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Degree <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="e.g., B.Tech, M.Sc, MBA"
                                                value={edu.degree}
                                                onChange={(e) => handleEducationEntryChange(idx, "degree", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Field of Study <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="e.g., Computer Science, Business"
                                                value={edu.fieldOfStudy}
                                                onChange={(e) => handleEducationEntryChange(idx, "fieldOfStudy", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Year <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="e.g., 2018"
                                                value={edu.startYear}
                                                onChange={(e) => handleEducationEntryChange(idx, "startYear", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                End Year <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="e.g., 2022"
                                                value={edu.endYear}
                                                onChange={(e) => handleEducationEntryChange(idx, "endYear", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Degree Certificate / Marksheet (Optional)</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="file"
                                                    id={`edu-cert-${idx}`}
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(e, `education_${idx}_doc`)}
                                                    disabled={!isEditing}
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                />
                                                <label
                                                    htmlFor={`edu-cert-${idx}`}
                                                    className={`flex items-center gap-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50 cursor-pointer shadow-sm text-sm ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    {edu.documentUrl ? 'Change Document' : 'Upload Document'}
                                                </label>
                                                {edu.documentUrl && (
                                                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                                        ✓ Document Uploaded
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* Additional Information Section (Under Personal) */}
            {(activeSection === 'personal') && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Contact Information Section */}
                    < Card className="mb-6 p-6" >
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Contact Information</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address Line 1 <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={formData.address.addressLine1}
                                onChange={(e) => handleInputChange(e, "address", "addressLine1")}
                                disabled={!isEditing}
                                placeholder="Enter address line 1"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                            <Input
                                value={formData.address.addressLine2}
                                onChange={(e) => handleInputChange(e, "address", "addressLine2")}
                                disabled={!isEditing}
                                placeholder="Enter address line 2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.address.city}
                                    onChange={(e) => handleInputChange(e, "address", "city")}
                                    disabled={!isEditing}
                                    placeholder="Enter city"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <SearchableDropdown
                                    options={states}
                                    value={formData.address.state}
                                    onChange={(value) => handleInputChange({ target: { value: value as string } } as any, "address", "state")}
                                    placeholder="Select State"
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <SearchableDropdown
                                    options={countries}
                                    value={formData.address.country}
                                    onChange={(value) => handleInputChange({ target: { value: value as string } } as any, "address", "country")}
                                    placeholder="Select Country"
                                    disabled={!isEditing}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    PIN Code <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.address.pinCode}
                                    onChange={(e) => handleInputChange(e, "address", "pinCode")}
                                    disabled={!isEditing}
                                    placeholder="Enter PIN code"
                                />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Emergency Contact</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.emergencyContact.contactName}
                                    onChange={(e) => handleInputChange(e, "emergencyContact", "contactName")}
                                    disabled={!isEditing}
                                    placeholder="Enter name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Relation <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.emergencyContact.relation}
                                    onChange={(e) => handleInputChange(e, "emergencyContact", "relation")}
                                    disabled={!isEditing}
                                    placeholder="e.g. Father, Mother, Spouse"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Number <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.emergencyContact.contactNumber}
                                    onChange={(e) => handleInputChange(e, "emergencyContact", "contactNumber")}
                                    disabled={!isEditing}
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Salary & Bank Details Section */}
                    <Card className="mb-6 p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Salary & Bank Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary</label>
                                <Input
                                    name="basicSalary"
                                    type="number"
                                    value={formData.basicSalary}
                                    onChange={handleInputChange}
                                    disabled={true}
                                    placeholder="Enter basic salary"
                                />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Account Details</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                                <Input
                                    value={formData.bankDetails.bankName}
                                    onChange={(e) => handleInputChange(e, "bankDetails", "bankName")}
                                    disabled={!isEditing}
                                    placeholder="Bank Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                                <Input
                                    value={formData.bankDetails.branchName}
                                    onChange={(e) => handleInputChange(e, "bankDetails", "branchName")}
                                    disabled={!isEditing}
                                    placeholder="Branch Name"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                                <Input
                                    value={formData.bankDetails.accountNumber}
                                    onChange={(e) => handleInputChange(e, "bankDetails", "accountNumber")}
                                    disabled={!isEditing}
                                    placeholder="Account Number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                                <Input
                                    value={formData.bankDetails.accountHolderName}
                                    onChange={(e) => handleInputChange(e, "bankDetails", "accountHolderName")}
                                    disabled={!isEditing}
                                    placeholder="Account Holder Name"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                                <Input
                                    value={formData.bankDetails.ifscCode}
                                    onChange={(e) => handleInputChange(e, "bankDetails", "ifscCode")}
                                    disabled={!isEditing}
                                    placeholder="IFSC Code"
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {activeSection !== 'overview' && activeSection !== undefined && (
                <div className="flex justify-center pt-8 border-t border-gray-100 mt-12 mb-8">
                    <Button
                        onClick={handleSave}
                        disabled={!isEditing}
                        className="min-w-[200px] h-14 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
                    >
                        <ShieldCheck className="w-5 h-5 mr-2" />
                        Save All Changes
                    </Button>
                </div>
            )}
        </div>
    )
}
