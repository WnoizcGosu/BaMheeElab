export function normalizeDifficulty(
  difficulty: string
): "Easy" | "Medium" | "Hard" | "God" {
  const d = difficulty.toLowerCase();
  if (d === "easy") return "Easy";
  if (d === "medium") return "Medium";
  if (d === "hard") return "Hard";
  if (d === "god") return "God";
  return "Medium";
}

/** Display label for difficulty (always uppercase). */
export function formatDifficultyLabel(difficulty: string): string {
  return normalizeDifficulty(difficulty).toUpperCase();
}
