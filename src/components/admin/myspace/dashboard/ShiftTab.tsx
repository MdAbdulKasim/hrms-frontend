"use client";

import React, { useState } from "react";
import axios from "axios";
import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth";

interface Shift {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
}

interface ShiftTabProps {
    shifts: Shift[];
    formVisible: boolean;
    setFormVisible: (visible: boolean) => void;
    onRefresh: () => void;
}

export default function ShiftTab({
    shifts,
    formVisible,
    setFormVisible,
    onRefresh
}: ShiftTabProps) {
    const [shiftForm, setShiftForm] = useState({
        name: "",
        startTime: "",
        endTime: ""
    });

    const handleAddShift = async () => {
        try {
            const token = getAuthToken();
            const orgId = getOrgId();
            const apiUrl = getApiUrl();
            if (!orgId || !token) return;

            const payload = {
                name: shiftForm.name,
                startTime: shiftForm.startTime,
                endTime: shiftForm.endTime,
                organizationId: orgId
            };

            await axios.post(`${apiUrl}/org/${orgId}/shifts`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFormVisible(false);
            setShiftForm({ name: "", startTime: "", endTime: "" });
            onRefresh();
        } catch (err) {
            alert("Failed to create shift");
            console.error(err);
        }
    };

    return (
        <>
            {formVisible ? (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold mb-6">Add New Shift</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Shift Name</label>
                            <input
                                value={shiftForm.name}
                                onChange={e => setShiftForm({ ...shiftForm, name: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                placeholder="e.g. Morning Shift"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Start Time</label>
                                <input
                                    type="time"
                                    value={shiftForm.startTime}
                                    onChange={e => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">End Time</label>
                                <input
                                    type="time"
                                    value={shiftForm.endTime}
                                    onChange={e => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setFormVisible(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                            <button onClick={handleAddShift} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save Shift</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr >
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Shift Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">End Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {shifts.length > 0 ? (
                                    shifts.map((shift) => (
                                        <tr key={shift.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shift.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shift.startTime}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shift.endTime}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">No shifts found</td>
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
