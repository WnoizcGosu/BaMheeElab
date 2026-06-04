"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type {
  Language,
  SubmissionStatus,
  SubmissionResult,
  SubmissionUpdateEvent,
} from "@/types/submission";

const USER_ID = "user-test";
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

const PROBLEMS = [
  { id: "p-1", title: "A+B Problem" },
  { id: "p-2", title: "Echo" },
];

const LANGS: Language[] = ["PYTHON", "C", "CPP"];

const STARTER: Record<Language, Record<string, string>> = {
  PYTHON: {
    "p-1": "a, b = map(int, input().split())\nprint(a + b)\n",
    "p-2": "print(input())\n",
  },
  C: {
    "p-1":
      '#include <stdio.h>\nint main(){int a,b;scanf("%d %d",&a,&b);printf("%d\\n",a+b);return 0;}\n',
    "p-2":
      '#include <stdio.h>\nint main(){char s[1024];scanf("%1023s",s);printf("%s\\n",s);return 0;}\n',
  },
  CPP: {
    "p-1":
      '#include <iostream>\nint main(){int a,b;std::cin>>a>>b;std::cout<<a+b<<"\\n";}\n',
    "p-2":
      '#include <iostream>\n#include <string>\nint main(){std::string s;std::cin>>s;std::cout<<s<<"\\n";}\n',
  },
};

const STATUS_COLOR: Record<SubmissionStatus, string> = {
  PENDING: "bg-gray-200 text-gray-800",
  JUDGING: "bg-blue-200 text-blue-900",
  ACCEPTED: "bg-green-200 text-green-900",
  WRONG_ANSWER: "bg-red-200 text-red-900",
  TIME_LIMIT: "bg-yellow-200 text-yellow-900",
  MEMORY_LIMIT: "bg-yellow-200 text-yellow-900",
  RUNTIME_ERROR: "bg-orange-200 text-orange-900",
  COMPILE_ERROR: "bg-purple-200 text-purple-900",
};

interface LeaderboardRow {
  rank: number;
  userId: string;
  score: number;
}

