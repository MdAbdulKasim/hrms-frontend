'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { X } from 'lucide-react';

interface AttendanceRecord {
    employeeName?: string;
    date: string;
    checkIn: string;
    checkOut: string;
    hoursWorked: string;
    standardHours?: number;
    overtimeHours?: number;
    status: 'Present' | 'Late' | 'Leave' | 'Weekend' | 'Absent' | string;
}

interface ViewAttendanceDetailsProps {
    record: AttendanceRecord;
    onClose: () => void;
}

const ViewAttendanceDetails: React.FC<ViewAttendanceDetailsProps> = ({ record, onClose }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-700';
            case 'Late': return 'bg-yellow-100 text-yellow-700';
            case 'Leave': return 'bg-blue-100 text-blue-700';
            case 'Holiday': return 'bg-orange-100 text-orange-700';
            case 'Weekend': return 'bg-gray-100 text-gray-600';
            case 'Absent': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Attendance Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Employee Name */}
                    {record.employeeName && (
                        <div className="flex justify-between items-center pb-3 border-b">
                            <span className="text-sm font-medium text-gray-500">Employee</span>
                            <span className="text-sm font-semibold text-gray-900">{record.employeeName}</span>
                        </div>
                    )}

                    {/* Date */}
                    <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-sm font-medium text-gray-500">Date</span>
                        <span className="text-sm font-semibold text-gray-900">{record.date}</span>
                    </div>

                    {/* Status */}
                    <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-sm font-medium text-gray-500">Status</span>
                        <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status}
                        </span>
                    </div>

                    {/* Check In */}
                    <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-sm font-medium text-gray-500">Check In</span>
                        <span className="text-sm font-semibold text-gray-900">{record.checkIn}</span>
                    </div>

                    {/* Check Out */}
                    <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-sm font-medium text-gray-500">Check Out</span>
                        <span className="text-sm font-semibold text-gray-900">{record.checkOut}</span>
                    </div>

                    {/* Hours Worked */}
                    <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-sm font-medium text-gray-500">Hours Worked</span>
                        <span className="text-sm font-semibold text-gray-900">{record.hoursWorked}</span>
                    </div>

                    {/* Standard Hours */}
                    {record.standardHours !== undefined && (
                        <div className="flex justify-between items-center pb-3 border-b">
                            <span className="text-sm font-medium text-gray-500">Standard Hours</span>
                            <span className="text-sm font-semibold text-gray-900">{record.standardHours}h</span>
                        </div>
                    )}

                    {/* Overtime Hours */}
                    {record.overtimeHours !== undefined && record.overtimeHours > 0 && (
                        <div className="flex justify-between items-center pb-3 border-b">
                            <span className="text-sm font-medium text-gray-500">Overtime Hours</span>
                            <span className="text-sm font-semibold text-orange-600">{record.overtimeHours}h</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewAttendanceDetails;
