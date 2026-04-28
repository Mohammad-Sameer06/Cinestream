import Link from "next/link";
import { Film } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: "var(--cs-dark)" }}
    >
      <Film size={80} className="text-red-600 mb-6 opacity-80" />
      <h1
        className="text-8xl font-black mb-4"
        style={{ color: "var(--cs-red)", fontFamily: "var(--cs-display-font)" }}
      >
        404
      </h1>
      <h2 className="text-2xl font-bold text-white mb-2">
        Lost your way?
      </h2>
      <p className="text-gray-400 mb-8 max-w-md">
        Sorry, we can&apos;t find that page. You&apos;ll find lots to explore on the home screen.
      </p>
      <Link
        href="/browse"
        className="px-8 py-3 rounded-lg text-white font-bold text-lg transition-colors hover:opacity-90"
        style={{ background: "var(--cs-red)" }}
      >
        CineStream Home
      </Link>
    </div>
  );
}
