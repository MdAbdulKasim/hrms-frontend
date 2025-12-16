"use client";

import { useState } from "react";
import DepartmentCard from "./DepartmentCard";
import DepartmentDrawer from "./DepartmentDrawer";
import { Search } from "lucide-react";

const departmentsData = [
  {
    id: 1,
    name: "Engineering",
    lead: "Sarah Davis",
    members: [
      { name: "Alice Johnson", role: "Developer" },
      { name: "Bob Smith", role: "Developer" },
      { name: "Carol White", role: "QA" },
    ],
  },
  {
    id: 2,
    name: "Design",
    lead: "Emily Chen",
    members: [
      { name: "Frank Miller", role: "UI Designer" },
      { name: "Grace Lee", role: "UX Designer" },
    ],
  },
  {
    id: 3,
    name: "Human Resources",
    lead: "Jane Wilson",
    members: [{ name: "Henry Adams", role: "HR Manager" }],
  },
];

export default function DepartmentsPage() {
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [search, setSearch] = useState("");

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
        {filtered.map((dept) => (
          <DepartmentCard
            key={dept.id}
            department={dept}
            onClick={() => setSelectedDept(dept)}
          />
        ))}
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
