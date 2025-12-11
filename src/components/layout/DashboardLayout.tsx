"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import SubNavbar from "./SubNavbar";

export type TopSectionKey = "my-space" | "team" | "organization" | string;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // active top-level section (e.g. "my-space", "team")
  const [activeTopSection, setActiveTopSection] =
    useState<TopSectionKey>("my-space");

  // active sub-tab under the active top section (e.g. "overview", "dashboard")
  const [activeSubTab, setActiveSubTab] = useState<string>("overview");

  const handleTopSectionChange = (key: TopSectionKey) => {
    setActiveTopSection(key);

    // reset sub tab when top section changes (choose sensible default per section)
    if (key === "team") setActiveSubTab("reportees");
    else setActiveSubTab("overview");
  };

  const handleSubTabChange = (tabKey: string) => {
    setActiveSubTab(tabKey);
  };

  return (
    <div className="flex h-screen">
      <Sidebar/> {/* keep role logic as your app needs */}

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar
          activeSection={activeTopSection}
          onSectionChange={handleTopSectionChange}
        />

        {/* Sub nav right under topbar */}
        <SubNavbar
          activeTop={activeTopSection}
          activeTab={activeSubTab}
          onTabChange={handleSubTabChange}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
