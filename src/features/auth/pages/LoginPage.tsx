import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
import type { LoginPayload, SignupPayload } from "../../../shared/types/models";

export function LoginPage() {
  const { clearError, error, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => clearError(), [clearError]);

  async function handleSubmit(payload: LoginPayload | SignupPayload) {
    const success = await login(payload as LoginPayload);
    const nextPath =
      (location.state as { from?: string } | null)?.from ?? "/dashboard";

    if (success) {
      navigate(nextPath, { replace: true });
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-160px)] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div className="space-y-6">
        <span className="eyebrow">Connected Care</span>
        <div className="space-y-4">
          <h1 className="max-w-xl text-5xl font-semibold leading-tight text-slate-950">
            Keep appointments moving without the usual friction.
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            This workspace gives patients a clean booking flow and gives doctors a
            focused dashboard for upcoming consultations, schedule changes, and
            care continuity.
          </p>
        </div>
      </div>

      <div className="flex justify-center lg:justify-end">
        <AuthForm
          error={error}
          isLoading={isLoading}
          mode="login"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
