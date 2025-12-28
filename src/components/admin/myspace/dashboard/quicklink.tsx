'use client';
import React, { useState, useEffect } from 'react';
import { ExternalLink, X } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
 
interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}
 
interface QuickLinksSectionProps {
  className?: string;
}
 
const QuickLinksSection: React.FC<QuickLinksSectionProps> = ({ className = '' }) => {
  const [showQuickLinkModal, setShowQuickLinkModal] = useState(false);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
 
  const [quickLinkForm, setQuickLinkForm] = useState({
    title: '',
    url: ''
  });

  // Fetch quick links from API
  useEffect(() => {
    const fetchQuickLinks = async () => {
      try {
        const token = getAuthToken();
        const orgId = getOrgId();
        const apiUrl = getApiUrl();

        if (!token || !orgId) return;

        const response = await axios.get(`${apiUrl}/org/${orgId}/quick-links`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const linksData = response.data.data || response.data || [];
        setQuickLinks(Array.isArray(linksData) ? linksData : []);
      } catch (error) {
        console.error('Error fetching quick links:', error);
        setQuickLinks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuickLinks();
  }, []);
 
  const handleAddQuickLink = async () => {
    if (!quickLinkForm.title || !quickLinkForm.url) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const token = getAuthToken();
      const orgId = getOrgId();
      const apiUrl = getApiUrl();

      if (!token || !orgId) return;

      const response = await axios.post(
        `${apiUrl}/org/${orgId}/quick-links`,
        {
          title: quickLinkForm.title,
          url: quickLinkForm.url
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const newLink = response.data.data || response.data;
      setQuickLinks([...quickLinks, newLink]);
      setQuickLinkForm({ title: '', url: '' });
      setShowQuickLinkModal(false);
    } catch (error) {
      console.error('Error adding quick link:', error);
      alert('Failed to add quick link');
    }
  };
 
  return (
    <>
      <div className={`bg-white rounded-lg shadow p-4 sm:p-5 border border-slate-100 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <ExternalLink className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold truncate text-slate-900">Quick Links</h2>
          </div>
          <button
            onClick={() => setShowQuickLinkModal(true)}
            className="text-blue-500 hover:text-blue-600 text-2xl leading-none px-2 transition-colors"
          >
            +
          </button>
        </div>
        <div className="space-y-2">
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : quickLinks.length > 0 ? (
            quickLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-sm text-slate-700 hover:bg-slate-50 p-2 rounded -mx-2 transition-colors"
              >
                <span className="truncate mr-2">{link.title}</span>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </a>
            ))
          ) : (
            <p className="text-sm text-slate-500">No quick links yet</p>
          )}
        </div>
      </div>
 
      {/* Shadcn-style Modal Overlay */}
      {showQuickLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          {/* Shadcn-style Dialog Content */}
          <div className="relative w-full max-w-sm gap-4 border border-slate-200 bg-white p-6 shadow-lg sm:rounded-lg animate-in fade-in-0 zoom-in-95 duration-200">
            
            <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-5">
              <h2 className="text-lg font-semibold leading-none tracking-tight text-slate-900">Add Quick Link</h2>
              <p className="text-sm text-slate-500">Add a new shortcut to the dashboard.</p>
            </div>
 
            <button
              onClick={() => setShowQuickLinkModal(false)}
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
                  placeholder="Link title"
                  value={quickLinkForm.title}
                  onChange={(e) => setQuickLinkForm({ ...quickLinkForm, title: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
 
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={quickLinkForm.url}
                  onChange={(e) => setQuickLinkForm({ ...quickLinkForm, url: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
 
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <button
                onClick={() => setShowQuickLinkModal(false)}
                className="mt-2 sm:mt-0 inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 ring-offset-white transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuickLink}
                className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-slate-50 ring-offset-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
 
export default QuickLinksSection;