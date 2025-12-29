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
    const getLabel = (arr: any[], id: string, nameKey: string = 'name') => {
        const found = arr.find(item => (item.id === id || item._id === id));
        // Also check if id is actually the name, just in case data is mixed
        if (!found && id) return id;
        return found ? (found[nameKey] || found.label || found.fullName || found.firstName) : 'N/A';
    };

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


    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl md:text-2xl font-bold">View Candidate Details</h1>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow p-4 md:p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold">Candidate Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                            <div className="text-gray-900 font-medium">{candidate.fullName || 'N/A'}</div>
                        </div>

                        <div className="border-b md:border-b-0 border-gray-100 pb-4 md:pb-0">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                            <div className="text-gray-900 font-medium">{candidate.email || 'N/A'}</div>
                        </div>

                        <div className="border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                            <div className="text-gray-900 font-medium">{getDesignationName(candidate.designationId)}</div>
                        </div>

                        <div className="border-b md:border-b-0 border-gray-100 pb-4 md:pb-0">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Reporting To</label>
                            <div className="text-gray-900 font-medium">{getManagerName(candidate.reportingToId)}</div>
                        </div>

                        <div className="border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                            <div className="text-gray-900 font-medium">{getDepartmentName(candidate.departmentId)}</div>
                        </div>

                        <div className="border-b md:border-b-0 border-gray-100 pb-4 md:pb-0">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Employee Type</label>
                            <div className="text-gray-900 font-medium capitalize">{candidate.empType || 'N/A'}</div>
                        </div>

                        <div className="border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Employee Status</label>
                            <div className="text-gray-900 font-medium capitalize">{candidate.employeeStatus || 'Active'}</div>
                        </div>

                        <div className="border-b md:border-b-0 border-gray-100 pb-4 md:pb-0">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Date of Joining</label>
                            <div className="text-gray-900 font-medium">{candidate.dateOfJoining || 'N/A'}</div>
                        </div>

                        <div className="border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Shift</label>
                            <div className="text-gray-900 font-medium">{getShiftName(candidate.shiftType)}</div>
                        </div>

                        <div className="border-b md:border-b-0 border-gray-100 pb-4 md:pb-0">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                            <div className="text-gray-900 font-medium">{getLocationName(candidate.locationId)}</div>
                        </div>

                        <div className="border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Time Zone</label>
                            <div className="text-gray-900 font-medium">{candidate.timeZone || 'Asia/Kolkata'}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Mobile Number</label>
                            <div className="text-gray-900 font-medium">{candidate.phoneNumber || candidate.mobileNumber || 'N/A'}</div>
                        </div>

                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Close View
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ViewCandidate;
