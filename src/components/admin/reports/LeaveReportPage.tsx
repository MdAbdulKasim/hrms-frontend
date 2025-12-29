"use client";

import { Download } from "lucide-react";

export default function LeaveReportPage() {
  const handleExport = () => {
    console.log("Exporting leave report...");
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              Leave Report
            </h1>
            <p className="text-sm md:text-base text-gray-500">
              Monitor leave balances, absences, and time-off patterns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Content will go here */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center">
          <p className="text-gray-500">Leave report content will be displayed here</p>
        </div>
      </div>
    </div>
  );
}