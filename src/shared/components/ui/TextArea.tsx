import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, error, label, ...props }, ref) => {
    return (
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <textarea
          ref={ref}
          className={cn(
            "min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100",
            error && "border-rose-300 focus:border-rose-400 focus:ring-rose-100",
            className,
          )}
          {...props}
        />
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      </label>
    );
  },
);

TextArea.displayName = "TextArea";
