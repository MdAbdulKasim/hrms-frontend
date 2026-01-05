'use client';
import React from 'react';
import { X } from 'lucide-react';
import { CandidateForm } from './types';

interface ViewCandidateProps {
    candidate: CandidateForm;
    onClose: () => void;
    departments: any[];
    designations: any[];
    locations: any[];
    reportingManagers: any[];
    shifts: any[];
}

const ViewCandidate: React.FC<ViewCandidateProps> = ({
    candidate,
    onClose,
    departments,
    designations,
    locations,
    reportingManagers,
    shifts,
}) => {
    const getDepartmentName = (id: string) => {
        const dept = departments.find(d => d.id === id || d._id === id);
        return dept ? (dept.departmentName || dept.name) : 'N/A';
    };

    const getDesignationName = (id: string) => {
        const desig = designations.find(d => d.id === id || d._id === id);
        return desig ? (desig.designationName || desig.name) : 'N/A';
    };

    const getLocationName = (id: string) => {
        const loc = locations.find(l => l.id === id || l._id === id);
        return loc ? (loc.locationName || loc.name) : 'N/A';
    };

    const getManagerName = (id: string) => {
        const mgr = reportingManagers.find(m => m.id === id || m._id === id);
        return mgr ? (mgr.fullName || `${mgr.firstName} ${mgr.lastName}`) : 'N/A';
    };

    const getShiftName = (id: string) => {
        if (id === 'morning') return 'Morning';
        if (id === 'evening') return 'Evening';
        if (id === 'night') return 'Night';
        const shift = shifts.find(s => s.id === id || s._id === id);
        return shift ? (shift.shiftName || shift.name) : id || 'N/A';
    };

    const getSiteName = (locId: string, siteId: string) => {
        const loc = locations.find(l => l.id === locId || l._id === locId);
        if (!loc || !loc.sites) return siteId || 'N/A';
        const site = loc.sites.find((s: any) => s.id === siteId || s._id === siteId || s.name === siteId);
        return site ? (site.name || site.siteName) : siteId || 'N/A';
    };

    const getBuildingName = (locId: string, siteId: string, bldId: string) => {
        const loc = locations.find(l => l.id === locId || l._id === locId);
        if (!loc || !loc.sites) return bldId || 'N/A';
        const site = loc.sites.find((s: any) => s.id === siteId || s._id === siteId || s.name === siteId);
        if (!site || !site.buildings) return bldId || 'N/A';
        const bld = site.buildings.find((b: any) => b.id === bldId || b._id === bldId || b.name === bldId);
        return bld ? (bld.name || bld.buildingName) : bldId || 'N/A';
    };


    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6 gap-4">
                    <h1 className="text-xl md:text-2xl font-bold">Candidate Details</h1>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow p-4 md:p-8 space-y-8">
                    {/* Personal Details Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold">Personal Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Employee Number</label>
                                <div className="text-gray-900 font-medium">{candidate.employeeNumber || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                                <div className="text-gray-900 font-medium">{candidate.fullName || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                                <div className="text-gray-900 font-medium">{candidate.email || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Mobile Number</label>
                                <div className="text-gray-900 font-medium">{candidate.phoneNumber || candidate.mobileNumber || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                                <div className="text-gray-900 font-medium capitalize">{candidate.gender || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                                <div className="text-gray-900 font-medium">{candidate.dateOfBirth || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Marital Status</label>
                                <div className="text-gray-900 font-medium capitalize">{candidate.maritalStatus || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Blood Group</label>
                                <div className="text-gray-900 font-medium uppercase">{candidate.bloodGroup || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Identity Information Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold">Identity Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">PAN Number</label>
                                <div className="text-gray-900 font-medium uppercase">{candidate.pan || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Aadhaar Number</label>
                                <div className="text-gray-900 font-medium">{candidate.aadhaar || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">UAN Number</label>
                                <div className="text-gray-900 font-medium">{candidate.uan || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Passport Number</label>
                                <div className="text-gray-900 font-medium uppercase">{candidate.passportNumber || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Driving License</label>
                                <div className="text-gray-900 font-medium uppercase">{candidate.drivingLicenseNumber || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Address Information Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold">Address Details</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Present Address</h3>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-1">
                                    <div className="text-gray-900">{candidate.presentAddress?.addressLine1 || 'N/A'}</div>
                                    {candidate.presentAddress?.addressLine2 && <div className="text-gray-900">{candidate.presentAddress.addressLine2}</div>}
                                    <div className="text-gray-900">
                                        {[candidate.presentAddress?.city, candidate.presentAddress?.state, candidate.presentAddress?.pinCode].filter(Boolean).join(', ')}
                                    </div>
                                    <div className="text-gray-900">{candidate.presentAddress?.country}</div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Permanent Address</h3>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-1">
                                    <div className="text-gray-900">{candidate.permanentAddress?.addressLine1 || 'N/A'}</div>
                                    {candidate.permanentAddress?.addressLine2 && <div className="text-gray-900">{candidate.permanentAddress.addressLine2}</div>}
                                    <div className="text-gray-900">
                                        {[candidate.permanentAddress?.city, candidate.permanentAddress?.state, candidate.permanentAddress?.pinCode].filter(Boolean).join(', ')}
                                    </div>
                                    <div className="text-gray-900">{candidate.permanentAddress?.country}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold">Emergency Contact</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Contact Name</label>
                                <div className="text-gray-900 font-medium">{candidate.emergencyContact?.contactName || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Relationship</label>
                                <div className="text-gray-900 font-medium">{candidate.emergencyContact?.relation || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Contact Number</label>
                                <div className="text-gray-900 font-medium">{candidate.emergencyContact?.contactNumber || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Employment Details Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold">Employment Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                                <div className="text-gray-900 font-medium">{getDesignationName(candidate.designationId)}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                                <div className="text-gray-900 font-medium">{getDepartmentName(candidate.departmentId)}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                                <div className="text-gray-900 font-medium">{getLocationName(candidate.locationId)}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Reporting To</label>
                                <div className="text-gray-900 font-medium">{getManagerName(candidate.reportingToId)}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Employee Type</label>
                                <div className="text-gray-900 font-medium capitalize">{candidate.empType || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Date of Joining</label>
                                <div className="text-gray-900 font-medium">{candidate.dateOfJoining || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Shift</label>
                                <div className="text-gray-900 font-medium">{getShiftName(candidate.shiftType)}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Site</label>
                                <div className="text-gray-900 font-medium">{getSiteName(candidate.locationId, candidate.siteId || '')}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Building / Area</label>
                                <div className="text-gray-900 font-medium">{getBuildingName(candidate.locationId, candidate.siteId || '', candidate.buildingId || '')}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Contract Type</label>
                                <div className="text-gray-900 font-medium capitalize">{candidate.contractType || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Contract Start</label>
                                <div className="text-gray-900 font-medium">{candidate.contractStartDate || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Contract End</label>
                                <div className="text-gray-900 font-medium">{candidate.contractEndDate || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Education Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold">Education</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Institution</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Degree</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Field of Study</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {candidate.education && candidate.education.length > 0 ? (
                                        candidate.education.map((edu, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-4 text-sm text-gray-900">{edu.instituteName}</td>
                                                <td className="px-4 py-4 text-sm text-gray-900">{edu.degree}</td>
                                                <td className="px-4 py-4 text-sm text-gray-900">{edu.fieldOfStudy}</td>
                                                <td className="px-4 py-4 text-sm text-gray-500">{edu.startYear} - {edu.endYear}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic text-sm">No education records provided</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Work Experience Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold">Work Experience</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Company</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Role</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Duration</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {candidate.experience && candidate.experience.length > 0 ? (
                                        candidate.experience.map((exp, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{exp.companyName}</td>
                                                <td className="px-4 py-4 text-sm text-gray-900">{exp.jobTitle}</td>
                                                <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {exp.fromDate ? new Date(exp.fromDate).toLocaleDateString() : 'N/A'} -
                                                    {exp.currentlyWorking ? ' Present' : (exp.toDate ? new Date(exp.toDate).toLocaleDateString() : ' N/A')}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate" title={exp.jobDescription}>
                                                    {exp.jobDescription || 'N/A'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic text-sm">No work experience records provided</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Compensation Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold">Compensation & Benefits</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Basic Salary</label>
                                <div className="text-gray-900 font-bold text-lg">
                                    {candidate.basicSalary ? `₹${parseFloat(candidate.basicSalary).toLocaleString()}` : 'N/A'}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-3">Allowances</label>
                                    <div className="space-y-2">
                                        {candidate.accommodationAllowances && candidate.accommodationAllowances.length > 0 ? (
                                            candidate.accommodationAllowances.map((allowance, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <span className="text-sm font-medium text-gray-700 capitalize">{allowance.type}</span>
                                                    <span className="text-sm font-semibold text-blue-600">{allowance.percentage}%</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-400 text-sm italic">No allowances specified</div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-3">Insurances</label>
                                    <div className="space-y-2">
                                        {candidate.insurances && candidate.insurances.length > 0 ? (
                                            candidate.insurances.map((insurance, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <span className="text-sm font-medium text-gray-700 capitalize">{insurance.type?.replace('_', ' ')}</span>
                                                    <span className="text-sm font-semibold text-red-600">{insurance.percentage}%</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-400 text-sm italic">No insurance added</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Details Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold">Bank Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Bank Name</label>
                                <div className="text-gray-900 font-medium">{candidate.bankDetails?.bankName || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Branch Name</label>
                                <div className="text-gray-900 font-medium">{candidate.bankDetails?.branchName || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Account Number</label>
                                <div className="text-gray-900 font-medium">{candidate.bankDetails?.accountNumber || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Account Holder Name</label>
                                <div className="text-gray-900 font-medium">{candidate.bankDetails?.accountHolderName || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">IFSC Code</label>
                                <div className="text-gray-900 font-medium uppercase">{candidate.bankDetails?.ifscCode || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium w-full sm:w-auto"
                    >
                        Close View
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewCandidate;
