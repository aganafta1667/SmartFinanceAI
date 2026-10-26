"use client";

/**
 * SmartFinance AI — Main Dashboard Page
 *
 * Architecture:
 *  - All state persisted to LocalStorage via useAppState hook
 *  - Theme managed locally via useState + class on <html>
 *  - Zero hydration mismatch: state is null until useEffect fires, then renders
 */

import React, { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";

// ── Components ───────────────────────────────────────────────────────────────
import Header from "./components/Header";
import KPICards from "./components/KPICards";
import InputPanel from "./components/InputPanel";
import BudgetAlerts from "./components/BudgetAlerts";
import RecurringBills from "./components/RecurringBills";
import TransactionTable from "./components/TransactionTable";
import EditTransactionModal from "./components/EditTransactionModal";

// ── Hook & types ──────────────────────────────────────────────────────────────
import { useAppState } from "./hooks/useAppState";
import type { FilterState, KPISummary, Transaction } from "./types";

// ── Theme helper ─────────────────────────────────────────────────────────────

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

// ── Page Component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // ── Theme ─────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<Theme>("light");

  // Initialise theme from localStorage on mount (avoids flash)
  useEffect(() => {
    // Temporarily disable transitions to prevent theme flash
    document.documentElement.classList.add("no-transition");

    const saved = localStorage.getItem("smartfinance_theme") as Theme | null;
    const preferred: Theme =
      saved ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(preferred);
    applyTheme(preferred);

    // Re-enable transitions after a tick
    requestAnimationFrame(() => {
      document.documentElement.classList.remove("no-transition");
    });
  }, []);

  const handleToggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("smartfinance_theme", next);
  };

  // ── Filter state (month/year) ─────────────────────────────────────────────
  // Use static defaults (1=January); actual values are set in useEffect after mount
  // to avoid "unstable new Date()" prerender error in Next.js 16
  const [filter, setFilter] = useState<FilterState>({
    month: 1,
    year: 2025,
    category: "All",
  });

  // Sync filter to current month/year on mount (client-only)
  useEffect(() => {
    const now = new Date();
    setFilter({ month: now.getMonth() + 1, year: now.getFullYear(), category: "All" });
  }, []);

  // ── Edit modal state ──────────────────────────────────────────────────────
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // ── App State (LocalStorage) ──────────────────────────────────────────────
  const {
    state,
    addTransaction,
    updateTransaction,
    removeTransaction,
    upsertBudgetCap,
    removeBudgetCap,
    addBill,
    updateBillStatus,
    removeBill,
  } = useAppState();

  // ── KPI computation ───────────────────────────────────────────────────────
  const kpi: KPISummary = useMemo(() => {
    if (!state)
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        monthlyRecurring: 0,
      };

    const monthTx = state.transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() + 1 === filter.month && d.getFullYear() === filter.year
      );
    });

    const totalIncome = monthTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);

    const totalExpenses = monthTx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    const monthlyRecurring = state.recurringBills.reduce(
      (s, b) => s + b.amount,
      0
    );

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      monthlyRecurring,
    };
  }, [state, filter]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (state === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#fafafa] dark:bg-[#090d16]">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
          <span className="text-sm font-medium">Loading data...</span>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-[#fafafa] dark:bg-[#090d16]">
      {/* ── Edit Transaction Modal ────────────────────────────────────────── */}
      <EditTransactionModal
        transaction={editingTx}
        onClose={() => setEditingTx(null)}
        onSave={(updated) => {
          updateTransaction(updated);
          setEditingTx(null);
        }}
      />
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        selectedMonth={filter.month}
        selectedYear={filter.year}
        onChangeFilter={(month, year) =>
          setFilter((f) => ({ ...f, month, year }))
        }
      />

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── KPI Cards ─────────────────────────────────────────────────── */}
        <KPICards summary={kpi} />

        {/* ── Two-column zone: Input + Budget/Bills on desktop ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Input Panel (takes 1/3 on desktop) */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Add Transaction
            </h2>
            <InputPanel onAddTransaction={addTransaction} />
          </div>

          {/* Right — Budget + Bills stacked (takes 2/3 on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Budget &amp; Bills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BudgetAlerts
                budgetCaps={state.budgetCaps}
                transactions={state.transactions}
                onUpsertCap={upsertBudgetCap}
                onRemoveCap={removeBudgetCap}
                selectedMonth={filter.month}
                selectedYear={filter.year}
              />
              <RecurringBills
                bills={state.recurringBills}
                onAddBill={addBill}
                onUpdateStatus={updateBillStatus}
                onRemoveBill={removeBill}
              />
            </div>
          </div>
        </div>

        {/* ── Transaction Table (full width) ────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Transaction History
          </h2>
          <TransactionTable
            transactions={state.transactions}
            filter={filter}
            onRemoveTransaction={removeTransaction}
            onEditTransaction={(tx) => setEditingTx(tx)}
          />
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-12 py-4 text-center text-xs text-slate-400 dark:text-slate-600">
        © {new Date().getFullYear()} SmartFinance AI - All rights reserved.
      </footer>
    </div>
  );
}
