"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TransactionType } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

interface AddTransactionFormProps {
  userId: string;
  onSuccess: () => void;
}

export function AddTransactionForm({ userId, onSuccess }: AddTransactionFormProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES.expense[0]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const categories = type === "income" ? CATEGORIES.income : CATEGORIES.expense;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount.replace(/,/g, ""));
    if (!num || num <= 0) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("transactions").insert({
        user_id: userId,
        type,
        amount: num,
        category: category || categories[0],
        note: note.trim() || "",
      });
      if (error) throw error;
      setAmount("");
      setNote("");
      setCategory(categories[0]);
      onSuccess();
    } catch {
      // handle error in UI if needed
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => {
            const newType = e.target.value as TransactionType;
            setType(newType);
            setCategory(newType === "income" ? CATEGORIES.income[0] : CATEGORIES.expense[0]);
          }}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
        <input
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
          placeholder="e.g. 50000"
          required
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add Transaction"}
      </button>
    </form>
  );
}
