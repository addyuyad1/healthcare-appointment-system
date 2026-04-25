import { http } from "../../../services/http";
import type { NotificationItem, PaginatedResponse } from "../../../shared/types/models";

export const notificationsApi = {
  async getNotifications(userId: string, page = 1, pageSize = 8) {
    const response = await http.get<PaginatedResponse<NotificationItem>>("/notifications", {
      params: { page, pageSize, userId },
    });
    return response.data;
  },
  async markAsRead(notificationId: string) {
    const response = await http.patch<NotificationItem>(`/notifications/${notificationId}`, {
      read: true,
    });
    return response.data;
  },
  async markAllAsRead(userId: string) {
    await http.post("/notifications/read-all", { userId });
  },
};
