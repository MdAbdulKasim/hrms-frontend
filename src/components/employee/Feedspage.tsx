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
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [statusInput, setStatusInput] = useState('');
  const [statusCreating, setStatusCreating] = useState(false);
  const [expandedStatusId, setExpandedStatusId] = useState<string | null>(null);
  const [statusReplies, setStatusReplies] = useState<Record<string, any[]>>({});

  const tabs = [
    { key: "all", label: "All" },
    { key: "status", label: "Status" },
    { key: "announcements", label: "Announcements" },
    { key: "approvals", label: "Approvals" },
    { key: "alerts", label: "Alerts" },
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
        setAlerts([]);

        // Fetch statuses from backend (requires orgId and locationId)
        try {
          const locationId = getLocationId();
          if (locationId) {
            const statusRes = await statusService.getStatuses(orgId, locationId);
            setStatuses(statusRes.data || []);
          } else {
            console.warn('No locationId found, skipping status fetch');
            setStatuses([]);
          }
        } catch (error) {
          console.error('Error fetching statuses:', error);
          setStatuses([]);
        }

      } catch (error) {
        console.error('Error fetching feed data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedData();
  }, []);

  const handleCreateStatus = async () => {
    if (!statusInput.trim()) return;

    try {
      setStatusCreating(true);
      const orgId = getOrgId();
      if (!orgId) {
        alert('Organization not found');
        return;
      }

      const locationId = getLocationId();
      if (!locationId) {
        alert('Location not found');
        return;
      }

      const response = await statusService.createStatus(orgId, locationId, {
        content: statusInput,
        text: statusInput
      });

      if (response.error) {
        alert(response.error);
        return;
      }

      // Add new status to list
      const newStatus = response.data as any;
      if (newStatus) {
        setStatuses([newStatus, ...statuses]);
        setStatusInput('');
      }
    } catch (error) {
      console.error('Error creating status:', error);
      alert('Failed to create status');
    } finally {
      setStatusCreating(false);
    }
  };

  const handleLoadReplies = async (statusId: string) => {
    if (statusReplies[statusId]) {
      setExpandedStatusId(expandedStatusId === statusId ? null : statusId);
      return;
    }

    try {
      const orgId = getOrgId();
      if (!orgId) return;

      const response = await statusService.getReplies(orgId, getLocationId() || '', statusId);
      setStatusReplies({
        ...statusReplies,
        [statusId]: Array.isArray(response.data) ? response.data : []
      });
      setExpandedStatusId(statusId);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Page Title */}
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Feeds</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 bg-gray-100 p-1 rounded-lg w-full md:w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
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
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading feeds...</p>
          </div>
        ) : (
          <>
            {/* ================= ALL ================= */}
            {activeTab === "all" && (
              <>
                {/* Announcements */}
                {announcements.map((announcement) => (
                  <FeedCard
                    key={announcement.id}
                    icon={<Megaphone className="text-orange-600" />}
                    title={announcement.title}
                    text={announcement.description}
                    tag="Announcement"
                    tagColor="bg-orange-100 text-orange-700"
                    timestamp={announcement.date}
                  />
                ))}

                {/* Approvals */}
                {approvals.slice(0, 3).map((approval) => (
                  <FeedCard
                    key={approval.id}
                    icon={<CheckCircle className="text-green-600" />}
                    title="Leave Request Update"
                    text={`Your leave request has been ${approval.status?.toLowerCase() || 'processed'}.`}
                    tag="Approval"
                    tagColor="bg-green-100 text-green-700"
                    timestamp={approval.createdAt || approval.date}
                  />
                ))}

                {/* Alerts */}
                {alerts.map((alert) => (
                  <FeedCard
                    key={alert.id}
                    icon={<Bell className="text-red-600" />}
                    title={alert.title || "System Alert"}
                    text={alert.message || alert.description}
                    tag="Alert"
                    tagColor="bg-red-100 text-red-700"
                    timestamp={alert.createdAt || alert.date}
                  />
                ))}
              </>
            )}

            {/* ================= STATUS ================= */}
            {activeTab === "status" && (
              <>
                <div className="bg-white p-4 rounded-lg shadow">
                  <textarea
                    placeholder="What's on your mind?"
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="w-full border rounded-lg p-3 h-24 focus:ring-2 focus:ring-blue-400"
                  />
                  <button 
                    onClick={handleCreateStatus}
                    disabled={statusCreating || !statusInput.trim()}
                    className="mt-2 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {statusCreating ? 'Posting...' : 'Post'}
                  </button>
                </div>

                {statuses.length > 0 ? (
                  statuses.map((status) => (
                    <div key={status.id} className="bg-white p-4 rounded-lg shadow">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="text-blue-600 shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">
                            {status.createdBy?.firstName || 'User'}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1 break-words">
                            {status.content || status.text || 'No content'}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(status.createdAt).toLocaleString()}
                          </p>
                          <button
                            onClick={() => handleLoadReplies(status.id)}
                            className="text-blue-500 text-xs mt-2 hover:underline"
                          >
                            {statusReplies[status.id] ? 'Hide' : 'Show'} Replies ({statusReplies[status.id]?.length || 0})
                          </button>
                          
                          {expandedStatusId === status.id && statusReplies[status.id] && (
                            <div className="mt-3 space-y-2 border-t pt-3">
                              {statusReplies[status.id].map((reply) => (
                                <div key={reply.id} className="bg-gray-50 p-2 rounded text-sm">
                                  <p className="font-medium text-xs text-gray-700">
                                    {reply.createdBy?.firstName || 'User'}
                                  </p>
                                  <p className="text-gray-600 text-xs mt-1">
                                    {reply.content || reply.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No statuses yet</p>
                  </div>
                )}
              </>
            )}

            {/* ================= ANNOUNCEMENTS ================= */}
            {activeTab === "announcements" && (
              <>
                {announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No announcements available</p>
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <FeedCard
                      key={announcement.id}
                      icon={<Megaphone className="text-orange-600" />}
                      title={announcement.title}
                      text={announcement.description}
                      tag="Announcement"
                      tagColor="bg-orange-100 text-orange-700"
                      timestamp={announcement.date}
                    />
                  ))
                )}
              </>
            )}

            {/* ================= APPROVALS ================= */}
            {activeTab === "approvals" && (
              <>
                {approvals.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No approvals available</p>
                  </div>
                ) : (
                  approvals.map((approval) => (
                    <FeedCard
                      key={approval.id}
                      icon={<CheckCircle className="text-green-600" />}
                      title={`Leave Request - ${approval.status || 'Pending'}`}
                      text={`From ${approval.startDate || approval.from} to ${approval.endDate || approval.to}`}
                      tag="Approval"
                      tagColor="bg-green-100 text-green-700"
                      timestamp={approval.createdAt || approval.date}
                    />
                  ))
                )}
              </>
            )}

            {/* ================= ALERTS ================= */}
            {activeTab === "alerts" && (
              <>
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No alerts available</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <FeedCard
                      key={alert.id}
                      icon={<Bell className="text-red-600" />}
                      title={alert.title || "System Alert"}
                      text={alert.message || alert.description}
                      tag="Alert"
                      tagColor="bg-red-100 text-red-700"
                      timestamp={alert.createdAt || alert.date}
                    />
                  ))
                )}
              </>
            )}

            {/* ================= HOLIDAYS ================= */}
            {activeTab === "holidays" && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Upcoming Holidays</h3>
                {holidays.length === 0 ? (
                  <p className="text-gray-500">No holidays scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {holidays.map((holiday, index) => (
                      <HolidayRow 
                        key={index} 
                        title={holiday.holidayName || holiday.title} 
                        date={holiday.date} 
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
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