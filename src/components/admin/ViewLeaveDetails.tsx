'use client';
import React from 'react';
import { X, Calendar, User, FileText, Info, CheckCircle, XCircle, Clock } from 'lucide-react';

interface LeaveRequest {
    id: string;
    leaveTypeCode: string;
    leaveType?: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'approved' | 'pending' | 'rejected';
    dayType: 'full_day' | 'first_half' | 'second_half';
    isLWP: boolean;
    employeeId?: string;
    employeeName?: string;
    employeeEmail?: string;
    locationName?: string;
    departmentName?: string;
    rejectionReason?: string;
    approverName?: string;
}

interface ViewLeaveDetailsProps {
    leave: LeaveRequest;
    onClose: () => void;
}

const ViewLeaveDetails: React.FC<ViewLeaveDetailsProps> = ({ leave, onClose }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return {
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    border: 'border-green-200',
                    icon: <CheckCircle className="w-5 h-5" />
                };
            case 'rejected':
                return {
                    bg: 'bg-red-50',
                    text: 'text-red-700',
                    border: 'border-red-200',
                    icon: <XCircle className="w-5 h-5" />
                };
            default:
                return {
                    bg: 'bg-yellow-50',
                    text: 'text-yellow-700',
                    border: 'border-yellow-200',
                    icon: <Clock className="w-5 h-5" />
                };
        }
    };

    const statusStyle = getStatusStyles(leave.status);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Leave Request Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Status Banner */}
                    <div className={`flex items-center justify-between p-4 rounded-xl border ${statusStyle.border} ${statusStyle.bg} ${statusStyle.text}`}>
                        <div className="flex items-center gap-3">
                            {statusStyle.icon}
                            <span className="font-semibold capitalize">Status: {leave.status}</span>
                        </div>
                        {leave.isLWP && (
                            <span className="text-[10px] bg-amber-500 text-white font-black px-2 py-1 rounded shadow-sm uppercase tracking-wider">Leave Without Pay</span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Employee Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <User className="w-4 h-4" /> Employee Info
                            </h3>
                            <div className="space-y-1">
                                <div className="text-lg font-bold text-gray-900">{leave.employeeName || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{leave.employeeEmail || 'N/A'}</div>
                                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mt-2 font-medium">
                                    {leave.departmentName || 'N/A'} • {leave.locationName || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Leave Type & Duration */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Leave Period
                            </h3>
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-600">
                                    <span className="text-gray-900 font-bold">{leave.leaveTypeCode}</span> • {leave.days} {leave.days === 1 ? 'Day' : 'Days'}
                                    <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded uppercase">
                                        {leave.dayType === 'full_day' ? 'Full Day' : leave.dayType === 'first_half' ? 'First Half' : 'Second Half'}
                                    </span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex flex-col gap-1">
                                    <div className="text-sm font-bold text-gray-900">{formatDate(leave.startDate)}</div>
                                    <div className="text-xs text-gray-400 text-center py-1">to</div>
                                    <div className="text-sm font-bold text-gray-900">{formatDate(leave.endDate)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Reason for Leave
                        </h3>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 leading-relaxed italic">
                            "{leave.reason || 'No reason provided'}"
                        </div>
                    </div>

                    {/* Approval details if not pending */}
                    {leave.status !== 'pending' && (
                        <div className="pt-6 border-t border-gray-100 space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Info className="w-4 h-4" /> Decision Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-medium">Decided By</label>
                                    <div className="text-sm font-bold text-gray-900">{leave.approverName || 'N/A'}</div>
                                </div>
                                {leave.status === 'rejected' && (
                                    <div>
                                        <label className="text-xs text-gray-400 font-medium">Rejection Reason</label>
                                        <div className="text-sm font-bold text-red-600">{leave.rejectionReason || 'No reason provided'}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-sm"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewLeaveDetails;
