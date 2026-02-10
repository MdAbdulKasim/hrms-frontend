import { getApiUrl, getAuthToken } from './auth';

export type NotificationSeverity = 'info' | 'warning' | 'critical' | 'success';

export interface Notification {
    id: string;
    title: string;
    message: string;
    severity: NotificationSeverity;
    type: string;
    entityId?: string;
    isRead: boolean;
    createdAt: string;
}

export const notificationService = {
    async getNotifications(orgId: string, employeeId: string): Promise<Notification[]> {
        const apiUrl = getApiUrl();
        const token = getAuthToken();

        try {
            const response = await fetch(`${apiUrl}/org/${orgId}/notifications/${employeeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`Failed to fetch notifications: ${response.status} ${response.statusText}`, errorData);
                throw new Error(errorData.error || 'Failed to fetch notifications');
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    async markAsRead(orgId: string, notificationId: string): Promise<boolean> {
        const apiUrl = getApiUrl();
        const token = getAuthToken();

        try {
            const response = await fetch(`${apiUrl}/org/${orgId}/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            return response.ok;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    },

    async markAllAsRead(orgId: string, employeeId: string): Promise<boolean> {
        const apiUrl = getApiUrl();
        const token = getAuthToken();

        try {
            const response = await fetch(`${apiUrl}/org/${orgId}/notifications/read-all/${employeeId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            return response.ok;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }
};
