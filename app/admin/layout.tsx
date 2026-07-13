"use client";

import Link from "next/link";
import { LayoutDashboard, FileCode2, BarChart3 } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import AppNavbar from "@/components/layout/AppNavbar";
import { Suspense } from "react";

function AdminSidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const isProblemsActive = pathname?.startsWith("/admin/problems") && category !== "Stat";
  const isStatActive = pathname?.startsWith("/admin/problems") && category === "Stat";

  const getLinkClasses = (isActive: boolean) => 
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-[#FFF9F0] text-brand-red border border-[#F5CBA7] shadow-sm"
        : "text-gray-600 hover:bg-[#FFF9F0] hover:text-brand-red border border-transparent"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-[#F5CBA7] flex-shrink-0 shadow-[2px_0_8px_rgba(139,90,43,0.04)]">
      <div className="p-5 pb-3">
        <h2 className="text-base font-bold text-gray-900 px-3 m-0">
          Admin Panel
        </h2>
      </div>
      <nav className="px-3 flex flex-col gap-1">
        <Link href="/admin" className={getLinkClasses(pathname === "/admin")}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        <Link href="/admin/problems?category=Programming" className={getLinkClasses(isProblemsActive)}>
          <FileCode2 size={18} />
          <span>Problems</span>
        </Link>
        <Link href="/admin/problems?category=Stat" className={getLinkClasses(isStatActive)}>
          <BarChart3 size={18} />
          <span>Stat Problems</span>
        </Link>
      </nav>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppNavbar />
      <div className="flex flex-1 bg-[#FFF9F0]">
        <Suspense fallback={
          <aside className="w-64 bg-white border-r border-[#F5CBA7] flex-shrink-0 shadow-[2px_0_8px_rgba(139,90,43,0.04)]" />
        }>
          <AdminSidebarContent />
        </Suspense>

        {/* Main Content */}
        <main className="flex-1 p-7 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
