"use client";

import React, { useState, useMemo } from "react";
import {
  Table2,
  Download,
  Printer,
  Trash2,
  Pencil,
  TrendingUp,
  TrendingDown,
  Filter,
} from "lucide-react";
import { CATEGORIES } from "../types";
import type { Transaction, Category, FilterState } from "../types";
import {
  formatRupiah,
  getMonthName,
  exportCSV,
  printPDF,
} from "../lib/utils";

interface TransactionTableProps {
  transactions: Transaction[];
  filter: FilterState;
  onRemoveTransaction: (id: string) => void;
  onEditTransaction: (tx: Transaction) => void;
}

export default function TransactionTable({
  transactions,
  filter,
  onRemoveTransaction,
  onEditTransaction,
}: TransactionTableProps) {
  const [categoryFilter, setCategoryFilter] = useState<Category | "All">("All");

  // ── Filter by month/year/category ─────────────────────────────────────────
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      const matchMonth = d.getMonth() + 1 === filter.month;
      const matchYear = d.getFullYear() === filter.year;
      const matchCat =
        categoryFilter === "All" || t.category === categoryFilter;
      return matchMonth && matchYear && matchCat;
    });
  }, [transactions, filter, categoryFilter]);

  // ── Export handlers ────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    exportCSV(
      filtered,
      `transactions_${getMonthName(filter.month)}_${filter.year}.csv`
    );
  };

  const handlePrintPDF = () => {
    const title = `Summary — ${getMonthName(filter.month)} ${filter.year}`;
    const rows = filtered
      .map(
        (t) => `
        <tr>
          <td>${t.date}</td>
          <td>${t.type === "income" ? "Income" : "Expense"}</td>
          <td>${t.category}</td>
          <td class="right">${formatRupiah(t.amount)}</td>
          <td>${t.note}</td>
        </tr>`
      )
      .join("");

    const totalIncome = filtered
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = filtered
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    const html = `
      <h1>${title}</h1>
      <p style="color:#666">Exported on ${new Date().toLocaleString("en-GB")}</p>
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Type</th><th>Category</th>
            <th class="right">Amount</th><th>Note</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr style="background:#f0f0f0;font-weight:bold">
            <td colspan="3">Total Income</td>
            <td class="right">${formatRupiah(totalIncome)}</td><td></td>
          </tr>
          <tr style="background:#f0f0f0;font-weight:bold">
            <td colspan="3">Total Expenses</td>
            <td class="right">${formatRupiah(totalExpense)}</td><td></td>
          </tr>
          <tr style="background:#e8e8e8;font-weight:bold">
            <td colspan="3">Net Balance</td>
            <td class="right">${formatRupiah(totalIncome - totalExpense)}</td><td></td>
          </tr>
        </tfoot>
      </table>
    `;
    printPDF(title, html);
  };

  const totalIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Summary — {getMonthName(filter.month)} {filter.year}
          </h2>
          <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
            {filtered.length} transactions
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={handlePrintPDF}
            title="Print PDF"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 overflow-x-auto">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        {(["All", ...CATEGORIES] as (Category | "All")[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`shrink-0 text-xs px-2.5 py-1 rounded-full transition-colors font-medium ${
              categoryFilter === c
                ? "bg-indigo-500 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Totals row */}
      <div className="px-4 py-2 grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-1.5 text-xs">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-slate-500 dark:text-slate-400">In:</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatRupiah(totalIncome)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-slate-500 dark:text-slate-400">Out:</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {formatRupiah(totalExpense)}
          </span>
        </div>
      </div>

      {/* Table — horizontal scroll on mobile */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-10">
            No transactions found for this period.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Date
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Category
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Amount
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Note
                </th>
                {/* Actions column */}
                <th className="w-16 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                >
                  {/* Date */}
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">
                    {new Date(t.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>

                  {/* Category badge */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        t.type === "income"
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {t.category}
                    </span>
                  </td>

                  {/* Amount */}
                  <td
                    className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${
                      t.type === "income"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatRupiah(t.amount)}
                  </td>

                  {/* Note */}
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[180px] truncate">
                    {t.note || <span className="text-slate-400">—</span>}
                  </td>

                  {/* Actions: Edit + Delete — visible on hover */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditTransaction(t)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                        aria-label="Edit transaction"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveTransaction(t.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                        aria-label="Delete transaction"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
