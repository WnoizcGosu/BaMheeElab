"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Modern Next.js router
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BowlIllustration from "@/components/shared/BowlIllustration";
import SocialAuthButtons from "@/components/shared/SocialAuthButtons";
import WaveSection from "@/components/shared/WaveSection";
import { useSession, signIn } from "next-auth/react"; // Pull in signIn action

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession(); // Track login state
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  
  // ── Error & Loading States ──
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Auto-Redirect if Already Logged In ──
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/problems"); // Smooth SPA transition to problems list
    }
  }, [status, router]);

  // ── Form Submission Handler ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Trigger NextAuth's native Credentials authorization hook
      const result = await signIn("credentials", {
        redirect: false, // Stop automatic server reloads so we can capture custom errors
        username: form.username,
        password: form.password,
      });

      if (result?.error) {
        // Displays bad passwords or user not found messages from the auth subsystem
        setError("Invalid username or password");
      } else {
        // If successful, our top-level useEffect hook will catch the state change and route them
        router.push("/problems");
      }
    } catch (err) {
      setError("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };
  
  if (status === "loading") {
    return <div className="min-h-screen bg-[#1a1010] flex items-center justify-center text-brand-cream font-sans">Loading...</div>;
  }
  
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
            <p className="text-sm text-gray-400 mb-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-brand-red font-semibold hover:underline">
                Sign up
              </Link>
            </p>

            {/* ── Visual Error Callout Banner ── */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-xs font-semibold text-brand-red border border-red-100 animate-shake">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Username
                </label>
                <Input
                  required
                  placeholder="your_username"
                  value={form.username}
                  onChange={(e) => {
                    setError(null);
                    setForm({ ...form, username: e.target.value });
                  }}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <Input
                    required
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => {
                    setError(null);
                      setForm({ ...form, password: e.target.value });
                    }}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-red transition-colors cursor-pointer"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-2 h-11 cursor-pointer">
                {loading ? "Verifying..." : "Login"}
              </Button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[#F5CBA7]" />
              <span className="text-xs text-gray-400">Or continue with</span>
              <div className="flex-1 h-px bg-[#F5CBA7]" />
            </div>

            <SocialAuthButtons />

            <div className="mt-8">
              <Link href="/l">
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