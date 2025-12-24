// components/profile/tabs/LeaveTab.tsx
import { Sun, Target, XCircle, Baby, Calendar, Sunrise, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { LeaveBalance } from '../types';

interface LeaveTabProps {
  leaveBalances: LeaveBalance[];
  year: string;
}

export default function LeaveTab({ leaveBalances, year }: LeaveTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'upcoming' | 'past' | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleLeaveCardClick = (leaveType: string) => {
    setSelectedLeaveType(leaveType);
    setIsModalOpen(true);
  };

  // Scroll to form when it opens
  useEffect(() => {
    if (isModalOpen && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isModalOpen]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <LeaveTypeCard
          title="Casual Leave"
          icon={<Sun className="w-6 h-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          available={12}
          booked={0}
          onClick={() => handleLeaveCardClick('Casual Leave')}
        />
        <LeaveTypeCard
          title="Leave Without Pay"
          icon={<Sunrise className="w-6 h-6" />}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          available={0}
          booked={0}
          onClick={() => handleLeaveCardClick('Leave Without Pay')}
        />
        <LeaveTypeCard
          title="Paternity Leave"
          icon={<Baby className="w-6 h-6" />}
          iconBgColor="bg-pink-100"
          iconColor="text-pink-600"
          available={0}
          booked={0}
          onClick={() => handleLeaveCardClick('Paternity Leave')}
        />
        <LeaveTypeCard
          title="Sabbatical Leave"
          icon={<Calendar className="w-6 h-6" />}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          available={0}
          booked={0}
          onClick={() => handleLeaveCardClick('Sabbatical Leave')}
        />
        <LeaveTypeCard
          title="Sick Leave"
          icon={<Target className="w-6 h-6" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          available={12}
          booked={0}
          onClick={() => handleLeaveCardClick('Sick Leave')}
        />
      </div>

      {/* Apply Leave Form - Inline */}
      {isModalOpen && (
        <div ref={formRef}>
          <ApplyLeaveForm
            leaveType={selectedLeaveType}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      )}

      {/* Upcoming Leaves Section */}
      {!isModalOpen && (
        <div className="mb-6">
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'upcoming' ? null : 'upcoming')}
              className="w-full md:w-auto px-4 py-2 border-2 border-blue-500 rounded-lg text-left flex items-center justify-between gap-2 hover:bg-blue-50 transition-colors"
            >
              <span className="font-medium">Upcoming Leaves & Holidays</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {activeDropdown === 'upcoming' && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[250px]">
                <div className="p-2 border-b bg-gray-50 font-medium">Upcoming Leaves & Holidays</div>
                <div className="p-2 hover:bg-gray-50 cursor-pointer">Upcoming Leaves</div>
                <div className="p-2 hover:bg-gray-50 cursor-pointer">Upcoming Holidays</div>
              </div>
            )}
          </div>

          <div className="mt-4 bg-white border rounded-lg p-12 flex flex-col items-center justify-center">
            <div className="w-48 h-48 mb-4 flex items-center justify-center">
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
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No Data Found</p>
          </div>
        </div>
      )}

      {/* Past Leaves Section */}
      {!isModalOpen && (
        <div className="mb-6">
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'past' ? null : 'past')}
              className="w-full md:w-auto px-4 py-2 border-2 border-blue-500 rounded-lg text-left flex items-center justify-between gap-2 hover:bg-blue-50 transition-colors"
            >
              <span className="font-medium">Past Leaves & Holidays</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {activeDropdown === 'past' && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[250px]">
                <div className="p-2 border-b bg-gray-50 font-medium">Past Leaves & Holidays</div>
                <div className="p-2 hover:bg-gray-50 cursor-pointer">Past Leaves</div>
                <div className="p-2 hover:bg-gray-50 cursor-pointer">Past Holidays</div>
              </div>
            )}
          </div>

          <div className="mt-4 bg-white border rounded-lg p-12 flex flex-col items-center justify-center">
            <div className="w-48 h-48 mb-4 flex items-center justify-center">
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
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No Data Found</p>
          </div>
        </div>
      )}
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
  onClick: () => void;
}

function LeaveTypeCard({ title, icon, iconBgColor, iconColor, available, booked, onClick }: LeaveTypeCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center mb-3`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <h4 className="font-medium text-gray-900 mb-4">{title}</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Available</span>
          <span className="font-semibold text-green-600">{available}</span>
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

interface ApplyLeaveFormProps {
  leaveType: string;
  onClose: () => void;
}

function ApplyLeaveForm({ leaveType, onClose }: ApplyLeaveFormProps) {
  const [formData, setFormData] = useState({
    leaveType: leaveType,
    fromDate: '',
    toDate: '',
    teamEmail: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Leave application:', formData);
    onClose();
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg mb-6">
      {/* Form Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">Apply Leave</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Leave</h3>
          
          {/* Leave Type */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              Leave type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            >
              <option value="Paternity Leave">Paternity Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Leave Without Pay">Leave Without Pay</option>
              <option value="Sabbatical Leave">Sabbatical Leave</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={formData.fromDate}
                onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="dd-MMM-yyyy"
                required
              />
              <input
                type="date"
                value={formData.toDate}
                onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="dd-MMM-yyyy"
                required
              />
            </div>
          </div>

          {/* Team Email ID */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              Team Email ID
            </label>
            <input
              type="email"
              value={formData.teamEmail}
              onChange={(e) => setFormData({ ...formData, teamEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Reason for Leave */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Reason for leave
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Form Footer */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}