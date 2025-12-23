"use client";

import { useState } from "react";
import Dropdown from "@/components/ui/Dropdown";

const permissionOptions = [
  "No Data",
  "My Data",
  "Reportees Data",
  "Reportees + My Data",
  "All Data",
];

const modules = [
  "Dashboard",
  "Leave Management",
  "Attendance",
  "Time Tracking",
  "Feeds",
  "Profile",
  "Reports",
];

export default function RolePermissionsTable() {
  return (
    <div className="border rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left p-4">Module</th>
            {["View", "Edit", "Add", "Delete"].map(h => (
              <th key={h} className="p-4">{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {modules.map((module, idx) => (
            <tr key={module} className="border-t">
              <td className="p-4 font-medium">{module}</td>

              {[1, 2, 3, 4].map((i) => (
                <PermissionCell key={i} direction={idx >= modules.length - 3 ? "up" : "down"} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PermissionCell({ direction = "down" }: { direction?: "up" | "down" }) {
  const [value, setValue] = useState("No Data");

  return (
    <td className="p-3">
      <Dropdown
        value={value}
        options={permissionOptions}
        onChange={setValue}
        direction={direction}
      />
    </td>
  );
}
