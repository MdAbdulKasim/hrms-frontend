"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Upload, User, Plus, Trash2 } from "lucide-react"
import type { FormData } from "./types"

interface ProfileFormProps {
    formData: FormData
    isEditing: boolean
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

const states = ["Select State", "California", "Texas", "New York", "Florida"]
const countries = ["Select Country", "India", "USA", "UK", "Canada"]
const genders = ["Select Gender", "Male", "Female", "Other"]
const maritalStatuses = ["Select Marital Status", "Single", "Married", "Divorced", "Widowed"]
const bloodGroups = ["Select Blood Group", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

export default function ProfileForm({
    formData,
    isEditing,
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <Input
                            name="emailAddress"
                            value={formData.emailAddress}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Email Address"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <Input
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Role"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <Input
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Department"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                        <Input
                            name="designation"
                            value={formData.designation}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Designation"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reporting To</label>
                        <Input
                            name="reportingTo"
                            value={formData.reportingTo}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Reporting To"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Team Position</label>
                        <Input
                            name="teamPosition"
                            value={formData.teamPosition}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Team Position"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                        <Input
                            name="shift"
                            value={formData.shift}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Shift"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <Input
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Location"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                        <Input
                            name="timeZone"
                            value={formData.timeZone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Time Zone"
                        />
                    </div>
                    <div>
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
                        <Select
                            value={formData.gender}
                            onValueChange={(value) => handleSelectChange(value, "gender")}
                            disabled={!isEditing}
                        >
                            <SelectTrigger disabled={!isEditing}>
                                <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                {genders.map((g) => (
                                    <SelectItem key={g} value={g}>
                                        {g}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Marital Status <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={formData.maritalStatus}
                            onValueChange={(value) => handleSelectChange(value, "maritalStatus")}
                            disabled={!isEditing}
                        >
                            <SelectTrigger disabled={!isEditing}>
                                <SelectValue placeholder="Select Marital Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {maritalStatuses.map((m) => (
                                    <SelectItem key={m} value={m}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                        <Select
                            value={formData.bloodGroup}
                            onValueChange={(value) => handleSelectChange(value, "bloodGroup")}
                            disabled={!isEditing}
                        >
                            <SelectTrigger disabled={!isEditing}>
                                <SelectValue placeholder="Select Blood Group" />
                            </SelectTrigger>
                            <SelectContent>
                                {bloodGroups.map((b) => (
                                    <SelectItem key={b} value={b}>
                                        {b}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                            UAN (Universal Account Number) <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="uan"
                            value={formData.uan}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="e.g. 123456789012"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">12-digit UAN</p>
                            <div className="flex items-center gap-2">
                                <input type="file" id="uanDoc" className="hidden" onChange={(e) => handleFileChange(e, "uanDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                <label htmlFor="uanDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Upload className="w-3 h-3" />
                                    {formData.uanDocUrl ? 'Change' : 'Upload Doc'}
                                </label>
                                {formData.uanDocUrl && <span className="text-[10px] text-green-600 font-medium">✓ Uploaded</span>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            PAN (Permanent Account Number) <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="pan"
                            value={formData.pan}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="e.g. ABCDE1234F"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">10-character alphanumeric</p>
                            <div className="flex items-center gap-2">
                                <input type="file" id="panDoc" className="hidden" onChange={(e) => handleFileChange(e, "panDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                <label htmlFor="panDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Upload className="w-3 h-3" />
                                    {formData.panDocUrl ? 'Change' : 'Upload Doc'}
                                </label>
                                {formData.panDocUrl && <span className="text-[10px] text-green-600 font-medium">✓ Uploaded</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Aadhaar Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="aadhaarNumber"
                            value={formData.aadhaarNumber}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="e.g. 1234 5678 9012"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">12-digit Aadhaar</p>
                            <div className="flex items-center gap-2">
                                <input type="file" id="aadharDoc" className="hidden" onChange={(e) => handleFileChange(e, "aadharDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                <label htmlFor="aadharDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Upload className="w-3 h-3" />
                                    {formData.aadhaarDocUrl ? 'Change' : 'Upload Doc'}
                                </label>
                                {formData.aadhaarDocUrl && <span className="text-[10px] text-green-600 font-medium">✓ Uploaded</span>}
                            </div>
                        </div>
                    </div>
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Driving License Number</label>
                        <Input
                            name="drivingLicenseNumber"
                            value={formData.drivingLicenseNumber}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="e.g. DL1420110012345"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">Alphanumeric (Optional)</p>
                            <div className="flex items-center gap-2">
                                <input type="file" id="drivingLicenseDoc" className="hidden" onChange={(e) => handleFileChange(e, "drivingLicenseDoc")} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                <label htmlFor="drivingLicenseDoc" className={`text-xs flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-50 cursor-pointer ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Upload className="w-3 h-3" />
                                    {formData.drivingLicenseDocUrl ? 'Change' : 'Upload Doc'}
                                </label>
                                {formData.drivingLicenseDocUrl && <span className="text-[10px] text-green-600 font-medium">✓ Uploaded</span>}
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
                        <Select
                            value={formData.address.state}
                            onValueChange={(value) => handleSelectChange(value, "address.state")}
                            disabled={!isEditing}
                        >
                            <SelectTrigger disabled={!isEditing}>
                                <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                                {states.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={formData.address.country}
                            onValueChange={(value) => handleSelectChange(value, "address.country")}
                            disabled={!isEditing}
                        >
                            <SelectTrigger disabled={!isEditing}>
                                <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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

                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
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
