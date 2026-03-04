"use client";

import type { Transaction } from "@/lib/types";

interface SummaryCardsProps {
  transactions: Transaction[];
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="bg-card rounded-xl shadow-card p-6 border border-border">
        <p className="text-sm text-muted font-medium">Total Balance</p>
        <p className={`text-2xl font-semibold mt-1 ${balance >= 0 ? "text-gray-900" : "text-red-600"}`}>
          {formatCurrency(balance)}
        </p>
      </div>
      <div className="bg-card rounded-xl shadow-card p-6 border border-border">
        <p className="text-sm text-muted font-medium">Total Income</p>
        <p className="text-2xl font-semibold text-green-600 mt-1">{formatCurrency(income)}</p>
      </div>
      <div className="bg-card rounded-xl shadow-card p-6 border border-border">
        <p className="text-sm text-muted font-medium">Total Expense</p>
        <p className="text-2xl font-semibold text-red-600 mt-1">{formatCurrency(expense)}</p>
      </div>
    </div>
  );
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}
