"use client";

import type { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface DeleteConfirmModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteConfirmModal({
  transaction,
  onClose,
  onConfirm,
  loading = false,
}: DeleteConfirmModalProps) {
  if (!transaction) return null;

  const label =
    transaction.type === "income"
      ? `Pemasukan · ${transaction.category}`
      : `Pengeluaran · ${transaction.category}`;
  const amount =
    transaction.type === "income"
      ? `+${formatCurrency(Number(transaction.amount))}`
      : `-${formatCurrency(Number(transaction.amount))}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 dark:bg-black/60"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border dark:border-slate-600 bg-card dark:bg-slate-800 p-6 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-expense/10 dark:bg-expense/20">
            <svg
              className="h-5 w-5 text-expense"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Hapus transaksi?
            </h3>
            <p className="text-sm text-muted dark:text-slate-400">
              Tindakan ini tidak bisa dibatalkan.
            </p>
          </div>
        </div>
        <div className="mb-6 rounded-xl border border-border dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
          <p
            className={`mt-0.5 text-lg font-semibold tabular-nums ${
              transaction.type === "income" ? "text-income" : "text-expense"
            }`}
          >
            {amount}
          </p>
          {transaction.note && (
            <p className="mt-1 text-sm text-muted dark:text-slate-400">{transaction.note}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-border dark:border-slate-600 py-3 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-expense py-3 font-medium text-white hover:bg-expense/90 disabled:opacity-50 transition"
          >
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
