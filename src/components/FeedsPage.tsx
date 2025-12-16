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
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold mb-6">Feeds</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
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
              <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
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
    <div className="bg-white p-4 rounded-lg shadow flex items-start gap-4">
      <div className="mt-1">{icon}</div>

      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-gray-600 text-sm">{text}</p>
        {timestamp && (
          <p className="text-xs text-gray-400 mt-1">{timestamp}</p>
        )}
      </div>

      {tag && (
        <span
          className={`px-3 py-1 text-xs rounded-full font-semibold ${tagColor}`}
        >
          {tag}
        </span>
      )}
    </div>
  );
}

function HolidayRow({ title, date }: HolidayRowProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Calendar className="text-blue-600" size={18} />
        <span className="font-medium">{title}</span>
      </div>
      <span className="text-gray-500 text-sm">{date}</span>
    </div>
  );
}
