import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { FileCode2, BarChart3, Plus } from "lucide-react";

export default async function AdminDashboard() {
  const dbProblems = await prisma.problem.findMany();
  
  // Use native category from database
  const problems = dbProblems;

  const programmingCount = problems.filter(
  (p: { category?: string | null }) => p.category === "Programming" || p.category === "General" || !p.category
  ).length;

  const statCount = problems.filter(
  (p: { category?: string | null }) => p.category === "Stat" || p.category === "Statistical Programming"
  ).length;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Dashboard
      </h1>
      <p className="text-sm text-gray-600 mb-8">
        Welcome back, Admin. Manage problems and test cases from here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 transition-all duration-200 hover:shadow-md">
          <div className="text-sm text-gray-500 mb-2 font-medium">Total Problems</div>
          <div className="text-3xl font-bold text-brand-orange">
            {problems.length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 transition-all duration-200 hover:shadow-md">
          <div className="text-sm text-gray-500 mb-2 font-medium">Programming</div>
          <div className="text-3xl font-bold text-gray-900">{programmingCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 transition-all duration-200 hover:shadow-md">
          <div className="text-sm text-gray-500 mb-2 font-medium">Statistical</div>
          <div className="text-3xl font-bold text-gray-900">{statCount}</div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Quick Actions
      </h2>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/admin/problems/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-red hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Problem
        </Link>
        <Link
          href="/admin/problems?category=Programming"
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-red-100 rounded-lg text-sm font-semibold hover:border-red-300 hover:bg-red-50/50 transition-colors shadow-sm"
        >
          <FileCode2 size={18} />
          Programming Problems
        </Link>
        <Link
          href="/admin/problems?category=Stat"
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-red-100 rounded-lg text-sm font-semibold hover:border-red-300 hover:bg-red-50/50 transition-colors shadow-sm"
        >
          <BarChart3 size={18} />
          Stat Problems
        </Link>
      </div>
    </div>
  );
}
