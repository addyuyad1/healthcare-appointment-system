import { useNotificationsStore } from "../store/notificationsStore";

export function useNotifications() {
  const items = useNotificationsStore((state) => state.items);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const isLoading = useNotificationsStore((state) => state.isLoading);
  const error = useNotificationsStore((state) => state.error);
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);

  return {
    error,
    fetchNotifications,
    isLoading,
    items,
    markAllAsRead,
    markAsRead,
    unreadCount,
  };
}
