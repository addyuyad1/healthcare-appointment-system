import { create } from "zustand";
import { notificationsApi } from "../api/notificationsApi";
import { getErrorMessage } from "../../../services/http";
import type { NotificationItem } from "../../../shared/types/models";

interface NotificationsState {
  items: NotificationItem[];
  error: string | null;
  isLoading: boolean;
  unreadCount: number;
  fetchNotifications: (
    userId: string,
    options?: { silent?: boolean; page?: number; pageSize?: number },
  ) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: [],
  error: null,
  isLoading: false,
  unreadCount: 0,
  async fetchNotifications(userId, options) {
    if (!options?.silent) {
      set({ isLoading: true, error: null });
    }

    try {
      const response = await notificationsApi.getNotifications(
        userId,
        options?.page,
        options?.pageSize,
      );
      const unreadCount = response.items.filter((item) => !item.read).length;
      set({
        items: response.items,
        unreadCount,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      });
    }
  },
  async markAsRead(notificationId) {
    try {
      const nextNotification = await notificationsApi.markAsRead(notificationId);
      set((state) => {
        const items = state.items.map((item) =>
          item.id === notificationId ? nextNotification : item,
        );

        return {
          items,
          unreadCount: items.filter((item) => !item.read).length,
        };
      });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },
  async markAllAsRead(userId) {
    try {
      await notificationsApi.markAllAsRead(userId);
      set((state) => ({
        items: state.items.map((item) => ({ ...item, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },
}));
