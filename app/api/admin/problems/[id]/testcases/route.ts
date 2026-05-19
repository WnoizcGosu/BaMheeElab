import { NextRequest, NextResponse } from "next/server";
import { addTestCasesToProblem } from "@/lib/db/mock-problems";
import { TestCase } from "@/types/problem";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const testCases = body.testCases as TestCase[] | undefined;

    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { error: "At least one test case is required." },
        { status: 400 }
      );
    }
    
    // Prevent Payload DoS & Ensure structural integrity
    if (testCases.length > 100) {
      return NextResponse.json({ error: "Too many test cases provided." }, { status: 413 });
    }
    
    for (const tc of testCases) {
      if (!tc.id || typeof tc.inputContent !== 'string' || typeof tc.outputContent !== 'string') {
        return NextResponse.json({ error: "Invalid test case format." }, { status: 400 });
      }
      if (tc.inputContent.length > 50000 || tc.outputContent.length > 50000) {
         return NextResponse.json({ error: "Test case payload size exceeds limit." }, { status: 413 });
      }
    }

    const updated = await addTestCasesToProblem(id, testCases);

    if (!updated) {
      return NextResponse.json({ error: "Problem not found." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error adding test cases:", error);
    return NextResponse.json(
      { error: "Failed to add test cases." },
      { status: 500 }
    );
  }
}
