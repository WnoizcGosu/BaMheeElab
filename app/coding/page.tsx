"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronLeft, Play, Trash2, Send, ChevronDown,
  CheckCircle, XCircle, Clock, Terminal, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppNavbar from "@/components/layout/AppNavbar";
import { cn } from "@/lib/utils";

const LANGUAGES = ["Python", "C", "C++", "Java", "JavaScript"];

// ── Blank starter templates (no answers, just boilerplate) ─────────────────
const STARTER_CODE: Record<string, string> = {
  Python:
`# Write your solution here


`,
  C:
`#include <stdio.h>

int main() {

    return 0;
}
`,
  "C++":
`#include <iostream>
using namespace std;

int main() {

    return 0;
}
`,
  Java:
`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

    }
}
`,
  JavaScript:
`// Write your solution here

`,
};

const PROBLEM = {
  title:      "A + B Problems",
  difficulty: "Easy",
  tags:       ["Math"],
  completion: 70.5,
  description: `Given two integers A and B, output the sum A + B.

This is a classic introductory problem designed to test your ability to read input and produce output in your chosen language.`,
  constraints: [
    "-10^9 ≤ A, B ≤ 10^9",
    "Input contains exactly two integers",
  ],
  examples: [
    { input: "1 2",     output: "3",  explanation: "1 + 2 = 3" },
    { input: "100 -50", output: "50", explanation: "100 + (-50) = 50" },
    { input: "-5 -3",   output: "-8", explanation: "(-5) + (-3) = -8" },
  ],
};

