import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { useAuthStore } from "../../features/auth/store/authStore";

function AppBootstrap({ children }: PropsWithChildren) {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="panel w-full max-w-md p-8 text-center">
          <span className="eyebrow">Preparing workspace</span>
          <h1 className="mt-4 text-2xl font-semibold text-slate-950">
            Loading your healthcare dashboard
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Checking your session and getting the app ready.
          </p>
        </div>
      </div>
    );
  }

  return children;
}

export function AppProviders({ children }: PropsWithChildren) {
  return <AppBootstrap>{children}</AppBootstrap>;
}
