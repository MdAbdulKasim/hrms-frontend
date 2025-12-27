"use client";

import { useState, useEffect } from "react";
import RolePermissionsTable from "./RolePermissionsTable";
import Toggle from "./Toggle";
import Dropdown from "@/components/ui/Dropdown";

import DepartmentPage from "@/components/admin/settings/departments/DepartmentsPage";
import { Building2, Briefcase, Plus, Trash2 } from "lucide-react";
import SearchableDropdown from "@/components/ui/SearchableDropdown";

const roles = ["Admin", "Manager", "Team Lead", "Employee"];

const usersByRole: Record<string, string[]> = {
  Admin: ["Alice Admin", "Bob Admin"],
  Manager: ["Charlie Manager", "David Manager"],
  "Team Lead": ["Eve Lead", "Frank Lead"],
  Employee: ["Grace Employee", "Heidi Employee", "Ivan Employee"],
};

type AccessScope = "all" | "multiple" | "particular";

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<"set" | "all" | "add">("set");
  const [innerTab, setInnerTab] = useState<"dept" | "role">("dept");
  const [role, setRole] = useState("Employee");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [hrAccess, setHrAccess] = useState(false);

  // Reset user selection when role changes
  useEffect(() => {
    setSelectedUsers([]);
  }, [role]);

  const currentRoleUsers = usersByRole[role] || [];

  // Construct dropdown options
  const userDropdownOptions = [
    `All ${role}s`,
    ...currentRoleUsers,
  ];

  const handleUserChange = (val: string[]) => {
    const allOption = `All ${role}s`;

    // If "All" is being selected
    if (val.includes(allOption) && !selectedUsers.includes(allOption)) {
      // Select only "All", deselect everything else
      setSelectedUsers([allOption]);
    }
    // If a specific user is being selected while "All" is already selected
    else if (selectedUsers.includes(allOption) && val.length > 1) {
      // Remove "All", keep only the newly selected users
      setSelectedUsers(val.filter(v => v !== allOption));
    }
    // Normal multi-select behavior
    else {
      setSelectedUsers(val);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-3">
        {[
          { key: "set", label: "Permission" },
          { key: "all", label: "All Departments" },
          { key: "add", label: "Add Department / Role" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition
              ${activeTab === tab.key
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
            <h1 className="text-2xl font-semibold">Permissions</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
              Save Changes
            </button>
          </div>

          {/* Role Permissions */}
          <div className="bg-white rounded-xl border p-6 space-y-6">
            <h2 className="text-lg font-semibold">Role Permissions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Select */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-24">Select Role:</span>
                <div className="w-64">
                  <Dropdown
                    value={role}
                    options={roles}
                    onChange={setRole}
                  />
                </div>
              </div>

              {/* User Select */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-24">Select User:</span>
                <div className="w-64">
                  <SearchableDropdown
                    value={selectedUsers}
                    options={userDropdownOptions}
                    onChange={handleUserChange}
                    placeholder="Search User..."
                    multiple={true}
                  />
                </div>
              </div>
            </div>

            {/* Access Scope Selection Display */}
            {role && selectedUsers.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Selected: </span>
                  {selectedUsers.includes(`All ${role}s`)
                    ? `All ${role}s`
                    : `${selectedUsers.length} user(s) - ${selectedUsers.join(", ")}`
                  }
                </div>
              </div>
            )}

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

      {/* ADD DEPARTMENT / ROLE */}
      {activeTab === "add" && (
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold">Add Department / Role</h1>

          {/* Inner Tabs Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setInnerTab("dept")}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition text-sm font-medium ${innerTab === "dept" ? "bg-blue-600 shadow-sm text-white" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Building2 className="w-4 h-4" />
              Department
            </button>
            <button
              onClick={() => setInnerTab("role")}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition text-sm font-medium ${innerTab === "role" ? "bg-blue-600 shadow-sm text-white" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Briefcase className="w-4 h-4" />
              Role
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {innerTab === "dept" ? (
              <>
                {/* Add New Department Card */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-6">
                  <h2 className="text-xl font-semibold">Add New Department</h2>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Department Name</label>
                    <input
                      type="text"
                      placeholder="Enter department name"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-blue-600 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Department
                  </button>
                </div>

                {/* Existing Departments Card */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-6">
                  <h2 className="text-xl font-semibold">Existing Departments</h2>
                  <div className="space-y-3">
                    {["Engineering", "Design", "HR", "Finance"].map((dept) => (
                      <div key={dept} className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg border border-gray-100">
                            <Building2 className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{dept}</span>
                        </div>
                        <button className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Add New Role Card */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-6">
                  <h2 className="text-xl font-semibold">Add New Role</h2>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Role Name</label>
                    <input
                      type="text"
                      placeholder="Enter role name"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-blue-600 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Role
                  </button>
                </div>

                {/* Existing Roles Card */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-6">
                  <h2 className="text-xl font-semibold">Existing Roles</h2>
                  <div className="flex flex-wrap gap-3">
                    {["Developer", "Designer", "Manager", "Team Lead", "QA Engineer"].map((role) => (
                      <div key={role} className="flex items-center gap-2.5 px-4 py-2 bg-gray-50/80 hover:bg-gray-100 rounded-full border border-gray-100 transition-colors">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">{role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
