"use client";

import React from "react";
import { TopSectionKey } from "./DashboardLayout";

interface SubNavbarProps {
  activeTop: TopSectionKey;
  activeTab: string;
  onTabChange: (tabKey: string) => void;
}

/**
 * Map top-level section key -> sub tabs (label + id)
 */
const SUB_TAB_MAP: Record<string, { id: string; label: string }[]> = {
  "my-space": [
    { id: "overview", label: "Overview" },
    { id: "dashboard", label: "Dashboard" },
    { id: "calendar", label: "Calendar" },
  ],
  team: [
    { id: "reportees", label: "Reportees" },
    { id: "hr-process", label: "HR Process" },
  ],
  organization: [
    { id: "overview", label: "Overview" },
    { id: "policies", label: "Policies" },
  ],
};

export default function SubNavbar({
  activeTop,
  activeTab,
  onTabChange,
}: SubNavbarProps) {
  const tabs = SUB_TAB_MAP[activeTop] ?? SUB_TAB_MAP["my-space"];

  return (
    <div className="bg-white border-b">
      <div className="px-6">
        <nav className="flex gap-3 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-muted-foreground hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
