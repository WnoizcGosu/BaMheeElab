"use client";

import Link from "next/link";
import { LayoutDashboard, FileCode2, BarChart3 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-brand-cream">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-red-100 flex-shrink-0 shadow-[2px_0_8px_rgba(192,57,43,0.04)]">
        <div className="p-5 pb-3">
          <h2 className="text-base font-bold text-gray-900 px-3 m-0">
            Admin Panel
          </h2>
        </div>
        <nav className="px-3 flex flex-col gap-1">
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === "/admin" 
                ? "bg-red-50 text-brand-red border border-red-100 font-semibold shadow-sm" 
                : "text-gray-600 hover:bg-red-50/50 hover:text-brand-red"
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/problems?category=Programming"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname?.startsWith("/admin/problems")
                ? "bg-red-50 text-brand-red border border-red-100 font-semibold shadow-sm"
                : "text-gray-600 hover:bg-red-50/50 hover:text-brand-red"
            }`}
          >
            <FileCode2 size={18} />
            <span>Problems</span>
          </Link>
          <Link
            href="/admin/problems?category=Stat"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:bg-red-50/50 hover:text-brand-red`}
          >
            <BarChart3 size={18} />
            <span>Stat Problems</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-7 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
