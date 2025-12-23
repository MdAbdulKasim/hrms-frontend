// components/profile/tabs/LeaveTab.tsx
import { Sun, Target, XCircle, Baby, Calendar } from 'lucide-react';
import { LeaveBalance } from '../types';

interface LeaveTabProps {
  leaveBalances: LeaveBalance[];
  year: string;
}

export default function LeaveTab({ leaveBalances, year }: LeaveTabProps) {
  return (
    <div className="p-6">
      {/* Year Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <span className="font-medium">{year}</span>
          <span>Leave booked: 0 | Absent: 0</span>
        </div>
      </div>

      {/* Leave Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        <LeaveTypeCard
          title="Casual Leave"
          icon={<Sun className="w-6 h-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          available={12}
          booked={0}
        />
        <LeaveTypeCard
          title="Earned Leave"
          icon={<Target className="w-6 h-6" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          available={12}
          booked={0}
        />
        <LeaveTypeCard
          title="Leave Without Pay"
          icon={<XCircle className="w-6 h-6" />}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          available={0}
          booked={0}
        />
        <LeaveTypeCard
          title="Paternity Leave"
          icon={<Baby className="w-6 h-6" />}
          iconBgColor="bg-pink-100"
          iconColor="text-pink-600"
          available={0}
          booked={0}
        />
        <LeaveTypeCard
          title="Sabbatical"
          icon={<Calendar className="w-6 h-6" />}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          available={0}
          booked={0}
        />
      </div>

      {/* Upcoming Leaves Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Upcoming Leaves & Holidays</h3>
          <button className="text-sm text-gray-600 hover:text-gray-900">
            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className="bg-white border rounded-lg p-12 flex flex-col items-center justify-center">
          <div className="w-48 h-48 mb-4">
            <img src="/api/placeholder/200/200" alt="No data" className="w-full h-full object-contain" />
          </div>
          <p className="text-gray-500">No Data Found</p>
        </div>
      </div>

      {/* Past Leaves Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Past Leaves & Holidays</h3>
          <button className="text-sm text-gray-600 hover:text-gray-900">
            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

interface LeaveTypeCardProps {
  title: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  available: number;
  booked: number;
}

function LeaveTypeCard({ title, icon, iconBgColor, iconColor, available, booked }: LeaveTypeCardProps) {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center mb-3`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <h4 className="font-medium text-gray-900 mb-4">{title}</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Available</span>
          <span className="font-semibold text-gray-900">{available}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Booked</span>
          <span className="font-semibold text-gray-900 flex items-center gap-1">
            {booked}
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}