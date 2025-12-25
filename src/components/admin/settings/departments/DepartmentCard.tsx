import { Building2, Users } from "lucide-react";

interface Props {
  department: any;
  onClick: () => void;
}

export default function DepartmentCard({ department, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white border rounded-xl p-5 hover:shadow-md transition"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <Building2 className="text-gray-600" />
        </div>

        <div>
          <h3 className="font-semibold">{department.name}</h3>
          <p className="text-sm text-gray-500">
            Lead: {department.lead}
          </p>
          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full mt-1">
            <Users className="w-3 h-3" />
            {department.members.length} members
          </span>
        </div>
      </div>
    </div>
  );
}
