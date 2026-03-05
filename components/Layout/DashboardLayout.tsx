"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mesh">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-h-screen lg:pl-64">
        {/* Mobile header with menu button — safe area untuk notch */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border dark:border-slate-700 bg-card/80 dark:bg-slate-800/80 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-md sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Buka menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg object-contain" />
          <span className="font-bold tracking-tight text-slate-800 dark:text-slate-100 truncate">Finance Tracker</span>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</div>
      </main>
    </div>
  );
}
