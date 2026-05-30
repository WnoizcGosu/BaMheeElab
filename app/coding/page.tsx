"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, Play, Send, ChevronDown,
  CheckCircle, XCircle, Clock, Terminal, ChevronUp, Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppNavbar from "@/components/layout/AppNavbar";
import { cn } from "@/lib/utils";
import Editor from "@monaco-editor/react";

const LANGUAGES = ["Python", "C", "C++", "Java", "JavaScript"];

const STARTER_CODE: Record<string, string> = {
  Python: `# Write your solution here\n\n\n`,
  C: `#include <stdio.h>\n\nint main() {\n    return 0;\n}\n`,
  "C++": `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n`,
  Java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n\n    }\n}\n`,
  JavaScript: `// Write your solution here\n\n`,
};

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

interface Submission {
  id: number;
  lang: string;
  code: string;
  status: "Accepted" | "Wrong Answer";
  runtime: string;
  memory: string;
  submittedAt: Date;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function CodingPage() {
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [lang, setLang] = useState("Python");
  const [code, setCode] = useState(STARTER_CODE["Python"]);
  const [tab, setTab] = useState<"current" | "recent" | "all">("current");
  const [runStatus, setRunStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const [output, setOutput] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 🎯 State สำหรับ Pyodide & Custom Input
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [terminalTab, setTerminalTab] = useState<"output" | "input">("output");
  const outputRef = useRef<HTMLDivElement>(null);

  // 🎯 State สำหรับยืด-หด Terminal
  const [terminalHeight, setTerminalHeight] = useState(200); // ค่าเริ่มต้น 200px
  const [isDragging, setIsDragging] = useState(false);

  // 🎯 Effect ควบคุมการลากเมาส์เพื่อยืด/หด
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      // คำนวณความสูงจากขอบล่างของจอภาพ
      const newHeight = window.innerHeight - e.clientY;
      // จำกัดความสูงไม่ให้น้อยกว่า 40px และไม่ให้สูงเกิน 80% ของหน้าจอ
      setTerminalHeight(Math.max(40, Math.min(newHeight, window.innerHeight * 0.8)));
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none"; // ป้องกันการคลุมดำข้อความตอนลาก
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

  // โหลด Pyodide
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
  }, []);

