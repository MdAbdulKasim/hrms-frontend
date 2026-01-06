"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { User, Plus, Trash2, Upload } from "lucide-react"
import type { FormData } from "./types"

interface EProfileFormProps {
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
    handleSameAsPresent: (checked: boolean) => void
    handleSave: () => void
    states: string[]
    countries: string[]
    genders: string[]
    maritalStatuses: string[]
    bloodGroups: string[]
}

const EProfileForm: React.FC<EProfileFormProps> = ({
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
    handleSameAsPresent,
    handleSave,
    states,
    countries,
    genders,
    maritalStatuses,
    bloodGroups,
}) => {
    return (
        <>
            {/* Profile Picture Section */}
            <Card className="mb-6 p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Profile Picture</h2>
                <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative">
                        {profilePicUrl ? (
                            <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
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
                                    onChange={(e) => handleFileChange(e, "profilePic")}
                                    className="hidden"
                                    id="profile-pic-upload"
                                    disabled={!isEditing}
                                />
                                <label
                                    htmlFor="profile-pic-upload"
                                    className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer ${!isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Select Image
                                </label>
                            </div>
                            {selectedProfilePicFile && (
                                <p className="text-xs text-green-600 mt-1">Selected: {selectedProfilePicFile.name}</p>
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
                        <Input name="fullName" value={formData.fullName} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <Input name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                        <Input name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <Input value={formData.role} disabled={true} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <Input value={formData.department} disabled={true} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                        <Input value={formData.designation} disabled={true} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reporting To</label>
                        <Input value={formData.reportingTo} disabled={true} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Team Position</label>
                        <Input value={formData.teamPosition} disabled={true} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                        <Input value={formData.shift} disabled={true} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <Input value={formData.location} disabled={true} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                        <Input value={formData.timeZone} disabled={true} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Site</label>
                        <Input value={formData.site} disabled={true} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Building / Area</label>
                        <Input value={formData.building} disabled={true} />
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Employment Status & Type</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Type</label>
                        <Input value={formData.empType} disabled={true} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Status</label>
                        <Input value={formData.employeeStatus} disabled={true} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contract Type</label>
                        <Input value={formData.contractType} disabled={true} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contract Start Date</label>
                        <Input value={formData.contractStartDate} disabled={true} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contract End Date</label>
                        <Input value={formData.contractEndDate} disabled={true} />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <Select value={formData.gender} onValueChange={(v) => handleSelectChange(v, "gender")} disabled={!isEditing}>
                            <SelectTrigger>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                        <Select value={formData.maritalStatus} onValueChange={(v) => handleSelectChange(v, "maritalStatus")} disabled={!isEditing}>
                            <SelectTrigger>
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
                        <Select value={formData.bloodGroup} onValueChange={(v) => handleSelectChange(v, "bloodGroup")} disabled={!isEditing}>
                            <SelectTrigger>
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} disabled={!isEditing} />
                </div>
            </Card>

            {/* Identity Information Section */}
            <Card className="mb-6 p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Identity Information</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">UAN</label>
                        <Input name="uan" value={formData.uan} onChange={handleInputChange} disabled={!isEditing} placeholder="Universal Account Number" />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-[10px] text-gray-500">12-digit UAN</p>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">PAN</label>
                        <Input name="pan" value={formData.pan} onChange={handleInputChange} disabled={!isEditing} placeholder="Permanent Account Number" />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-[10px] text-gray-500">10-character alphanumeric</p>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                        <Input name="passportNumber" value={formData.passportNumber} onChange={handleInputChange} disabled={!isEditing} placeholder="Alphabet and numeric" />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-[10px] text-gray-500">Alphanumeric (Optional)</p>
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
                        <Button variant="outline" size="sm" onClick={handleAddWorkExperienceEntry} className="flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Experience
                        </Button>
                    )}
                </div>
                <div className="space-y-6">
                    {formData.workExperience.map((exp, idx) => (
                        <div key={idx} className="p-6 bg-white rounded-xl relative border border-gray-100 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-4">
                                <h3 className="font-semibold text-gray-800">Experience #{idx + 1}</h3>
                                {isEditing && (
                                    <button type="button" onClick={() => handleRemoveWorkExperienceEntry(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium">
                                        <Trash2 className="w-4 h-4" /> Remove
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                                    <Input value={exp.companyName} onChange={(e) => handleWorkExperienceEntryChange(idx, "companyName", e.target.value)} disabled={!isEditing} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                                    <Input value={exp.jobTitle} onChange={(e) => handleWorkExperienceEntryChange(idx, "jobTitle", e.target.value)} disabled={!isEditing} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                                    <Input type="date" value={exp.fromDate} onChange={(e) => handleWorkExperienceEntryChange(idx, "fromDate", e.target.value)} disabled={!isEditing} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                                    <Input type="date" value={exp.toDate} onChange={(e) => handleWorkExperienceEntryChange(idx, "toDate", e.target.value)} disabled={!isEditing || exp.currentlyWorkHere} />
                                </div>
                                <div className="col-span-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox id={`curr-${idx}`} checked={exp.currentlyWorkHere} onCheckedChange={(v) => handleWorkExperienceEntryChange(idx, "currentlyWorkHere", !!v)} disabled={!isEditing} />
                                        <label htmlFor={`curr-${idx}`} className="text-sm font-medium text-gray-700 cursor-pointer">I currently work here</label>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                                    <textarea
                                        value={exp.jobDescription}
                                        onChange={(e) => handleWorkExperienceEntryChange(idx, "jobDescription", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[100px]"
                                        rows={3}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience Certificate (Optional)</label>
                                    <div className="flex items-center gap-3">
                                        <input type="file" id={`exp-cert-${idx}`} className="hidden" onChange={(e) => handleFileChange(e, `experience_${idx}_doc`)} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                        <label htmlFor={`exp-cert-${idx}`} className={`flex items-center gap-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50 cursor-pointer shadow-sm text-sm ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <Upload className="w-4 h-4" />
                                            {exp.documentUrl ? 'Change Certificate' : 'Upload Certificate'}
                                        </label>
                                        {exp.documentUrl && <span className="text-sm text-green-600 font-medium flex items-center gap-1">✓ Certificate Uploaded</span>}
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
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Present Address</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                            <Input value={formData.presentAddress.addressLine1} onChange={(e) => handleInputChange(e, "presentAddress", "addressLine1")} disabled={!isEditing} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                            <Input value={formData.presentAddress.addressLine2} onChange={(e) => handleInputChange(e, "presentAddress", "addressLine2")} disabled={!isEditing} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <Input value={formData.presentAddress.city} onChange={(e) => handleInputChange(e, "presentAddress", "city")} disabled={!isEditing} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                            <Select value={formData.presentAddress.state} onValueChange={(v) => handleSelectChange(v, "presentAddress.state")} disabled={!isEditing}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select State" />
                                </SelectTrigger>
                                <SelectContent>
                                    {states.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                            <Select value={formData.presentAddress.country} onValueChange={(v) => handleSelectChange(v, "presentAddress.country")} disabled={!isEditing}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                            <Input value={formData.presentAddress.pinCode} onChange={(e) => handleInputChange(e, "presentAddress", "pinCode")} disabled={!isEditing} />
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">Permanent Address</h3>
                        <div className="flex items-center gap-2">
                            <Checkbox id="same-as-present" checked={formData.sameAsPresentAddress} onCheckedChange={handleSameAsPresent} disabled={!isEditing} />
                            <label htmlFor="same-as-present" className="text-sm text-gray-600 cursor-pointer">Same as present address</label>
                        </div>
                    </div>
                    {!formData.sameAsPresentAddress && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                                <Input value={formData.permanentAddress.addressLine1} onChange={(e) => handleInputChange(e, "permanentAddress", "addressLine1")} disabled={!isEditing} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                                <Input value={formData.permanentAddress.addressLine2} onChange={(e) => handleInputChange(e, "permanentAddress", "addressLine2")} disabled={!isEditing} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <Input value={formData.permanentAddress.city} onChange={(e) => handleInputChange(e, "permanentAddress", "city")} disabled={!isEditing} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                <Select value={formData.permanentAddress.state} onValueChange={(v) => handleSelectChange(v, "permanentAddress.state")} disabled={!isEditing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select State" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {states.map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                <Select value={formData.permanentAddress.country} onValueChange={(v) => handleSelectChange(v, "permanentAddress.country")} disabled={!isEditing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((c) => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                                <Input value={formData.permanentAddress.pinCode} onChange={(e) => handleInputChange(e, "permanentAddress", "pinCode")} disabled={!isEditing} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                            <Input value={formData.emergencyContact.contactName} onChange={(e) => handleInputChange(e, "emergencyContact", "contactName")} disabled={!isEditing} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
                            <Input value={formData.emergencyContact.relation} onChange={(e) => handleInputChange(e, "emergencyContact", "relation")} disabled={!isEditing} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                            <Input value={formData.emergencyContact.contactNumber} onChange={(e) => handleInputChange(e, "emergencyContact", "contactNumber")} disabled={!isEditing} />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Education Section */}
            <Card className="mb-6 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Education</h2>
                    {isEditing && (
                        <Button variant="outline" size="sm" onClick={handleAddEducationEntry} className="flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Education
                        </Button>
                    )}
                </div>
                <div className="space-y-6">
                    {formData.education.map((edu, idx) => (
                        <div key={idx} className="p-6 bg-white rounded-xl relative border border-gray-100 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-4">
                                <h3 className="font-semibold text-gray-800">Education #{idx + 1}</h3>
                                {isEditing && (
                                    <button type="button" onClick={() => handleRemoveEducationEntry(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium">
                                        <Trash2 className="w-4 h-4" /> Remove
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Institute Name</label>
                                    <Input value={edu.instituteName} onChange={(e) => handleEducationEntryChange(idx, "instituteName", e.target.value)} disabled={!isEditing} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                                    <Input value={edu.degree} onChange={(e) => handleEducationEntryChange(idx, "degree", e.target.value)} disabled={!isEditing} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
                                    <Input value={edu.fieldOfStudy} onChange={(e) => handleEducationEntryChange(idx, "fieldOfStudy", e.target.value)} disabled={!isEditing} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Year</label>
                                    <Input value={edu.startYear} onChange={(e) => handleEducationEntryChange(idx, "startYear", e.target.value)} disabled={!isEditing} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Year</label>
                                    <Input value={edu.endYear} onChange={(e) => handleEducationEntryChange(idx, "endYear", e.target.value)} disabled={!isEditing} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Degree Certificate / Marksheet (Optional)</label>
                                    <div className="flex items-center gap-3">
                                        <input type="file" id={`edu-cert-${idx}`} className="hidden" onChange={(e) => handleFileChange(e, `education_${idx}_doc`)} disabled={!isEditing} accept=".pdf,.jpg,.jpeg,.png" />
                                        <label htmlFor={`edu-cert-${idx}`} className={`flex items-center gap-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50 cursor-pointer shadow-sm text-sm ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <Upload className="w-4 h-4" />
                                            {edu.documentUrl ? 'Change Document' : 'Upload Document'}
                                        </label>
                                        {edu.documentUrl && <span className="text-sm text-green-600 font-medium flex items-center gap-1">✓ Document Uploaded</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Salary & Bank Details Section */}
            <Card className="mb-6 p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Salary & Bank Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary</label>
                        <Input value={formData.basicSalary} disabled={true} placeholder="Basic Salary" />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Account Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                        <Input value={formData.bankDetails.bankName} disabled={true} placeholder="Bank Name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                        <Input value={formData.bankDetails.branchName} disabled={true} placeholder="Branch Name" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                        <Input value={formData.bankDetails.accountNumber} disabled={true} placeholder="Account Number" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                        <Input value={formData.bankDetails.accountHolderName} disabled={true} placeholder="Account Holder Name" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                        <Input value={formData.bankDetails.ifscCode} disabled={true} placeholder="IFSC Code" />
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

export default EProfileForm
