import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "CineStream - Watch Movies and TV Shows Online",
    template: "%s | CineStream",
  },
  description:
    "Stream thousands of movies and TV shows in HD. Watch anytime, anywhere on CineStream.",
  keywords: ["movies", "tv shows", "streaming", "watch online", "cinema"],
  authors: [{ name: "CineStream" }],
  openGraph: {
    title: "CineStream - Watch Movies and TV Shows Online",
    description: "Stream thousands of movies and TV shows in HD.",
    type: "website",
    siteName: "CineStream",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineStream - Watch Movies and TV Shows Online",
    description: "Stream thousands of movies and TV shows in HD.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
            <footer className="border-t border-white/10 bg-[rgba(8,12,18,0.88)] px-[5%] py-5 text-sm text-white/55 backdrop-blur-xl">
              <div className="content-wrap flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-medium text-white/70">CineStream</p>
                <p>Developed by Sameer</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
