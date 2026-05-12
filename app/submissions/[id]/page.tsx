import { notFound } from "next/navigation";
import { getSubmissionById } from "@/lib/db/mock-submissions";
import { CheckCircle2, XCircle, Clock, MemoryStick as Memory, Code2 } from "lucide-react";
import Link from "next/link";

export default async function SubmissionResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await getSubmissionById(id);

  if (!submission) {
    notFound();
  }

  const isPassed = submission.status === "Passed";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header & Overall Status */}
        <div className={`p-6 rounded-2xl shadow-sm border ${isPassed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isPassed ? (
                <CheckCircle2 className="text-green-600" size={40} />
              ) : (
                <XCircle className="text-red-600" size={40} />
              )}
              <div>
                <h1 className={`text-3xl font-bold ${isPassed ? 'text-green-800' : 'text-red-800'}`}>
                  {submission.status}
                </h1>
                <p className={`text-sm mt-1 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  Submitted on {submission.createdAt.toLocaleString()}
                </p>
              </div>
            </div>
            <Link 
              href={`/admin/problems/${submission.problemId}`}
              className="px-4 py-2 bg-white rounded-lg border shadow-sm text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Back to Problem
            </Link>
          </div>

          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-lg border border-white/40 shadow-sm">
              <Clock className={isPassed ? "text-green-700" : "text-red-700"} size={18} />
              <span className="font-semibold text-gray-800">{submission.executionTime} ms</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-lg border border-white/40 shadow-sm">
              <Memory className={isPassed ? "text-green-700" : "text-red-700"} size={18} />
              <span className="font-semibold text-gray-800">{submission.memoryUsed} MB</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-lg border border-white/40 shadow-sm">
              <Code2 className={isPassed ? "text-green-700" : "text-red-700"} size={18} />
              <span className="font-semibold text-gray-800">{submission.language}</span>
            </div>
          </div>
        </div>

        {/* Test Cases Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Test Cases</h2>
            <span className="text-sm font-medium text-gray-500">
              {submission.testCaseResults.filter(tc => tc.status === "Passed").length} / {submission.testCaseResults.length} Passed
            </span>
          </div>
          
          <div className="divide-y divide-gray-200">
            {submission.testCaseResults.map((tc, index) => {
              const tcPassed = tc.status === "Passed";
              return (
                <div key={tc.testCaseId} className={`p-6 ${tcPassed ? 'hover:bg-green-50/30' : 'bg-red-50/30'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {tcPassed ? (
                        <CheckCircle2 className="text-green-500" size={20} />
                      ) : (
                        <XCircle className="text-red-500" size={20} />
                      )}
                      <h3 className="font-semibold text-gray-800">Test Case {index + 1}</h3>
                    </div>
                    <div className="text-sm text-gray-500 flex gap-4">
                      <span>{tc.executionTime} ms</span>
                      <span>{tc.memoryUsed} MB</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Input</div>
                      <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{tc.input}</pre>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expected Output</div>
                      <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{tc.expectedOutput}</pre>
                    </div>
                    <div className={`rounded-lg p-4 border ${tcPassed ? 'bg-green-50/50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${tcPassed ? 'text-green-600' : 'text-red-600'}`}>
                        Actual Output
                      </div>
                      <pre className={`text-sm font-mono whitespace-pre-wrap ${tcPassed ? 'text-green-900' : 'text-red-900 font-semibold'}`}>
                        {tc.actualOutput}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submitted Code */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900">Submitted Code</h2>
          </div>
          <div className="p-0">
            <pre className="p-6 text-sm font-mono text-gray-800 overflow-x-auto bg-[#FAFAFA]">
              <code>{submission.code}</code>
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
