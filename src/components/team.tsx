"use client";

import React, { useState } from "react";
import { Search, Plus, Clock } from "lucide-react";

import Dashboard from "./home";

// --- Types ---
type Tab = "Reportees" | "HR Process";

interface Reportee {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "Checked In" | "Checked Out" | "On Leave";
  initials: string;
}

interface Process {
  id: string;
  name: string;
  action: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

// --- Mock Data (Matching Screenshots) ---
const reporteesData: Reportee[] = [
  {
    id: "1",
    name: "Alice Johnson",
    role: "Designer",
    department: "Design",
    status: "Checked In",
    initials: "A",
  },
  {
    id: "2",
    name: "Bob Smith",
    role: "Developer",
    department: "Engineering",
    status: "Checked Out",
    initials: "B",
  },
  {
    id: "3",
    name: "Carol White",
    role: "QA Engineer",
    department: "Quality",
    status: "On Leave",
    initials: "C",
  },
  {
    id: "4",
    name: "David Brown",
    role: "Developer",
    department: "Engineering",
    status: "Checked In",
    initials: "D",
  },
];

const processesData: Process[] = [
  {
    id: "1",
    name: "Alice Johnson",
    action: "Department Change: Design → Product",
    date: "Dec 5, 2024",
    status: "Pending",
  },
  {
    id: "2",
    name: "Bob Smith",
    action: "Location Change: NYC → LA",
    date: "Dec 3, 2024",
    status: "Approved",
  },
  {
    id: "3",
    name: "Carol White",
    action: "Designation Change: Developer → Sr. Developer",
    date: "Dec 1, 2024",
    status: "Rejected",
  },
];

// --- Components ---

// 1. Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStyles = () => {
    switch (status) {
      case "Checked In":
      case "Approved":
        return "bg-green-500 text-white";
      case "On Leave":
      case "Rejected":
        return "bg-red-500 text-white";
      case "Checked Out":
      case "Pending":
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${getStyles()}`}
    >
      {status}
    </span>
  );
};

// 2. Reportees Tab View
const ReporteesView = () => {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Reportees</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search reportees..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reporteesData.map((person) => (
          <div
            key={person.id}
            className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-medium">
                {person.initials}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{person.name}</h3>
                <p className="text-sm text-gray-500">{person.role}</p>
                <p className="text-xs text-gray-400">{person.department}</p>
              </div>
            </div>
            <StatusBadge status={person.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. HR Process Tab View
const HRProcessView = () => {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">HR Process</h2>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Initiate Process
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-gray-900" />
          <h3 className="text-xl font-bold text-gray-900">Recent Processes</h3>
        </div>

        <div className="flex flex-col gap-4">
          {processesData.map((process) => (
            <div
              key={process.id}
              className="bg-gray-50 rounded-lg p-5 flex items-center justify-between"
            >
              <div>
                <h4 className="font-semibold text-gray-900 text-base">
                  {process.name}
                </h4>
                <p className="text-slate-600 text-sm mt-1">{process.action}</p>
                <p className="text-gray-400 text-xs mt-1">{process.date}</p>
              </div>
              <StatusBadge status={process.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Reportees");

  return (
    
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="border-b border-gray-100 px-8 py-4">
        <div className="flex gap-2">
          {(["Reportees", "HR Process"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-gray-100 text-gray-900 shadow-sm" // Active State
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50" // Inactive State
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === "Reportees" ? <ReporteesView /> : <HRProcessView />}
      </main>
    </div>
    
  );
}