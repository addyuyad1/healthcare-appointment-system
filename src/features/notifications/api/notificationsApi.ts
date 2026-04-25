import { apiGet, apiPatch, apiPost } from "../../../services/http";
import type { NotificationItem, PaginatedResponse } from "../../../shared/types/models";

export const notificationsApi = {
  async getNotifications(userId: string, page = 1, pageSize = 8) {
    return apiGet<PaginatedResponse<NotificationItem>>("/notifications", {
      params: { page, pageSize, userId },
    });
  },
  async markAsRead(notificationId: string) {
    return apiPatch<NotificationItem, { read: boolean }>(`/notifications/${notificationId}`, {
      read: true,
    });
  },
  async markAllAsRead(userId: string) {
    await apiPost("/notifications/read-all", { userId });
  },
};
