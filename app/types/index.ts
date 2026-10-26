// ─── Core Domain Types ────────────────────────────────────────────────────────

export type TransactionType = "income" | "expense";

export type Category =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Entertainment"
  | "Health"
  | "Education"
  | "Bills"
  | "Salary"
  | "Investment"
  | "Other";

export const CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Bills",
  "Salary",
  "Investment",
  "Other",
];

export const EXPENSE_CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Bills",
  "Other",
];

export const INCOME_CATEGORIES: Category[] = ["Salary", "Investment", "Other"];

// ─── Transaction ──────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  date: string; // ISO date string: "YYYY-MM-DD"
  note: string;
  createdAt: string; // ISO timestamp
}

// ─── Budget Cap ───────────────────────────────────────────────────────────────

export interface BudgetCap {
  category: Category;
  limit: number; // in Rupiah
}

// ─── Recurring Bill ──────────────────────────────────────────────────────────

export type BillStatus = "paid" | "upcoming" | "overdue";

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // day of month (1–31)
  status: BillStatus;
  category: Category;
}

// ─── App State (persisted to LocalStorage) ───────────────────────────────────

export interface AppState {
  transactions: Transaction[];
  budgetCaps: BudgetCap[];
  recurringBills: RecurringBill[];
}

// ─── Filter / View State ─────────────────────────────────────────────────────

export interface FilterState {
  month: number; // 1–12
  year: number;
  category: Category | "All";
}

// ─── Parsed NLP entry ────────────────────────────────────────────────────────

export interface ParsedEntry {
  note: string;
  amount: number;
  category: Category;
}

// ─── KPI Summary ─────────────────────────────────────────────────────────────

export interface KPISummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  monthlyRecurring: number;
}
