"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, Play, Send, ChevronDown,
  CheckCircle, XCircle, Clock, Terminal, ChevronUp, Code2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppNavbar from "@/components/layout/AppNavbar";
import { cn } from "@/lib/utils";
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { io, Socket } from "socket.io-client";
import type { SubmissionUpdateEvent } from "@/types/submission";

loader.config({ monaco });
const LANGUAGES = ["Python", "C", "C++"];

const LANG_TO_API: Record<string, "PYTHON" | "C" | "CPP"> = {
  Python: "PYTHON",
  C: "C",
  "C++": "CPP",
};

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
const TEST_USER_ID = "user-test";

const STARTER_CODE: Record<string, string> = {
  Python: `a, b = map(int, input().split())\nprint(a + b)`,
  C: `#include <stdio.h>\n\nint main() {\n    return 0;\n}\n`,
  "C++": `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n`,
  Java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n\n    }\n}\n`,
  JavaScript: `// Write your solution here\n\n`,
};

interface ProblemData {
  id: string;
  title: string;
  difficulty: string;
  tags: string[];
  completion: number;
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
}

type RunStatus = "idle" | "running" | "passed" | "failed";

interface Submission {
  id: number;
  lang: string;
}
interface TestCaseResult {
  testCaseId: string;
  status: "Passed" | "Failed";
  executionTime: number;
  memoryUsed: number;
  input: string;
  expectedOutput: string | null;
  actualOutput: string | null;
  errorMessage?: string | null;
}

interface DBSubmission {
  id: string;
  problemId: string;
  userId: string;
  language: string;
  code: string;
  status: "Passed" | "Failed";
  executionTime: number;
  memoryUsed: number;
  createdAt: Date;
  testCaseResults: TestCaseResult[];
}

interface Example {
  input: string;
  output: string;
  explanation: string;
}

interface ProblemDetail {
  id: string;
  title: string;
  difficulty: string;
  tags: string[];
  completion: number;
  description: string;
  constraints: string[];
  examples: Example[];
}

