import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  action,
  description,
  title,
}: EmptyStateProps) {
  return (
    <div className="panel flex flex-col items-start gap-4 p-8">
      <span className="eyebrow">No results</span>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="max-w-xl text-sm text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
}
