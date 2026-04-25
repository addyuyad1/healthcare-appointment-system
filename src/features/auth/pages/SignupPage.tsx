import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
import type { LoginPayload, SignupPayload } from "../../../shared/types/models";

export function SignupPage() {
  const { clearError, error, isLoading, signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => clearError(), [clearError]);

  async function handleSubmit(payload: LoginPayload | SignupPayload) {
    const success = await signup(payload as SignupPayload);

    if (success) {
      navigate("/dashboard", { replace: true });
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-160px)] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div className="flex justify-center lg:justify-start">
        <AuthForm
          error={error}
          isLoading={isLoading}
          mode="signup"
          onSubmit={handleSubmit}
        />
      </div>

      <div className="space-y-6">
        <span className="eyebrow">New Account</span>
        <div className="space-y-4">
          <h1 className="max-w-xl text-5xl font-semibold leading-tight text-slate-950">
            Set up a healthcare workspace that feels calm, fast, and reliable.
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            Patients can discover doctors and book time in minutes, while doctors
            get schedule visibility and a better handle on follow-up care.
          </p>
        </div>
      </div>
    </div>
  );
}
