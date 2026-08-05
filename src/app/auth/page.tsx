"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
} from "@/lib/validations";
import Link from "next/link";

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function FormInput(
  {
    label,
    type = "text",
    error,
    showToggle,
    ...props
  }: {
    label: string;
    type?: string;
    error?: string;
    showToggle?: boolean;
  } & React.InputHTMLAttributes<HTMLInputElement>,
) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          className={cn(
            "w-full rounded-lg border bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600",
            error
              ? "border-red-500/50 ring-1 ring-red-500/30 focus:border-red-500/50 focus:ring-red-500/30"
              : "border-zinc-800 focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/50",
          )}
          {...props}
        />
        {showToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 text-xs text-red-400"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error || "Something went wrong");
        return;
      }

      toast.success("Welcome back!", {
        description: "Redirecting to landing page...",
      });

      setTimeout(() => router.push("/"), 600);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      key="login"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <FormInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <FormInput
        label="Password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        showToggle
        {...register("password")}
      />

      <AnimatePresence mode="wait">
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400"
            role="alert"
          >
            {serverError}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Spinner />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </motion.button>
    </motion.form>
  );
}

function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupInput) {
    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.fieldErrors) {
          Object.entries(json.fieldErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              setError(field as keyof SignupInput, {
                message: messages[0] as string,
              });
            }
          });
        }
        setServerError(json.error || "Something went wrong");
        return;
      }

      toast.success("Account created successfully!", {
        description: "Redirecting to landing page...",
      });

      setTimeout(() => router.push("/"), 600);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      key="signup"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <FormInput
        label="Full Name"
        placeholder="Jane Doe"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <FormInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <FormInput
        label="Password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.password?.message}
        showToggle
        {...register("password")}
      />
      <FormInput
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        showToggle
        {...register("confirmPassword")}
      />

      <AnimatePresence mode="wait">
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400"
            role="alert"
          >
            {serverError}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Spinner />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </motion.button>

      <p className="text-center text-[11px] text-zinc-600">
        By creating an account, you agree to our Terms of Service.
      </p>
    </motion.form>
  );
}

type AuthTab = "login" | "signup";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.07] blur-[120px] animate-pulse" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-[45%] rounded-full bg-slate-500/[0.05] blur-[100px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,#09090b_0%,#000000_70%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 shadow-2xl shadow-black/50 backdrop-blur-2xl">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                StackSense
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <p className="text-xs text-zinc-500">
              {activeTab === "login"
                ? "Welcome back. Sign in to continue."
                : "Create your account to get started."}
            </p>
          </div>

          <div className="relative mb-8 flex rounded-lg border border-zinc-800/80 bg-zinc-950/80 p-1">
            {(["login", "signup"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative z-10 flex-1 rounded-md px-4 py-2 text-xs font-medium transition-colors duration-200",
                  activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300",
                )}
                aria-selected={activeTab === tab}
                role="tab"
              >
                {tab === "login" ? "Sign In" : "Create Account"}
                {activeTab === tab && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 rounded-md border border-zinc-700/50 bg-zinc-800/80"
                    style={{ zIndex: -1 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "login" ? <LoginForm /> : <SignupForm />}
          </AnimatePresence>
        </div>

        <div className="mx-auto mt-0 h-px w-3/4 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      </motion.div>
    </div>
  );
}
