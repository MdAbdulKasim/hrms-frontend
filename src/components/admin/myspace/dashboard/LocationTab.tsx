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
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Site</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Building/Area</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">City</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Country</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {locations.length > 0 ? (
                                    locations.map((loc) => (
                                        <tr key={loc.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{loc.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.addressLine1 || "-"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.addressLine2 || "-"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{loc.city}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{loc.country}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold font-mono uppercase tracking-tight">{loc.code}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400 italic font-medium">No locations found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile/Tablet Card View */}
                    <div className="lg:hidden divide-y divide-gray-100">
                        {locations.length > 0 ? (
                            locations.map((loc) => (
                                <div key={loc.id} className="p-4 sm:p-6 hover:bg-gray-50 active:bg-blue-50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold text-gray-900">{loc.name}</span>
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold uppercase tracking-wider">{loc.code}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Address</p>
                                            <p className="text-xs text-gray-600">
                                                {loc.addressLine1 || loc.addressLine2
                                                    ? `${loc.addressLine1 || ''}${loc.addressLine1 && loc.addressLine2 ? ', ' : ''}${loc.addressLine2 || ''}`
                                                    : 'No address details'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Region</p>
                                            <p className="text-xs text-gray-600">{loc.city}, {loc.country}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-sm text-gray-400 italic">No locations found</div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
