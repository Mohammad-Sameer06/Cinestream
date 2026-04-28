"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profiles";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result || result.error || !result.ok) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container relative">
      <div className="auth-overlay" />

      {/* Logo */}
      <div className="absolute top-6 left-[5%] z-10">
        <Link href="/">
          <span
            className="text-3xl font-black"
            style={{
              color: "var(--cs-red)",
              fontFamily: "var(--cs-display-font)",
              letterSpacing: "0.05em",
            }}
          >
            CINESTREAM
          </span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="auth-card z-10"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
        <p className="text-gray-400 text-sm mb-8">
          Welcome back to CineStream
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-900/30 border border-red-500/50 rounded p-3 text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Email */}
          <div className="relative">
            <input
              {...register("email")}
              type="email"
              id="email"
              placeholder=" "
              className="cs-input peer"
              autoComplete="email"
            />
            <label htmlFor="email" className="cs-input-label">
              Email
            </label>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder=" "
              className="cs-input peer pr-12"
              autoComplete="current-password"
            />
            <label htmlFor="password" className="cs-input-label">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-red flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            New to CineStream?{" "}
            <Link
              href="/register"
              className="text-white hover:underline font-semibold"
            >
              Sign up now
            </Link>
          </p>
        </div>

        <p className="text-gray-600 text-xs text-center mt-4">
          This page is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-container" />}>
      <LoginPageContent />
    </Suspense>
  );
}
