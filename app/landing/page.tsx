"use client";
import Link from "next/link";
import { Home, BookOpen, Users, Trophy, Code2, ChevronRight, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import BowlIllustration from "@/components/shared/BowlIllustration";
import WaveSection from "@/components/shared/WaveSection";

const features = [
  {
    icon: Code2,
    title: "Interactive Labs",
    desc: "Solve real CS problems in a live coding environment with instant feedback and test cases.",
    color: "#C0392B",
  },
  {
    icon: BookOpen,
    title: "Structured Library",
    desc: "Curated problem sets organized by topic, difficulty, and language — from Arrays to Dynamic Programming.",
    color: "#E8441A",
  },
  {
    icon: Users,
    title: "Peer Community",
    desc: "Discuss solutions, review code, and grow with fellow CS students in real time.",
    color: "#F5A623",
  },
  {
    icon: Trophy,
    title: "Achievement Ranks",
    desc: "Earn rank badges as you progress — from Noodle Novice to Chopstick Champion.",
    color: "#C0392B",
  },
  {
    icon: Zap,
    title: "Multi-language",
    desc: "Code in Python, C, C++, Java and more. Switch languages without leaving the editor.",
    color: "#E8441A",
  },
  {
    icon: Star,
    title: "Skill Tracking",
    desc: "Visualize your growth across topics — see your String, Math, and Algorithm proficiency rise.",
    color: "#F5A623",
  },
];



export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-cream font-sans">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white border-b-2 border-brand-red shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-red rounded-lg flex items-center justify-center text-lg">🏮</div>
            <span className="font-display font-bold text-lg text-brand-red tracking-wide">BaMhee E-lab</span>
          </div>

          {/*          <nav className="hidden md:flex items-center gap-6">
            {["About", "Elab", "Problems"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm text-gray-500 hover:text-brand-red transition-colors font-medium"
              >
                {item}
              </a>
            ))}
          </nav> */}

          <div className="hidden md:flex items-center gap-20">
            <Link href="/landing">
              <p className="text-sm text-gray-500 hover:text-brand-red transition-colors font-medium">About</p>
            </Link>
            <Link href="/problems">
              <p className="text-sm text-gray-500 hover:text-brand-red transition-colors font-medium">Elab</p>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Create Account</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* ── Hero ── */}
        <section className="relative bg-brand-cream overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-[-60px] left-[-60px] w-[280px] h-[280px] rounded-full bg-brand-orange opacity-[0.06]" />
          <div className="absolute bottom-[-80px] left-[160px] w-[220px] h-[220px] rounded-full bg-brand-red opacity-[0.05]" />
          <div className="absolute top-[30px] right-[300px] w-[100px] h-[100px] rounded-full bg-[#F5CBA7] opacity-[0.35]" />

          <div className="max-w-6xl mx-auto px-6 py-20 flex items-center gap-12">
            {/* Text */}
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-brand-orange mb-5">
                <span className="text-base">🏮</span> BaMhee E-lab platform
              </div>

              <h1 className="font-display text-5xl font-bold text-gray-900 leading-tight mb-5">
                Learn, grow &<br />
                <span className="text-brand-red">experiment</span>
                <br />with us
              </h1>

              <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-md">
                พร้อมก้าวข้ามขีดจำกัดและสนุกไปกับโจทย์ท้าทายแล้วหรือยัง? ไม่ว่าน้องจะถนัดสาย Python, C หรือ C++ ที่ BaMhee E-lab เราพร้อมเปิดพื้นที่ให้น้องๆ ได้ปล่อยของและอัปสกิลให้เก่งกว่าเดิมเสมอ!
              </p>

              <div className="flex items-center gap-4 flex-wrap">
                <Link href="/register">
                  <Button size="lg" className="shadow-lg shadow-red-200">
                    Join us now <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/problems">
                  <Button variant="outline" size="lg">Explore Elab</Button>
                </Link>
              </div>
            </div>

          {/* Bowl illustration */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="animate-float">
              <BowlIllustration size={300} />
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <WaveSection bgColor="#FFF9F0" fillColor="#F5CBA7" className="mt-4" />
      </section>
      </main>        
      {/* ── Features ── */}
      
      {/*<section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold tracking-widest uppercase text-brand-orange mb-3">
              What we offer
            </div>
            <h2 className="font-display text-3xl font-bold text-gray-900">
              Everything you need to master CS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="group bg-brand-cream rounded-2xl p-6 border border-[#F5CBA7] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white"
                  style={{ backgroundColor: color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-base font-bold mb-2" style={{ color }}>
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                
                <div
                  className="absolute -bottom-5 -right-5 w-16 h-16 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"
                  style={{ backgroundColor: color }}
                />
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── CTA Banner ── */}
      
      {/*<section className="py-20 px-6 bg-gradient-to-r from-[#922B21] via-[#C0392B] to-[#E8441A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-10 text-6xl">🏮</div>
          <div className="absolute bottom-4 right-20 text-5xl">🥢</div>
          <div className="absolute top-1/2 left-1/3 text-4xl">🍜</div>
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-white/75 text-base mb-8">
            Join thousands of CS students experimenting and growing with BaMhee E-lab.
          </p>
          <Link href="/register">
            <Button
              className="bg-white text-brand-red hover:bg-brand-cream border-0 text-base px-8 py-3 h-auto shadow-xl"
            >
              Create Free Account →
            </Button>
          </Link>
        </div>
      </section>*/}

      {/* ── Footer ── */}
      <footer className="bg-[#C0392B] py-8 px-8"></footer>
    </div>
  );
}
