// components/profile/tabs/TimeTrackingTab.tsx
import { Clock } from 'lucide-react';

export default function TimeTrackingTab() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[500px]">
      <div className="w-48 h-48 mb-6 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="120" r="80" fill="#E0E7FF" opacity="0.5" />
          <ellipse cx="100" cy="160" rx="60" ry="10" fill="#C7D2FE" opacity="0.3" />
          <circle cx="80" cy="100" r="30" fill="#DBEAFE" />
          <circle cx="120" cy="100" r="30" fill="#DBEAFE" />
          <circle cx="100" cy="80" r="35" fill="#BFDBFE" />
          <circle cx="85" cy="75" r="8" fill="#3B82F6" />
          <circle cx="115" cy="75" r="8" fill="#3B82F6" />
          <path d="M 90 95 Q 100 105 110 95" stroke="#3B82F6" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="100" cy="40" r="8" fill="#EF4444" />
          <line x1="100" y1="48" x2="100" y2="60" stroke="#374151" strokeWidth="2" />
          
          {/* Clock icon overlay */}
          <circle cx="100" cy="110" r="25" fill="white" opacity="0.9" />
          <circle cx="100" cy="110" r="23" stroke="#3B82F6" strokeWidth="2" fill="none" />
          <line x1="100" y1="110" x2="100" y2="95" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
          <line x1="100" y1="110" x2="110" y2="110" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-gray-500 font-medium text-lg">No time tracking data available</p>
    </div>
  );
}