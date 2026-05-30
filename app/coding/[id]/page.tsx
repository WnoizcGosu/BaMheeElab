import { notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import CodingClient from "./CodingClient";

export default async function CodingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const dbProblem = await prisma.problem.findUnique({
    where: { id },
    include: {
      test_cases: {
        where: { is_public: true }, // We only want to send public test cases to the client
        orderBy: { order_index: "asc" },
      },
    },
  });

  if (!dbProblem) {
    return notFound();
  }

  // Parse description to extract constraints if "เงื่อนไขและข้อจำกัด:" exists
  let descriptionText = dbProblem.description;
  let parsedConstraints: string[] = [];
  
  const constraintKeyword = "เงื่อนไขและข้อจำกัด:";
  if (descriptionText.includes(constraintKeyword)) {
    const parts = descriptionText.split(constraintKeyword);
    descriptionText = parts[0].trim();
    // Parse the rest into an array of strings, splitting by newline and removing empty lines and leading hyphens
    parsedConstraints = parts[1]
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.startsWith("- ") ? line.substring(2) : line.startsWith("-") ? line.substring(1).trim() : line);
  }

  // Map to the format the client expects
  const problem = {
    id: dbProblem.id,
    title: dbProblem.title,
    difficulty: dbProblem.difficulty,
    tags: [dbProblem.category],
    completion: 0, // Placeholder
    description: descriptionText,
    constraints: [
      ...parsedConstraints,
    ],
    examples: dbProblem.test_cases.map((tc) => ({
      input: tc.input_content || "Hidden",
      output: tc.output_content || "Hidden",
      explanation: "", // Could be added to test case schema later
    })),
  };

  return <CodingClient problem={problem} />;
}
