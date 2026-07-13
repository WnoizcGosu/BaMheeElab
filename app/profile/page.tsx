"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppNavbar from "@/components/layout/AppNavbar";
import { useSession, signOut } from "next-auth/react";

// ── TYPESCRIPT INTERFACES ──
interface ActivityItem {
  id: string;
  problem: string;
  status: "solved" | "attempted" | string;
  submittedAt: string | Date;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  lang: string;
}

interface StatItem {
  label: string;
  count: number;
  color?: string;
}

interface ProfileStats {
  totalSolved: number;
  recentActivity: ActivityItem[];
  languageStats: StatItem[];
  difficultyStats: StatItem[];
}

// ฟังก์ชันแปลงวันที่ให้เป็น "2h ago", "1d ago"
function timeAgo(dateString: string | Date) {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  
  // State สำหรับเก็บข้อมูลจาก Database พร้อมใส่ Type ป้องกัน Error Any
  const [stats, setStats] = useState<ProfileStats>({
    totalSolved: 0,
    recentActivity: [],
    languageStats: [],
    difficultyStats: [],
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // ดึงข้อมูลสถิติเมื่อหน้าเว็บโหลด
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data: ProfileStats) => {
          setStats(data);
          setIsLoadingStats(false);
        })
        .catch(() => setIsLoadingStats(false));
    }
  }, [status]);

  const fullName = session?.user?.name || "Developer";
  const usernameHandle = session?.user?.email 
    ? session.user.email.split("@")[0].toLowerCase() 
    : "guest_user";
  const userInitial = (session?.user?.name?.[0] || session?.user?.email?.[0] || "D").toUpperCase();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center text-sm font-sans text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <AppNavbar username={fullName} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Left: Profile card ── */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-brand-red rounded-2xl p-5 text-white relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />

              <div className="flex items-start gap-4 relative z-10">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={fullName}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-xl border-2 border-white/30 object-cover"
                    unoptimized // ใส่ไว้กันเหนียว เผื่อรูปโปรไฟล์ดึงมาจาก Google Auth แล้วไม่ได้ตั้งค่า config
                  />
                ) : (
                  <div className="w-16 h-16 bg-wave-tan rounded-xl border-2 border-white/30 flex items-center justify-center text-brand-red font-bold text-2xl font-display">
                    {userInitial}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base truncate" title={fullName}>
                    {usernameHandle}
                  </div>
                  <div className="text-white/80 text-xs truncate mt-0.5">
                    {fullName}
                  </div>
                  <div className="text-white/60 text-[11px] mt-2">
                    {isLoadingStats ? "..." : stats.totalSolved} Solved ✅
                  </div>
                </div>
              </div>

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
            <div className="bg-white rounded-2xl border border-wave-tan shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-wave-tan flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-gray-800">Recent Submissions</h3>
                <Link href="/problems">
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    View all →
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-wave-tan/50">
                {isLoadingStats ? (
                  <div className="p-8 text-center text-xs text-gray-400">Loading activity...</div>
                ) : stats.recentActivity.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">No recent activity yet.</div>
                ) : (
                  stats.recentActivity.map((item, idx) => (
                    <div key={idx} className="px-6 py-3.5 flex items-center gap-4 hover:bg-brand-cream transition-colors">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        item.status === "solved" ? "bg-green-400" : "bg-yellow-400"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <Link href={`/coding?id=${item.id}`}>
                          <div className="text-sm font-medium text-gray-800 hover:text-brand-red transition-colors truncate cursor-pointer">
                            {item.problem}
                          </div>
                        </Link>
                        <div className="text-xs text-gray-400 mt-0.5">{timeAgo(item.submittedAt)}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={item.difficulty.toLowerCase() as "easy" | "medium" | "hard"}
                          className="text-[10px]"
                        >
                          {item.difficulty}
                        </Badge>
                        <Badge variant="lang" className="text-[10px]">{item.lang}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Solve distribution */}
            <div className="bg-white rounded-2xl p-6 border border-wave-tan shadow-sm">
              <h3 className="font-display font-bold text-sm text-gray-800 mb-4">Difficulty Distribution</h3>
              <div className="flex items-center gap-4">
                {isLoadingStats ? (
                  <div className="w-full text-center text-xs text-gray-400 py-4">Loading stats...</div>
                ) : (
                  stats.difficultyStats.map(({ label, count, color }) => {
                    const pct = stats.totalSolved > 0 ? (count / stats.totalSolved) * 100 : 0;
                    return (
                      <div key={label} className="flex-1">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-bold" style={{ color }}>{count}</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}