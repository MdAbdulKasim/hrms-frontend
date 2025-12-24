// components/profile/tabs/DepartmentTab.tsx

interface DepartmentMember {
  id: string;
  employeeId: string;
  name: string;
  phone?: string;
  checkInStatus: string;
  profileImage?: string;
}

interface DepartmentTabProps {
  department?: string;
  location?: string;
  ceoMembers?: DepartmentMember[];
  administrationMembers?: DepartmentMember[];
  onEmployeeClick?: (employeeId: string) => void;
}

export default function DepartmentTab({ 
  department = 'Management',
  location = 'Unspecified location',
  ceoMembers = [],
  administrationMembers = [],
  onEmployeeClick
}: DepartmentTabProps) {
  const totalMembers = ceoMembers.length + administrationMembers.length;

  return (
    <div className="p-6 space-y-4">
      {/* Filters Card */}
      <div className="bg-white border border-gray-200 rounded-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white">
              <option>{department}</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white">
              <option>{location}</option>
            </select>
            <span className="text-gray-600">-</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">{totalMembers}</span>
            <div className="text-sm text-gray-600">Members</div>
          </div>
        </div>
      </div>

      {/* Department Cards - Horizontal Layout */}
      <div className="flex items-start gap-4 overflow-x-auto pb-2">
        {/* CEO Section */}
        <div className="bg-white border border-gray-200 rounded-lg min-w-[320px] shrink-0">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-2.5 rounded-t-lg flex items-center justify-between border-b">
            <h3 className="font-medium text-gray-900">CEO</h3>
            <span className="bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
              {ceoMembers.length}
            </span>
          </div>
          {/* Members */}
          <div className="p-2.5">
            {ceoMembers.length > 0 ? (
              ceoMembers.map((member) => (
                <MemberCard key={member.id} member={member} onEmployeeClick={onEmployeeClick} />
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No members found</p>
            )}
          </div>
        </div>

        {/* Administration Section */}
        <div className="bg-white border border-gray-200 rounded-lg min-w-[320px] shrink-0">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-2.5 rounded-t-lg flex items-center justify-between border-b">
            <h3 className="font-medium text-gray-900">Administration</h3>
            <span className="bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
              {administrationMembers.length}
            </span>
          </div>
          {/* Members */}
          <div className="p-2.5 space-y-1.5">
            {administrationMembers.length > 0 ? (
              administrationMembers.map((member) => (
                <MemberCard key={member.id} member={member} onEmployeeClick={onEmployeeClick} />
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No members found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MemberCardProps {
  member: DepartmentMember;
  onEmployeeClick?: (employeeId: string) => void;
}

function MemberCard({ member, onEmployeeClick }: MemberCardProps) {
  const handleClick = () => {
    if (onEmployeeClick && member.employeeId) {
      onEmployeeClick(member.employeeId);
    }
  };

  return (
    <div 
      className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <img
        src={member.profileImage || '/api/placeholder/40/40'}
        alt={member.name}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate hover:text-blue-600 transition-colors">
          {member.employeeId} - {member.name}
        </p>
        {member.phone && (
          <p className="text-xs text-gray-600">{member.phone}</p>
        )}
        <p className="text-xs text-red-500">{member.checkInStatus}</p>
      </div>
    </div>
  );
}