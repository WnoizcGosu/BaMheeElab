"use client";

import { TestCase } from "@/types/problem";
import AddTestCasePanel from "./add-test-case-panel";



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



      <AddTestCasePanel
        problemId={problemId}
        existingTestCases={testCases}
        variant={testCases.length === 0 ? "modal" : "inline"}
      />
    </div>
  );
}
