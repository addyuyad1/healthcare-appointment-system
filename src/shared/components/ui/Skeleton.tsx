import { cn } from "../../utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton rounded-2xl", className)} />;
}

export function StatCardSkeleton() {
  return (
    <div className="panel p-6">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-4 h-8 w-14" />
      <Skeleton className="mt-3 h-4 w-full" />
    </div>
  );
}

export function DoctorCardSkeleton() {
  return (
    <div className="panel p-6">
      <div className="flex items-start gap-4">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="mt-6 h-4 w-full" />
      <Skeleton className="mt-3 h-4 w-5/6" />
      <Skeleton className="mt-6 h-24 w-full rounded-3xl" />
      <Skeleton className="mt-6 h-11 w-full" />
    </div>
  );
}

export function AppointmentCardSkeleton() {
  return (
    <div className="panel p-6">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-10 w-44" />
      </div>
    </div>
  );
}
