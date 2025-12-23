// components/profile/ProfileTabs.tsx
interface Tab {
  id: string;
  label: string;
}

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: Tab[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'career-history', label: 'Career History' },
  { id: 'department', label: 'Department' },
  { id: 'peers', label: 'Peers' },
  { id: 'leave', label: 'Leave' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'time-logs', label: 'Time Logs' },
];

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="bg-white border-b">
      <div className="flex gap-6 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button className="py-4 px-2 text-gray-600 hover:text-gray-900">
          <span className="text-xl">⋯</span>
        </button>
      </div>
    </div>
  );
}