"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth";
import DepartmentTab from "./DepartmentTab";
import DesignationTab from "./DesignationTab";
import LocationTab from "./LocationTab";


export default function ManageSection() {
    const [activeTab, setActiveTab] = useState("departments");
    const [formVisible, setFormVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [locations, setLocations] = useState([]);
    const [shifts, setShifts] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const orgId = getOrgId();
            const apiUrl = getApiUrl();
            if (!orgId || !token) return;

            const headers = { Authorization: `Bearer ${token}` };

            const [deptRes, desigRes, locRes, shiftRes] = await Promise.all([
                axios.get(`${apiUrl}/org/${orgId}/departments`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${apiUrl}/org/${orgId}/designations`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${apiUrl}/org/${orgId}/locations`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${apiUrl}/org/${orgId}/shifts`, { headers }).catch(() => ({ data: [] }))
            ]);

            setDepartments(deptRes.data?.data || deptRes.data || []);
            setDesignations(desigRes.data?.data || desigRes.data || []);
            setLocations(locRes.data?.data || locRes.data || []);
            setShifts(shiftRes.data?.data || shiftRes.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const refreshData = () => {
        fetchData();
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setFormVisible(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-900">Manage Organization</h2>
                <button
                    onClick={() => setFormVisible(true)}
                    disabled={formVisible}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add {activeTab.slice(0, -1)}</span>
                </button>
            </div>

            <div className="p-6">
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: "departments", label: "Departments" },
                        { id: "designations", label: "Designations" },
                        { id: "locations", label: "Locations" },
                        
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-600/20"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === "departments" && (
                            <DepartmentTab
                                departments={departments}
                                locations={locations}
                                formVisible={formVisible}
                                setFormVisible={setFormVisible}
                                onRefresh={refreshData}
                            />
                        )}
                        {activeTab === "designations" && (
                            <DesignationTab
                                designations={designations}
                                departments={departments}
                                locations={locations}
                                formVisible={formVisible}
                                setFormVisible={setFormVisible}
                                onRefresh={refreshData}
                            />
                        )}
                        {activeTab === "locations" && (
                            <LocationTab
                                locations={locations}
                                formVisible={formVisible}
                                setFormVisible={setFormVisible}
                                onRefresh={refreshData}
                            />
                        )}
                        
                    </div>
                )}
            </div>
        </div>
    );
}
