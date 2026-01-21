"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Upload, User, Plus, Trash2 } from "lucide-react"
import type { FormData } from "./types"
import SearchableDropdown from "@/components/ui/SearchableDropdown"

const genders = ["Male", "Female", "Other"]
const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"]
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
const employeeTypes = ["permanent", "temporary"]
const employeeStatuses = ["Active", "Inactive", "On Leave", "Terminated"]
const contractTypes = ["Full Time", "Part Time", "Consultant", "Freelance"]
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
    handleSave: () => void
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
    handleSave
}: ProfileFormProps) {
    return (
        <>
            {/* Profile Picture Section */}
            <Card className="mb-6 p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Profile Picture</h2>
                <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative">
                        {profilePicUrl ? (
                            <img
                                src={profilePicUrl}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-12 h-12 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-gray-600 mb-2">
                                Upload a profile picture. Max size 10MB.
                                <br />
                                Allowed formats: JPG, PNG, GIF.
                            </p>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="profile-pic-upload"
                                    disabled={!isEditing}
                                />
                                <label
                                    htmlFor="profile-pic-upload"
                                    className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Select Image
                                </label>
                            </div>
                            {selectedProfilePicFile && (
                                <p className="text-xs text-green-600 mt-1">
                                    Selected: {selectedProfilePicFile.name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Personal Details Section */}
            <Card className="mb-6 p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Personal Details</h2>

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
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                        <SearchableDropdown
                            options={bloodGroups}
                            value={formData.bloodGroup}
                            onChange={(value) => handleInputChange({ target: { name: 'bloodGroup', value: value as string } } as any)}
                        />
                    </div>
                </div>
            </Card>

            {/* Identity Information Section */}
            <Card className="mb-6 p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Identity Information</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Please provide your identity documents information. These details are required for official records.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            UID Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="uid"
                            value={formData.uid}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Enter UID Number"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">UID Document</p>
                            <div className="flex items-center gap-2">
                                <input type="file" id="uidDoc" className="hidden" onChange={(e) => handleFileChange(e, "uidDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                <label htmlFor="uidDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Upload className="w-3 h-3" />
                                    {formData.uidDocUrl ? 'Change' : 'Upload Doc'}
                                </label>
                                {formData.uidDocUrl && <span className="text-[10px] text-green-600 font-medium">✓ Uploaded</span>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Labour Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="labourNumber"
                            value={formData.labourNumber}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Enter Labour Number"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">Labour Card Document</p>
                            <div className="flex items-center gap-2">
                                <input type="file" id="labourNumberDoc" className="hidden" onChange={(e) => handleFileChange(e, "labourNumberDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                <label htmlFor="labourNumberDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Upload className="w-3 h-3" />
                                    {formData.labourNumberDocUrl ? 'Change' : 'Upload Doc'}
                                </label>
                                {formData.labourNumberDocUrl && <span className="text-[10px] text-green-600 font-medium">✓ Uploaded</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            EID Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="eidNumber"
                            value={formData.eidNumber}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Enter Emirates ID"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">Emirates ID Document</p>
                            <div className="flex items-center gap-2">
                                <input type="file" id="eidNumberDoc" className="hidden" onChange={(e) => handleFileChange(e, "eidNumberDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                <label htmlFor="eidNumberDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Upload className="w-3 h-3" />
                                    {formData.eidNumberDocUrl ? 'Change' : 'Upload Doc'}
                                </label>
                                {formData.eidNumberDocUrl && <span className="text-[10px] text-green-600 font-medium">✓ Uploaded</span>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Visa Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="visaNumber"
                            value={formData.visaNumber}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Enter Visa Number"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">Visa Document</p>
                            <div className="flex items-center gap-2">
                                <input type="file" id="visaNumberDoc" className="hidden" onChange={(e) => handleFileChange(e, "visaNumberDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                <label htmlFor="visaNumberDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Upload className="w-3 h-3" />
                                    {formData.visaNumberDocUrl ? 'Change' : 'Upload Doc'}
                                </label>
                                {formData.visaNumberDocUrl && <span className="text-[10px] text-green-600 font-medium">✓ Uploaded</span>}
                            </div>
                        </div>
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
                                {formData.ibanDocUrl && <span className="text-[10px] text-green-600 font-medium">✓ Uploaded</span>}
                            </div>
                        </div>
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
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">Alphanumeric (Optional)</p>
                            <div className="flex items-center gap-2">
                                <input type="file" id="passportDoc" className="hidden" onChange={(e) => handleFileChange(e, "passportDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                <label htmlFor="passportDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Upload className="w-3 h-3" />
                                    {formData.passportDocUrl ? 'Change' : 'Upload Doc'}
                                </label>
                                {formData.passportDocUrl && <span className="text-[10px] text-green-600 font-medium">✓ Uploaded</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

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
            </Card>

            {/* Education */}
            <Card className="mb-6 p-6">
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

            {/* Contact Information Section */}
            <Card className="mb-6 p-6">
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

            <div className="flex justify-center mb-8">
                <Button
                    onClick={handleSave}
                    disabled={!isEditing}
                    className="w-full sm:w-auto px-12 py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg"
                >
                    Save Profile
                </Button>
            </div>
        </>
    )
}
