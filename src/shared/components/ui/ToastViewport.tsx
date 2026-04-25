import { useEffect } from "react";
import { create } from "zustand";
import { cn } from "../../utils/cn";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: string;
  title: string;
  message?: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (toastId: string) => void;
}

const toneClasses: Record<ToastTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-slate-200 bg-white text-slate-800",
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast(toast) {
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: crypto.randomUUID(),
        },
      ],
    }));
  },
  removeToast(toastId) {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== toastId),
    }));
  },
}));

function ToastItem({
  id,
  message,
  title,
  tone,
}: Toast) {
  const removeToast = useToastStore((state) => state.removeToast);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => removeToast(id), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [id, removeToast]);

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm rounded-3xl border px-4 py-4 shadow-soft",
        toneClasses[tone],
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      {message ? <p className="mt-1 text-sm opacity-90">{message}</p> : null}
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3"
      aria-atomic="true"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
}
