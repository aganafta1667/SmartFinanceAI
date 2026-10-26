"use client";

import React, { useState, useEffect } from "react";
import {
  RepeatIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
} from "lucide-react";
import { EXPENSE_CATEGORIES } from "../types";
import type { RecurringBill, Category } from "../types";
import { genId, formatRupiah } from "../lib/utils";

interface RecurringBillsProps {
  bills: RecurringBill[];
  onAddBill: (bill: RecurringBill) => void;
  onUpdateStatus: (id: string, status: RecurringBill["status"]) => void;
  onRemoveBill: (id: string) => void;
}

export default function RecurringBills({
  bills,
  onAddBill,
  onUpdateStatus,
  onRemoveBill,
}: RecurringBillsProps) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    dueDay: "1",
    category: "Bills" as Category,
  });

  // today's day-of-month — initialised to 0 to match SSR (no date dependency),
  // then set to the real value after mount to avoid hydration mismatch
  const [today, setToday] = useState(0);
  useEffect(() => {
    setToday(new Date().getDate());
  }, []);

  const handleAdd = () => {
    const amount = parseFloat(form.amount.replace(/\./g, "").replace(",", "."));
    if (!form.name.trim() || !amount || amount <= 0) return;
    onAddBill({
      id: genId(),
      name: form.name,
      amount,
      dueDay: parseInt(form.dueDay, 10),
      status: "upcoming",
      category: form.category,
    });
    setForm({ name: "", amount: "", dueDay: "1", category: "Bills" });
    setAdding(false);
  };

  const totalRecurring = bills.reduce((s, b) => s + b.amount, 0);
  const paidCount = bills.filter((b) => b.status === "paid").length;

  const getStatusBadge = (bill: RecurringBill) => {
    if (bill.status === "paid")
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" /> Paid
        </span>
      );
    const daysLeft = bill.dueDay - today;
    if (daysLeft < 0 || bill.status === "overdue")
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" /> Overdue
        </span>
      );
    if (daysLeft <= 3)
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" /> {daysLeft}d left
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
        <Clock className="w-3 h-3" /> Day {bill.dueDay}
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <RepeatIcon className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Recurring Bills
          </h2>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* Summary bar */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{paidCount}/{bills.length} Paid</span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Total: {formatRupiah(totalRecurring)}/mo
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Add form */}
        {adding && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 space-y-2">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              New Bill
            </p>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Bill name (e.g. Rent)"
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="1"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="Amount (Rp)"
                className="col-span-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400"
              />
              <input
                type="number"
                min="1"
                max="31"
                value={form.dueDay}
                onChange={(e) => setForm((f) => ({ ...f, dueDay: e.target.value }))}
                placeholder="Due day"
                className="col-span-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400"
              />
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                className="col-span-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setAdding(false)}
                className="flex-1 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Bill list */}
        {bills.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
            No recurring bills yet.
          </p>
        ) : (
          <div className="space-y-2">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {bill.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatRupiah(bill.amount)} &middot; {bill.category}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {getStatusBadge(bill)}

                  {/* Toggle paid/upcoming */}
                  <button
                    onClick={() =>
                      onUpdateStatus(
                        bill.id,
                        bill.status === "paid" ? "upcoming" : "paid"
                      )
                    }
                    className="text-slate-400 hover:text-emerald-500 transition-colors"
                    title={bill.status === "paid" ? "Mark as unpaid" : "Mark as paid"}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onRemoveBill(bill.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
