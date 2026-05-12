import { NextRequest, NextResponse } from "next/server";
import { createProblem } from "@/lib/db/mock-problems";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // In a real application, you would validate this data (e.g. using Zod)
    const newProblem = await createProblem(data);

    return NextResponse.json(newProblem);
  } catch (error) {
    console.error("Error creating problem:", error);
    return NextResponse.json(
      { error: "Failed to create problem." },
      { status: 500 }
    );
  }
}