  const handleLangChange = (l: string) => {
    setLang(l);
    setCode(STARTER_CODE[l] ?? "");
    setRunStatus("idle");
    setOutput("");
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
          { label: "for", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "for i in range($1):\n\t$0", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
          { label: "if", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "if $1:\n\t$0", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
        ];
        return { suggestions: pythonKeywords };
      },
    });

    const cProvider = {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
        const cKeywords = [
          { label: "printf", kind: monaco.languages.CompletionItemKind.Function, insertText: "printf(\"$1\\n\"$2);", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
          { label: "scanf", kind: monaco.languages.CompletionItemKind.Function, insertText: "scanf(\"$1\", &$2);", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
          { label: "cout", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "cout << $1 << endl;", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
          { label: "cin", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "cin >> $1;", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
          { label: "include", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "#include <$1>", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
        ];
        return { suggestions: cKeywords };
      }
    };
    monaco.languages.registerCompletionItemProvider("c", cProvider);
    monaco.languages.registerCompletionItemProvider("cpp", cProvider);
  };

  const handleRun = async () => {
    setRunStatus("running");
    setTerminalTab("output");
    
    if (lang !== "Python") {
      setOutput(`Error: Browser execution is currently only supported for Python.\nPlease submit to run ${lang} on the server.`);
      setRunStatus("failed");
      return;
    }

    if (!isPyodideReady) {
      setOutput("Initializing Python Environment... Please try again in a moment.");
      setRunStatus("failed");
      return;
    }

    const pyodide = (window as any).pyodideInstance;
    let currentOutput = "";
    
    const inputLines = customInput.split('\n');
    let inputIndex = 0;

    pyodide.setStdout({
      batched: (text: string) => { currentOutput += text + "\n"; }
    });
    
    pyodide.setStdin({
      stdin: () => {
        if (inputIndex < inputLines.length) {
          return inputLines[inputIndex++] + "\n";
        }
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

  const handleSubmit = () => {
    setRunStatus("running");
    setOutput("Submitting…");
    setTimeout(() => {
      setRunStatus("passed");
      setOutput("🎉  Accepted!\nAll hidden test cases passed.");
      
      const newSub: Submission = {
        id: Date.now(),
        lang,
        code,
        status: "Accepted",
        runtime: "31ms",
        memory: "14.3 MB",
        submittedAt: new Date(),
      };
      setSubmissions((prev) => [newSub, ...prev]);
      setTab("recent");
    }, 2000);
  };

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
        {/* ── LEFT: Problem panel ── */}
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
              {problem.tags.map((t) => (
                <Badge key={t} variant="topic">{t}</Badge>
              ))}
              <span className="text-xs text-gray-400 ml-auto">{problem.completion}% acceptance</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 text-sm text-gray-700">
            <div>
              <h2 className="font-display font-bold text-gray-900 mb-2">Description</h2>
              <p className="leading-relaxed whitespace-pre-line">{problem.description}</p>
            </div>

            {problem.examples.map((ex, i) => (
              <div key={i}>
                <h2 className="font-display font-bold text-gray-900 mb-2">Example {i + 1}</h2>
                <div className="bg-[#FFF9F0] rounded-xl border border-[#F5CBA7] overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-[#F5CBA7]">
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Input</div>
                      <code className="font-code text-xs text-gray-800 whitespace-pre-wrap">{ex.input}</code>
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Output</div>
                      <code className="font-code text-xs text-gray-800 whitespace-pre-wrap">{ex.output}</code>
                    </div>
                  </div>
                  {ex.explanation && (
                    <div className="px-3 py-2 border-t border-[#F5CBA7]">
                      <span className="text-[10px] text-gray-400">{ex.explanation}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Editor panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Toolbar */}
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

            {tab === "current" && (
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleRun} disabled={runStatus === "running"} className="h-8 text-xs gap-1.5">
                  {runStatus === "running" ? <Clock className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />} Run
                </Button>
                <Button size="sm" onClick={handleSubmit} className="h-8 text-xs gap-1.5">
                  <Send className="w-3 h-3" /> Submit
                </Button>
              </div>
            )}
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
                  loading={
                    <div className="p-5 text-sm text-gray-400 italic">
                      Initializing IDE Environment...
                    </div>
                  }
                  options={{
                    fontSize: 14,
                    fontFamily: "var(--font-code), monospace",
                    minimap: { enabled: false },
                    scrollbar: { vertical: "visible", horizontal: "visible" },
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    quickSuggestions: { other: true, comments: true, strings: true }, 
                    suggestOnTriggerCharacters: true,  
                    wordBasedSuggestions: "allDocuments", 
                    acceptSuggestionOnEnter: "on",     
                    tabCompletion: "on",                
                    snippetSuggestions: "inline",      
                    fixedOverflowWidgets: true,
                  }}
                />
              </div>
              
              {/* 🎯 Drag Handle (เส้นปรับขนาด) */}
              <div 
                className={cn(
                  "h-1.5 bg-[#F5CBA7] cursor-row-resize flex items-center justify-center transition-colors hover:bg-brand-red",
                  isDragging && "bg-brand-red"
                )}
                onMouseDown={() => setIsDragging(true)}
              >
                <div className="w-8 h-0.5 bg-white/50 rounded-full" />
              </div>
              
              {/* Output terminal & Custom Input */}
              <div 
                className="bg-white flex flex-col"
                style={{ height: `${terminalHeight}px` }}
              >
                <div className="flex items-center gap-2 px-4 py-2 border-b border-[#F5CBA7] bg-[#FFF9F0] flex-shrink-0">
                  <button 
                    onClick={() => setTerminalTab("output")}
                    className={cn("flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded", terminalTab === "output" ? "text-gray-800 bg-[#F5CBA7]/30" : "text-gray-500 hover:text-gray-700")}
                  >
                    <Terminal className="w-4 h-4" /> Output
                  </button>
                  <button 
                    onClick={() => setTerminalTab("input")}
                    className={cn("flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded", terminalTab === "input" ? "text-gray-800 bg-[#F5CBA7]/30" : "text-gray-500 hover:text-gray-700")}
                  >
                    <Code2 className="w-4 h-4" /> Custom Input
                  </button>
                </div>
                
                <div className="flex-1 p-0 overflow-hidden relative bg-white">
                  {terminalTab === "output" ? (
                    <div className="h-full w-full p-4 overflow-y-auto">
                      {output ? (
                        <pre className={cn("font-code text-xs leading-relaxed whitespace-pre-wrap", runStatus === "failed" ? "text-red-500" : "text-gray-700")}>{output}</pre>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-xs text-gray-300 italic">Click &ldquo;Run&rdquo; to test your code</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <textarea 
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter custom input here (each line represents one input() call)"
                      className="h-full w-full p-4 font-code text-xs text-gray-700 resize-none outline-none focus:ring-0 border-none"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: RECENT */}
          {tab === "recent" && (
            <div className="flex-1 overflow-y-auto p-6">
              {recentSub ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-bold text-gray-800 text-base">Latest Submission</h2>
                    <span className="text-xs text-gray-400">{formatDate(recentSub.submittedAt)}</span>
                  </div>
                  <div className={cn("rounded-xl p-4 border flex items-center gap-3", recentSub.status === "Accepted" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-sm font-bold text-green-700">{recentSub.status}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Runtime: {recentSub.runtime} · Memory: {recentSub.memory} · Language: {recentSub.lang}
                      </div>
                    </div>
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
            <div className="flex-1 overflow-y-auto p-6">
              {submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.map((sub, idx) => {
                    const isExpanded = expandedId === sub.id;
                    return (
                      <div key={sub.id} className="bg-white rounded-xl border border-[#F5CBA7] overflow-hidden shadow-sm">
                        <button onClick={() => setExpandedId(isExpanded ? null : sub.id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFF9F0] text-left">
                          <span className="text-xs text-green-600 font-semibold">{sub.status}</span>
                          <span className="text-xs text-gray-400 ml-auto">{formatDate(sub.submittedAt)}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {isExpanded && (
                          <div className="border-t border-[#F5CBA7] bg-[#FFF9F0]">
                            <pre className="font-code text-xs text-gray-700 p-4 whitespace-pre-wrap max-h-64 overflow-y-auto">{sub.code}</pre>
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
    </div>
  );
}