function formatDate(d: Date) {
  const dateObj = new Date(d);
  return dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " + dateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function CodingClient({ problem }: { problem: any }) {
  const [lang, setLang] = useState("Python");
  const [code, setCode] = useState(STARTER_CODE["Python"]);
  const [tab, setTab] = useState<"current" | "recent" | "all">("current");
  const [runStatus, setRunStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const [output, setOutput] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [submissions, setSubmissions] = useState<DBSubmission[]>([]);
  const [submissionResult, setSubmissionResult] = useState<("T" | "F")[]>([]);

  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [terminalTab, setTerminalTab] = useState<"output" | "input">("output");

  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const pendingSubmissionId = useRef<string | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", TEST_USER_ID);
    });

    socket.on("submission:update", async (event: SubmissionUpdateEvent) => {
      if (event.submissionId !== pendingSubmissionId.current) return;

      if (event.status === "JUDGING") {
        setOutput("⏳ Judging...");
        return;
      }

      const passed = event.status === "ACCEPTED";
      setRunStatus(passed ? "passed" : "failed");
      setOutput(
        passed
          ? `✅ Accepted! Score: ${event.score}/100` +
            (event.runtime != null ? ` · ${event.runtime}ms` : "") +
            (event.memory != null ? ` · ${event.memory}KB` : "")
          : `❌ ${event.status.replace(/_/g, " ")} · Score: ${event.score}/100`
      );

      // fetch ข้อมูลจริงจาก DB แล้วใส่ใน submissions state
      try {
        const res = await fetch(`/api/submissions/${event.submissionId}`);
        if (res.ok) {
          const data = await res.json();
          const mapped: DBSubmission = {
            id: data.id,
            problemId: data.problemId ?? "",
            userId: TEST_USER_ID,
            language: data.language,
            code: data.sourceCode ?? "",
            status: data.status === "ACCEPTED" ? "Passed" : "Failed",
            executionTime: data.runtime ?? 0,
            memoryUsed: data.memory ?? 0,
            createdAt: new Date(data.submittedAt),
            testCaseResults: (data.results ?? []).map((tc: {
              testCaseId: string;
              passed: boolean;
              runtime: number | null;
              memory: number | null;
              actualOutput: string | null;
              expectedOutput: string | null;
              errorMessage: string | null;
            }) => ({
              testCaseId: tc.testCaseId,
              status: tc.passed ? "Passed" : "Failed",
              executionTime: tc.runtime ?? 0,
              memoryUsed: tc.memory ?? 0,
              input: "",
              expectedOutput: tc.expectedOutput,
              actualOutput: tc.actualOutput,
              errorMessage: tc.errorMessage,
            })),
          };
          setSubmissions((prev) => [mapped, ...prev]);
        }
      } catch {
        // ถ้า fetch ไม่ได้ก็ไม่เป็นไร output บอกผลไปแล้ว
      }

      pendingSubmissionId.current = null;
      setTab("recent");
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newHeight = window.innerHeight - e.clientY;
      setTerminalHeight(Math.max(40, Math.min(newHeight, window.innerHeight * 0.8)));
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "row-resize";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging]);

  useEffect(() => {
    const loadPyodide = async () => {
      if ((window as any).pyodideInstance) {
        setIsPyodideReady(true);
        return;
      }
      try {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
        script.onload = async () => {
          const pyodide = await (window as any).loadPyodide();
          (window as any).pyodideInstance = pyodide;
          setIsPyodideReady(true);
        };
        document.body.appendChild(script);
      } catch (err) {
        console.error("Failed to load Pyodide", err);
      }
    };
    loadPyodide();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const problemId = queryParams.get("id");

    if (!problemId) return;

    fetch(`/api/problems/${problemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response failure");
        return res.json();
      })
      .then((data: ProblemDetail) => {
        setProblem(data);
      })
      .catch((err) => console.error("Error loading problem profile:", err));

    // โหลด submission history จาก DB
    fetch(`/api/submissions?problemId=${problemId}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data: Array<{
        id: string; problemId: string; language: string; sourceCode: string;
        status: string; runtime: number | null; memory: number | null;
        submittedAt: string;
        results: Array<{ testCaseId: string; passed: boolean; runtime: number | null; memory: number | null; actualOutput: string | null; expectedOutput: string | null; errorMessage: string | null }>;
      }>) => {
        const mapped: DBSubmission[] = data.map((s) => ({
          id: s.id,
          problemId: s.problemId,
          userId: TEST_USER_ID,
          language: s.language,
          code: s.sourceCode,
          status: s.status === "ACCEPTED" ? "Passed" : "Failed",
          executionTime: s.runtime ?? 0,
          memoryUsed: s.memory ?? 0,
          createdAt: new Date(s.submittedAt),
          testCaseResults: s.results.map((tc) => ({
            testCaseId: tc.testCaseId,
            status: tc.passed ? "Passed" : "Failed",
            executionTime: tc.runtime ?? 0,
            memoryUsed: tc.memory ?? 0,
            input: "",
            expectedOutput: tc.expectedOutput,
            actualOutput: tc.actualOutput,
            errorMessage: tc.errorMessage,
          })),
        }));
        setSubmissions(mapped);
      })
      .catch(() => {});
  }, []);

  const handleLangChange = (l: string) => {
    setLang(l);
    setCode(STARTER_CODE[l] ?? "");
    setRunStatus("idle");
    setOutput("");
    setSubmissionResult([]);
  };

  const getMonacoLanguage = (displayLang: string) => {
    switch (displayLang) {
      case "C++": return "cpp";
      case "JavaScript": return "javascript";
      default: return displayLang.toLowerCase();
    }
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    monaco.languages.registerCompletionItemProvider("python", {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const pythonKeywords = [
          { label: "print", kind: monaco.languages.CompletionItemKind.Function, insertText: "print($1)", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: "พิมพ์ข้อมูลออกทางหน้าจอ", range },
          { label: "input", kind: monaco.languages.CompletionItemKind.Function, insertText: "input($1)", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: "รับข้อมูลจากคีย์บอร์ด", range },
          { label: "len", kind: monaco.languages.CompletionItemKind.Function, insertText: "len($1)", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
          { label: "range", kind: monaco.languages.CompletionItemKind.Function, insertText: "range($1)", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
          { label: "def", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "def ", range },
          { label: "import", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "import ", range },
        ];
        return { suggestions: pythonKeywords };
      },
    });
  };

  const handleRun = async () => {
    setRunStatus("running");
    setTerminalTab("output");
    setSubmissionResult([]);

    if (lang !== "Python") {
      setOutput(`Error: Browser execution is currently only supported for Python.`);
      setRunStatus("failed");
      return;
    }

    if (!isPyodideReady) {
      setOutput("Initializing Python Environment...");
      setRunStatus("failed");
      return;
    }

    const pyodide = (window as any).pyodideInstance;
    let currentOutput = "";
    const inputLines = customInput.split('\n');
    let inputIndex = 0;

    pyodide.setStdout({ batched: (text: string) => { currentOutput += text + "\n"; } });
    pyodide.setStdin({
      stdin: () => {
        if (inputIndex < inputLines.length) return inputLines[inputIndex++] + "\n";
        return "\n";
      }
    });

    try {
      setOutput("Running...");
      await pyodide.runPythonAsync(code);
      setOutput(currentOutput || "Code executed successfully. (No output)");
      setRunStatus("passed");
    } catch (error: any) {
      setOutput(error.message);
      setRunStatus("failed");
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    const apiLang = LANG_TO_API[lang];
    if (!apiLang) {
      setOutput(`Language "${lang}" is not supported for submission.`);
      return;
    }

    setRunStatus("running");
    setSubmissionResult([]);
    setOutput("⏳ Submitting...");
    setTerminalTab("output");

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          language: apiLang,
          sourceCode: code,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setOutput(`❌ Submission failed: ${err.error ?? res.statusText}`);
        setRunStatus("failed");
        return;
      }

      const { submissionId } = await res.json();
      pendingSubmissionId.current = submissionId;
      setOutput("⏳ Queued — waiting for judge...");

    } catch (e) {
      setOutput(`❌ Network error: ${e instanceof Error ? e.message : String(e)}`);
      setRunStatus("failed");
    }
  };

  // 🎯 กล่องดักสถานะโหลด (Guard Clause) เพื่อแก้ปัญหา TypeError: problem is null
  if (!problem) {
    return (
      <div className="h-screen bg-[#FFF9F0] flex items-center justify-center text-gray-500">
        Loading challenge engine...
      </div>
    );
  }

  const recentSub = submissions[0] ?? null;

  return (
    <div className="h-screen flex flex-col bg-[#FFF9F0] overflow-hidden">
      <AppNavbar username="Worachot" />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT Panel */}
        <div className="w-[400px] flex-shrink-0 flex flex-col bg-white border-r border-[#F5CBA7] overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-[#F5CBA7]">
            <Link href="/problems">
              <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-red mb-3 transition-colors">
                <ChevronLeft className="w-3 h-3" /> back
              </button>
            </Link>
            <h1 className="font-display text-xl font-bold text-gray-900 mb-2">{problem.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={problem.difficulty.toLowerCase() as "easy" | "medium" | "hard"}>
                {problem.difficulty}
              </Badge>
              {problem.tags.map((t: string) => (
                <Badge key={t} variant="topic">{t}</Badge>
              ))}
  <span className="text-xs text-gray-400 ml-auto">{problem.completion}% acceptance</span>
            </div >
          </div >

    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 text-sm text-gray-700">
      <div>
        <h2 className="font-display font-bold text-gray-900 mb-2">Description</h2>
        <p className="leading-relaxed whitespace-pre-line">{problem.description}</p>
      </div>
  <div>
    <h2 className="font-display font-bold text-gray-900 mb-2">Constraints</h2>
    <ul className="space-y-1">
      {problem?.constraints?.map((c: string) => (
        <li key={c} className="flex items-start gap-2">
          <span className="text-brand-red mt-0.5">•</span>
          <code className="font-code text-xs bg-[#FFF9F0] px-1.5 py-0.5 rounded">{c}</code>
        </li>
      ))}
    </ul>
  </div>
  {
    problem.examples.map((ex: Example, i: number) => (
      <div key={i}>
        <h2 className="font-display font-bold text-gray-900 mb-2">Example {i + 1}</h2>
        <div className="bg-[#FFF9F0] rounded-xl border border-[#F5CBA7] overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-[#F5CBA7]">
            <div className="p-3 min-w-0 overflow-x-auto">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Input</div>
                      <code className="font-code text-xs text-gray-800 whitespace-pre-wrap">{ex.input}</code>
                    </div >
      <div className="p-3 min-w-0 overflow-x-auto">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Output</div>
                      <code className="font-code text-xs text-gray-800 whitespace-pre-wrap">{ex.output}</code>
                    </div >
                  </div >
                </div >
              </div >
            ))
  }
          </div >
        </div >

    {/* RIGHT Panel */ }
    < div className = "flex-1 flex flex-col overflow-hidden relative" >
      <div className="flex items-center px-4 py-2.5 bg-white border-b border-[#F5CBA7] gap-3">
        <div className="flex items-center gap-1 bg-[#FFF9F0] rounded-full p-0.5 border border-[#F5CBA7]">
          {(["current", "recent", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium capitalize transition-all",
                tab === t ? "bg-brand-red text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "current" && (
          <div className="relative">
            <select
              value={lang}
              onChange={(e) => handleLangChange(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs font-medium bg-[#FFF9F0] border border-[#F5CBA7] rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red cursor-pointer"
            >
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        )}

        {tab === "current" && submissionResult.length > 0 && (
          <div className="flex items-center gap-1.5 bg-[#FFF9F0] px-3 py-1.5 rounded-full border border-[#F5CBA7] animate-in fade-in duration-300">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mr-0.5">Results:</span>
            <div className="flex items-center gap-1">
              {submissionResult.map((res, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "w-5 h-5 rounded flex items-center justify-center border shadow-sm transition-all",
                    res === "T" ? "bg-green-50 border-green-200 text-green-600 font-bold" : "bg-red-50 border-red-200 text-red-500 text-xs font-medium"
                  )}
                >
                  {res === "T" ? <Check className="w-3 h-3 stroke-[3]" /> : "x"}
                </span>
              ))}
            </div>
          </div>
        )}

        {tab === "current" && (
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleRun} disabled={runStatus === "running"} className="h-8 text-xs gap-1.5">
              {runStatus === "running" ? <Clock className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />} Run
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={runStatus === "running"} className="h-8 text-xs gap-1.5">
              <Send className="w-3 h-3" /> Submit
            </Button>
          </div>
        )}
      </div>

  {/* TAB CONTENT: CURRENT */ }
  {
    tab === "current" && (
      <div className="flex-1 overflow-hidden flex flex-col bg-white">
        <div className="flex-1 w-full pt-2 bg-white" style={{ minHeight: "100px" }}>
          <Editor
            height="100%"
            width="100%"
            language={getMonacoLanguage(lang)}
            value={code}
            onChange={(value) => setCode(value || "")}
            onMount={handleEditorMount}
            options={{
              fontSize: 14,
              fontFamily: "var(--font-code), monospace",
              minimap: { enabled: false },
              scrollbar: { vertical: "visible", horizontal: "visible" },
              lineNumbers: "on",
              automaticLayout: true,
              tabSize: 4,
              fixedOverflowWidgets: true,
            }}
          />
        </div>

        <div
          className={cn("h-1.5 bg-[#F5CBA7] cursor-row-resize flex items-center justify-center transition-colors hover:bg-brand-red", isDragging && "bg-brand-red")}
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="w-8 h-0.5 bg-white/50 rounded-full" />
        </div>

        <div className="bg-white flex flex-col" style={{ height: `${terminalHeight}px` }}>
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[#F5CBA7] bg-[#FFF9F0] flex-shrink-0">
            <button onClick={() => setTerminalTab("output")} className={cn("flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded", terminalTab === "output" ? "text-gray-800 bg-[#F5CBA7]/30" : "text-gray-500 hover:text-gray-700")}>
              <Terminal className="w-4 h-4" /> Output
            </button>
            <button onClick={() => setTerminalTab("input")} className={cn("flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded", terminalTab === "input" ? "text-gray-800 bg-[#F5CBA7]/30" : "text-gray-500 hover:text-gray-700")}>
              <Code2 className="w-4 h-4" /> Custom Input
            </button>
          </div>

          <div className="flex-1 p-0 overflow-hidden relative bg-white">
            <div className="h-full w-full p-4 overflow-y-auto">
              {terminalTab === "output" ? (
                output ? <pre className={cn("font-code text-xs leading-relaxed whitespace-pre-wrap", runStatus === "failed" ? "text-red-500" : "text-gray-700")}>{output}</pre> : <div className="h-full flex items-center justify-center"><p className="text-xs text-gray-300 italic">Click &ldquo;Run&rdquo; to test your code</p></div>
              ) : (
                <textarea value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="Enter custom input here..." className="h-full w-full p-4 font-code text-xs text-gray-700 resize-none outline-none border-none" />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  {/* TAB CONTENT: RECENT */ }
  {
    tab === "recent" && (
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        {recentSub ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-gray-800 text-base">Latest Fake-DB Log</h2>
              <span className="text-xs text-gray-400">{formatDate(recentSub.createdAt)}</span>
            </div>
            <div className={cn("rounded-xl p-4 border flex items-center gap-3", recentSub.status === "Passed" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
              {recentSub.status === "Passed" ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
              <div>
                <div className={cn("text-sm font-bold", recentSub.status === "Passed" ? "text-green-700" : "text-red-700")}>{recentSub.status === "Passed" ? "Accepted" : "Wrong Answer"}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Runtime: {recentSub.executionTime}ms · Memory: {recentSub.memoryUsed}MB · Language: {recentSub.language}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Test Case Details</h3>
              {recentSub.testCaseResults.map((res, index) => (
                <div key={res.testCaseId} className="bg-gray-50 border rounded-lg p-3 text-xs font-code flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-600">#Case {index + 1}</span>
                    <span className="text-gray-400 ml-3">In: {res.input} | Expected: {res.expectedOutput} | Got: {res.actualOutput}</span>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", res.status === "Passed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{res.status}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#FFF9F0] rounded-xl border border-[#F5CBA7] overflow-hidden">
              <pre className="font-code text-xs text-gray-700 p-4 overflow-x-auto whitespace-pre-wrap">{recentSub.code}</pre>
            </div>
          </div>

          {/* TAB CONTENT: CURRENT */}
          {tab === "current" && (
            <div className="flex-1 overflow-hidden flex flex-col bg-white">
              <div className="flex-1 w-full pt-2 bg-white" style={{ minHeight: "100px" }}>
                <Editor
                  height="100%"
                  width="100%"
                  language={getMonacoLanguage(lang)}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  onMount={handleEditorMount}
                  options={{
                    fontSize: 14,
                    fontFamily: "var(--font-code), monospace",
                    minimap: { enabled: false },
                    scrollbar: { vertical: "visible", horizontal: "visible" },
                    lineNumbers: "on",
                    automaticLayout: true,
                    tabSize: 4,
                    fixedOverflowWidgets: true,
                  }}
                />
              </div>
              
              <div 
                className={cn("h-1.5 bg-[#F5CBA7] cursor-row-resize flex items-center justify-center transition-colors hover:bg-brand-red", isDragging && "bg-brand-red")}
                onMouseDown={() => setIsDragging(true)}
              >
                <div className="w-8 h-0.5 bg-white/50 rounded-full" />
              </div>
              
              <div className="bg-white flex flex-col" style={{ height: `${terminalHeight}px` }}>
                <div className="flex items-center gap-2 px-4 py-2 border-b border-[#F5CBA7] bg-[#FFF9F0] flex-shrink-0">
                  <button onClick={() => setTerminalTab("output")} className={cn("flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded", terminalTab === "output" ? "text-gray-800 bg-[#F5CBA7]/30" : "text-gray-500 hover:text-gray-700")}>
                    <Terminal className="w-4 h-4" /> Output
                  </button>
                  <button onClick={() => setTerminalTab("input")} className={cn("flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded", terminalTab === "input" ? "text-gray-800 bg-[#F5CBA7]/30" : "text-gray-500 hover:text-gray-700")}>
                    <Code2 className="w-4 h-4" /> Custom Input
                  </button>
                </div>
                
                <div className="flex-1 p-0 overflow-hidden relative bg-white">
                  <div className="h-full w-full p-4 overflow-y-auto">
                    {terminalTab === "output" ? (
                      output ? <pre className={cn("font-code text-xs leading-relaxed whitespace-pre-wrap", runStatus === "failed" ? "text-red-500" : "text-gray-700")}>{output}</pre> : <div className="h-full flex items-center justify-center"><p className="text-xs text-gray-300 italic">Click &ldquo;Run&rdquo; to test your code</p></div>
                    ) : (
                      <textarea value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="Enter custom input here..." className="h-full w-full p-4 font-code text-xs text-gray-700 resize-none outline-none border-none" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: RECENT */}
          {tab === "recent" && (
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {recentSub ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-bold text-gray-800 text-base">Latest Submission</h2>
                    <span className="text-xs text-gray-400">{formatDate(recentSub.createdAt)}</span>
                  </div>
                  <div className={cn("rounded-xl p-4 border flex items-center gap-3", recentSub.status === "Passed" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
                    {recentSub.status === "Passed" ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                    <div>
                      <div className={cn("text-sm font-bold", recentSub.status === "Passed" ? "text-green-700" : "text-red-700")}>{recentSub.status === "Passed" ? "Accepted" : "Wrong Answer"}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Runtime: {recentSub.executionTime}ms · Memory: {recentSub.memoryUsed}MB · Language: {recentSub.language}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Test Case Details</h3>
                    {recentSub.testCaseResults.map((res, index) => (
                      <div key={res.testCaseId} className="bg-gray-50 border rounded-lg p-3 text-xs font-code space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-600">#Case {index + 1}</span>
                          <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", res.status === "Passed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{res.status}</span>
                        </div>
                        {res.errorMessage && (
                          <div className="text-red-500 mt-1">Error: {res.errorMessage}</div>
                        )}
                        {res.expectedOutput != null && (
                          <div className="text-gray-400">
                            Expected: <span className="text-gray-600">{res.expectedOutput}</span>
                            {res.actualOutput != null && <> · Got: <span className="text-gray-600">{res.actualOutput}</span></>}
                          </div>
                        )}
                        {res.expectedOutput == null && (
                          <div className="text-gray-300 italic">Hidden test case</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#FFF9F0] rounded-xl border border-[#F5CBA7] overflow-hidden">
                    <pre className="font-code text-xs text-gray-700 p-4 overflow-x-auto whitespace-pre-wrap">{recentSub.code}</pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-gray-400 text-sm">No submissions yet</div>
              )}
            </div>
          )}

          {/* TAB CONTENT: ALL */}
          {tab === "all" && (
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.map((sub) => {
                    const isExpanded = expandedId === sub.id;
                    return (
                      <div key={sub.id} className="bg-white rounded-xl border border-[#F5CBA7] overflow-hidden shadow-sm">
                        <button onClick={() => setExpandedId(isExpanded ? null : sub.id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFF9F0] text-left">
                          <span className={cn("text-xs font-semibold", sub.status === "Passed" ? "text-green-600" : "text-red-500")}>
                            {sub.status === "Passed" ? "Accepted" : "Wrong Answer"}
                          </span>
                          <span className="text-xs text-gray-400 ml-auto">{formatDate(sub.createdAt)}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {isExpanded && (
                          <div className="border-t border-[#F5CBA7] bg-[#FFF9F0] p-4 space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-[11px] font-code bg-white/60 p-2 rounded border border-orange-100">
                              <div>🚀 Time: {sub.executionTime}ms</div>
                              <div>📦 Memory: {sub.memoryUsed}MB</div>
                              <div>📝 Lang: {sub.language}</div>
                            </div>
                            <pre className="font-code text-xs text-gray-700 p-3 bg-white border rounded-lg whitespace-pre-wrap max-h-64 overflow-y-auto">{sub.code}</pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-gray-400 text-sm">No submission logs found</div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  {/* TAB CONTENT: ALL */ }
  {
    tab === "all" && (
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        {submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((sub) => {
              const isExpanded = expandedId === sub.id;
              return (
                <div key={sub.id} className="bg-white rounded-xl border border-[#F5CBA7] overflow-hidden shadow-sm">
                  <button onClick={() => setExpandedId(isExpanded ? null : sub.id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFF9F0] text-left">
                    <span className={cn("text-xs font-semibold", sub.status === "Passed" ? "text-green-600" : "text-red-500")}>
                      {sub.status === "Passed" ? "Accepted" : "Wrong Answer"}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">{formatDate(sub.createdAt)}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-[#F5CBA7] bg-[#FFF9F0] p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-[11px] font-code bg-white/60 p-2 rounded border border-orange-100">
                        <div>🚀 Time: {sub.executionTime}ms</div>
                        <div>📦 Memory: {sub.memoryUsed}MB</div>
                        <div>📝 Lang: {sub.language}</div>
                      </div>
                      <pre className="font-code text-xs text-gray-700 p-3 bg-white border rounded-lg whitespace-pre-wrap max-h-64 overflow-y-auto">{sub.code}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-20 text-gray-400 text-sm">No submission logs found</div>
        )}
      </div>
    )
  }
        </div >
      </div >
    </div >
  );
}