"use client";

import { useEffect, useState } from 'react';
import { Bell, Clock, Check, AlertCircle, AlertTriangle, Info, CheckCircle2, ChevronRight, Search, Filter, FileText, Calendar, UserCheck, UserX, UserMinus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { notificationService, Notification, NotificationSeverity } from '@/lib/notificationService';
import { getOrgId, getEmployeeId, getUserRole } from '@/lib/auth';
import { format } from 'date-fns';

export default function NotificationsView() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('unread');
    const router = useRouter();

    const fetchNotifications = async () => {
        const orgId = getOrgId();
        const empId = getEmployeeId();
        if (orgId && empId) {
            setIsLoading(true);
            const data = await notificationService.getNotifications(orgId, empId);
            setNotifications(data);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        const orgId = getOrgId();
        if (orgId) {
            const success = await notificationService.markAsRead(orgId, id);
            if (success) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            }
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await handleMarkAsRead(notification.id);
        }

        const role = getUserRole();
        const type = notification.type;

        if (role === 'admin') {
            if (['leave_applied'].includes(type)) {
                router.push('/admin/leavetracker');
            } else if (['contract_expiry', 'employee_contract_expiry_admin', 'contract_extended'].includes(type)) {
                router.push('/admin/onboarding');
            } else if (type === 'announcement') {
                router.push('/admin/my-space/dashboard');
            }
        } else {
            if (['leave_approved', 'leave_rejected'].includes(type)) {
                router.push('/employee/leavetracker');
            } else if (['employee_contract_expiry', 'contract_extended'].includes(type)) {
                router.push('/employee/profile');
            } else if (type === 'announcement') {
                router.push('/employee/my-space/dashboard');
            }
        }
    };

    const handleMarkAllAsRead = async () => {
        const orgId = getOrgId();
        const empId = getEmployeeId();
        if (orgId && empId) {
            const success = await notificationService.markAllAsRead(orgId, empId);
            if (success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        }
    };

    const getNotificationTypeConfig = (type: string, severity: NotificationSeverity) => {
        const severityStyles = getSeverityStyles(severity);

        switch (type) {
            case 'leave_applied':
                return {
                    ...severityStyles,
                    icon: <FileText className="w-5 h-5 text-blue-600" />,
                    bg: 'bg-blue-50',
                    border: 'border-blue-100',
                    label: 'Leave Request'
                };
            case 'leave_approved':
                return {
                    ...severityStyles,
                    icon: <UserCheck className="w-5 h-5 text-green-600" />,
                    bg: 'bg-green-50',
                    border: 'border-green-100',
                    label: 'Approved'
                };
            case 'leave_rejected':
                return {
                    ...severityStyles,
                    icon: <UserX className="w-5 h-5 text-red-600" />,
                    bg: 'bg-red-50',
                    border: 'border-red-100',
                    label: 'Rejected'
                };
            case 'contract_expiry':
            case 'employee_contract_expiry':
            case 'employee_contract_expiry_admin':
                return {
                    ...severityStyles,
                    icon: <Calendar className="w-5 h-5 text-orange-600" />,
                    bg: 'bg-orange-50',
                    border: 'border-orange-100',
                    label: 'Contract Alert'
                };
            case 'announcement':
                return {
                    ...severityStyles,
                    icon: <Bell className="w-5 h-5 text-purple-600" />,
                    bg: 'bg-purple-50',
                    border: 'border-purple-100',
                    label: 'Announcement'
                };
            default:
                return {
                    ...severityStyles,
                    label: severity
                };
        }
    };

    const getSeverityStyles = (severity: NotificationSeverity) => {
        switch (severity) {
            case 'critical':
                return {
                    bg: 'bg-red-50',
                    text: 'text-red-700',
                    border: 'border-red-100',
                    icon: <AlertCircle className="w-5 h-5 text-red-600" />,
                    dot: 'bg-red-600'
                };
            case 'warning':
                return {
                    bg: 'bg-orange-50',
                    text: 'text-orange-700',
                    border: 'border-orange-100',
                    icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
                    dot: 'bg-orange-600'
                };
            case 'success':
                return {
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    border: 'border-green-100',
                    icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
                    dot: 'bg-green-600'
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    border: 'border-blue-100',
                    icon: <Info className="w-5 h-5 text-blue-600" />,
                    dot: 'bg-blue-600'
                };
        }
    };

    const filteredNotifications = filter === 'all'
        ? notifications.filter(n => n.isRead)
        : notifications.filter(n => !n.isRead);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
                        <p className="text-sm font-medium text-gray-500 mt-0.5">Stay updated with your daily alerts</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-95"
                    >
                        <Check className="w-4 h-4" />
                        Mark all as read
                    </button>
                </div>
            </div>

            {/* Filters section */}
            <div className="flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-xl w-fit">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    All Activity
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'unread'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    Unread ({notifications.filter(n => !n.isRead).length})
                </button>
            </div>

            {/* Notifications list */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4 p-4 animate-pulse">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-1/4 bg-gray-100 rounded"></div>
                                    <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {filteredNotifications.map((notification) => {
                            const config = getNotificationTypeConfig(notification.type, notification.severity);
                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`group p-6 hover:bg-gray-50/80 transition-all cursor-pointer relative ${!notification.isRead ? 'bg-blue-50/20' : ''
                                        }`}
                                >
                                    <div className="flex gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${config.bg} ${config.border}`}>
                                            {config.icon}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-4 mb-1">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <h3 className={`text-base font-bold truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.isRead ? (
                                                        <span className="shrink-0 px-2 py-0.5 bg-blue-600 text-[10px] font-bold text-white rounded-full uppercase tracking-wider">New</span>
                                                    ) : (
                                                        <span className="shrink-0 px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded-full uppercase tracking-wider border border-gray-200">Read</span>
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-gray-400 whitespace-nowrap bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                    {format(new Date(notification.createdAt), 'MMM dd, yyyy')}
                                                </span>
                                            </div>

                                            <p className="text-sm font-medium text-gray-500 leading-relaxed mb-4">
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-[11px] font-bold uppercase tracking-widest ${config.text}`}>
                                                        {config.label}
                                                    </span>
                                                    <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 capitalize">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {format(new Date(notification.createdAt), 'hh:mm a')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 shrink-0">
                                            <div className="w-10 h-10 bg-white border border-gray-100 text-gray-400 rounded-xl flex items-center justify-center shadow-sm">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-24 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                            <Bell className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Clear notifications</h3>
                        <p className="text-sm font-medium text-gray-500 max-w-xs mx-auto">
                            You're all caught up! There are no new notifications at this time.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
