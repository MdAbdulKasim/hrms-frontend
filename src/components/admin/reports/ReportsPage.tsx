"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Users,
  Clock,
  Calendar,
  Download,
  Eye
} from "lucide-react";

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function ReportsPage() {
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reports: ReportCard[] = [
    {
      id: "salary",
      title: "Salary Report",
      description: "View and download salary reports, payroll summaries, and compensation analysis",
      icon: <DollarSign className="w-8 h-8" />,
    },
    {
      id: "employee",
      title: "Employee Report",
      description: "Access employee data, demographics, and workforce analytics",
      icon: <Users className="w-8 h-8" />,
    },
    {
      id: "attendance",
      title: "Attendance Report",
      description: "Track attendance records, punctuality metrics, and work hours",
      icon: <Clock className="w-8 h-8" />,
    },
    {
      id: "leave",
      title: "Leave Report",
      description: "Monitor leave balances, absences, and time-off patterns",
      icon: <Calendar className="w-8 h-8" />,
    },
  ];

  const handleViewReport = (reportId: string) => {
    setSelectedReport(reportId);
    // Navigate to respective report page
    router.push(`/admin/reports/${reportId}`);
    console.log(`Viewing ${reportId} report`);
  };

  const handleDownloadReport = (reportId: string) => {
    console.log(`Downloading ${reportId} report`);
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Reports</h1>
            <p className="text-sm md:text-base text-gray-500">
              Generate and download comprehensive reports for your organization
            </p>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-blue-50 p-6 flex justify-center items-center">
                  <div className="text-blue-600">
                    {report.icon}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 min-h-[60px]">
                    {report.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewReport(report.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}