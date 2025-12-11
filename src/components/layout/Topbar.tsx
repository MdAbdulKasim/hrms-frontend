"use client";

import React from "react";
import { TopSectionKey } from "./DashboardLayout";

// Lucide Icons (same library you used in sidebar)
import { Settings, Bell } from "lucide-react";

interface TopbarProps {
  activeSection: TopSectionKey;
  onSectionChange: (key: TopSectionKey) => void;
}

const TOP_SECTIONS: { key: TopSectionKey; label: string }[] = [
  { key: "my-space", label: "My Space" },
  { key: "team", label: "Team" },
  { key: "organization", label: "Organization" },
];

export default function Topbar({
  activeSection,
  onSectionChange,
}: TopbarProps) {
  return (
    <header className="border-b bg-white">
      <div className="flex items-center justify-between px-6 h-16">
        {/* LEFT SIDE — TOP NAV SECTIONS */}
        <nav className="flex items-center gap-2">
          {TOP_SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => onSectionChange(s.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeSection === s.key
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* RIGHT SIDE — ICONS */}
        <div className="flex items-center gap-4">
          {/* Settings icon */}
          <button className="p-2 rounded-full hover:bg-gray-100 transition">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>

          {/* Notification icon */}
          <button className="p-2 rounded-full hover:bg-gray-100 transition">
            <Bell className="h-5 w-5 text-gray-600" />
          </button>

          {/* Profile Circle */}
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
