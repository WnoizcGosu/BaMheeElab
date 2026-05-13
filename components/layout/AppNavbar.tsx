"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppNavbarProps {
  username?: string;
}

export default function AppNavbar({ username = "User" }: AppNavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-brand-red shadow-md">
      <div className="flex items-center justify-between px-6 h-14">
        {/* Logo */}
        <Link href="/landing" className="flex items-center gap-2 text-white">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-wide">BaMhee E-lab</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: "Problems", href: "/problems" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                pathname === href
                  ? "bg-white text-brand-red"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link href="/profile">
            <div className="w-9 h-9 rounded-full bg-[#F5CBA7] border-2 border-white/30 flex items-center justify-center text-brand-red font-bold text-sm hover:border-white/70 transition-all">
              {username.slice(0, 1).toUpperCase()}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
