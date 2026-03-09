"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ExpensePieChartProps {
  transactions: Transaction[];
}

const COLORS = [
  "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#14b8a6", "#ec4899", "#f97316", "#6366f1", "#84cc16",
];

function useIsMobile(breakpoint = 640) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return mobile;
}

export function ExpensePieChart({ transactions }: ExpensePieChartProps) {
  const isMobile = useIsMobile();
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

  const renderLabel = ({ name, percent }: { name: string; percent: number }) => {
    const pct = `${(percent * 100).toFixed(0)}%`;
    if (isMobile) return pct;
    return `${name} ${pct}`;
  };

  return (
    <div className="h-[260px] sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy={isMobile ? "45%" : "48%"}
            innerRadius={isMobile ? "38%" : "45%"}
            outerRadius={isMobile ? "62%" : "75%"}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={renderLabel}
            fontSize={isMobile ? 11 : 13}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: 4, display: "flex", justifyContent: "center", flexWrap: "wrap" }}
            iconSize={isMobile ? 10 : 14}
            formatter={(value: string) => <span className="text-xs sm:text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
