"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  Megaphone,
  MessageSquare,
  CheckCircle,
  Bell,
  Calendar,
} from "lucide-react";
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId, getLocationId } from '@/lib/auth';
import statusService from '@/lib/statusService';
import { CustomAlertDialog } from '@/components/ui/custom-dialogs';

/* ================= TYPES ================= */

type TabKey =
  | "all"
  // | "status"
  | "announcements"
  | "approvals"
  // | "alerts"
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
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  // const [alerts, setAlerts] = useState<any[]>([]);
  // const [statuses, setStatuses] = useState<any[]>([]);
  const [statusInput, setStatusInput] = useState('');
  const [statusCreating, setStatusCreating] = useState(false);

  // Alert State
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

  const tabs = [
    { key: "all", label: "All" },
    // { key: "status", label: "Status" },
    { key: "announcements", label: "Announcements" },
    { key: "approvals", label: "Approvals" },
    // { key: "alerts", label: "Alerts" },
    { key: "holidays", label: "Holidays" },
  ];

  // Fetch feed data from API
  useEffect(() => {
    const fetchFeedData = async () => {
      try {
        setLoading(true);
        const apiUrl = getApiUrl();
        const token = getAuthToken();
        const orgId = getOrgId();

        if (!token || !orgId) {
          console.warn('Missing authentication token or orgId');
          return;
        }

        // Fetch announcements
        try {
          const announcementsRes = await axios.get(`${apiUrl}/org/${orgId}/announcements`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAnnouncements(announcementsRes.data.data || announcementsRes.data || []);
        } catch (error) {
          console.error('Error fetching announcements:', error);
          setAnnouncements([]);
        }

        // Fetch holidays
        try {
          const holidaysRes = await axios.get(`${apiUrl}/org/${orgId}/holidays`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setHolidays(holidaysRes.data.data || holidaysRes.data || []);
        } catch (error) {
          console.error('Error fetching holidays:', error);
          setHolidays([]);
        }

        // Fetch approvals (leave requests)
        try {
          const approvalsRes = await axios.get(`${apiUrl}/org/${orgId}/leaves`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setApprovals(approvalsRes.data.data || approvalsRes.data || []);
        } catch (error) {
          console.error('Error fetching approvals:', error);
          setApprovals([]);
        }

        // Alerts - set empty for now as there's no notifications endpoint
        // setAlerts([]);

        // // Fetch statuses from backend (requires orgId and locationId)
        // try {
        //   const locationId = getLocationId();
        //   if (locationId) {
        //     const statusRes = await statusService.getStatuses(orgId, locationId);
        //     setStatuses(statusRes.data || []);
        //   } else {
        //     console.warn('No locationId found, skipping status fetch');
        //     setStatuses([]);
        //   }
        // } catch (error) {
        //   console.error('Error fetching statuses:', error);
        //   setStatuses([]);
        // }

      } catch (error) {
        console.error('Error fetching feed data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedData();
  }, []);

  // Handle creating a new status
  const handleCreateStatus = async () => {
    if (!statusInput.trim()) return;

    try {
      setStatusCreating(true);
      const orgId = getOrgId();
      if (!orgId) {
        showAlert('Error', 'Organization not found', "error");
        return;
      }

      const locationId = getLocationId();
      if (!locationId) {
        showAlert('Error', 'Location not found', "error");
        return;
      }

      const response = await statusService.createStatus(orgId, locationId, { content: statusInput.trim() });
      if (response.error) {
        showAlert('Error', response.error, "error");
        return;
      }

      const newStatus = response.data;
      // if (newStatus) {
      //   setStatuses([newStatus, ...statuses]);
      //   setStatusInput('');
      // }
    } catch (error) {
      console.error('Error creating status:', error);
      showAlert('Error', 'Failed to create status', "error");
    } finally {
      setStatusCreating(false);
    }
  };


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
            className={`px-3 py-2 md:px-4 rounded-md text-sm font-medium transition flex-1 md:flex-none text-center whitespace-nowrap ${activeTab === tab.key
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
        {loading ? (
          <div className="text-center text-gray-500">Loading feeds...</div>
        ) : (
          <>
            {/* ================= ALL ================= */}
            {activeTab === "all" && (
              <>
                {announcements.map((item) => (
                  <FeedCard
                    key={item.id}
                    icon={<Megaphone className="text-orange-600" />}
                    title={item.title}
                    text={item.description}
                    tag="Announcement"
                    tagColor="bg-orange-100 text-orange-700"
                    timestamp={item.createdAt}
                  />
                ))}
                {approvals.map((item) => (
                  <FeedCard
                    key={item.id}
                    icon={<CheckCircle className="text-green-600" />}
                    title={item.title || 'Leave Request'}
                    text={item.description || `Leave from ${item.startDate} to ${item.endDate}`}
                    tag="Approval"
                    tagColor="bg-green-100 text-green-700"
                    timestamp={item.createdAt}
                  />
                ))}
                {/* {statuses.map((item) => (
                  <FeedCard
                    key={item.id}
                    icon={<MessageSquare className="text-blue-600" />}
                    title={item.createdBy?.firstName || 'Employee'}
                    text={item.content}
                    tag="Status"
                    tagColor="bg-blue-100 text-blue-700"
                    timestamp={item.createdAt}
                  />
                ))}
                {alerts.map((item) => (
                  <FeedCard
                    key={item.id}
                    icon={<Bell className="text-red-600" />}
                    title={item.title}
                    text={item.message}
                    tag="Alert"
                    tagColor="bg-red-100 text-red-700"
                    timestamp={item.createdAt}
                  />
                ))} */}
              </>
            )}

            {/* ================= STATUS ================= */}
            {/* {activeTab === "status" && (
              <>
                {/* Status Creation Form */}
            {/* <div className="bg-white p-4 rounded-lg shadow mb-4">
                  <textarea
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full border rounded-lg p-3 h-24 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                  <button 
                    onClick={handleCreateStatus}
                    disabled={statusCreating || !statusInput.trim()}
                    className={`mt-2 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg transition ${
                      statusCreating || !statusInput.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                  >
                    {statusCreating ? 'Posting...' : 'Post'}
                  </button>
                </div>

                {statuses.length > 0 ? (
                  statuses.map((item) => (
                    <FeedCard
                      key={item.id}
                      icon={<MessageSquare className="text-blue-600" />}
                      title={item.createdBy?.firstName || 'Employee'}
                      text={item.content}
                      timestamp={item.createdAt}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-500">No statuses available</div>
                )}
              </>
            )} */}

            {/* ================= ANNOUNCEMENTS ================= */}
            {activeTab === "announcements" && (
              <>
                {announcements.length > 0 ? (
                  announcements.map((item) => (
                    <FeedCard
                      key={item.id}
                      icon={<Megaphone className="text-orange-600" />}
                      title={item.title}
                      text={item.description}
                      tag="Announcement"
                      tagColor="bg-orange-100 text-orange-700"
                      timestamp={item.createdAt}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-500">No announcements available</div>
                )}
              </>
            )}

            {/* ================= APPROVALS ================= */}
            {activeTab === "approvals" && (
              <>
                {approvals.length > 0 ? (
                  approvals.map((item) => (
                    <FeedCard
                      key={item.id}
                      icon={<CheckCircle className="text-green-600" />}
                      title={item.title || 'Leave Request'}
                      text={item.description || `Leave from ${item.startDate} to ${item.endDate}`}
                      tag="Approval"
                      tagColor="bg-green-100 text-green-700"
                      timestamp={item.createdAt}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-500">No approvals available</div>
                )}
              </>
            )}

            {/* ================= ALERTS ================= */}
            {/* {activeTab === "alerts" && (
              <>
                {alerts.length > 0 ? (
                  alerts.map((item) => (
                    <FeedCard
                      key={item.id}
                      icon={<Bell className="text-red-600" />}
                      title={item.title}
                      text={item.message}
                      tag="Alert"
                      tagColor="bg-red-100 text-red-700"
                      timestamp={item.createdAt}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-500">No alerts available</div>
                )}
              </>
            )} */}

            {/* ================= HOLIDAYS ================= */}
            {activeTab === "holidays" && (
              <div className="space-y-3">
                {holidays.length > 0 ? (
                  holidays.map((holiday) => (
                    <HolidayRow
                      key={holiday.id}
                      title={holiday.holidayName || holiday.name || holiday.title}
                      date={new Date(holiday.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-500">No holidays available</div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <CustomAlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}
        title={alertState.title}
        description={alertState.description}
        variant={alertState.variant}
      />
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