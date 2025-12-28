'use client';
import React, { useState, useEffect } from 'react';
import { Megaphone, X } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';

interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
}

const AnnouncementsSection: React.FC = () => {
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    expiryDate: '',
    disableComments: false,
    pinToTop: false,
    notifyAll: false
  });

  // Fetch announcements from API
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const apiUrl = getApiUrl();
        const token = getAuthToken();
        const orgId = getOrgId();

        if (!orgId) {
          console.error('No organization ID found');
          setAnnouncements([]);
          return;
        }

        const response = await axios.get(`${apiUrl}/org/${orgId}/announcements`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const announcementData = response.data.data || response.data || [];

        // Transform API data to component format
        const transformedAnnouncements: Announcement[] = announcementData.map((item: any) => ({
          id: item.id || Date.now().toString(),
          title: item.title || 'Untitled',
          description: item.content || item.description || '',
          date: new Date(item.createdAt || item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        }));

        setAnnouncements(transformedAnnouncements);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async () => {
    if (announcementForm.title && announcementForm.message) {
      try {
        setLoading(true);
        const apiUrl = getApiUrl();
        const token = getAuthToken();
        const orgId = getOrgId();

        if (!orgId) {
          alert('Organization not found');
          return;
        }

        // Call API to create announcement
        const response = await axios.post(
          `${apiUrl}/org/${orgId}/announcements`,
          {
            title: announcementForm.title,
            content: announcementForm.message,
            expiryDate: announcementForm.expiryDate || null,
            isPinned: announcementForm.pinToTop,
            disableComments: announcementForm.disableComments,
            notifyEmployees: announcementForm.notifyAll
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.status === 201 || response.status === 200) {
          // Add to local state
          const newAnnouncement: Announcement = {
            id: response.data.id || Date.now().toString(),
            title: announcementForm.title,
            description: announcementForm.message,
            date: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          };

          setAnnouncements([newAnnouncement, ...announcements]);

          // Reset form
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
      } catch (error) {
        console.error('Error creating announcement:', error);
        alert('Failed to create announcement. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 sm:p-5 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold truncate text-slate-900">Announcements</h2>
          </div>
          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="text-blue-500 hover:text-blue-600 text-2xl leading-none px-2 transition-colors"
          >
            +
          </button>
        </div>
        <div className="space-y-4">
          {announcements.length === 0 ? (
             <p className="text-sm text-slate-400">No announcements yet.</p>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate text-slate-900">{announcement.title}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">{announcement.description}</div>
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap">{announcement.date}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <div className="relative w-full max-w-lg gap-4 border border-slate-200 bg-white p-6 shadow-lg sm:rounded-lg animate-in fade-in-0 zoom-in-95 duration-200">
            
            <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-5">
              <h2 className="text-lg font-semibold leading-none tracking-tight text-slate-900">Create Announcement</h2>
              <p className="text-sm text-slate-500">Post a new update for the team.</p>
            </div>

            <button
              onClick={() => setShowAnnouncementModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500"
            >
              <X className="h-4 w-4 text-slate-500" />
              <span className="sr-only">Close</span>
            </button>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">Title</label>
                <input
                  type="text"
                  placeholder="Announcement title"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">Message</label>
                <textarea
                  placeholder="Write your announcement..."
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  rows={4}
                  className="flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">Expiry Date</label>
                <input
                  type="datetime-local"
                  value={announcementForm.expiryDate}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, expiryDate: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={announcementForm.disableComments}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, disableComments: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-950"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Disable comments</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={announcementForm.pinToTop}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, pinToTop: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-950"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Pin to top</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={announcementForm.notifyAll}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, notifyAll: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-950"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Notify all employees</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="mt-2 sm:mt-0 inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 ring-offset-white transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnouncement}
                className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-slate-50 ring-offset-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Post Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementsSection;