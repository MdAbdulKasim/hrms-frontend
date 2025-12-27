'use client';
import React, { useState } from 'react';
import { Megaphone, X } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
}

// Static mock data
const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'Welcome to the Team!',
    description: 'We are excited to have you on board. Please complete your onboarding tasks.',
    date: 'Dec 20, 2025'
  },
  {
    id: '2',
    title: 'Holiday Schedule',
    description: 'Office will be closed from Dec 24-26 for the holidays. Happy holidays!',
    date: 'Dec 15, 2025'
  },
  {
    id: '3',
    title: 'New Project Launch',
    description: 'Excited to announce our new project starting in January. More details coming soon.',
    date: 'Dec 10, 2025'
  }
];

const AnnouncementsSection: React.FC = () => {
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    expiryDate: '',
    disableComments: false,
    pinToTop: false,
    notifyAll: false
  });

  const handleCreateAnnouncement = () => {
    if (announcementForm.title && announcementForm.message) {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
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