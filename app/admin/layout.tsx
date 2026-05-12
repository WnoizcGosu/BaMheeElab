import Link from "next/link";
import { LayoutDashboard, FileCode2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">BaMhee Admin</h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/problems?category=Programming" className="flex items-center gap-3 px-4 py-3 text-blue-700 bg-blue-50 rounded-lg font-medium">
            <FileCode2 size={20} />
            <span>Problems</span>
          </Link>
          <Link href="/admin/problems?category=Stat" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100">
            <FileCode2 size={20} />
            <span>Stat Problems</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
