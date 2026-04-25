import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import { Select } from "../../../shared/components/ui/Select";
import { doctorSpecializations } from "../../../shared/constants/specializations";
import type { LoginPayload, SignupPayload, UserRole } from "../../../shared/types/models";

interface AuthFormProps {
  mode: "login" | "signup";
  error: string | null;
  isLoading: boolean;
  onSubmit: (payload: LoginPayload | SignupPayload) => Promise<void>;
}

export function AuthForm({
  error,
  isLoading,
  mode,
  onSubmit,
}: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(mode === "login" ? "patient@care.com" : "");
  const [password, setPassword] = useState(mode === "login" ? "password123" : "");
  const [role, setRole] = useState<UserRole>("patient");
  const [specialization, setSpecialization] = useState("General Medicine");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setValidationError(null);
  }, [email, mode, name, password, role, specialization]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "signup" && name.trim().length < 2) {
      setValidationError("Please enter your full name.");
      return;
    }

    if (password.trim().length < 6) {
      setValidationError("Password should be at least 6 characters.");
      return;
    }

    if (mode === "signup") {
      await onSubmit({
        email,
        name: name.trim(),
        password,
        role,
        specialization: role === "doctor" ? specialization : undefined,
      });
      return;
    }

    await onSubmit({ email, password });
  }

  const isSignup = mode === "signup";
  const activeError = validationError || error;

  return (
    <Card className="w-full max-w-xl border-white/80 bg-white/95 p-8">
      <div className="space-y-3">
        <span className="eyebrow">
          {isSignup ? "Create account" : "Welcome back"}
        </span>
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">
            {isSignup ? "Start managing care with confidence" : "Sign in to your workspace"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isSignup
              ? "Create a patient or doctor account to access scheduling, dashboards, and appointment updates."
              : "Use your patient or doctor credentials to access appointments and dashboards."}
          </p>
        </div>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {isSignup ? (
          <Input
            label="Full name"
            placeholder="Enter your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        ) : null}

        {isSignup ? (
          <Select
            label="Account role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </Select>
        ) : null}

        {isSignup && role === "doctor" ? (
          <Select
            label="Specialization"
            value={specialization}
            onChange={(event) => setSpecialization(event.target.value)}
          >
            {doctorSpecializations.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        ) : null}

        <Input
          autoComplete="email"
          label="Email address"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          autoComplete={isSignup ? "new-password" : "current-password"}
          label="Password"
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {activeError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {activeError}
          </div>
        ) : null}

        {!isSignup ? (
          <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            Demo patient: <strong>patient@care.com</strong> / <strong>password123</strong>
            <br />
            Demo doctor: <strong>doctor@care.com</strong> / <strong>password123</strong>
          </div>
        ) : null}

        <Button fullWidth type="submit" variant="secondary" disabled={isLoading}>
          {isLoading
            ? "Please wait..."
            : isSignup
              ? "Create account"
              : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        {isSignup ? "Already have an account?" : "Need a new account?"}{" "}
        <Link
          className="font-semibold text-accent-700 transition hover:text-accent-600"
          to={isSignup ? "/login" : "/signup"}
        >
          {isSignup ? "Sign in" : "Create one"}
        </Link>
      </p>
    </Card>
  );
}
