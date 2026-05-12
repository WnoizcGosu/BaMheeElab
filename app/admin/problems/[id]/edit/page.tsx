import { notFound } from "next/navigation";
import { getProblemById } from "@/lib/db/mock-problems";
import EditProblemForm from "./edit-form";

export default async function EditProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = await getProblemById(id);

  if (!problem) {
    notFound();
  }

  return <EditProblemForm problem={problem} />;
}
