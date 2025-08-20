import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Biometric Auth",
  description: "Face-based authentication with liveness checks",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        data-gramm="false"
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-neutral-950 text-neutral-100`}
      >
        <div className="mx-auto max-w-6xl p-4 md:p-8">
          <header className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight hover:opacity-90"
            >
              Biometric Auth
            </Link>
            <nav className="flex items-center gap-4 text-sm text-neutral-400">
              <Link className="hover:text-white" href="/dashboard">
                Dashboard
              </Link>
              <Link className="hover:text-white" href="/admin">
                Admin
              </Link>
              <Link className="hover:text-white" href="/settings/biometrics">
                Settings
              </Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
