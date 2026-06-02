"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, BookOpen, Heart, ChevronRight, CheckCircle, Circle, XCircle } from "lucide-react";
import { Search, ChevronRight, CheckCircle, Circle, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AppNavbar from "@/components/layout/AppNavbar";

// ── Data ──────────────────────────────────────────────────────────────────
const topics = [];

const categories = [];

export default function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("apb");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('/api/problems')
      .then(res => res.json())
      .then(data => {
        setProblems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch problems", err);
        setLoading(false);
      });
    // Define a safe TypeScript structure matching the database payload
    interface ProblemData {
      id: string;
      title: string;
      difficulty: string;
      status: "solved" | "attempted" | "unsolved";
      tags: string[];
    }

    type StatusKey = "solved" | "attempted" | "unsolved";
    const statusIcon: Record<StatusKey, React.ReactNode> = {
      solved: <CheckCircle className="w-4 h-4 text-green-500" />,
      attempted: <Circle className="w-4 h-4 text-yellow-500" />,
      unsolved: <XCircle className="w-4 h-4 text-gray-300" />,
    };

    export default function ProblemsPage() {
      const [problems, setProblems] = useState<ProblemData[]>([]);
      const [search, setSearch] = useState("");
      const [loading, setLoading] = useState(true);

      // 🎯 Fetch real data from your Prisma PostgreSQL API
      useEffect(() => {
        const fetchProblems = async () => {
          try {
            const res = await fetch("/api/problems");
            if (!res.ok) throw new Error("Network response failure");
            const data = await res.json();
            setProblems(data);
          } catch (err) {
            console.error("Failed loading backend problem list:", err);
          } finally {
            setLoading(false);
          }
        };

        fetchProblems();
      }, []);

      const filtered = problems.filter((p) => {
        return p.title.toLowerCase().includes(search.toLowerCase());
      });

      return (
        <div className="min-h-screen bg-[#FFF9F0]">
          <AppNavbar />

          <main className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex gap-4">
              <div className="flex-1 min-w-0">

                {/* Search bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search problems…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#E8D5B0] rounded-full focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                  />
                </div>

                {/* Problem list */}
                <div className="bg-white rounded-2xl border border-[#F5CBA7] shadow-sm overflow-hidden">
                  <div className="grid grid-cols-[1fr_120px_40px_40px] gap-3 px-5 py-3 border-b border-[#F5CBA7] bg-[#FFF9F0]">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Title</div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Difficulty</div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Enter</div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Status</div>
                  </div>

                  <div className="divide-y divide-[#F5CBA7]/40">
                    {loading ? (
                      <div className="py-16 text-center text-gray-400">Loading problems...</div>
                    ) : (
                      filtered.map((p) => (
                        <div
                          key={p.id}
                          className="grid grid-cols-[40px_1fr_120px_40px] gap-3 px-5 py-3.5 items-center hover:bg-[#FFF9F0] transition-colors group"
                        >

                          {/* Title */}
                          <div>
                            <Link href={`/coding/${p.id}`}>
                              <div className="text-sm font-medium text-gray-800 group-hover:text-brand-red transition-colors cursor-pointer">
                                {p.title}
                              </div>
                            </Link>
                          </div>

                          {loading ? (
                            /* Loading State Spinner */
                            <div className="py-16 flex flex-col items-center justify-center gap-2 text-gray-400">
                              <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
                              <p className="text-sm">Loading problem sets...</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-[#F5CBA7]/40">
                              {filtered.map((p) => (
                                <div
                                  key={p.id}
                                  className="grid grid-cols-[1fr_120px_40px_40px] gap-3 px-5 py-3.5 items-center hover:bg-[#FFF9F0] transition-colors group"
                                >
                                  {/* Title linked with query parameter ID */}
                                  <div>
                                    <Link href={`/coding?id=${p.id}`}>
                                      <div className="text-sm font-medium text-gray-800 group-hover:text-brand-red transition-colors cursor-pointer">
                                        {p.title}
                                      </div>
                                    </Link>
                                  </div>

                                  {/* Difficulty */}
                                  <div className="flex justify-center">
                                    <Badge
                                      variant={p.difficulty.toLowerCase() as "easy" | "medium" | "hard"}
                                      className="text-[10px]"
                                    >
                                      {p.difficulty}
                                    </Badge>
                                  </div>

                                  {/* Arrow */}
                                  <Link href={`/coding/${p.id}`}>
                                    <button className="p-1 text-gray-300 group-hover:text-brand-red transition-colors">
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  </Link>
                                  {/* Status icon */}
                                  <div className="flex items-center justify-center">
                                    {p.status === "solved" ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                                      p.status === "attempted" ? <Circle className="w-4 h-4 text-yellow-500" /> :
                                        <XCircle className="w-4 h-4 text-gray-300" />}
                                  </div>

                                </div>
                              ))
                )}
                            </div>

                      
                      {/* Navigation Arrow */}
                          <div className="flex justify-center">
                            <Link href={`/coding?id=${p.id}`}>
                              <button className="p-1 text-gray-300 group-hover:text-brand-red transition-colors cursor-pointer">
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>

                          {/* Status icon computed cleanly */}
                          <div className="flex items-center justify-center">
                            {statusIcon[p.status]}
                          </div>
                        </div>
                      ))}
                  </div>
              )}

                  {!loading && filtered.length === 0 && (
                    <div className="py-16 text-center">
                      <div className="text-4xl mb-3">🍜</div>
                      <div className="text-gray-400 text-sm">No problems found</div>
                    </div>
                  )}
                </div>

                {/* Footer metrics layout panel */}
                {!loading && (
                  <div className="mt-5 flex items-center justify-between px-1">
                    <span className="text-xs text-gray-400">
                      Showing {filtered.length} of {problems.length} problems
                    </span>
                    <span className="text-xs text-gray-400">
                      {problems.filter(p => p.status === "solved").length} solved
                    </span>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      );
    }