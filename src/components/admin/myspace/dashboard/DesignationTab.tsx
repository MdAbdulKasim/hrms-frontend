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

interface Designation {
    id: string;
    name: string;
    code: string;
    locationId: string;
    departmentId: string;
}

interface DesignationTabProps {
    designations: Designation[];
    locations: Location[];
    departments: Department[];
    formVisible: boolean;
    setFormVisible: (visible: boolean) => void;
    onRefresh: () => void;
}

export default function DesignationTab({
    designations,
    locations,
    departments,
    formVisible,
    setFormVisible,
    onRefresh
}: DesignationTabProps) {
    const [desigForm, setDesigForm] = useState({
        name: "",
        code: "",
        locationId: "",
        departmentId: ""
    });

    const handleAddDesignation = async () => {
        try {
            const token = getAuthToken();
            const orgId = getOrgId();
            const apiUrl = getApiUrl();
            if (!orgId || !token) return;

            const payload = {
                name: desigForm.name,
                code: desigForm.code,
                locationId: desigForm.locationId,
                departmentId: desigForm.departmentId,
                organizationId: orgId
            };

            await axios.post(`${apiUrl}/org/${orgId}/designations`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFormVisible(false);
            setDesigForm({ name: "", code: "", locationId: "", departmentId: "" });
            onRefresh();
        } catch (err) {
            alert("Failed to create designation");
            console.error(err);
        }
    };

    return (
        <>
            {formVisible ? (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold mb-6">Add New Designation</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Designation Name</label>
                                <input
                                    value={desigForm.name}
                                    onChange={e => setDesigForm({ ...desigForm, name: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Designation Code</label>
                                <input
                                    value={desigForm.code}
                                    onChange={e => setDesigForm({ ...desigForm, code: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Location</label>
                                <select
                                    value={desigForm.locationId}
                                    onChange={e => setDesigForm({ ...desigForm, locationId: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
                                >
                                    <option value="">Select Location</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Department</label>
                                <select
                                    value={desigForm.departmentId}
                                    onChange={e => setDesigForm({ ...desigForm, departmentId: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setFormVisible(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                            <button onClick={handleAddDesignation} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save Designation</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {designations.length > 0 ? (
                                    designations.map((desig) => (
                                        <tr key={desig.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{desig.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{desig.code}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">None</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">None</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No designations found</td>
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
