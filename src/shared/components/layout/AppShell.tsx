import { Suspense, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { NotificationCenter } from "../../../features/notifications/components/NotificationCenter";
import { navigationLinks } from "../../constants/navigation";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";

function RouteFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}

export function AppShell() {
  const { isLoading, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const visibleLinks = navigationLinks.filter(
    (link) => !link.authOnly || Boolean(user),
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-3" to="/">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
              HC
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Healthcare
              </p>
              <p className="text-lg font-semibold text-slate-950">Appointment System</p>
            </div>
          </Link>

          <button
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 md:hidden"
            onClick={() => setIsMenuOpen((value) => !value)}
            type="button"
          >
            Menu
          </button>

          <div className="hidden items-center gap-3 md:flex">
            <nav className="flex items-center gap-2 rounded-full border border-white/80 bg-white/90 p-2 shadow-soft">
              {visibleLinks.map((link) => (
                <NavLink
                  key={link.to}
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition",
                      isActive && "bg-slate-950 text-white",
                    )
                  }
                  to={link.to}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {user ? (
              <div className="flex items-center gap-3">
                <NotificationCenter />
                <div className="hidden rounded-full bg-brand-50 px-4 py-2 text-sm text-brand-700 lg:block">
                  {user.name} · {user.role}
                </div>
                <Button
                  variant="ghost"
                  disabled={isLoading}
                  onClick={() => void handleLogout()}
                >
                  Log out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="secondary">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-white/80 bg-white/90 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {visibleLinks.map((link) => (
                <NavLink
                  key={link.to}
                  className={({ isActive }) =>
                    cn(
                      "rounded-2xl px-4 py-3 text-sm font-medium text-slate-700",
                      isActive && "bg-slate-950 text-white",
                    )
                  }
                  onClick={() => setIsMenuOpen(false)}
                  to={link.to}
                >
                  {link.label}
                </NavLink>
              ))}

              {user ? (
                <>
                  <div className="mt-2">
                    <NotificationCenter />
                  </div>
                  <Button
                    className="mt-2"
                    variant="ghost"
                    onClick={() => void handleLogout()}
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <div className="mt-2 grid gap-2">
                  <Link to="/login">
                    <Button className="w-full" variant="ghost">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="w-full" variant="secondary">
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
