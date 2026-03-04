"use client";

import { useState } from "react";

export function LinkTelegram() {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setCode(null);
    try {
      const res = await fetch("/api/telegram/link-code", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal buat kode");
      setCode(data.code);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal buat kode");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="link-telegram" className="rounded-2xl border-2 border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 p-4 shadow-card sm:p-6">
      <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-100 sm:text-lg">
        <span className="text-xl" aria-hidden>🔗</span>
        Link Telegram
      </h2>
      <p className="mb-4 text-sm text-muted dark:text-slate-400">
        Hubungkan akun Telegram ke dashboard ini. Transaksi yang kamu kirim lewat bot akan masuk ke akun kamu.
      </p>
      {!code ? (
        <>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? "Memuat..." : "Buat kode"}
          </button>
          {error && <p className="mt-2 text-sm text-expense">{error}</p>}
        </>
      ) : (
        <div className="rounded-xl border border-border dark:border-slate-600 bg-slate-50 dark:bg-slate-800 p-4">
          <p className="mb-2 text-sm text-muted dark:text-slate-400">Kirim ke bot Telegram:</p>
          <p className="mb-2 font-mono text-lg font-bold tracking-wider text-primary">
            /link {code}
          </p>
          <p className="text-xs text-muted dark:text-slate-500">Kode berlaku 10 menit. Setelah kirim, akun Telegram akan terhubung.</p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="mt-3 text-sm font-medium text-primary hover:underline disabled:opacity-50"
          >
            Buat kode baru
          </button>
        </div>
      )}
    </section>
  );
}
