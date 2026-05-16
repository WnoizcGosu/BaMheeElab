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
