"use client";

import { useState, useRef, useEffect } from "react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

interface MonthPickerProps {
  value: string; // YYYY-MM
  onChange: (value: string) => void;
  className?: string;
}

export function MonthPicker({ value, onChange, className = "" }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [y, m] = value.split("-").map(Number);
  const year = y || new Date().getFullYear();
  const month = m || new Date().getMonth() + 1;

  const label = new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (newYear: number, newMonth: number) => {
    const next = `${newYear}-${String(newMonth).padStart(2, "0")}`;
    onChange(next);
    setOpen(false);
  };

  const thisMonth = new Date();
  const thisYear = thisMonth.getFullYear();
  const thisMonthNum = thisMonth.getMonth() + 1;

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[44px] w-full sm:min-w-[160px] sm:w-auto items-center justify-between gap-2 rounded-xl border border-border dark:border-slate-600 bg-card dark:bg-slate-800 px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <span className="capitalize">{label}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-muted dark:text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="relative z-10 mt-2 w-full rounded-xl border border-border dark:border-slate-600 bg-card dark:bg-slate-800 p-4 shadow-lg sm:absolute sm:left-0 sm:mt-1.5 sm:w-64 sm:shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{year}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleSelect(year - 1, month)}
                className="rounded-lg p-1.5 text-muted hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label="Tahun sebelumnya"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleSelect(year + 1, month)}
                className="rounded-lg p-1.5 text-muted hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label="Tahun berikutnya"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((name, i) => {
              const num = i + 1;
              const isSelected = month === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleSelect(year, num)}
                  className={`min-h-[44px] rounded-lg py-2.5 text-sm font-medium transition ${
                    isSelected
                      ? "bg-primary text-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => handleSelect(thisYear, thisMonthNum)}
            className="mt-3 w-full min-h-[44px] rounded-lg py-3 text-center text-sm font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
          >
            Bulan ini
          </button>
        </div>
      )}
    </div>
  );
}
