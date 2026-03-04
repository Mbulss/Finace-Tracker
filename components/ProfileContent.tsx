"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ProfileContentProps {
  email: string;
}

export function ProfileContent({ email }: ProfileContentProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const supabase = createClient();

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password minimal 6 karakter." });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Password dan konfirmasi tidak sama." });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage({ type: "success", text: "Password berhasil diubah." });
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mengubah password.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border dark:border-slate-700 bg-card dark:bg-slate-800 p-4 shadow-card sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-100 sm:text-lg">
          <span className="text-xl" aria-hidden>👤</span>
          Info Akun
        </h2>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-muted dark:text-slate-400">Email</dt>
            <dd className="mt-0.5 text-slate-800 dark:text-slate-200">{email}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-border dark:border-slate-700 bg-card dark:bg-slate-800 p-4 shadow-card sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-100 sm:text-lg">
          <span className="text-xl" aria-hidden>🔒</span>
          Ubah Password
        </h2>
        {message && (
          <p
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            role="alert"
          >
            {message.text}
          </p>
        )}
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password baru
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-800 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Min. 6 karakter"
              minLength={6}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Konfirmasi password baru
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-800 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Ulangi password baru"
              minLength={6}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Ubah password"}
          </button>
        </form>
      </section>
    </div>
  );
}
