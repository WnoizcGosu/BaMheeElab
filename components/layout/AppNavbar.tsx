"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShieldAlert } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface AppNavbarProps {
  username?: string;
}

export default function AppNavbar({ username = "User" }: AppNavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // ── Dynamic Mappings ──
  const fullName = session?.user?.name || username;
  const userInitial = (session?.user?.name?.[0] || session?.user?.email?.[0] || username?.[0] || "U").toUpperCase();

  // 🎯 ปรับจุดที่ 1: ใช้ (session?.user as any) เพื่อไม่ให้ TS บ่นเรื่องสิทธิ์ role
  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 bg-brand-red shadow-md">
      <div className="flex items-center justify-between px-6 h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-wide">BaMhee E-lab</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {!pathname?.startsWith("/admin") && [
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

          {/* 🎯 ปุ่ม Admin Panel */}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5",
                // 🎯 ปรับจุดที่ 2: เติมเครื่องหมาย ? หลัง pathname เผื่อจังหวะที่ Next.js กำลังเรนเดอร์หน้าจอครั้งแรก
                pathname?.startsWith("/admin")
                  ? "bg-white text-brand-red"
                  : "text-amber-200 hover:text-white hover:bg-white/10"
              )}
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Panel
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session?.user?.name && (
            <span className="text-xs text-white/80 font-medium hidden sm:inline-block max-w-[120px] truncate">
              {fullName}
              {isAdmin && <span className="ml-1 text-[9px] bg-amber-400 text-brand-red px-1 rounded font-bold">Admin</span>}
            </span>
          )}

          <Link href="/profile">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={fullName}
                className="w-9 h-9 rounded-full border-2 border-white/30 object-cover hover:border-white/70 transition-all cursor-pointer"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#F5CBA7] border-2 border-white/30 flex items-center justify-center text-brand-red font-bold text-sm hover:border-white/70 transition-all font-display cursor-pointer">
                {userInitial}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}