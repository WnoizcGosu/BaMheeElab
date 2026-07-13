import type { Difficulty } from "@/types/problem";

const STYLES: Record<Difficulty, string> = {
  EASY: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HARD: "bg-orange-100 text-orange-700",
  GOD: "bg-purple-100 text-purple-700",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STYLES[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}
