import Link from "next/link";
import { notFound } from "next/navigation";
import { getProblemById } from "@/lib/db/mock-problems";
import { ArrowLeft, Clock, MemoryStick as Memory, FileText } from "lucide-react";

export default async function ProblemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = await getProblemById(id);

  if (!problem) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/problems" 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Problem Details</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-mono text-gray-500 mb-1">ID: {problem.id}</div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{problem.title}</h2>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                  problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {problem.difficulty}
                </span>
              </div>
            </div>
            <Link 
              href={`/admin/problems/${problem.id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Edit Problem
            </Link>
          </div>
          
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
              <Clock size={16} />
              <span className="text-sm font-medium">{problem.timeLimit} ms</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
              <Memory size={16} />
              <span className="text-sm font-medium">{problem.memoryLimit} MB</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
              <FileText size={16} />
              <span className="text-sm font-medium">{problem.testCases?.length || 0} Test Cases</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
          <div className="prose max-w-none text-gray-700">
            {problem.description || "No description provided."}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Cases</h3>
          {problem.testCases && problem.testCases.length > 0 ? (
            <div className="space-y-4">
              {problem.testCases.map((tc, index) => (
                <div key={tc.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-800">Test Case #{index + 1}</span>
                    {tc.isPublic && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Public Example
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Input</h4>
                      <pre className="bg-gray-50 p-3 rounded border border-gray-100 text-sm font-mono text-gray-800 whitespace-pre-wrap">
                        {tc.inputContent ? tc.inputContent : tc.inputUrl ? `[File: ${tc.filename}]` : "No input data"}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Expected Output</h4>
                      <pre className="bg-gray-50 p-3 rounded border border-gray-100 text-sm font-mono text-gray-800 whitespace-pre-wrap">
                        {tc.outputContent ? tc.outputContent : tc.outputUrl ? `[File: output_${tc.filename}]` : "No output data"}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200 border-dashed">
              <p className="text-gray-500">No test cases have been added for this problem yet.</p>
              <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                + Add Test Case
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
