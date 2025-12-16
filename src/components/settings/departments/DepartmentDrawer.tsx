"use client";

import { X, UserPlus, Pencil } from "lucide-react";

interface Props {
  department: any;
  onClose: () => void;
}

export default function DepartmentDrawer({ department, onClose }: Props) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 z-40"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white z-50 shadow-xl transform transition-transform duration-300 translate-x-0">
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">{department.name}</h2>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          {/* Lead */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Team Lead</h3>
              <button className="text-sm flex items-center gap-1 border px-3 py-1 rounded-md ">
                <Pencil className="w-4 h-4" />
                Change Lead
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium">{department.lead}</p>
              <p className="text-sm text-gray-500">Department Lead</p>
            </div>
          </div>

          {/* Members */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">
                Members ({department.members.length})
              </h3>
              <button className="text-sm flex items-center gap-1 border px-3 py-1 rounded-md">
                <UserPlus className="w-4 h-4" />
                Add Member
              </button>
            </div>

            <div className="space-y-2">
              {department.members.map((m: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-md"
                >
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.role}</p>
                  </div>
                  <Pencil className="w-4 h-4 text-gray-400 cursor-pointer" />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex gap-3">
            <button className="flex-1 bg-blue-600 text-white py-2 rounded-md">
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="flex-1 border rounded-md py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
