"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, BookOpen, Heart, ChevronRight, CheckCircle, Circle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AppNavbar from "@/components/layout/AppNavbar";
import { cn } from "@/lib/utils";

// ── Data ──────────────────────────────────────────────────────────────────
const topics = [];

const categories = [];

const problems = [
  {
    id: 1, title: "A + B Problems",
    difficulty: "Easy",
    status: "solved",   tags: ["Math"],
  },
  {
    id: 2, title: "Two Sum",
    difficulty: "Easy", 
    status: "solved",   tags: ["Array"],
  },
  {
    id: 3, title: "Reverse String",
    difficulty: "Easy",  
    status: "solved",   tags: ["String"],
  },
  {
    id: 4, title: "Merge Sorted Arrays",
    difficulty: "Medium",
    status: "attempted",tags: ["Array", "Two Pointers"],
  },
  {
    id: 5, title: "Linked List Cycle",
    difficulty: "Medium",
    status: "unsolved", tags: ["Linked List"],
  },
  {
    id: 6, title: "Binary Search",
    difficulty: "Easy", 
    status: "solved",   tags: ["Array", "Binary Search"],
  },
  {
    id: 7, title: "Matrix Rotation",
    difficulty: "Medium",
    status: "unsolved", tags: ["Math", "Matrix"],
  },
  {
    id: 8, title: "Longest Common Subsequence",
    difficulty: "Hard",  
    status: "unsolved", tags: ["DP"],
  },
];

type StatusKey = "solved" | "attempted" | "unsolved";
const statusIcon: Record<StatusKey, React.ReactNode> = {
  solved:   <CheckCircle className="w-4 h-4 text-green-500" />,
  attempted:<Circle      className="w-4 h-4 text-yellow-500" />,
  unsolved: <XCircle     className="w-4 h-4 text-gray-300"  />,
};

export default function ProblemsPage() {
  const [selectedTopic,    setSelectedTopic]    = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("apb");
  const [search,           setSearch]           = useState("");

  const filtered = problems.filter((p) => {
    const topicMatch = selectedTopic === "all";
    const searchMatch = p.title.toLowerCase().includes(search.toLowerCase());
    return topicMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      <AppNavbar username="Worachot" />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-4">

          {/* ── Main content ── */}
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
              {/* Table header */}
              <div className="grid grid-cols-[40px_1fr_120px_40px] gap-3 px-5 py-3 border-b border-[#F5CBA7] bg-[#FFF9F0]">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Title</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Difficulty</div>
                <div></div>
              </div>

              <div className="divide-y divide-[#F5CBA7]/40">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[40px_1fr_120px_40px] gap-3 px-5 py-3.5 items-center hover:bg-[#FFF9F0] transition-colors group"
                  >

                    {/* Title */}
                    <div>
                      <Link href="/coding">
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
                    <Link href="/coding">
                      <button className="p-1 text-gray-300 group-hover:text-brand-red transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                    {/* Status icon */}
                    <div className="flex items-center justify-center">
                      {statusIcon[p.status as StatusKey]}
                    </div>

                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <div className="text-4xl mb-3">🍜</div>
                  <div className="text-gray-400 text-sm">No problems found</div>
                </div>
              )}
            </div>

            {/* Footer info */}
            <div className="mt-5 flex items-center justify-between px-1">
              <span className="text-xs text-gray-400">
                Showing {filtered.length} of {problems.length} problems
              </span>
              <span className="text-xs text-gray-400">
                {problems.filter(p => p.status === "solved").length} solved
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
