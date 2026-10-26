"use client";

import React, { useState } from "react";
import { Target, AlertTriangle, Trash2, Plus, CheckCircle } from "lucide-react";
import { EXPENSE_CATEGORIES } from "../types";
import type { BudgetCap, Category, Transaction } from "../types";
import { formatRupiah } from "../lib/utils";

interface BudgetAlertsProps {
  budgetCaps: BudgetCap[];
  transactions: Transaction[];
  onUpsertCap: (cap: BudgetCap) => void;
  onRemoveCap: (category: string) => void;
  selectedMonth: number;
  selectedYear: number;
}

export default function BudgetAlerts({
  budgetCaps,
  transactions,
  onUpsertCap,
  onRemoveCap,
  selectedMonth,
  selectedYear,
}: BudgetAlertsProps) {
  const [addingNew, setAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState<Category>("Food");
  const [newLimit, setNewLimit] = useState("");

  // Compute spending per category for the selected month
  const spending = transactions
    .filter((t) => {
      if (t.type !== "expense") return false;
      const d = new Date(t.date);
      return (
        d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear
      );
    })
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});

  const handleSaveNew = () => {
    const limit = parseFloat(newLimit.replace(/\./g, "").replace(",", "."));
    if (!limit || limit <= 0) return;
    onUpsertCap({ category: newCategory, limit });
    setNewCategory("Food");
    setNewLimit("");
    setAddingNew(false);
  };

  const getAlertLevel = (spent: number, limit: number) => {
    const pct = (spent / limit) * 100;
    if (pct >= 90) return "red";
    if (pct >= 75) return "yellow";
    return "green";
  };

  const getBarColor = (level: ReturnType<typeof getAlertLevel>) => {
    if (level === "red") return "bg-rose-500";
    if (level === "yellow") return "bg-amber-400";
    return "bg-emerald-500";
  };

  const getBadge = (level: ReturnType<typeof getAlertLevel>, pct: number) => {
    if (level === "red")
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-3 h-3" />
          {pct >= 100 ? "Exceeded!" : `${pct.toFixed(0)}%`}
        </span>
      );
    if (level === "yellow")
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-3 h-3" />
          {pct.toFixed(0)}%
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        <CheckCircle className="w-3 h-3" />
        {pct.toFixed(0)}%
      </span>
    );
  };

  const categoriesWithoutCap = EXPENSE_CATEGORIES.filter(
    (c) => !budgetCaps.find((b) => b.category === c)
  );

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Category Budgets
          </h2>
        </div>
        {!addingNew && categoriesWithoutCap.length > 0 && (
          <button
            onClick={() => {
              setNewCategory(categoriesWithoutCap[0]);
              setAddingNew(true);
            }}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Add new cap form */}
        {addingNew && (
          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 space-y-2">
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              Set New Budget
            </p>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as Category)}
                className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categoriesWithoutCap.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="Limit (Rp)"
                className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveNew}
                className="flex-1 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setAddingNew(false)}
                className="flex-1 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Budget items */}
        {budgetCaps.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
            No budgets set yet.
          </p>
        ) : (
          <div className="space-y-3">
            {budgetCaps.map((cap) => {
              const spent = spending[cap.category] ?? 0;
              const pct = Math.min((spent / cap.limit) * 100, 100);
              const level = getAlertLevel(spent, cap.limit);
              const rawPct = (spent / cap.limit) * 100;

              return (
                <div key={cap.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {cap.category}
                      </span>
                      {getBadge(level, rawPct)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatRupiah(spent)} / {formatRupiah(cap.limit)}
                      </span>
                      <button
                        onClick={() => onRemoveCap(cap.category)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                        aria-label="Remove budget"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getBarColor(level)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
