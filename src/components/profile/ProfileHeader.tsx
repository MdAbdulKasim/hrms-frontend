// components/profile/ProfileHeader.tsx
import { Star, MessageSquare, Phone, Video, MoreHorizontal } from 'lucide-react';
import { Employee } from './types';

interface ProfileHeaderProps {
  employee: Employee;
}

export default function ProfileHeader({ employee }: ProfileHeaderProps) {
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-40 bg-gradient-to-r from-green-800 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="/api/placeholder/1200/200" 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Profile Content */}
      <div className="bg-white px-6 pb-4">
        <div className="flex items-start justify-between -mt-16">
          {/* Left: Profile Image and Info */}
          <div className="flex gap-4">
            <img
              src={employee.profileImage || '/api/placeholder/120/120'}
              alt={`${employee.firstName} ${employee.lastName}`}
              className="w-32 h-32 rounded-lg border-4 border-white shadow-lg bg-white"
            />
            <div className="mt-16">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">{employee.employeeId} -</span>
                <h1 className="text-2xl font-semibold">
                  {employee.firstName} {employee.lastName}
                </h1>
                <span className="text-red-500 text-sm">{employee.checkInStatus}</span>
              </div>
              <p className="text-gray-600 mt-1">{employee.designation}</p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Star className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Reporting To */}
        <div className="flex items-center gap-2 mt-4 ml-36">
          <span className="text-sm text-gray-600">Reporting To</span>
          <div className="flex items-center gap-2">
            <img
              src="/api/placeholder/24/24"
              alt="Manager"
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm font-medium">{employee.reportingManager}</span>
          </div>
        </div>
      </div>
    </div>
  );
}