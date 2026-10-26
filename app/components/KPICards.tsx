"use client";

import React from "react";
import { TrendingUp, TrendingDown, Wallet, RefreshCcw } from "lucide-react";
import { formatRupiah } from "../lib/utils";
import type { KPISummary } from "../types";

interface KPICardsProps {
  summary: KPISummary;
}

interface CardData {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  bg: string;
  isBalance?: boolean;
}

export default function KPICards({ summary }: KPICardsProps) {
  const cards: CardData[] = [
    {
      title: "Total Income",
      value: summary.totalIncome,
      icon: <TrendingUp className="w-5 h-5" />,
      accent: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Total Expenses",
      value: summary.totalExpenses,
      icon: <TrendingDown className="w-5 h-5" />,
      accent: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-900/20",
    },
    {
      title: "Net Balance",
      value: summary.netBalance,
      icon: <Wallet className="w-5 h-5" />,
      accent:
        summary.netBalance >= 0
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-rose-600 dark:text-rose-400",
      bg:
        summary.netBalance >= 0
          ? "bg-indigo-50 dark:bg-indigo-900/20"
          : "bg-rose-50 dark:bg-rose-900/20",
      isBalance: true,
    },
    {
      title: "Monthly Recurring",
      value: summary.monthlyRecurring,
      icon: <RefreshCcw className="w-5 h-5" />,
      accent: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4 flex flex-col gap-3 shadow-sm"
        >
          {/* Icon badge */}
          <div className={`${card.bg} ${card.accent} w-9 h-9 rounded-lg flex items-center justify-center shrink-0`}>
            {card.icon}
          </div>

          {/* Value */}
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">
              {card.title}
            </p>
            <p
              className={`text-sm sm:text-base font-bold leading-tight ${card.accent}`}
            >
              {formatRupiah(Math.abs(card.value))}
            </p>
            {card.isBalance && card.value < 0 && (
              <p className="text-xs text-rose-500 mt-0.5">Deficit</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
