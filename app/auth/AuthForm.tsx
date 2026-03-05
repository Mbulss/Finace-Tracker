"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

function getAuthRedirectUrl(): string {
  if (typeof window !== "undefined") return `${window.location.origin}/auth/callback`;
  return process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    : "https://finace-tracker-seven.vercel.app/auth/callback";
}

const CALLBACK_ERROR_MSG: Record<string, string> = {
  missing_code: "Link tidak lengkap. Coba klik lagi dari email atau minta kirim ulang.",
  invalid_code: "Link kedaluwarsa atau sudah dipakai. Coba daftar ulang atau minta link reset password lagi.",
};

export function AuthForm({ callbackError }: { callbackError?: string | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(callbackError ? CALLBACK_ERROR_MSG[callbackError] ?? "Terjadi kesalahan." : "");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const redirectTo = getAuthRedirectUrl();
    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
        setMessage("Cek email kamu untuk link reset password. Kalau belum muncul, cek folder spam.");
        setEmail("");
        setIsForgotPassword(false);
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
        if (error) throw error;
        setMessage("Cek email kamu untuk konfirmasi pendaftaran. Link akan mengarah ke dashboard.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-auth-hero p-4">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
        <div className="absolute -right-20 bottom-1/4 h-48 w-48 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
      </div>
      <div className="relative w-full max-w-md animate-fade-in-up rounded-2xl border border-border dark:border-slate-700 bg-card/95 dark:bg-slate-800/95 p-8 shadow-card backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-white shadow-lg shadow-primary/25">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Finance Tracker</span>
        </div>
        <p className="mb-6 text-center text-sm text-muted dark:text-slate-400">Kelola keuangan kamu dengan mudah — web & Telegram</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-border dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 px-4 py-3 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="kamu@example.com"
            />
          </div>
          {!isForgotPassword && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setMessage(""); }}
                  className="text-xs text-primary hover:underline dark:text-sky-400"
                >
                  Lupa password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-border dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 px-4 py-3 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}
          {message && (
            <p className={`text-sm ${message.includes("Cek email") || message.includes("spam") ? "text-income" : "text-expense"}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3.5 font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover hover:shadow-primary/30 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading
              ? "Memproses..."
              : isForgotPassword
                ? "Kirim link reset"
                : isSignUp
                  ? "Daftar"
                  : "Masuk"}
          </button>
        </form>
        {isForgotPassword ? (
          <button
            type="button"
            onClick={() => { setIsForgotPassword(false); setMessage(""); }}
            className="mt-4 w-full text-sm text-muted transition hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-400"
          >
            ← Kembali ke masuk
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { setIsSignUp((v) => !v); setMessage(""); }}
            className="mt-4 w-full text-sm text-muted transition hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-400"
          >
            {isSignUp ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
          </button>
        )}
      </div>
    </div>
  );
}
