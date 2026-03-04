"use client";

import type { Transaction } from "@/lib/types";

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionTable({ transactions, onDelete }: TransactionTableProps) {
  if (transactions.length === 0) {
    return <p className="text-muted text-sm">No transactions in this period.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted">
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Type</th>
            <th className="pb-3 font-medium">Amount</th>
            <th className="pb-3 font-medium">Category</th>
            <th className="pb-3 font-medium">Note</th>
            <th className="pb-3 font-medium w-20"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-border last:border-0">
              <td className="py-3 text-gray-700">
                {new Date(t.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="py-3">
                <span className={t.type === "income" ? "text-green-600" : "text-red-600"}>
                  {t.type}
                </span>
              </td>
              <td className="py-3 font-medium">
                <span className={t.type === "income" ? "text-green-600" : "text-red-600"}>
                  {t.type === "income" ? "+" : "-"}
                  {formatCurrency(Number(t.amount))}
                </span>
              </td>
              <td className="py-3 text-gray-700">{t.category}</td>
              <td className="py-3 text-gray-600 max-w-[180px] truncate">{t.note || "—"}</td>
              <td className="py-3">
                <button
                  type="button"
                  onClick={() => onDelete(t.id)}
                  className="text-red-600 hover:underline text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
