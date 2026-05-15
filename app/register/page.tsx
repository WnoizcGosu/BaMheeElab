"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Clean SPA routing
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BowlIllustration from "@/components/shared/BowlIllustration";
import SocialAuthButtons from "@/components/shared/SocialAuthButtons";
import WaveSection from "@/components/shared/WaveSection";

export default function RegisterPage() {
  const router = useRouter();
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // ── Error & Loading States ──
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "", 
    email: "",
    password: "", 
    confirm: "",
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null); // Clear errors dynamically as the user re-types
      setForm((prev) => ({ ...prev, [k]: e.target.value }));
    };

  // ── Form Submission Handler ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Client-Side Passwords Matching Guard
    if (form.password !== form.confirm) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      // 2. Fetch Request sending payload to our local Mock DB API
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Captures "Username is already taken" or "Email already registered" from API
        throw new Error(data.error || "Something went wrong.");
      }

      // 3. Success -> Route user cleanly to login screen so they can test credentials
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1010] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* ── Form side ── */}
          <div className="p-10 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-8">
              <span className="text-2xl">🏮</span>
              <span className="font-display font-bold text-brand-red text-base tracking-wide">
                BaMhee E-lab
              </span>
            </div>

            <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">
              Create an Account
            </h1>
            <p className="text-sm text-gray-400 mb-6">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-red font-semibold hover:underline">
                Login
              </Link>
            </p>

            {/* ── Visual Error Alert Callout ── */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-xs font-semibold text-brand-red border border-red-100 animate-shake">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Username & Email row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Username
                  </label>
                  <Input 
                    required
                    placeholder="johndoe99" 
                    value={form.username} 
                    onChange={set("username")} 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Gmail
                  </label>
                  <Input 
                    required
                    type="email" 
                    placeholder="john@gmail.com" 
                    value={form.email} 
                    onChange={set("email")} 
                  />
                </div>
              </div>

              {/* Password */}
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
                    onChange={set("password")}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-red cursor-pointer"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    required
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={set("confirm")}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-red cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Disabled button state when background network request is flying */}
              <Button type="submit" disabled={loading} className="w-full mt-2 h-11 cursor-pointer">
                {loading ? "Registering account..." : "Create Account"}
              </Button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#F5CBA7]" />
              <span className="text-xs text-gray-400">Or continue with</span>
              <div className="flex-1 h-px bg-[#F5CBA7]" />
            </div>

            <SocialAuthButtons />

            <div className="mt-6">
              <Link href="/landing">
                <span className="text-xs text-gray-400 hover:text-brand-red transition-colors cursor-pointer">
                  ← Back to home
                </span>
              </Link>
            </div>
          </div>

          {/* ── Visual side ── */}
          <div className="relative bg-brand-red flex flex-col items-center justify-center overflow-hidden min-h-[480px]">
            <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute top-1/3 right-1/4 w-10 h-10 rounded-full bg-white/10" />
            <div className="animate-float">
              <BowlIllustration size={200} light />
            </div>

            <div className="absolute bottom-0 left-0 right-0">
              <WaveSection bgColor="#C0392B" fillColor="#F5CBA7" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}