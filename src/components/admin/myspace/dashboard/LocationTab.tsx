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

interface LocationTabProps {
    locations: Location[];
    formVisible: boolean;
    setFormVisible: (visible: boolean) => void;
    onRefresh: () => void;
}

export default function LocationTab({
    locations,
    formVisible,
    setFormVisible,
    onRefresh
}: LocationTabProps) {
    const [locForm, setLocForm] = useState({
        name: "",
        code: "",
        site: "",
        building: "",
        city: "",
        state: "",
        country: "",
        zip: ""
    });

    const handleAddLocation = async () => {
        try {
            const token = getAuthToken();
            const orgId = getOrgId();
            const apiUrl = getApiUrl();
            if (!orgId || !token) return;

            const payload = {
                name: locForm.name,
                code: locForm.code,
                addressLine1: locForm.site,
                addressLine2: locForm.building,
                city: locForm.city,
                state: locForm.state,
                country: locForm.country,
                postalCode: locForm.zip,
                timeZone: "IST",
                organizationId: orgId
            };

            await axios.post(`${apiUrl}/org/${orgId}/locations`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFormVisible(false);
            setLocForm({ name: "", code: "", site: "", building: "", city: "", state: "", country: "", zip: "" });
            onRefresh();
        } catch (err) {
            alert("Failed to create location");
            console.error(err);
        }
    };

    return (
        <>
            {formVisible ? (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold mb-6">Add New Location</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Location Name</label>
                                <input
                                    value={locForm.name}
                                    onChange={e => setLocForm({ ...locForm, name: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Location Code</label>
                                <input
                                    value={locForm.code}
                                    onChange={e => setLocForm({ ...locForm, code: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Site Name (Address Line 1)</label>
                                <input
                                    value={locForm.site}
                                    onChange={e => setLocForm({ ...locForm, site: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Building/Area (Address Line 2)</label>
                                <input
                                    value={locForm.building}
                                    onChange={e => setLocForm({ ...locForm, building: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">City</label>
                                <input
                                    value={locForm.city}
                                    onChange={e => setLocForm({ ...locForm, city: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">State</label>
                                <input
                                    value={locForm.state}
                                    onChange={e => setLocForm({ ...locForm, state: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Country</label>
                                <input
                                    value={locForm.country}
                                    onChange={e => setLocForm({ ...locForm, country: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Postal Code</label>
                                <input
                                    value={locForm.zip}
                                    onChange={e => setLocForm({ ...locForm, zip: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setFormVisible(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                            <button onClick={handleAddLocation} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save Location</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Site</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Building/Area</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">City</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {locations.length > 0 ? (
                                    locations.map((loc) => (
                                        <tr key={loc.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loc.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.addressLine1 || "-"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.addressLine2 || "-"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.city}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.country}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.code}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">No locations found</td>
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
