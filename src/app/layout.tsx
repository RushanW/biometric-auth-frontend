import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "../globals.css";
import Logo from "@/components/ui/Logo";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
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
  themeColor: "#14B8A6", // primary teal
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        data-gramm="false"
        className={`
          ${geistSans.variable} ${geistMono.variable}
          antialiased min-h-dvh text-foreground
          bg-[url('/images/background.jpg')] bg-cover bg-center bg-no-repeat
        `}
      >
        {/* soft readability layer: top gradient + slight blur */}
        <div className="pointer-events-none fixed inset-0 [background:linear-gradient(to_bottom,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.65)_35%,rgba(255,255,255,0.4)_60%,rgba(255,255,255,0.25)_100%)] backdrop-blur-[2px]" />

        <div className="relative mx-auto max-w-6xl">
          <header className="mb-8 flex items-center justify-between px-4 md:px-0">
            <Logo
              iconColor="text-rose-500"
              textColor="text-slate-900"
              withText
            />
            <nav className="flex items-center gap-5 text-sm">
              <Link
                className="text-foreground/80 hover:text-primary transition"
                href="/dashboard"
              >
                Dashboard
              </Link>
              <Link
                className="text-foreground/80 hover:text-primary transition"
                href="/admin"
              >
                Admin
              </Link>
              <Link
                className="text-foreground/80 hover:text-primary transition"
                href="/settings/biometrics"
              >
                Settings
              </Link>
            </nav>
          </header>

          <main className="px-4 md:px-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
