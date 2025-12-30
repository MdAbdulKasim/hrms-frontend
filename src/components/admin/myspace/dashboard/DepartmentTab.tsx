"use client";

import React, { useState } from "react";
import axios from "axios";
import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth";

interface Location {
    id: string;
    name: string;
    code: string;
    city: string;
    country: string;
    addressLine1?: string;
    addressLine2?: string;
}

interface Department {
    id: string;
    departmentName: string;
    code: string;
    locationId: string;
}

interface DepartmentTabProps {
    departments: Department[];
    locations: Location[];
    formVisible: boolean;
    setFormVisible: (visible: boolean) => void;
    onRefresh: () => void;
}

export default function DepartmentTab({
    departments,
    locations,
    formVisible,
    setFormVisible,
    onRefresh
}: DepartmentTabProps) {
    const [deptForm, setDeptForm] = useState({ name: "", code: "", locationId: "" });

    const handleAddDepartment = async () => {
        try {
            const token = getAuthToken();
            const orgId = getOrgId();
            const apiUrl = getApiUrl();
            if (!orgId || !token) return;

            const payload = {
                departmentName: deptForm.name,
                code: deptForm.code,
                locationId: deptForm.locationId,
                organizationId: orgId
            };

            await axios.post(`${apiUrl}/org/${orgId}/departments`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFormVisible(false);
            setDeptForm({ name: "", code: "", locationId: "" });
            onRefresh();
        } catch (err) {
            alert("Failed to create department");
            console.error(err);
        }
    };

    return (
        <>
            {formVisible ? (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold mb-6">Add New Department</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Department Name</label>
                                <input
                                    value={deptForm.name}
                                    onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                    placeholder="e.g. Engineering"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Department Code</label>
                                <input
                                    value={deptForm.code}
                                    onChange={e => setDeptForm({ ...deptForm, code: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                    placeholder="e.g. ENG"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Location</label>
                            <select
                                value={deptForm.locationId}
                                onChange={e => setDeptForm({ ...deptForm, locationId: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
                            >
                                <option value="">Select Location</option>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setFormVisible(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                            <button onClick={handleAddDepartment} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save Department</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {departments.length > 0 ? (
                                    departments.map((dept) => (
                                        <tr key={dept.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.departmentName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.code}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">None</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">No departments found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}
