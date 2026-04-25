import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, className, error, label, ...props }, ref) => {
    return (
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <select
          ref={ref}
          className={cn(
            "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100",
            error && "border-rose-300 focus:border-rose-400 focus:ring-rose-100",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      </label>
    );
  },
);

Select.displayName = "Select";
