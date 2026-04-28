"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: "var(--cs-dark)" }}
    >
      <AlertTriangle size={64} className="text-yellow-500 mb-6" />
      <h1 className="text-3xl font-bold text-white mb-2">
        Something went wrong
      </h1>
      <p className="text-gray-400 mb-8 max-w-md">
        We encountered an unexpected error. Please try again or go back to the home page.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
        >
          <RefreshCw size={18} />
          Try Again
        </button>
        <Link
          href="/browse"
          className="px-6 py-3 rounded-lg text-white font-semibold transition-colors border border-gray-600 hover:bg-gray-800"
        >
          Go Home
        </Link>
      </div>
      {process.env.NODE_ENV === "development" && error.message && (
        <p className="mt-6 text-xs text-gray-600 font-mono bg-gray-900 px-4 py-2 rounded max-w-lg">
          {error.message}
        </p>
      )}
    </div>
  );
}
