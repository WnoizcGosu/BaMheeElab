"use client";

import { TestCase } from "@/types/problem";
import AddTestCasePanel from "./add-test-case-panel";

function displayContent(content?: string, url?: string, fallback?: string): string {
  if (content) return content;
  if (url) return `[File: ${fallback || url}]`;
  return "No data";
}

export default function ProblemTestCasesSection({
  problemId,
  testCases,
}: {
  problemId: string;
  testCases: TestCase[];
}) {
  return (
    <div className="p-6 border-t border-gray-200 bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Cases</h3>

      {testCases.length > 0 ? (
        <div className="space-y-4 mb-6">
          {testCases.map((tc, index) => (
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
                    {displayContent(tc.inputContent, tc.inputUrl, tc.filename)}
                  </pre>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Expected Output</h4>
                  <pre className="bg-gray-50 p-3 rounded border border-gray-100 text-sm font-mono text-gray-800 whitespace-pre-wrap">
                    {displayContent(tc.outputContent, tc.outputUrl, `output_${tc.filename}`)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg border border-gray-200 border-dashed mb-4">
          <p className="text-gray-500">No test cases have been added for this problem yet.</p>
        </div>
      )}

      <AddTestCasePanel
        problemId={problemId}
        existingTestCases={testCases}
        variant={testCases.length === 0 ? "modal" : "inline"}
      />
    </div>
  );
}
