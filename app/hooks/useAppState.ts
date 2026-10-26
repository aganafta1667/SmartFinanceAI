"use client";

import { useState, useEffect, useCallback } from "react";
import type { AppState, Transaction, BudgetCap, RecurringBill } from "../types";

// ─── Default seed data ────────────────────────────────────────────────────────

const DEFAULT_STATE: AppState = {
  transactions: [],
  budgetCaps: [
    { category: "Food", limit: 1_000_000 },
    { category: "Transport", limit: 500_000 },
    { category: "Entertainment", limit: 300_000 },
    { category: "Shopping", limit: 800_000 },
  ],
  recurringBills: [
    {
      id: "bill-1",
      name: "House Rent",
      amount: 1_500_000,
      dueDay: 1,
      status: "upcoming",
      category: "Bills",
    },
    {
      id: "bill-2",
      name: "Internet",
      amount: 350_000,
      dueDay: 15,
      status: "upcoming",
      category: "Bills",
    },
    {
      id: "bill-3",
      name: "Netflix",
      amount: 54_000,
      dueDay: 20,
      status: "paid",
      category: "Entertainment",
    },
    {
      id: "bill-4",
      name: "Spotify",
      amount: 54_990,
      dueDay: 25,
      status: "upcoming",
      category: "Entertainment",
    },
  ],
};

const STORAGE_KEY = "smartfinance_v2";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppState() {
  // Start with null to avoid hydration mismatch — populated after mount
  const [state, setState] = useState<AppState | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: AppState = JSON.parse(raw);
        setState(parsed);
      } else {
        setState(DEFAULT_STATE);
      }
    } catch {
      setState(DEFAULT_STATE);
    }
  }, []);

  // Persist to LocalStorage whenever state changes
  useEffect(() => {
    if (state !== null) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Quota exceeded or private mode — silently ignore
      }
    }
  }, [state]);

  // ── Transactions ────────────────────────────────────────────────────────────

  const addTransaction = useCallback((tx: Transaction) => {
    setState((prev) =>
      prev
        ? { ...prev, transactions: [tx, ...prev.transactions] }
        : { ...DEFAULT_STATE, transactions: [tx] }
    );
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setState((prev) =>
      prev
        ? {
            ...prev,
            transactions: prev.transactions.filter((t) => t.id !== id),
          }
        : prev
    );
  }, []);

  const updateTransaction = useCallback((updated: Transaction) => {
    setState((prev) =>
      prev
        ? {
            ...prev,
            transactions: prev.transactions.map((t) =>
              t.id === updated.id ? updated : t
            ),
          }
        : prev
    );
  }, []);

  // ── Budget Caps ─────────────────────────────────────────────────────────────

  const upsertBudgetCap = useCallback((cap: BudgetCap) => {
    setState((prev) => {
      if (!prev) return prev;
      const existing = prev.budgetCaps.findIndex(
        (b) => b.category === cap.category
      );
      const updated =
        existing >= 0
          ? prev.budgetCaps.map((b, i) => (i === existing ? cap : b))
          : [...prev.budgetCaps, cap];
      return { ...prev, budgetCaps: updated };
    });
  }, []);

  const removeBudgetCap = useCallback((category: string) => {
    setState((prev) =>
      prev
        ? {
            ...prev,
            budgetCaps: prev.budgetCaps.filter(
              (b) => b.category !== category
            ),
          }
        : prev
    );
  }, []);

  // ── Recurring Bills ─────────────────────────────────────────────────────────

  const addBill = useCallback((bill: RecurringBill) => {
    setState((prev) =>
      prev
        ? { ...prev, recurringBills: [...prev.recurringBills, bill] }
        : { ...DEFAULT_STATE, recurringBills: [bill] }
    );
  }, []);

  const updateBillStatus = useCallback(
    (id: string, status: RecurringBill["status"]) => {
      setState((prev) =>
        prev
          ? {
              ...prev,
              recurringBills: prev.recurringBills.map((b) =>
                b.id === id ? { ...b, status } : b
              ),
            }
          : prev
      );
    },
    []
  );

  const removeBill = useCallback((id: string) => {
    setState((prev) =>
      prev
        ? {
            ...prev,
            recurringBills: prev.recurringBills.filter((b) => b.id !== id),
          }
        : prev
    );
  }, []);

  return {
    state,
    addTransaction,
    updateTransaction,
    removeTransaction,
    upsertBudgetCap,
    removeBudgetCap,
    addBill,
    updateBillStatus,
    removeBill,
  };
}
