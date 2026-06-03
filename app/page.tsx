"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { 
  BookOpen, Users, Trophy, Code2, ChevronRight, Star, Zap, 
  Instagram, ArrowUp, Target, Heart 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BowlIllustration from "@/components/shared/BowlIllustration";
import WaveSection from "@/components/shared/WaveSection";

export default function LandingPage() {
  const aboutRef = useRef<HTMLElement>(null); // 🎯 เปลี่ยนชื่อจาก footerRef เป็น aboutRef

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    aboutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
            {/* 🎯 วิ่งไปที่ Section จุดประสงค์ใหม่ */}
            <a href="#about-section" onClick={scrollToAbout}>
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
          <div className="absolute top-[-60px] left-[-60px] w-[280px] h-[280px] rounded-full bg-brand-orange opacity-[0.06]" />
          <div className="max-w-6xl mx-auto px-6 py-20 flex items-center gap-12">
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
              </div>
            </div>
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="animate-float">
                <BowlIllustration size={300} />
              </div>
            </div>
          </div>
          <WaveSection bgColor="#FFF9F0" fillColor="#F5CBA7" className="mt-4" />
        </section>

        {/* ── 🎯 NEW SECTION: จุดประสงค์ (Purpose) ── */}
        <section 
          ref={aboutRef} 
          id="about-section" 
          className="bg-brand-cream py-24 scroll-mt-16"
        >
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col items-center text-center space-y-8">              
              <div className="space-y-4">
                <h2 className="font-display text-3xl font-bold text-gray-900">จุดประสงค์</h2>
                <div className="w-25 h-1 bg-brand-red mx-auto rounded-full" />
              </div>

              <div className="grid gap-6 text-gray-600 leading-relaxed text-lg max-w-2xl">
                <p>
                  เว็บไซต์นี้จัดทำขึ้นโดย <span className="text-brand-red font-semibold">ชุมนุมนิสิตภาควิชาคอมพิวเตอร์</span> โดยมีจุดมุ่งหมายเพื่อเตรียมความพร้อมให้คุณได้ฝึกเขียนโค้ด และได้ลงมือแก้ปัญหาจริงๆ
                </p>
                <p>
                  ไม่ว่าคุณจะถนัดภาษา Python, C, C++ หรือหากยังไม่มีพื้นฐานก็มาฝึกได้ เพราะที่นี่มีโจทย์มากมายหลายระดับความยากเหมาะสำหรับทุกๆคน
                </p>
                <p className="font-medium text-gray-800">
                  BaMhee Elab ยินดีต้อนรับเหล่านักพัฒนาที่มีไฟและพร้อมจะพัฒนาตนเองเสมอ!
                </p>
              </div>

              <div className="pt-4">
                <a 
                  href="https://www.instagram.com/comsci40.ku/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-3 px-6 py-3 bg-brand-cream hover:bg-[#F5CBA7]/20 border border-[#F5CBA7] text-gray-700 rounded-2xl transition-all duration-300 group shadow-sm"
                >
                  <Instagram className="w-5 h-5 text-brand-red group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Follow us: comsci40.ku</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>        

      {/* ── Footer (Site Map & Copyright Only) ── */}
      <footer className="bg-[#1D1313] text-white pt-16 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="absolute right-0 bottom-0 w-[600px] h-[400px] border-l border-t border-white transform rotate-12 origin-bottom-right" />
        </div>

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10 relative z-10">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏮</span>
              <span className="font-display font-bold text-xl tracking-wide text-white">
                BaMhee E-lab
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Empowering the next generation of developers through interactive learning and real-world challenges.
            </p>
            <button 
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              Back to Top
            </button>
          </div>

          <div className="hidden md:block md:col-span-3" />

          {/* Site Map Column */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="text-xs font-bold text-brand-orange uppercase tracking-widest border-l-2 border-brand-orange pl-3">
              Site Map
            </h4>
            <ul className="grid grid-cols-1 gap-3 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">Homepage</Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors">Sign In Gateway</Link>
              </li>
              <li>
                <Link href="/problems" className="text-gray-400 hover:text-white transition-colors">Problems Library</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
          <p>Copyright © 2026, BaMhee E-lab. All Rights Reserved.</p>
          <p className="opacity-70 text-center sm:text-right">จัดทำโดย ชุมนุมนิสิตภาควิชาคอมพิวเตอร์ มหาวิทยาลัยเกษตรศาสตร์บางเขน</p>
        </div>
      </footer>
    </div>
  );
}