import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BaMhee E-lab | Online Programming Judge",
  description: "Practice coding problems, track your progress, and improve your programming skills with BaMhee E-lab.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Top Navigation Bar */}
        <header
          style={{
            background: "linear-gradient(135deg, #E8652B 0%, #D4541E 50%, #C04415 100%)",
            boxShadow: "0 2px 12px rgba(192, 68, 21, 0.3)",
          }}
        >
          <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(4px)",
                  transition: "background 0.2s",
                }}
                className="group-hover:bg-white/30"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span
                style={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                BaMhee E-lab
              </span>
            </Link>

            {/* Center Nav Links */}
            <div className="flex items-center gap-1">
              <Link
                href="/admin/problems"
                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                Problems
              </Link>
              <Link
                href="/admin/problems?category=Stat"
                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                Stat Problems
              </Link>
            </div>

            {/* User Avatar */}
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #F5A05C, #E8652B)",
                  border: "2px solid rgba(255,255,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                className="hover:border-white"
              >
                W
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
