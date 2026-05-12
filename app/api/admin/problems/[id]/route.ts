import { NextRequest, NextResponse } from "next/server";
import { updateProblem } from "@/lib/db/mock-problems";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updatedProblem = await updateProblem(id, data);

    if (!updatedProblem) {
      return NextResponse.json(
        { error: "Problem not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProblem);
  } catch (error) {
    console.error("Error updating problem:", error);
    return NextResponse.json(
      { error: "Failed to update problem." },
      { status: 500 }
    );
  }
}
