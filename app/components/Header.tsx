"use client";

import React, { useState, useMemo } from "react";
import {
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { getMonthName } from "../lib/utils";

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  selectedMonth: number;
  selectedYear: number;
  onChangeFilter: (month: number, year: number) => void;
}

const MONTHS_EN = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function Header({
  theme,
  onToggleTheme,
  selectedMonth,
  selectedYear,
  onChangeFilter,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Computed client-side to avoid SSR/client year mismatch
  const YEARS = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  }, []);

  const handleMonthYear = (month: number, year: number) => {
    onChangeFilter(month, year);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
            SmartFinance <span className="text-emerald-500">AI</span>
          </span>
        </div>

        {/* Desktop controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Month/Year Selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {getMonthName(selectedMonth)} {selectedYear}
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-50 overflow-hidden">
                <div className="p-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                    Month
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {MONTHS.map((m) => (
                      <button
                        key={m}
                        onClick={() => handleMonthYear(m, selectedYear)}
                        className={`text-xs px-2 py-1.5 rounded-lg transition-colors ${
                          m === selectedMonth
                            ? "bg-emerald-500 text-white font-semibold"
                            : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {MONTHS_EN[m - 1]}
                      </button>
                    ))}
                  </div>

                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3 mb-2 uppercase tracking-wider">
                    Year
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {YEARS.map((y) => (
                      <button
                        key={y}
                        onClick={() => handleMonthYear(selectedMonth, y)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                          y === selectedYear
                            ? "bg-indigo-500 text-white font-semibold"
                            : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Mobile: hamburger */}
        <button
          className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-4 flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Month
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {MONTHS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    handleMonthYear(m, selectedYear);
                    setMobileOpen(false);
                  }}
                  className={`text-xs px-2 py-2 rounded-lg transition-colors ${
                    m === selectedMonth
                      ? "bg-emerald-500 text-white font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {MONTHS_EN[m - 1]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Year
            </p>
            <div className="flex gap-2 flex-wrap">
              {YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    handleMonthYear(selectedMonth, y);
                    setMobileOpen(false);
                  }}
                  className={`text-xs px-3 py-2 rounded-lg transition-colors ${
                    y === selectedYear
                      ? "bg-indigo-500 text-white font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 font-medium"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" /> Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500" /> Dark Mode
              </>
            )}
          </button>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
}
