"use client";

import { useState, useEffect } from "react";
import DepartmentCard from "./DepartmentCard";
import DepartmentDrawer from "./DepartmentDrawer";
import { Search } from "lucide-react";
import axios from 'axios';
import { getApiUrl, getAuthToken } from '@/lib/auth';

interface Department {
  id: number;
  name: string;
  lead: string;
  members: Array<{ name: string; role: string }>;
}

export default function DepartmentsPage() {
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [departmentsData, setDepartmentsData] = useState<Department[]>([]);

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const apiUrl = getApiUrl();
        const token = getAuthToken();

        const response = await axios.get(`${apiUrl}/departments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const departments = response.data.data || response.data || [];

        // Transform API data to match component interface
        const transformedData: Department[] = departments.map((dept: any) => ({
          id: dept.id || dept._id,
          name: dept.name || 'Unknown Department',
          lead: dept.lead || dept.manager || 'Not assigned',
          members: dept.members || dept.employees || []
        }));

        setDepartmentsData(transformedData);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartmentsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const filtered = departmentsData.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">All Departments</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Loading departments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No departments found</p>
          </div>
        ) : (
          filtered.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              onClick={() => setSelectedDept(dept)}
            />
          ))
        )}
      </div>

      {/* Right Drawer */}
      {selectedDept && (
        <DepartmentDrawer
          department={selectedDept}
          onClose={() => setSelectedDept(null)}
        />
      )}
    </div>
  );
}
