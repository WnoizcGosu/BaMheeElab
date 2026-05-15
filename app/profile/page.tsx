"use client";

import Link from "next/link";
import { Edit3, Award, Code2, TrendingUp, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppNavbar from "@/components/layout/AppNavbar";
import { useSession, signOut } from "next-auth/react"; // Using session data

const languages = [
  { name: "Python", solved: 5,  color: "#3B82F6" },
  { name: "C",      solved: 2,  color: "#6B7280" },
  { name: "C++",    solved: 1,  color: "#8B5CF6" },
];

const skills = [
  { name: "String",    count: 5, hot: true  },
  { name: "Array",     count: 5, hot: true  },
  { name: "Link list", count: 7, hot: true  },
  { name: "Matrix",    count: 7, hot: true  },
  { name: "Math",      count: 2, hot: false },
  { name: "List",      count: 2, hot: false },
];

const recentActivity = [
  { problem: "A + B Problems",     difficulty: "Easy",   lang: "Python", status: "solved",  time: "2h ago"  },
  { problem: "Two Sum",            difficulty: "Easy",   lang: "Python", status: "solved",  time: "1d ago"  },
  { problem: "Reverse Linked List",difficulty: "Medium", lang: "C++",    status: "solved",  time: "2d ago"  },
  { problem: "Binary Search",      difficulty: "Easy",   lang: "C",      status: "solved",  time: "3d ago"  },
  { problem: "Merge Sort",         difficulty: "Medium", lang: "C",      status: "attempted",time: "5d ago" },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();

  // ── Dynamic Text Mappings from Google Session ──
  const fullName = session?.user?.name || "Developer";
  
  // Creates a handle from gmail (e.g., proudnapassara@gmail.com -> proudnapassara)
  const usernameHandle = session?.user?.email 
    ? session.user.email.split("@")[0].toLowerCase() 
    : "guest_user";

  // Captures the very first letter of their name/email for the placeholder block
  const userInitial = (session?.user?.name?.[0] || session?.user?.email?.[0] || "D").toUpperCase();

  // Show a loading text block while NextAuth fetches session cookies
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center text-sm font-sans text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      {/* 1. Dynamic Navbar Title */}
      <AppNavbar username={fullName} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Left: Profile card ── */}
          <div className="md:col-span-1 space-y-4">

            {/* Profile hero */}
            <div className="bg-brand-red rounded-2xl p-5 text-white relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />

              <div className="flex items-start gap-4 relative z-10">
                {/* ── Dynamic Avatar: Google Photo vs Letter Fallback ── */}
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={fullName}
                    className="w-16 h-16 rounded-xl border-2 border-white/30 object-cover"
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-16 h-16 bg-[#F5CBA7] rounded-xl border-2 border-white/30 flex items-center justify-center text-brand-red font-bold text-2xl font-display">
                    {userInitial}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Dynamic User Handles */}
                  <div className="font-bold text-base truncate" title={fullName}>
                    {usernameHandle}
                  </div>
                  <div className="text-white/80 text-xs truncate mt-0.5">
                    {fullName}
                  </div>
                  <div className="text-white/60 text-[11px] mt-2">8 Solved ✅</div>
                </div>
              </div>

              {/* Sign Out Container */}
              <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full h-9 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 opacity-80" />
                  Sign out
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: Activity & chart ── */}
          <div className="md:col-span-2 space-y-5">
            {/* Recent activity */}
            <div className="bg-white rounded-2xl border border-[#F5CBA7] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F5CBA7] flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-gray-800">Recent Submissions</h3>
                <Link href="/problems">
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    View all →
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-[#F5CBA7]/50">
                {recentActivity.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-6 py-3.5 flex items-center gap-4 hover:bg-[#FFF9F0] transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      item.status === "solved" ? "bg-green-400" : "bg-yellow-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <Link href="/coding">
                        <div className="text-sm font-medium text-gray-800 hover:text-brand-red transition-colors truncate cursor-pointer">
                          {item.problem}
                        </div>
                      </Link>
                      <div className="text-xs text-gray-400 mt-0.5">{item.time}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        variant={item.difficulty.toLowerCase() as "easy" | "medium" | "hard"}
                        className="text-[10px]"
                      >
                        {item.difficulty}
                      </Badge>
                      <Badge variant="lang" className="text-[10px]">{item.lang}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-2xl p-5 border border-[#F5CBA7] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-4 h-4 text-brand-red" />
                <h3 className="font-display font-bold text-sm text-gray-800">Languages</h3>
              </div>

              <div className="space-y-3">
                {languages.map(({ name, solved, color }) => (
                  <div key={name} className="flex items-center gap-3">
                    <Badge variant="lang" className="min-w-[60px] justify-center">{name}</Badge>
                    <div className="flex-1 h-2 bg-[#F5CBA7]/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(solved / 8) * 100}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-14 text-right">
                      {solved} solved
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Solve distribution */}
            <div className="bg-white rounded-2xl p-6 border border-[#F5CBA7] shadow-sm">
              <h3 className="font-display font-bold text-sm text-gray-800 mb-4">Difficulty Distribution</h3>
              <div className="flex items-center gap-4">
                {[
                  { label: "Easy",   count: 5, color: "#22C55E", pct: 62 },
                  { label: "Medium", count: 2, color: "#EAB308", pct: 25 },
                  { label: "Hard",   count: 1, color: "#EF4444", pct: 13 },
                ].map(({ label, count, color, pct }) => (
                  <div key={label} className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-bold" style={{ color }}>{count}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}