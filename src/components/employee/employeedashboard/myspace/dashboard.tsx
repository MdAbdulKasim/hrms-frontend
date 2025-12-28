'use client';
import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, ExternalLink, Megaphone, List, UserCheck } from 'lucide-react';
import { getOrgId } from '@/lib/auth';
import quickLinkService, { QuickLink as QuickLinkType } from '@/lib/quickLinkService';

interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface QuickLink {
  id: string;
  title: string;
  url: string;
}

const Dashboard: React.FC = () => {
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showQuickLinkModal, setShowQuickLinkModal] = useState(false);
  const [quickLinks, setQuickLinks] = useState<QuickLinkType[]>([]);
  const [quickLinksLoading, setQuickLinksLoading] = useState(true);
  const [quickLinksError, setQuickLinksError] = useState<string | null>(null);
  const [quickLinkCreating, setQuickLinkCreating] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Year End Party',
      description: 'Join us for the annual celebration!',
      date: 'Dec 20, 2024'
    },
    {
      id: '2',
      title: 'Policy Update',
      description: 'New leave policy effective January',
      date: 'Dec 15, 2024'
    }
  ]);

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    expiryDate: '',
    disableComments: false,
    pinToTop: false,
    notifyAll: false
  });

  const [quickLinkForm, setQuickLinkForm] = useState({
    title: '',
    url: ''
  });

  // Fetch quick links on mount
  useEffect(() => {
    const fetchQuickLinks = async () => {
      try {
        setQuickLinksLoading(true);
        const orgId = getOrgId();
        if (!orgId) {
          setQuickLinksError('Organization ID not found');
          setQuickLinks([]);
          return;
        }

        const response = await quickLinkService.getAll(orgId);
        if (response.error) {
          setQuickLinksError(response.error);
          setQuickLinks([]);
        } else {
          setQuickLinks(response.data || []);
          setQuickLinksError(null);
        }
      } catch (error) {
        console.error('Error fetching quick links:', error);
        setQuickLinksError('Failed to load quick links');
        setQuickLinks([]);
      } finally {
        setQuickLinksLoading(false);
      }
    };

    fetchQuickLinks();
  }, []);

  const handleCreateAnnouncement = () => {
    if (announcementForm.title && announcementForm.message) {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title: announcementForm.title,
        description: announcementForm.message,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      setAnnouncementForm({
        title: '',
        message: '',
        expiryDate: '',
        disableComments: false,
        pinToTop: false,
        notifyAll: false
      });
      setShowAnnouncementModal(false);
    }
  };

  const handleAddQuickLink = async () => {
    if (!quickLinkForm.title || !quickLinkForm.url) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setQuickLinkCreating(true);
      const orgId = getOrgId();
      if (!orgId) {
        setQuickLinksError('Organization ID not found');
        return;
      }

      const response = await quickLinkService.create(orgId, {
        name: quickLinkForm.title,
        url: quickLinkForm.url
      });

      if (response.error) {
        setQuickLinksError(response.error);
        alert('Failed to create quick link');
        return;
      }

      // Add new link to list
      const newLink = response.data as QuickLinkType;
      if (newLink && newLink.id) {
        setQuickLinks([...quickLinks, newLink]);
        setQuickLinkForm({ title: '', url: '' });
        setShowQuickLinkModal(false);
        setQuickLinksError(null);
      }
    } catch (error) {
      console.error('Error creating quick link:', error);
      setQuickLinksError('Failed to create quick link');
    } finally {
      setQuickLinkCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Row - Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Birthdays */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-pink-600" />
              </div>
              <h2 className="text-lg font-semibold truncate">Birthdays</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-medium shrink-0">
                  A
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">Alice Johnson</div>
                  <div className="text-xs text-gray-500">Today</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-medium shrink-0">
                  B
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">Bob Smith</div>
                  <div className="text-xs text-gray-500">Tomorrow</div>
                </div>
              </div>
            </div>
          </div>

          {/* New Hires */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold truncate">New Hires</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium shrink-0">
                  C
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">Carol White</div>
                  <div className="text-xs text-gray-500 truncate">Designer · Dec 5, 2024</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium shrink-0">
                  D
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">David Brown</div>
                  <div className="text-xs text-gray-500 truncate">Developer · Dec 5, 2024</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links - Spans full width on tablet (sm) if needed, or fits into grid */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold truncate">Quick Links</h2>
              </div>
            </div>
            <div className="space-y-2">
              {quickLinksLoading ? (
                <p className="text-sm text-gray-500">Loading quick links...</p>
              ) : quickLinksError ? (
                <p className="text-sm text-red-500">{quickLinksError}</p>
              ) : quickLinks.length > 0 ? (
                quickLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm hover:bg-gray-50 p-2 rounded -mx-2"
                  >
                    <span className="truncate mr-2">{link.name || link.title}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
                  </a>
                ))
              ) : (
                <p className="text-sm text-gray-500">No quick links yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Announcements */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <Megaphone className="w-4 h-4 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold truncate">Announcements</h2>
              </div>
            </div>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{announcement.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{announcement.description}</div>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">{announcement.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Holidays */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold truncate">Upcoming Holidays</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Christmas</span>
                <span className="text-sm text-gray-500">Dec 25, 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">New Year</span>
                <span className="text-sm text-gray-500">Jan 1, 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* My Pending Tasks */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <List className="w-4 h-4 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold truncate">My Pending Tasks</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm truncate">Review timesheet</span>
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded shrink-0">high</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm truncate">Approve leave request</span>
                <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded shrink-0">medium</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm truncate">Complete training</span>
                <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded shrink-0">low</span>
              </div>
            </div>
          </div>

          {/* On Leave Today */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold truncate">On Leave Today</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium shrink-0">
                  E
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">Emily Davis</div>
                  <div className="text-xs text-gray-500 truncate">Sick Leave · Until Dec 12</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium shrink-0">
                  F
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">Frank Miller</div>
                  <div className="text-xs text-gray-500 truncate">Vacation · Until Dec 15</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-white z-10">
                <h2 className="text-xl sm:text-2xl font-semibold">Create Announcement</h2>
                <button
                  onClick={() => setShowAnnouncementModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Announcement title"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    placeholder="Write your announcement..."
                    value={announcementForm.message}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Date & Time</label>
                  <input
                    type="datetime-local"
                    value={announcementForm.expiryDate}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, expiryDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcementForm.disableComments}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, disableComments: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm font-medium">Disable comments</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcementForm.pinToTop}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, pinToTop: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm font-medium">Pin to top</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcementForm.notifyAll}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, notifyAll: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm font-medium">Notify all employees</span>
                  </label>
                </div>

                <button
                  onClick={handleCreateAnnouncement}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Post Announcement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Quick Link Modal */}
      {showQuickLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-white z-10">
                <h2 className="text-xl sm:text-2xl font-semibold">Add Quick Link</h2>
                <button
                  onClick={() => setShowQuickLinkModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Link title"
                    value={quickLinkForm.title}
                    onChange={(e) => setQuickLinkForm({ ...quickLinkForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={quickLinkForm.url}
                    onChange={(e) => setQuickLinkForm({ ...quickLinkForm, url: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <button
                  onClick={handleAddQuickLink}
                  disabled={quickLinkCreating}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {quickLinkCreating ? 'Adding...' : 'Add Link'}
                </button>
                {quickLinksError && (
                  <p className="text-red-500 text-sm">{quickLinksError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;