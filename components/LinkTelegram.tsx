"use client";

import { useState, useEffect } from "react";
import { TELEGRAM_BOT_URL, TELEGRAM_BOT_USERNAME } from "@/lib/constants";
import { openTelegramUrl } from "@/lib/utils";

export function LinkTelegram() {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#otomatis") {
      document.getElementById("otomatis")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14 pb-20 px-4 sm:px-6">
      {/* --- HERO SECTION --- (Standardized Gmail Style) */}
      <div className="relative overflow-hidden rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-8 sm:p-14 lg:p-16 animate-fade-in-up">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-40 dark:opacity-20" />
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12 text-center xl:text-left">
          <div className="space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] border border-slate-200 dark:border-slate-700 mx-auto xl:mx-0 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Telegram Assistant
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                 Link Your <span className="text-primary italic">Telegram Bot.</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl mx-auto xl:mx-0 animate-fade-in [animation-delay:300ms]">
                Catat transaksi secepat kilat langsung dari chat tanpa perlu buka browser. Akun tersinkronisasi otomatis dengan asisten robot pintar kami.
              </p>
            </div>
            <div className="flex flex-wrap justify-center xl:justify-start gap-3 sm:gap-4 animate-fade-in [animation-delay:600ms]">
              {["Cepat", "Aman", "Otomatis"].map((tag, i) => (
                <span key={tag} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 hover:scale-105 transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm">
                  {i === 0 ? "🚀" : i === 1 ? "🔒" : "⚡"} {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="shrink-0 relative group animate-float mx-auto xl:mx-0">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700 opacity-60 dark:opacity-40" />
            <div className="relative bg-white dark:bg-slate-800 p-10 sm:p-14 lg:p-16 rounded-[4.5rem] shadow-2xl ring-2 ring-slate-100 dark:ring-slate-800 scale-105">
               <svg className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* --- CARD: LINK OTOMATIS --- */}
        <section
          id="otomatis"
          className="group relative flex flex-col rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 shadow-xl transition-all hover:-translate-y-1.5 hover:shadow-2xl animate-fade-in-up [animation-delay:200ms]"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative flex flex-col gap-10 h-full">
            <div className="space-y-8 flex-1">
              <div className="flex items-center gap-5">
                <span className="flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-white dark:bg-slate-800 text-3xl shadow-lg ring-1 ring-slate-100 dark:ring-slate-700/50 group-hover:rotate-12 transition-transform">⚡</span>
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">Link Otomatis</h2>
                  <p className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.25em] mt-2">Recommended Setup</p>
                </div>
              </div>

              <p className="text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Metode tercepat! Cukup klik tombol di bawah, ketuk <strong>Start</strong> di Telegram, dan akun Anda langsung tersambung.
              </p>

              <div className="grid grid-cols-1 gap-4">
                {[ 
                  { step: 1, text: "Buka di Telegram" },
                  { step: 2, text: "Ketuk Tombol START" }
                ].map(s => (
                  <div key={s.step} className="flex gap-4 items-center group/step">
                     <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-primary font-black shadow-md border border-slate-100 dark:border-slate-800 group-hover/step:bg-primary group-hover/step:text-white transition-all text-sm">{s.step}</span>
                     <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover/step:text-primary transition-colors">{s.text}</p>
                  </div>
                ))}
              </div>

              <div className="bg-amber-100/40 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 p-5 rounded-3xl text-xs font-bold text-amber-800 dark:text-amber-200">
                ⚠️ <strong className="ml-1 text-[10px] uppercase tracking-wider">PENTING:</strong> Tidak mendukung Telegram Web.
              </div>
            </div>

            <div className="pt-6 border-t border-primary/10">
               <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    try {
                      const res = await fetch("/api/telegram/link-code", { method: "POST" });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || "Gagal");
                      openTelegramUrl(`${TELEGRAM_BOT_URL}?start=${data.code}`);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Gagal");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-4 rounded-[2rem] bg-primary text-white shadow-xl shadow-primary/25 hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-50 relative overflow-hidden group/btn min-h-[4.5rem]"
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                  <svg className={`h-6 w-6 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="currentColor">
                    {loading ? (
                      <path d="M12 4v4m0 8v4m-8-8h4m8 0h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    ) : (
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    )}
                  </svg>
                  {loading ? "MENYIAPKAN..." : "BUKA TELEGRAM"}
               </button>
               {error && <p className="mt-4 text-center text-xs font-black text-red-500">{error}</p>}
            </div>
          </div>
        </section>

        {/* --- CARD: LINK MANUAL --- */}
        <section
          id="link-manual"
          className="group relative flex flex-col rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 shadow-xl transition-all hover:-translate-y-1.5 hover:shadow-2xl animate-fade-in-up [animation-delay:400ms]"
        >
          <div className="relative flex flex-col gap-10 h-full">
            <div className="space-y-8 flex-1">
              <div className="flex items-center gap-5">
                <span className="flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-slate-50 dark:bg-slate-800 text-3xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 group-hover:rotate-12 transition-transform">✏️</span>
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">Manual Link</h2>
                  <p className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mt-2">Bot Support Center</p>
                </div>
              </div>

              <p className="text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-left">
                Gunakan jika link otomatis lambat. Cukup kirim kode ke asisten robot di chat.
              </p>

              <div className="space-y-6">
                 <div className="flex flex-wrap lg:justify-start gap-4 sm:gap-6">
                    {[ 
                       { step: 1, text: "Buat kode" },
                       { step: 2, text: "Buka bot" },
                       { step: 3, text: "Kirim /link KODE" }
                    ].map(s => (
                       <div key={s.step} className="flex gap-3 items-center group/step">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50/80 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black shadow-sm border border-slate-100 dark:border-slate-800 group-hover/step:bg-primary group-hover/step:text-white transition-all text-sm">{s.step}</span>
                          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover/step:text-primary transition-colors leading-none tracking-tight">{s.text}</p>
                       </div>
                    ))}
                 </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              {!code ? (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-black hover:border-primary dark:hover:border-primary hover:text-primary transition-all active:scale-95 disabled:opacity-50 min-h-[4.5rem]"
                >
                  {loading ? "TUNGGU..." : "BUAT KODE MANUAL"}
                </button>
              ) : (
                <div className="relative group/code overflow-hidden rounded-[2.5rem] bg-primary p-8 text-center shadow-lg animate-in zoom-in-95 duration-200">
                  <div className="absolute top-0 right-0 p-4"><span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /></div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 mb-3">Copy & Paste to Bot:</p>
                  <div className="flex flex-col gap-2 items-center">
                    <p className="text-2xl sm:text-3xl font-black tracking-widest text-white font-mono break-all drop-shadow-md">
                      /link {code}
                    </p>
                    <div className="h-1 w-12 bg-white/20 rounded-full" />
                  </div>
                  <p className="text-[9px] font-black tracking-[0.1em] text-white/40 mt-4 uppercase">KODE AKTIF 10 MENIT</p>
                  <button
                    onClick={handleGenerate}
                    className="mt-6 text-[10px] font-black text-white/80 hover:text-white transition-all uppercase tracking-[0.15em] hover:underline"
                  >
                    Ganti Kode Baru
                  </button>
                </div>
              )}
               {error && <p className="mt-4 text-center text-xs font-black text-red-500">{error}</p>}
            </div>
          </div>
        </section>
      </div>

      {/* --- TIPS SECTION --- (Gmail Style) */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] sm:rounded-[3.5rem] p-10 sm:p-14 border border-slate-200 dark:border-slate-800 animate-fade-in-up [animation-delay:600ms] transition-all group shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 flex items-center justify-center rounded-[2rem] bg-emerald-500 text-white text-4xl sm:text-5xl shadow-xl shadow-emerald-500/20 animate-pulse-subtle group-hover:scale-110 transition-transform">🎁</div>
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Tips Anti Ribet! 🚀</h3>
            <p className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl">
              Biar makin pro, coba kirim format cepat: <span className="text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-500/20 mx-1 whitespace-nowrap">+50rb gaji</span> atau <span className="text-red-500 font-bold px-3 py-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-red-100 dark:border-red-500/20 mx-1 whitespace-nowrap">-25k kopi</span>. Data bakal langsung sinkron!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
