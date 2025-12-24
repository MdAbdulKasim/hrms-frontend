"use client";

import { X } from "lucide-react";

interface Props {
    onClose: () => void;
    departmentName: string;
}

export default function AddMemberDrawer({ onClose, departmentName }: Props) {
    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/30 z-[60]"
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-[420px] bg-white z-[70] shadow-xl transform transition-transform duration-300 translate-x-0">
                <div className="p-6 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold">Add Member to {departmentName}</h2>
                        <button onClick={onClose}>
                            <X />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Select Employee</label>
                            <select className="w-full border rounded-md p-2 bg-white">
                                <option value="">Select an employee...</option>
                                <option value="1">John Doe</option>
                                <option value="2">Jane Smith</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Role</label>
                            <input
                                type="text"
                                className="w-full border rounded-md p-2"
                                placeholder="e.g. Developer"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex gap-3">
                        <button className="flex-1 bg-blue-600 text-white py-2 rounded-md">
                            Add Member
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
