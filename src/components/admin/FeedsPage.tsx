"use client";

import { useState, ReactNode } from "react";
import {
  Megaphone,
  MessageSquare,
  CheckCircle,
  Bell,
  Calendar,
} from "lucide-react";

/* ================= TYPES ================= */

type TabKey =
  | "all"
  | "status"
  | "announcements"
  | "approvals"
  | "alerts"
  | "holidays";

interface FeedCardProps {
  icon: ReactNode;
  title: string;
  text: string;
  tag?: string;
  tagColor?: string;
  timestamp?: string;
}

interface HolidayRowProps {
  title: string;
  date: string;
}

/* ================= PAGE ================= */

export default function FeedsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const tabs = [
    { key: "all", label: "All" },
    { key: "status", label: "Status" },
    { key: "announcements", label: "Announcements" },
    { key: "approvals", label: "Approvals" },
    { key: "alerts", label: "Alerts" },
    { key: "holidays", label: "Holidays" },
  ];

  return (
    // Changed p-6 to p-4 for mobile, md:p-6 for desktop
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Page Title */}
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Feeds</h1>

      {/* Tabs */}
      {/* Added flex-wrap for mobile, adjusted width logic */}
      <div className="flex flex-wrap gap-2 mb-6 bg-gray-100 p-1 rounded-lg w-full md:w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            // Added flex-1 to make buttons grow evenly on mobile rows
            className={`px-3 py-2 md:px-4 rounded-md text-sm font-medium transition flex-1 md:flex-none text-center whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white shadow text-blue-600"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="space-y-4">
        {/* ================= ALL ================= */}
        {activeTab === "all" && (
          <>
            <FeedCard
              icon={<Megaphone className="text-orange-600" />}
              title="Year End Party"
              text="Join us for the annual celebration on Dec 20!"
              tag="Announcement"
              tagColor="bg-orange-100 text-orange-700"
              timestamp="2 hours ago"
            />

            <FeedCard
              icon={<CheckCircle className="text-green-600" />}
              title="Leave Approved"
              text="Your leave request for Dec 26–27 has been approved."
              tag="Approval"
              tagColor="bg-green-100 text-green-700"
              timestamp="4 hours ago"
            />

            <FeedCard
              icon={<MessageSquare className="text-blue-600" />}
              title="Alice Johnson"
              text="Working on the new dashboard design today!"
              tag="Status"
              tagColor="bg-blue-100 text-blue-700"
              timestamp="5 hours ago"
            />

            <FeedCard
              icon={<Bell className="text-red-600" />}
              title="Reminder"
              text="Please submit your timesheets by end of day."
              tag="Alert"
              tagColor="bg-red-100 text-red-700"
              timestamp="1 day ago"
            />
          </>
        )}

        {/* ================= STATUS ================= */}
        {activeTab === "status" && (
          <>
            <div className="bg-white p-4 rounded-lg shadow">
              <textarea
                placeholder="What's on your mind?"
                className="w-full border rounded-lg p-3 h-24 focus:ring-2 focus:ring-blue-400"
              />
              <button className="mt-2 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Post
              </button>
            </div>

            <FeedCard
              icon={<MessageSquare className="text-blue-600" />}
              title="Alice Johnson"
              text="Working on the new dashboard design today!"
              timestamp="5 hours ago"
            />
          </>
        )}

        {/* ================= ANNOUNCEMENTS ================= */}
        {activeTab === "announcements" && (
          <FeedCard
            icon={<Megaphone className="text-orange-600" />}
            title="Year End Party"
            text="Join us for the annual celebration on Dec 20!"
            tag="Announcement"
            tagColor="bg-orange-100 text-orange-700"
            timestamp="2 hours ago"
          />
        )}

        {/* ================= APPROVALS ================= */}
        {activeTab === "approvals" && (
          <FeedCard
            icon={<CheckCircle className="text-green-600" />}
            title="Leave Approved"
            text="Your leave request for Dec 26–27 has been approved."
            tag="Approval"
            tagColor="bg-green-100 text-green-700"
            timestamp="4 hours ago"
          />
        )}

        {/* ================= ALERTS ================= */}
        {activeTab === "alerts" && (
          <FeedCard
            icon={<Bell className="text-red-600" />}
            title="Reminder"
            text="Please submit your timesheets by end of day."
            tag="Alert"
            tagColor="bg-red-100 text-red-700"
            timestamp="1 day ago"
          />
        )}

        {/* ================= HOLIDAYS ================= */}
        {activeTab === "holidays" && (
          <div className="space-y-3">
            <HolidayRow title="Christmas" date="December 25, 2024" />
            <HolidayRow title="New Year's Day" date="January 1, 2025" />
            <HolidayRow
              title="Martin Luther King Jr. Day"
              date="January 20, 2025"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function FeedCard({
  icon,
  title,
  text,
  tag,
  tagColor,
  timestamp,
}: FeedCardProps) {
  return (
    // Added flex-col for very small screens or keep row with better constraints
    // shrink-0 on icon prevents it from getting squashed
    // min-w-0 on content div allows text truncate/wrap to work in flexbox
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow flex items-start gap-3 sm:gap-4">
      <div className="mt-1 shrink-0">{icon}</div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm sm:text-base truncate">{title}</h3>
        <p className="text-gray-600 text-sm break-words">{text}</p>
        {timestamp && (
          <p className="text-xs text-gray-400 mt-1">{timestamp}</p>
        )}
      </div>

      {tag && (
        <span
          className={`shrink-0 px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded-full font-semibold ${tagColor}`}
        >
          {tag}
        </span>
      )}
    </div>
  );
}

function HolidayRow({ title, date }: HolidayRowProps) {
  return (
    // Stacks vertically on mobile, row on tablet+
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
      <div className="flex items-center gap-2">
        <Calendar className="text-blue-600 shrink-0" size={18} />
        <span className="font-medium text-sm sm:text-base">{title}</span>
      </div>
      <span className="text-gray-500 text-xs sm:text-sm pl-6 sm:pl-0">
        {date}
      </span>
    </div>
  );
}