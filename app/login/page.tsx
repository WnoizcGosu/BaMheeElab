"use client";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BowlIllustration from "@/components/shared/BowlIllustration";
import SocialAuthButtons from "@/components/shared/SocialAuthButtons";
import WaveSection from "@/components/shared/WaveSection";

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = "/problems";
  };

  return (
    <div className="min-h-screen bg-[#1a1010] flex items-center justify-center p-6">
      {/* Card wrapper */}
      <div className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* ── Form side ── */}
          <div className="p-10 flex flex-col justify-center">
            {/* Brand mark */}
            <div className="flex items-center gap-2 mb-8">
              <span className="text-2xl">🏮</span>
              <span className="font-display font-bold text-brand-red text-base tracking-wide">
                BaMhee E-lab
              </span>
            </div>

            <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">
              Welcome back!
            </h1>
            <p className="text-sm text-gray-400 mb-8">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-brand-red font-semibold hover:underline">
                Sign up
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Username
                </label>
                <Input
                  placeholder="your_username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-red transition-colors"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full mt-2 h-11">
                Login
              </Button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[#F5CBA7]" />
              <span className="text-xs text-gray-400">Or continue with</span>
              <div className="flex-1 h-px bg-[#F5CBA7]" />
            </div>

            <SocialAuthButtons />

            <div className="mt-8">
              <Link href="/landing">
                <span className="text-xs text-gray-400 hover:text-brand-red transition-colors cursor-pointer">
                  ← Back to home
                </span>
              </Link>
            </div>
          </div>

          {/* ── Visual side ── */}
          <div className="relative bg-brand-red flex flex-col items-center justify-center overflow-hidden min-h-[380px]">
            {/* Decorative circles */}
            <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute top-1/4 right-1/4 w-12 h-12 rounded-full bg-white/10" />
            <div className="animate-float">
              <BowlIllustration size={200} light />
            </div>

            {/* Wave bottom on red panel */}
            <div className="absolute bottom-0 left-0 right-0">
              <WaveSection bgColor="#C0392B" fillColor="#F5CBA7" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
