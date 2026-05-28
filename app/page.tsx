"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react"; // 🎯 Imported useRef
// Added Instagram, Discord, Github, and ArrowUp icons
import { Home, BookOpen, Users, Trophy, Code2, ChevronRight, Star, Zap, Instagram, Disc, Github, ArrowUp } from "lucide-react";
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
  const footerRef = useRef<HTMLElement>(null); // 🎯 Create a reference anchor for the footer

  // Smooth scroll handler for the "Back to Top" button layout behavior
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🎯 Smooth scroll handler for scrolling down to the footer
  const scrollToFooter = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop page from hard reloading/jumping
    footerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream font-sans">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white border-b-2 border-brand-red shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-red rounded-lg flex items-center justify-center text-lg">🏮</div>
            <span className="font-display font-bold text-lg text-brand-red tracking-wide">BaMhee E-lab</span>
          </div>

          <div className="hidden md:flex items-center gap-20">
            {/* 🎯 Changed Link wrapper to a button/anchor behavior with click logic */}
            <a href="#about-footer" onClick={scrollToFooter}>
              <p className="text-sm text-gray-500 hover:text-brand-red transition-colors font-medium cursor-pointer">About</p>
            </a>
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

      {/* ── Refactored Footer Component ── */}
      {/* 🎯 Attached ref={footerRef} and id="about-footer" here */}
      <footer ref={footerRef} id="about-footer" className="bg-[#1D1313] text-white pt-16 pb-6 relative overflow-hidden scroll-mt-16">
        {/* Background ambient geometric accents mimicking your reference layout design background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="absolute right-0 bottom-0 w-[600px] h-[400px] border-l border-t border-white transform rotate-12 origin-bottom-right" />
          <div className="absolute right-20 bottom-0 w-[400px] h-[300px] border-l border-t border-white transform rotate-12 origin-bottom-right" />
        </div>

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10 relative z-10">
          
          {/* Column 1: Brand Info Box (Span 5 columns) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏮</span>
                <span className="font-display font-bold text-lg tracking-wide text-white">
                  จุดประสงค์
                </span>
              </div>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                เว็บไชต์นี้จัดทำขึ้นโดยนิสิตชุมนุมนิสิตภาควิชาคอมพิวเตอร์ โดยมีจุดมุ่งหมายเพื่อเตรียมความพร้อมให้คุณได้ฝึกเขียนโค้ด และได้ลงมือแก้ปัญหาจริงๆ
              </p>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                ไม่ว่าคุณจะถนัดภาษา python c c++ java javascript หรือหากยังไม่มีพื้นฐานก็มาฝึกได้ เพราะที่นี้มีโจทย์มากมายหลายระดับความยาก
              </p>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                BaMhee Elab ยินดีต้อนรับเหล่านักพัฒนาตัวน้อยที่มีไฟและพร้อมจะเติบโตไปด้วยกันเสมอ!
              </p>
            </div>

            <div className="flex items-center gap-5">
              {/* Combined Social Anchor Link targeting group hover */}
              <a 
                href="https://www.instagram.com/comsci40.ku/" 
                target="_blank" 
                rel="noreferrer" 
                className="group flex items-center gap-3 w-fit"
              >
                {/* The Icon: inherits group hover state */}
                <Instagram className="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-200" />
                
                {/* The Text Label: inherits group hover state synced perfectly */}
                <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors duration-200 tracking-wide">
                  comsci40.ku
                </span>
              </a>
            </div>

            {/* Back to Top Interceptor */}
            <div>
              <button 
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Back to Top
              </button>
            </div>
          </div>

          {/* Spacer layout separator (Span 1 column) */}
          <div className="hidden md:block md:col-span-1" />

          {/* Column 2: Site Map Link Structure (Span 3 columns) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-brand-orange uppercase tracking-widest">
              Site Map
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white font-medium transition-colors hover:underline decoration-brand-orange underline-offset-4">
                  Homepage
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white font-medium transition-colors hover:underline decoration-brand-orange underline-offset-4">
                  Sign In Gateway
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-white font-medium transition-colors hover:underline decoration-brand-orange underline-offset-4">
                  Student Profile
                </Link>
              </li>
              <li>
                <Link href="/problems" className="text-gray-400 hover:text-white font-medium transition-colors hover:underline decoration-brand-orange underline-offset-4">
                  Problems Library
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Absolute Copy strip row bar line */}
        <div className="max-w-6xl mx-auto px-6 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2">
          <p>Copyright © 2026, BaMhee E-lab. All Rights Reserved.</p>
          <p className="opacity-70">จัดทำโดย ชุมนุมนิสิตภาควิชาคอมพิวเตอร์ มหาวิทยาลัยเกษตรศาสตร์บางเขน</p>
        </div>
      </footer>
    </div>
  );
}