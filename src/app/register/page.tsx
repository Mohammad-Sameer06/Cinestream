"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
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
      await axios.post("/api/auth/register", {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
      });

      // Auto sign in after registration
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created! Please sign in.");
        router.push("/login");
      } else {
        toast.success("Welcome to CineStream! 🎬");
        router.push("/profiles");
        router.refresh();
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Registration failed");
      } else {
        setError("Something went wrong. Please try again.");
      }
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
        style={{ maxWidth: 500 }}
      >
        <h1 className="text-3xl font-bold text-white mb-1">Create Account</h1>
        <p className="text-gray-400 text-sm mb-7">
          Join CineStream and start watching
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-900/30 border border-red-500/50 rounded p-3 text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Name */}
          <div className="relative">
            <input
              {...register("name")}
              type="text"
              id="name"
              placeholder=" "
              className="cs-input peer"
              autoComplete="name"
            />
            <label htmlFor="name" className="cs-input-label">
              Full Name
            </label>
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Username */}
          <div className="relative">
            <input
              {...register("username")}
              type="text"
              id="username"
              placeholder=" "
              className="cs-input peer"
              autoComplete="username"
            />
            <label htmlFor="username" className="cs-input-label">
              Username
            </label>
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <input
              {...register("email")}
              type="email"
              id="reg-email"
              placeholder=" "
              className="cs-input peer"
              autoComplete="email"
            />
            <label htmlFor="reg-email" className="cs-input-label">
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
              id="reg-password"
              placeholder=" "
              className="cs-input peer pr-12"
              autoComplete="new-password"
            />
            <label htmlFor="reg-password" className="cs-input-label">
              Password (min. 6 characters)
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type={showPassword ? "text" : "password"}
              id="confirm-password"
              placeholder=" "
              className="cs-input peer pr-12"
              autoComplete="new-password"
            />
            <label htmlFor="confirm-password" className="cs-input-label">
              Confirm Password
            </label>
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-red flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
