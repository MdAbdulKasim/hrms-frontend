import { Star, MessageSquare, Phone, Video, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  designation: string;
  checkInStatus: string;
  profileImage?: string;
  reportingManager: string;
}

interface ProfileHeaderProps {
  employee: Employee;
  onEmployeeClick?: (employeeId: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ProfileHeader({ employee, onEmployeeClick, onEdit, onDelete }: ProfileHeaderProps) {
  // Extract manager ID from reportingManager string (format: "1 - fathima")
  const getManagerId = (managerString: string) => {
    return managerString.split(' - ')[0];
  };

  const handleManagerClick = () => {
    if (onEmployeeClick && employee.reportingManager) {
      const managerId = getManagerId(employee.reportingManager);
      onEmployeeClick(managerId);
    }
  };

  return (
    <div className="relative bg-white">
      {/* Cover Image with leaf pattern - Dark green background */}
      <div className="h-40 bg-linear-to-br from-green-900 via-green-800 to-green-700 relative overflow-hidden">
        {/* Leaf pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c-5 0-10-5-10-10 0 5-5 10-10 10 5 0 10 5 10 10 0-5 5-10 10-10z' fill='%23ffffff' fill-opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
        
        {/* Additional decorative elements */}
        <div className="absolute top-4 right-20 w-32 h-32 rounded-full bg-green-600 opacity-10 blur-2xl"></div>
        <div className="absolute bottom-4 left-40 w-40 h-40 rounded-full bg-green-500 opacity-10 blur-3xl"></div>
      </div>

      {/* Profile Content Container */}
      <div className="px-8 pb-4 relative">
        {/* Back Button - Positioned in top left over cover */}
        <button className="absolute -top-32 left-8 text-white hover:bg-white/10 p-2 rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Action Buttons - Positioned in top right over cover */}
        <div className="absolute -top-32 right-8 flex gap-2">
          <button className="p-2.5 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm">
            <Star className="w-5 h-5 text-gray-700" />
          </button>
          <button className="p-2.5 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm">
            <MessageSquare className="w-5 h-5 text-gray-700" />
          </button>
          <button className="p-2.5 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm">
            <Phone className="w-5 h-5 text-gray-700" />
          </button>
          <button className="p-2.5 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm">
            <Video className="w-5 h-5 text-gray-700" />
          </button>
          {onEdit && (
            <button 
              onClick={onEdit}
              className="p-2.5 bg-white hover:bg-blue-50 rounded-lg transition-colors shadow-sm"
              title="Edit employee"
            >
              <Edit2 className="w-5 h-5 text-blue-600" />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={onDelete}
              className="p-2.5 bg-white hover:bg-red-50 rounded-lg transition-colors shadow-sm"
              title="Delete employee"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>
          )}
          <button className="p-2.5 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm">
            <MoreHorizontal className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Profile Image and Info */}
        <div className="flex items-end justify-between -mt-20">
          {/* Left: Profile image and name */}
          <div className="flex items-end">
            <img
              src={employee.profileImage || '/api/placeholder/160/160'}
              alt={`${employee.firstName} ${employee.lastName}`}
              className="w-40 h-40 rounded-2xl border-4 border-white shadow-xl bg-white object-cover"
            />
            
            {/* Name and designation */}
            <div className="ml-6 pb-2">
              {/* Name and status */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-600 font-medium">{employee.employeeId} -</span>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {employee.firstName} {employee.lastName}
                </h1>
                <span className="text-red-500 text-sm font-medium">{employee.checkInStatus}</span>
              </div>
              
              {/* Designation */}
              <p className="text-gray-600">{employee.designation}</p>
            </div>
          </div>

          {/* Right: Reporting To */}
          <div className="pb-4">
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Reporting To</div>
              <div 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={handleManagerClick}
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {employee.reportingManager}
                </span>
                <img
                  src="/api/placeholder/32/32"
                  alt="Manager"
                  className="w-8 h-8 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}