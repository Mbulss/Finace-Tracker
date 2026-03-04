"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Transaction } from "@/lib/types";
import { SummaryCards } from "./SummaryCards";
import { AddTransactionForm } from "./AddTransactionForm";
import { TransactionTable } from "./TransactionTable";
import { ExpensePieChart } from "./ExpensePieChart";
import { MonthlyBarChart } from "./MonthlyBarChart";

interface DashboardProps {
  userId: string;
}

export function Dashboard({ userId }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthFilter, setMonthFilter] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const supabase = createClient();
  const router = useRouter();

  const fetchTransactions = useCallback(async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error) setTransactions(data ?? []);
  }, [supabase, userId]);

  useEffect(() => {
    fetchTransactions();
    const channel = supabase
      .channel("transactions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${userId}` },
        () => fetchTransactions()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTransactions, supabase, userId]);

  const filteredByMonth = transactions.filter((t) => {
    const d = new Date(t.created_at);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}` === monthFilter;
  });

  const handleDelete = async (id: string) => {
    await supabase.from("transactions").delete().eq("id", id).eq("user_id", userId);
    fetchTransactions();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Finance Tracker</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/auth");
              router.refresh();
            }}
            className="text-sm text-muted hover:text-gray-700"
          >
            Sign out
          </button>
          <div className="flex items-center gap-2">
          <label htmlFor="month" className="text-sm text-muted">Filter by month</label>
            <input
              id="month"
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </header>

      <SummaryCards transactions={filteredByMonth} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-card rounded-xl shadow-card p-6 border border-border">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add Transaction</h2>
          <AddTransactionForm userId={userId} onSuccess={fetchTransactions} />
        </section>
        <section className="bg-card rounded-xl shadow-card p-6 border border-border">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Expense by Category</h2>
          <ExpensePieChart transactions={filteredByMonth} />
        </section>
      </div>

      <section className="bg-card rounded-xl shadow-card p-6 border border-border">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Income vs Expense</h2>
        <MonthlyBarChart transactions={transactions} />
      </section>

      <section className="bg-card rounded-xl shadow-card p-6 border border-border">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h2>
        <TransactionTable
          transactions={filteredByMonth}
          onDelete={handleDelete}
        />
      </section>
    </div>
  );
}
