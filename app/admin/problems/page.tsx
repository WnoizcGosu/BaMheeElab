import Link from "next/link";
import { getProblems } from "@/lib/db/mock-problems";
import { Plus, Search, FileText } from "lucide-react";

export default async function ProblemsPage() {
  const problems = await getProblems();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Problem Management</h1>
        <Link 
          href="/admin/problems/create" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Create Problem
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search problems..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 font-medium text-gray-600">ID</th>
                <th className="px-6 py-4 font-medium text-gray-600">Title</th>
                <th className="px-6 py-4 font-medium text-gray-600">Limits</th>
                <th className="px-6 py-4 font-medium text-gray-600">Test Cases</th>
                <th className="px-6 py-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {problems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No problems found. Create one to get started.
                  </td>
                </tr>
              ) : (
                problems.map((problem) => (
                  <tr key={problem.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono text-sm text-gray-500">{problem.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <Link href={`/admin/problems/${problem.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        {problem.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {problem.timeLimit}ms / {problem.memoryLimit}MB
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <FileText size={16} className="text-gray-400" />
                        {problem.testCases?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/problems/${problem.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
