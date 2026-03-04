"use client";

import { useState, useRef, useEffect } from "react";

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export function SelectDropdown({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  className = "",
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedLabel = value === "all" || !value ? placeholder : options.find((o) => o.value === value)?.label ?? value;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-[42px] min-w-[140px] items-center justify-between gap-2 rounded-xl border border-border dark:border-slate-600 bg-card dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:min-w-[160px]"
      >
        <span className="truncate">{selectedLabel}</span>
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
        <div className="absolute left-0 top-full z-50 mt-1.5 max-h-60 w-full min-w-[160px] overflow-auto rounded-xl border border-border dark:border-slate-600 bg-card dark:bg-slate-800 py-1 shadow-card">
          <button
            type="button"
            onClick={() => {
              onChange("all");
              setOpen(false);
            }}
            className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition ${
              value === "all" || !value
                ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition ${
                value === opt.value
                  ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
