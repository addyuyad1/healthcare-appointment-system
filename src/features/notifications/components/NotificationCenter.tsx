import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { usePolling } from "../../../shared/hooks/usePolling";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { useToastStore } from "../../../shared/components/ui/ToastViewport";
import { formatDateWithWeekday } from "../../../shared/utils/format";

export function NotificationCenter() {
  const { user } = useAuth();
  const { error, fetchNotifications, isLoading, items, markAllAsRead, markAsRead, unreadCount } =
    useNotifications();
  const addToast = useToastStore((state) => state.addToast);
  const [isOpen, setIsOpen] = useState(false);
  const seenIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void fetchNotifications(user.id, { pageSize: 8 });
  }, [fetchNotifications, user]);

  usePolling(
    () => {
      if (user) {
        void fetchNotifications(user.id, { pageSize: 8, silent: true });
      }
    },
    15000,
    Boolean(user),
  );

  useEffect(() => {
    if (!items.length) {
      return;
    }

    const newUnreadItems = items.filter(
      (item) => !item.read && !seenIdsRef.current.includes(item.id),
    );

    if (newUnreadItems.length) {
      const latestItem = newUnreadItems[0];
      addToast({
        title: latestItem.title,
        message: latestItem.message,
        tone: "info",
      });
    }

    seenIdsRef.current = items.map((item) => item.id);
  }, [addToast, items]);

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        className="relative rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        onClick={() => setIsOpen((value) => !value)}
      >
        Notifications
        {unreadCount ? (
          <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-2 text-xs font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-16 z-40 w-[360px] rounded-3xl border border-white/80 bg-white/95 p-4 shadow-soft backdrop-blur"
          role="dialog"
          aria-label="Notification center"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Updates</h3>
              <p className="text-sm text-slate-500">{unreadCount} unread</p>
            </div>
            <Button variant="ghost" onClick={() => void markAllAsRead(user.id)}>
              Mark all read
            </Button>
          </div>

          <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {isLoading ? (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : items.length ? (
              items.map((item) => (
                <button
                  key={item.id}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-left transition hover:bg-slate-100"
                  type="button"
                  onClick={() => void markAsRead(item.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
                    </div>
                    {!item.read ? <Badge tone="warning">New</Badge> : null}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Badge>{item.channel}</Badge>
                    <span>{formatDateWithWeekday(item.createdAt)}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                No notifications yet.
              </div>
            )}

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
