import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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

type AuthFormValues = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  specialization: string;
};

export function AuthForm({
  error,
  isLoading,
  mode,
  onSubmit,
}: AuthFormProps) {
  const schema = useMemo(
    () =>
      z
        .object({
          email: z.string().email("Enter a valid email address."),
          name: z.string(),
          password: z.string().min(6, "Password should be at least 6 characters."),
          role: z.enum(["patient", "doctor"]),
          specialization: z.string(),
        })
        .superRefine((value, context) => {
          if (mode === "signup" && value.name.trim().length < 2) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Please enter your full name.",
              path: ["name"],
            });
          }

          if (mode === "signup" && value.role === "doctor" && !value.specialization) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Please choose a specialization.",
              path: ["specialization"],
            });
          }
        }),
    [mode],
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<AuthFormValues>({
    defaultValues: {
      email: mode === "login" ? "patient@care.com" : "",
      name: "",
      password: mode === "login" ? "password123" : "",
      role: "patient",
      specialization: "General Medicine",
    },
    resolver: zodResolver(schema),
  });
  const role = watch("role");
  const isSignup = mode === "signup";

  async function submitForm(values: AuthFormValues) {
    if (isSignup) {
      await onSubmit({
        email: values.email,
        name: values.name,
        password: values.password,
        role: values.role,
        specialization: values.role === "doctor" ? values.specialization : undefined,
      });
      return;
    }

    await onSubmit({
      email: values.email,
      password: values.password,
    });
  }

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

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(submitForm)}>
        {isSignup ? (
          <Input
            label="Full name"
            placeholder="Enter your full name"
            error={errors.name?.message}
            {...register("name")}
          />
        ) : null}

        {isSignup ? (
          <Select
            label="Account role"
            error={errors.role?.message}
            {...register("role")}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </Select>
        ) : null}

        {isSignup && role === "doctor" ? (
          <Select
            label="Specialization"
            error={errors.specialization?.message}
            {...register("specialization")}
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
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          autoComplete={isSignup ? "new-password" : "current-password"}
          label="Password"
          placeholder="Enter your password"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
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
