"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  PenLine,
  Zap,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../types";
import type { Transaction, Category } from "../types";
import { genId, parseNaturalText } from "../lib/utils";
import type { NLPEntry } from "../lib/utils";

interface InputPanelProps {
  onAddTransaction: (tx: Transaction) => void;
}

type TabId = "nlp" | "manual";

export default function InputPanel({ onAddTransaction }: InputPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("manual");

  // ── NLP state ─────────────────────────────────────────────────────────────
  const [nlpText, setNlpText] = useState("");
  const [nlpParsed, setNlpParsed] = useState<NLPEntry[]>([]);

  // ── Manual form state ─────────────────────────────────────────────────────
  // date is initialised empty and set on mount to avoid SSR/client mismatch
  const [manualForm, setManualForm] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    category: "Food" as Category,
    date: "",
    note: "",
  });

  // Sync today's date after mount (client-only)
  useEffect(() => {
    setManualForm((f) => ({ ...f, date: new Date().toISOString().split("T")[0] }));
  }, []);
  const [manualSuccess, setManualSuccess] = useState(false);

  // ── NLP handler: local parsing (no external API) ─────────────────────────
  const handleParseNLP = () => {
    if (!nlpText.trim()) return;
    const parsed = parseNaturalText(nlpText);
    setNlpParsed(parsed);
  };

  const handleAddNLPEntries = () => {
    const today = new Date().toISOString().split("T")[0];
    nlpParsed.forEach((entry) => {
      onAddTransaction({
        id: genId(),
        type: entry.type,
        amount: entry.amount,
        category: entry.category,
        date: today,
        note: entry.note,
        createdAt: new Date().toISOString(),
      });
    });
    setNlpText("");
    setNlpParsed([]);
  };

  // ── Manual form handler ───────────────────────────────────────────────────
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(
      manualForm.amount.replace(/\./g, "").replace(",", ".")
    );
    if (!amount || amount <= 0) return;

    onAddTransaction({
      id: genId(),
      type: manualForm.type,
      amount,
      category: manualForm.category,
      date: manualForm.date,
      note: manualForm.note,
      createdAt: new Date().toISOString(),
    });

    setManualForm((f) => ({
      ...f,
      amount: "",
      note: "",
      date: new Date().toISOString().split("T")[0], // safe: runs only on client
    }));
    setManualSuccess(true);
    setTimeout(() => setManualSuccess(false), 2000);
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    {
      id: "manual",
      label: "Manual",
      icon: <PenLine className="w-3.5 h-3.5" />,
    },
    {
      id: "nlp",
      label: "Free Text",
      icon: <MessageSquare className="w-3.5 h-3.5" />,
    },
  ];

  const availableCategories =
    manualForm.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden shadow-sm">
      {/* Tab Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors flex-1 justify-center ${
              activeTab === tab.id
                ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 bg-white dark:bg-slate-800/80"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">

        {/* ── Manual Form ──────────────────────────────────────────────── */}
        {activeTab === "manual" && (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            {/* Tipe toggle */}
            <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
              {(["expense", "income"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setManualForm((f) => ({
                      ...f,
                      type: t,
                      category: t === "income" ? "Salary" : "Food",
                    }))
                  }
                  className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                    manualForm.type === t
                      ? t === "expense"
                        ? "bg-rose-500 text-white"
                        : "bg-emerald-500 text-white"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {t === "expense" ? "Expense" : "Income"}
                </button>
              ))}
            </div>

            {/* Jumlah */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Amount (Rp)
              </label>
              <input
                type="number"
                min="1"
                required
                value={manualForm.amount}
                onChange={(e) =>
                  setManualForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="25000"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
              />
            </div>

            {/* Kategori + Tanggal */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={manualForm.category}
                  onChange={(e) =>
                    setManualForm((f) => ({
                      ...f,
                      category: e.target.value as Category,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={manualForm.date}
                  onChange={(e) =>
                    setManualForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Note
              </label>
              <input
                type="text"
                value={manualForm.note}
                onChange={(e) =>
                  setManualForm((f) => ({ ...f, note: e.target.value }))
                }
                placeholder="Transaction description..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
            >
              {manualSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Added!
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" /> Add Transaction
                </>
              )}
            </button>
          </form>
        )}

        {/* ── Free Text Mode ────────────────────────────────────────────── */}
        {activeTab === "nlp" && (
          <div className="space-y-3">
            {/* Info hint */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
              <div className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
                <p>
                  Type transactions in natural language separate each entry with a{" "}
                  <strong>comma</strong> or <strong>new line</strong>.
                  Supports English and Indonesian.
                </p>
                <p className="opacity-80">
                  <strong>Expenses:</strong>{" "}
                  <em>lunch 25rb, taxi 15rb, bought book 50rb</em>
                </p>
                <p className="opacity-80">
                  <strong>Income:</strong>{" "}
                  <em>salary this month 5jt, received bonus 500rb</em>
                </p>
                <p className="opacity-80">
                  <strong>Mixed:</strong>{" "}
                  <em>salary 4jt, groceries 80k, netflix 54000</em>
                </p>
              </div>
            </div>

            <textarea
              value={nlpText}
              onChange={(e) => {
                setNlpText(e.target.value);
                // Live parse as user types
                if (e.target.value.trim()) {
                  setNlpParsed(parseNaturalText(e.target.value));
                } else {
                  setNlpParsed([]);
                }
              }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleParseNLP();
                }
              }}
              placeholder="Type your transactions here..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 resize-none"
            />

            {/* Live parse preview */}
            {nlpParsed.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Preview — {nlpParsed.length} detected
                </p>
                {nlpParsed.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {entry.note || "—"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {entry.category} &middot;{" "}
                        <span
                          className={
                            entry.type === "income"
                              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-rose-500 font-semibold"
                          }
                        >
                          {entry.type === "income" ? "Income" : "Expense"}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold shrink-0 ml-3 ${
                        entry.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-500"
                      }`}
                    >
                      {entry.type === "income" ? "+" : "−"}Rp{" "}
                      {entry.amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}

                <button
                  onClick={handleAddNLPEntries}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
                >
                  <PlusCircle className="w-4 h-4" /> Add All ({nlpParsed.length})
                </button>
              </div>
            )}

            {/* Nothing detected */}
            {nlpParsed.length === 0 && nlpText.trim().length > 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
                No amounts detected. Make sure you include numbers like{" "}
                <em>25rb</em>, <em>2jt</em>, <em>150000</em>, or <em>50k</em>.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
