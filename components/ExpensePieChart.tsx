"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ExpensePieChartProps {
  transactions: Transaction[];
}

// Palet beda-beda per kategori: biru, hijau, oranye, merah, ungu, teal, amber
const COLORS = [
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#ec4899", // pink
  "#f97316", // orange
  "#6366f1", // indigo
  "#84cc16", // lime
];

export function ExpensePieChart({ transactions }: ExpensePieChartProps) {
  const expenseOnly = transactions.filter((t) => t.type === "expense");
  const byCategory = expenseOnly.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + Number(t.amount);
    return acc;
  }, {});
  const data = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] flex-col items-center justify-center rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-muted dark:text-slate-400">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          </svg>
        </div>
        <p className="text-sm text-muted dark:text-slate-400">Belum ada data pengeluaran</p>
        <p className="mt-1 text-xs text-muted dark:text-slate-500">Tambahkan transaksi pengeluaran untuk melihat grafik</p>
      </div>
    );
  }

  return (
    <div className="h-[240px] min-h-[200px] sm:h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="45%"
            outerRadius="70%"
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