type RunStatus = "idle" | "running" | "passed" | "failed";

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
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    + " · "
    + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function CodingPage() {
  const [lang,        setLang]        = useState("Python");
  const [code,        setCode]        = useState(STARTER_CODE["Python"]);
  const [tab,         setTab]         = useState<"current" | "recent" | "all">("current");
  const [runStatus,   setRunStatus]   = useState<RunStatus>("idle");
  const [output,      setOutput]      = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [expandedId,  setExpandedId]  = useState<number | null>(null);

  // ── Language change resets to that language's blank starter ───────────────
  const handleLangChange = (l: string) => {
    setLang(l);
    setCode(STARTER_CODE[l] ?? "");
    setRunStatus("idle");
    setOutput("");
  };



  // ── Run ───────────────────────────────────────────────────────────────────
  const handleRun = () => {
    setRunStatus("running");
    setOutput("Running test cases…");
    setTimeout(() => {
      setRunStatus("passed");
      setOutput(
        "✅  All 3 sample test cases passed!\n\n" +
        "Test 1: Input: 1 2    → Output: 3   [PASS]\n" +
        "Test 2: Input: 100 -50 → Output: 50  [PASS]\n" +
        "Test 3: Input: -5 -3  → Output: -8  [PASS]\n\n" +
        "Runtime: 28ms | Memory: 14.2 MB"
      );
    }, 1500);
  };

  // ── Submit — saves to history ─────────────────────────────────────────────
  const handleSubmit = () => {
    setRunStatus("running");
    setOutput("Submitting…");
    setTimeout(() => {
      setRunStatus("passed");
      setOutput(
        "🎉  Accepted!\n\n" +
        "All 10 hidden test cases passed.\n" +
        "Runtime: 31ms  (beats 92% of submissions)\n" +
        "Memory: 14.3 MB (beats 78%)"
      );
      const newSub: Submission = {
        id:          Date.now(),
        lang,
        code,
        status:      "Accepted",
        runtime:     "31ms",
        memory:      "14.3 MB",
        submittedAt: new Date(),
      };
      setSubmissions((prev) => [newSub, ...prev]);
      setTab("recent");
    }, 2000);
  };

  // ── Most recent submission ─────────────────────────────────────────────────
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
            <h1 className="font-display text-xl font-bold text-gray-900 mb-2">{PROBLEM.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={PROBLEM.difficulty.toLowerCase() as "easy" | "medium" | "hard"}>
                {PROBLEM.difficulty}
              </Badge>
              {PROBLEM.tags.map((t) => (
                <Badge key={t} variant="topic">{t}</Badge>
              ))}
              <span className="text-xs text-gray-400 ml-auto">{PROBLEM.completion}% acceptance</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 text-sm text-gray-700">
            <div>
              <h2 className="font-display font-bold text-gray-900 mb-2">Description</h2>
              <p className="leading-relaxed whitespace-pre-line">{PROBLEM.description}</p>
            </div>
            <div>
              <h2 className="font-display font-bold text-gray-900 mb-2">Constraints</h2>
              <ul className="space-y-1">
                {PROBLEM.constraints.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <span className="text-brand-red mt-0.5">•</span>
                    <code className="font-code text-xs bg-[#FFF9F0] px-1.5 py-0.5 rounded">{c}</code>
                  </li>
                ))}
              </ul>
            </div>
            {PROBLEM.examples.map((ex, i) => (
              <div key={i}>
                <h2 className="font-display font-bold text-gray-900 mb-2">Example {i + 1}</h2>
                <div className="bg-[#FFF9F0] rounded-xl border border-[#F5CBA7] overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-[#F5CBA7]">
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Input</div>
                      <code className="font-code text-xs text-gray-800">{ex.input}</code>
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Output</div>
                      <code className="font-code text-xs text-gray-800">{ex.output}</code>
                    </div>
                  </div>
                  <div className="px-3 py-2 border-t border-[#F5CBA7]">
                    <span className="text-[10px] text-gray-400">{ex.explanation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Editor panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center px-4 py-2.5 bg-white border-b border-[#F5CBA7] gap-3">

            {/* Tabs: Current / Recent / All */}
            <div className="flex items-center gap-1 bg-[#FFF9F0] rounded-full p-0.5 border border-[#F5CBA7]">
              {(["current", "recent", "all"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium capitalize transition-all",
                    tab === t
                      ? "bg-brand-red text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {t}
                  {t === "all" && submissions.length > 0 && (
                    <span className="ml-1 bg-white/30 text-[10px] rounded-full px-1">
                      {submissions.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Language selector — only shown on Current tab */}
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

            {/* Actions */}
            {tab === "current" && (
              <div className="flex items-center gap-2 ml-auto">
                {/* 🗑 Trash = reset to blank starter */}
                <Button variant="outline" size="sm" onClick={handleRun} className="h-8 text-xs gap-1.5">
                  <Play className="w-3 h-3" /> Run
                </Button>
                <Button size="sm" onClick={handleSubmit} className="h-8 text-xs gap-1.5">
                  <Send className="w-3 h-3" /> Submit
                </Button>
              </div>
            )}
          </div>

          {/* ── TAB: CURRENT ── */}
          {tab === "current" && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full p-5 font-code text-sm bg-[#FFF9F0] text-gray-800 resize-none focus:outline-none leading-relaxed border-none"
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                placeholder="Start coding here…"
              />
              {/* Output panel */}
              <div className="border-t border-[#F5CBA7] bg-white">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-[#F5CBA7]">
                  <Terminal className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Output</span>
                  {runStatus === "running" && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <Clock className="w-3.5 h-3.5 text-brand-orange animate-pulse" />
                      <span className="text-xs text-brand-orange">Running…</span>
                    </div>
                  )}
                  {runStatus === "passed" && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs text-green-600 font-semibold">Accepted</span>
                    </div>
                  )}
                  {runStatus === "failed" && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-xs text-red-600 font-semibold">Wrong Answer</span>
                    </div>
                  )}
                </div>
                <div className="h-36 p-4 overflow-y-auto">
                  {output ? (
                    <pre className="font-code text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-xs text-gray-300 italic">Click &ldquo;Run&rdquo; to test your code</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: RECENT ── */}
          {tab === "recent" && (
            <div className="flex-1 overflow-y-auto p-6">
              {recentSub ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-bold text-gray-800 text-base">Latest Submission</h2>
                    <span className="text-xs text-gray-400">{formatDate(recentSub.submittedAt)}</span>
                  </div>
                  {/* Status card */}
                  <div className={cn(
                    "rounded-xl p-4 border flex items-center gap-3",
                    recentSub.status === "Accepted"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  )}>
                    {recentSub.status === "Accepted"
                      ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      : <XCircle    className="w-5 h-5 text-red-500 flex-shrink-0" />
                    }
                    <div>
                      <div className={cn(
                        "text-sm font-bold",
                        recentSub.status === "Accepted" ? "text-green-700" : "text-red-700"
                      )}>
                        {recentSub.status}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Runtime: {recentSub.runtime} · Memory: {recentSub.memory} · Language: {recentSub.lang}
                      </div>
                    </div>
                  </div>
                  {/* Code snapshot */}
                  <div className="bg-[#FFF9F0] rounded-xl border border-[#F5CBA7] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#F5CBA7] flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted Code</span>
                      <Badge variant="lang">{recentSub.lang}</Badge>
                    </div>
                    <pre className="font-code text-xs text-gray-700 p-4 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                      {recentSub.code}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="text-4xl mb-3">📭</div>
                  <div className="text-gray-400 text-sm">No submissions yet</div>
                  <div className="text-gray-300 text-xs mt-1">Submit your code to see it here</div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: ALL ── */}
          {tab === "all" && (
            <div className="flex-1 overflow-y-auto p-6">
              {submissions.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="font-display font-bold text-gray-800 text-base mb-4">
                    All Submissions ({submissions.length})
                  </h2>
                  {submissions.map((sub, idx) => {
                    const isExpanded = expandedId === sub.id;
                    return (
                      <div
                        key={sub.id}
                        className="bg-white rounded-xl border border-[#F5CBA7] overflow-hidden shadow-sm"
                      >
                        {/* Row header — click to expand/collapse */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFF9F0] transition-colors text-left"
                        >
                          {/* Index */}
                          <span className="text-xs text-gray-300 font-mono w-5 flex-shrink-0">
                            #{submissions.length - idx}
                          </span>

                          {/* Status */}
                          {sub.status === "Accepted"
                            ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            : <XCircle    className="w-4 h-4 text-red-400 flex-shrink-0" />
                          }
                          <span className={cn(
                            "text-xs font-semibold flex-shrink-0",
                            sub.status === "Accepted" ? "text-green-600" : "text-red-500"
                          )}>
                            {sub.status}
                          </span>

                          {/* Lang badge */}
                          <Badge variant="lang" className="flex-shrink-0">{sub.lang}</Badge>

                          {/* Runtime / memory */}
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {sub.runtime} · {sub.memory}
                          </span>

                          {/* Date — pushed right */}
                          <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                            {formatDate(sub.submittedAt)}
                          </span>

                          {/* Chevron toggle */}
                          {isExpanded
                            ? <ChevronUp   className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            : <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          }
                        </button>

                        {/* Expandable code */}
                        {isExpanded && (
                          <div className="border-t border-[#F5CBA7] bg-[#FFF9F0]">
                            <pre className="font-code text-xs text-gray-700 p-4 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
                              {sub.code}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="text-4xl mb-3">📂</div>
                  <div className="text-gray-400 text-sm">No submissions yet</div>
                  <div className="text-gray-300 text-xs mt-1">Submit your code to see the history here</div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}