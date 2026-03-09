"use client";

import { useState, useEffect } from "react";
import type { Transaction, TransactionType } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { formatAmountDisplay, parseAmountInput } from "@/lib/utils";

interface EditTransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (id: string, data: { type: TransactionType; amount: number; category: string; note: string }) => void | Promise<void>;
}

export function EditTransactionModal({ transaction, onClose, onSave }: EditTransactionModalProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!transaction) return;
    setType(transaction.type);
    setAmount(formatAmountDisplay(String(transaction.amount)));
    setCategory(transaction.category);
    setNote(transaction.note || "");
    setError("");
  }, [transaction]);

  if (!transaction) return null;

  const categories = type === "income" ? CATEGORIES.income : CATEGORIES.expense;
  const num = parseAmountInput(amount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!transaction || !num || num <= 0) return;
    setLoading(true);
    setError("");
    try {
      await Promise.resolve(onSave(transaction.id, { type, amount: num, category: category || categories[0], note: note.trim() }));
      onClose();
    } catch {
      setError("Gagal menyimpan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 dark:bg-black/60" onClick={onClose} aria-hidden />
      <div
        className="relative w-full max-w-md rounded-2xl border border-border dark:border-slate-600 bg-card dark:bg-slate-800 p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Edit Transaksi</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            aria-label="Tutup"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-700 p-1">
            <button
              type="button"
              onClick={() => { setType("expense"); setCategory(CATEGORIES.expense[0]); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium ${type === "expense" ? "bg-card dark:bg-slate-800 shadow soft text-slate-800 dark:text-slate-100" : "text-muted dark:text-slate-400"}`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => { setType("income"); setCategory(CATEGORIES.income[0]); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium ${type === "income" ? "bg-card dark:bg-slate-800 shadow soft text-slate-800 dark:text-slate-100" : "text-muted dark:text-slate-400"}`}
            >
              Pemasukan
            </button>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Jumlah (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(formatAmountDisplay(e.target.value))}
              placeholder="25.000"
              required
              className="w-full rounded-xl border border-border dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-border dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Catatan</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-border dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {error && <p className="text-sm text-expense">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-border dark:border-slate-600 py-3 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !num || num <= 0}
              className="flex-1 rounded-xl bg-primary py-3 font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
