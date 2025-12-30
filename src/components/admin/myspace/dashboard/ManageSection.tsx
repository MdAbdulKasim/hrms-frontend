"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, MapPin, Building2, Briefcase, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiUrl, getAuthToken, getOrgId } from "@/lib/auth";
import DepartmentTab from "./DepartmentTab";
import LocationTab from "./LocationTab";
import DesignationTab from "./DesignationTab";

// Types
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

export default function ManageSection() {
    const [activeTab, setActiveTab] = useState("department");
    const [isLoading, setIsLoading] = useState(false);

    // Data State
    const [locations, setLocations] = useState<Location[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);

    const [formVisible, setFormVisible] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = getAuthToken();
            const orgId = getOrgId();
            const apiUrl = getApiUrl();
            if (!orgId || !token) return;

            const headers = { Authorization: `Bearer ${token}` };

            const [locRes, deptRes, desigRes] = await Promise.all([
                axios.get(`${apiUrl}/org/${orgId}/locations`, { headers }),
                axios.get(`${apiUrl}/org/${orgId}/departments`, { headers }),
                axios.get(`${apiUrl}/org/${orgId}/designations`, { headers })
            ]);

            setLocations(locRes.data.data || locRes.data || []);
            setDepartments(deptRes.data.data || deptRes.data || []);
            setDesignations(desigRes.data.data || desigRes.data || []);

        } catch (error) {
            console.error("Error fetching manage data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Manage Organization</h2>
                {!formVisible && (
                    <button
                        onClick={() => setFormVisible(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </button>
                )}
            </div>

            <div className="p-6">
                <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setFormVisible(false); }} className="w-full">
                    <TabsList className="flex w-full max-w-md mx-auto mb-8 bg-transparent p-0 gap-2">
                        <TabsTrigger
                            value="department"
                            className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all text-gray-500 hover:text-gray-900 border border-transparent data-[state=active]:border-blue-100"
                        >
                            <Building2 className="w-4 h-4" /> Department
                        </TabsTrigger>
                        <TabsTrigger
                            value="location"
                            className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all text-gray-500 hover:text-gray-900 border border-transparent data-[state=active]:border-blue-100"
                        >
                            <MapPin className="w-4 h-4" /> Location
                        </TabsTrigger>
                        <TabsTrigger
                            value="designation"
                            className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all text-gray-500 hover:text-gray-900 border border-transparent data-[state=active]:border-blue-100"
                        >
                            <Briefcase className="w-4 h-4" /> Designation
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="department" className="mt-0">
                        <DepartmentTab
                            departments={departments}
                            locations={locations}
                            formVisible={formVisible}
                            setFormVisible={setFormVisible}
                            onRefresh={fetchData}
                        />
                    </TabsContent>

                    <TabsContent value="location" className="mt-0">
                        <LocationTab
                            locations={locations}
                            formVisible={formVisible}
                            setFormVisible={setFormVisible}
                            onRefresh={fetchData}
                        />
                    </TabsContent>

                    <TabsContent value="designation" className="mt-0">
                        <DesignationTab
                            designations={designations}
                            locations={locations}
                            departments={departments}
                            formVisible={formVisible}
                            setFormVisible={setFormVisible}
                            onRefresh={fetchData}
                        />
                    </TabsContent>
                </Tabs>
            </div>
            {isLoading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                </div>
            )}
        </div>
    );
}
