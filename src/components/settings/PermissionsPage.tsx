"use client";

import { useState } from "react";
import RolePermissionsTable from "./RolePermissionsTable";
import Toggle from "./Toggle";
import Dropdown from "@/components/ui/Dropdown";
import DepartmentPage from "@/components/settings/departments/DepartmentsPage";

const roles = ["Admin", "Manager", "Team Lead", "Employee"];

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<"set" | "all" | "add">("set");
  const [role, setRole] = useState("Employee");
  const [hrAccess, setHrAccess] = useState(false);

  return (
    <div className="p-6 space-y-6">

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-3">
        {[
          { key: "set", label: "Set Permission" },
          { key: "all", label: "All Departments" },
          { key: "add", label: "Add Department / Role" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition
              ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= TAB CONTENT ================= */}

      {/* SET PERMISSION */}
      {activeTab === "set" && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Set Permissions</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
              Save Changes
            </button>
          </div>

          {/* Role Permissions */}
          <div className="bg-white rounded-xl border p-6 space-y-6">
            <h2 className="text-lg font-semibold">Role Permissions</h2>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Select Role:</span>
              <div className="w-60">
                <Dropdown
                  value={role}
                  options={roles}
                  onChange={setRole}
                />
              </div>
            </div>

            <RolePermissionsTable />

            {/* HR Toggle */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="font-medium">HR Process Access</p>
                <p className="text-sm text-gray-500">
                  Allow this role to initiate and manage HR processes
                </p>
              </div>
              <Toggle enabled={hrAccess} setEnabled={setHrAccess} />
            </div>
          </div>
        </>
      )}

      {/* ALL DEPARTMENTS */}
      {activeTab === "all" && <DepartmentPage />}

      {/* ADD DEPARTMENT / ROLE (future) */}
      {activeTab === "add" && (
        <div className="text-gray-500 text-sm">
          Add Department / Role – Coming Soon
        </div>
      )}
    </div>
  );
}
