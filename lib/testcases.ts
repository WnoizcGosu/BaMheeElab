import { TestCase } from "@/types/problem";

export type FileRole = "input" | "output" | "unknown";

export interface TestCasePair {
  id: string;
  baseKey: string;
  inputFile?: File;
  outputFile?: File;
}

export function classifyFileRole(filename: string): FileRole {
  const lower = filename.toLowerCase();
  const base = lower.replace(/\.[^.]+$/, "");

  if (lower.endsWith(".in") || lower.endsWith(".input")) return "input";
  if (lower.endsWith(".out") || lower.endsWith(".output") || lower.endsWith(".ans")) {
    return "output";
  }
  if (/^input([._-]|\d)/i.test(base) || /(^|[._-])input([._-]|$)/i.test(lower)) return "input";
  if (/^output([._-]|\d)/i.test(base) || /(^|[._-])output([._-]|$)/i.test(lower)) return "output";

  return "unknown";
}

export function getFileBaseKey(filename: string): string {
  const lower = filename.toLowerCase();
  let name = filename.replace(/\.[^.]+$/, "");

  const inputNum = lower.match(/input[._-]?(\d+)/);
  if (inputNum) return inputNum[1];

  const outputNum = lower.match(/output[._-]?(\d+)/);
  if (outputNum) return outputNum[1];

  name = name.replace(/\.(in|out|input|output|ans)$/i, "");
  name = name.replace(/^(input|output)[._-]?/i, "");
  name = name.replace(/[._-]?(input|output)$/i, "");

  return name || filename;
}

export function pairTestCaseFiles(files: File[]): TestCasePair[] {
  const map = new Map<string, TestCasePair>();

  for (const file of files) {
    const role = classifyFileRole(file.name);
    const baseKey = getFileBaseKey(file.name);

    if (!map.has(baseKey)) {
      map.set(baseKey, { id: baseKey, baseKey });
    }

    const pair = map.get(baseKey)!;

    if (role === "input") {
      if (pair.inputFile) {
        const orphanKey = `${baseKey}-in-${file.name}`;
        map.set(orphanKey, { id: orphanKey, baseKey: orphanKey, inputFile: file });
      } else {
        pair.inputFile = file;
      }
    } else if (role === "output") {
      if (pair.outputFile) {
        const orphanKey = `${baseKey}-out-${file.name}`;
        map.set(orphanKey, { id: orphanKey, baseKey: orphanKey, outputFile: file });
      } else {
        pair.outputFile = file;
      }
    } else if (!pair.inputFile) {
      pair.inputFile = file;
    } else if (!pair.outputFile) {
      pair.outputFile = file;
    } else {
      const orphanKey = `${baseKey}-${file.name}`;
      map.set(orphanKey, { id: orphanKey, baseKey: orphanKey, inputFile: file });
    }
  }

  return Array.from(map.values());
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export async function uploadTestCaseFile(
  file: File
): Promise<{ fileUrl: string; s3Key: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/testcases/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload ${file.name}`);
  }

  const data = await res.json();
  return {
    fileUrl: data.fileUrl,
    s3Key: data.s3Key,
    filename: data.filename || file.name,
  };
}

export async function buildTestCaseFromPair(pair: TestCasePair): Promise<TestCase> {
  const id = `tc-${crypto.randomUUID().slice(0, 8)}`;
  const filename = pair.inputFile?.name || pair.outputFile?.name || pair.baseKey;

  let inputContent: string | undefined;
  let outputContent: string | undefined;
  let inputUrl: string | undefined;
  let outputUrl: string | undefined;

  if (pair.inputFile) {
    inputContent = await readFileAsText(pair.inputFile);
    const uploaded = await uploadTestCaseFile(pair.inputFile);
    inputUrl = uploaded.fileUrl;
  }

  if (pair.outputFile) {
    outputContent = await readFileAsText(pair.outputFile);
    const uploaded = await uploadTestCaseFile(pair.outputFile);
    outputUrl = uploaded.fileUrl;
  }

  return {
    id,
    filename,
    inputContent,
    outputContent,
    inputUrl,
    outputUrl,
    isPublic: false,
  };
}

export async function buildTestCasesFromPairs(pairs: TestCasePair[]): Promise<TestCase[]> {
  const results: TestCase[] = [];
  for (const pair of pairs) {
    if (!pair.inputFile && !pair.outputFile) continue;
    results.push(await buildTestCaseFromPair(pair));
  }
  return results;
}

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