export default function TestPage() {
  const [problemId, setProblemId] = useState("p-1");
  const [language, setLanguage] = useState<Language>("PYTHON");
  const [code, setCode] = useState(STARTER.PYTHON["p-1"]);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<SubmissionStatus | null>(null);
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [liveRuntime, setLiveRuntime] = useState<number | null>(null);
  const [liveMemory, setLiveMemory] = useState<number | null>(null);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Reset code when problem or language changes.
  useEffect(() => {
    setCode(STARTER[language][problemId] || "");
  }, [problemId, language]);

  // Socket connection.
  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = s;

    s.on("connect", () => {
      setSocketConnected(true);
      s.emit("join", USER_ID);
    });
    s.on("disconnect", () => setSocketConnected(false));

    return () => {
      s.disconnect();
    };
  }, []);

  // React to submission updates for the active submission.
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const onUpdate = async (e: SubmissionUpdateEvent) => {
      if (!submissionId || e.submissionId !== submissionId) return;
      setLiveStatus(e.status);
      setLiveScore(e.score);
      setLiveRuntime(e.runtime);
      setLiveMemory(e.memory);

      // Final verdicts → fetch full result + refresh leaderboard.
      if (e.status !== "PENDING" && e.status !== "JUDGING") {
        try {
          const r = await fetch(`/api/submissions/${e.submissionId}`);
          if (r.ok) setResult(await r.json());
        } catch {
          /* ignore */
        }
        fetchLeaderboard();
      }
    };

    s.on("submission:update", onUpdate);
    return () => {
      s.off("submission:update", onUpdate);
    };
  }, [submissionId]);

  async function fetchLeaderboard() {
    try {
      const r = await fetch(
        `/api/leaderboard?problemId=${encodeURIComponent(problemId)}&limit=10`
      );
      if (!r.ok) return;
      const data = (await r.json()) as { entries: LeaderboardRow[] };
      setLeaderboard(data.entries);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  async function onSubmit() {
    setError(null);
    setResult(null);
    setLiveStatus("PENDING");
    setLiveScore(null);
    setLiveRuntime(null);
    setLiveMemory(null);
    setSubmitting(true);
    try {
      const r = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, language, sourceCode: code }),
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`${r.status} ${txt}`);
      }
      const data = (await r.json()) as { submissionId: string };
      setSubmissionId(data.submissionId);
    } catch (e) {
      setError(String(e));
      setLiveStatus(null);
    } finally {
      setSubmitting(false);
    }
  }

  const statusBadge = useMemo(() => {
    if (!liveStatus) return null;
    return (
      <span
        className={`inline-block px-2 py-1 rounded text-xs font-mono ${STATUS_COLOR[liveStatus]}`}
      >
        {liveStatus}
      </span>
    );
  }, [liveStatus]);

  return (
    <div className="min-h-screen p-6 font-sans bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Judge test page</h1>
          <div className="text-xs">
            socket:{" "}
            <span
              className={
                socketConnected ? "text-green-700" : "text-red-700 font-bold"
              }
            >
              {socketConnected ? "connected" : "disconnected"}
            </span>{" "}
            · user: <span className="font-mono">{USER_ID}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="text-sm">
            Problem
            <select
              value={problemId}
              onChange={(e) => setProblemId(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 bg-white p-2"
            >
              {PROBLEMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.id})
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Language
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="mt-1 block w-full rounded border border-gray-300 bg-white p-2"
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              onClick={onSubmit}
              disabled={submitting || !code.trim()}
              className="w-full rounded bg-blue-600 px-4 py-2 text-white font-medium disabled:bg-gray-300"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full h-64 rounded border border-gray-300 p-3 font-mono text-sm bg-white"
        />

        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900 font-mono">
            {error}
          </div>
        )}

        {submissionId && (
          <section className="rounded border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">submissionId</span>
              <span className="font-mono text-xs">{submissionId}</span>
              {statusBadge}
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Stat label="score" value={liveScore ?? "—"} />
              <Stat
                label="runtime"
                value={liveRuntime === null ? "—" : `${liveRuntime} ms`}
              />
              <Stat
                label="memory"
                value={liveMemory === null ? "—" : `${liveMemory} KB`}
              />
            </div>

            {result && (
              <div className="space-y-3 mt-2">
                {result.results.map((r) => (
                  <article
                    key={r.testCaseId}
                    className={`rounded border ${
                      r.passed
                        ? "border-green-200 bg-green-50/40"
                        : "border-red-200 bg-red-50/40"
                    }`}
                  >
                    <header className="flex flex-wrap items-center gap-3 px-3 py-2 border-b border-gray-200 bg-white/60">
                      <span className="font-mono text-sm font-semibold">
                        {r.testCaseId}
                      </span>
                      {r.passed ? (
                        <span className="rounded bg-green-200 text-green-900 text-xs font-bold px-2 py-0.5">
                          PASS
                        </span>
                      ) : (
                        <span className="rounded bg-red-200 text-red-900 text-xs font-bold px-2 py-0.5">
                          FAIL
                        </span>
                      )}
                      <span className="text-xs text-gray-600">
                        runtime: {r.runtime === null ? "—" : `${r.runtime} ms`}
                      </span>
                      <span className="text-xs text-gray-600">
                        memory: {r.memory === null ? "—" : `${r.memory} KB`}
                      </span>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                      <CodeBlock
                        label="expected output"
                        value={r.expectedOutput}
                        hiddenNote="hidden test case"
                      />
                      <CodeBlock
                        label="actual output"
                        value={r.actualOutput}
                        hiddenNote="hidden test case"
                        tone={r.passed ? "ok" : "bad"}
                      />
                    </div>

                    {r.errorMessage && (
                      <div className="px-3 pb-3">
                        <CodeBlock
                          label="error"
                          value={r.errorMessage}
                          tone="error"
                        />
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="rounded border border-gray-200 bg-white p-4">
          <div className="flex justify-between items-baseline mb-2">
            <h2 className="font-semibold">Leaderboard — {problemId}</h2>
            <button
              onClick={fetchLeaderboard}
              className="text-xs text-blue-600 hover:underline"
            >
              refresh
            </button>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-gray-500">No entries yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="py-1">#</th>
                  <th>user</th>
                  <th>score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr key={row.userId} className="border-t border-gray-100">
                    <td className="py-1">{row.rank}</td>
                    <td className="font-mono">{row.userId}</td>
                    <td>{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded bg-gray-50 p-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-mono">{value}</div>
    </div>
  );
}

function CodeBlock({
  label,
  value,
  hiddenNote,
  tone = "neutral",
}: {
  label: string;
  value: string | null;
  hiddenNote?: string;
  tone?: "neutral" | "ok" | "bad" | "error";
}) {
  const toneClass =
    tone === "error"
      ? "bg-red-950 text-red-100"
      : tone === "bad"
      ? "bg-gray-900 text-red-200"
      : tone === "ok"
      ? "bg-gray-900 text-green-200"
      : "bg-gray-900 text-gray-100";

  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      {value === null ? (
        <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-xs italic text-gray-400">
          {hiddenNote ?? "—"}
        </div>
      ) : (
        <pre className={`rounded ${toneClass} p-3 text-sm font-mono whitespace-pre-wrap break-all overflow-auto max-h-72`}>
          {value || <span className="text-gray-500">(empty)</span>}
        </pre>
      )}
    </div>
  );
}
