"use client";

// ─── Utility helpers ─────────────────────────────────────────────────────────

/**
 * Generate a short random ID for new records.
 */
export function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/**
 * Format a number as Indonesian Rupiah (Rp 1.000.000).
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse a natural-language note (English + Indonesian).
 * Detects amount, category, AND transaction type (income/expense).
 *
 * Examples:
 *   "lunch 25rb"                → expense, Food,      25000
 *   "salary this month 5jt"    → income,  Salary,    5000000
 *   "received bonus 500rb"     → income,  Salary,    500000
 *   "electricity bill 200rb"   → expense, Bills,     200000
 */
import type { ParsedEntry, Category } from "../types";

// ── Keyword → category (Indonesian + English) ───────────────────────────────
const CATEGORY_KEYWORDS: Record<string, Category> = {
  // Food & Drink — ID
  makan: "Food", minum: "Food", kopi: "Food",
  cafe: "Food", restoran: "Food", warung: "Food",
  nasi: "Food", bakso: "Food", mie: "Food",
  // Food & Drink — EN
  food: "Food", lunch: "Food", dinner: "Food",
  breakfast: "Food", coffee: "Food", restaurant: "Food",
  snack: "Food", drink: "Food", meal: "Food",
  groceries: "Food", grocery: "Food",

  // Transport — ID
  ojek: "Transport", taksi: "Transport", grab: "Transport",
  gojek: "Transport", bensin: "Transport", bbm: "Transport",
  bus: "Transport", kereta: "Transport", parkir: "Transport",
  // Transport — EN
  taxi: "Transport", transport: "Transport", fuel: "Transport",
  gasoline: "Transport", gas: "Transport", train: "Transport",
  commute: "Transport", uber: "Transport", parking: "Transport",
  flight: "Transport", ticket: "Transport",

  // Shopping — ID
  beli: "Shopping", belanja: "Shopping", mall: "Shopping",
  toko: "Shopping", shopee: "Shopping", tokopedia: "Shopping",
  // Shopping — EN
  shopping: "Shopping", bought: "Shopping", purchase: "Shopping",
  amazon: "Shopping", shop: "Shopping", clothes: "Shopping",

  // Entertainment — ID
  bioskop: "Entertainment", film: "Entertainment", game: "Entertainment",
  netflix: "Entertainment", spotify: "Entertainment", youtube: "Entertainment",
  // Entertainment — EN
  movie: "Entertainment", cinema: "Entertainment", entertainment: "Entertainment",
  gaming: "Entertainment", subscription: "Entertainment", streaming: "Entertainment",

  // Health — ID
  obat: "Health", dokter: "Health", apotek: "Health",
  rs: "Health", "rumah sakit": "Health",
  // Health — EN
  medicine: "Health", doctor: "Health", pharmacy: "Health",
  hospital: "Health", clinic: "Health", health: "Health",
  medical: "Health", gym: "Health",

  // Education — ID
  sekolah: "Education", kursus: "Education",
  buku: "Education", kuliah: "Education",
  // Education — EN
  school: "Education", course: "Education", book: "Education",
  college: "Education", tuition: "Education", education: "Education",
  class: "Education", lesson: "Education",

  // Bills — ID
  listrik: "Bills", pln: "Bills", air: "Bills",
  internet: "Bills", pulsa: "Bills", telepon: "Bills",
  sewa: "Bills", kos: "Bills",
  // Bills — EN
  electricity: "Bills", water: "Bills", phone: "Bills",
  rent: "Bills", bill: "Bills", utility: "Bills",
  wifi: "Bills", hosting: "Bills", insurance: "Bills",

  // Salary / Income — ID+EN
  gaji: "Salary", salary: "Salary", bonus: "Salary",
  upah: "Salary", honor: "Salary", freelance: "Salary",
  wage: "Salary", paycheck: "Salary", stipend: "Salary",
  commission: "Salary", income: "Salary",

  // Investment — ID+EN
  investasi: "Investment", saham: "Investment",
  reksa: "Investment", dividen: "Investment", bunga: "Investment",
  investment: "Investment", dividend: "Investment", stock: "Investment",
  crypto: "Investment", interest: "Investment",
};

// ── Income keywords (Indonesian + English) ───────────────────────────────────
const INCOME_KEYWORDS = [
  // ID
  "gaji", "bonus", "upah", "honor", "honorarium", "freelance",
  "terima", "dapat", "dapet", "masuk", "transfer masuk",
  "pendapatan", "penghasilan", "hasil", "untung", "profit",
  "dividen", "bunga", "investasi", "saham", "reksa", "nabung",
  "tabungan", "cashback", "refund", "kembali", "bayar balik",
  // EN
  "salary", "income", "received", "receive", "earned", "earn",
  "payment received", "got paid", "wage", "paycheck", "stipend",
  "commission", "dividend", "interest", "revenue", "profit",
  "investment return", "reimbursement", "allowance", "tip",
];

function detectType(text: string): "income" | "expense" {
  const lower = text.toLowerCase();
  if (INCOME_KEYWORDS.some((kw) => lower.includes(kw))) return "income";
  return "expense";
}

function detectCategory(text: string): Category {
  const lower = text.toLowerCase();
  for (const [kw, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(kw)) return cat;
  }
  return "Other";
}

/**
 * Parse rupiah shorthand: "25rb" → 25000, "1,5jt" → 1500000, "500k" → 500000
 */
function parseAmount(raw: string): number {
  // Handle "1.500.000" format → strip thousand separators first
  const noThousands = raw.replace(/(\d)\.(\d{3})/g, "$1$2");
  const cleaned = noThousands.replace(/,/g, ".");
  const jt = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:jt|juta)/i);
  if (jt) return Math.round(parseFloat(jt[1]) * 1_000_000);
  const rb = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:rb|ribu|k)/i);
  if (rb) return Math.round(parseFloat(rb[1]) * 1_000);
  const plain = cleaned.match(/(\d+)/);
  if (plain) return parseInt(plain[1], 10);
  return 0;
}

export interface NLPEntry {
  note: string;
  amount: number;
  category: Category;
  type: "income" | "expense";
}

export function parseNaturalText(text: string): NLPEntry[] {
  // Split on comma or newline
  const segments = text.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
  const results: NLPEntry[] = [];

  for (const seg of segments) {
    // Find amount in segment
    const amountMatch = seg.match(/(\d[\d.,]*\s*(?:jt|juta|rb|ribu|k)?)\b/i);
    const amount = amountMatch ? parseAmount(amountMatch[0]) : 0;
    if (amount <= 0) continue;

    // Strip digits from the note text
    const note = seg
      .replace(/\d[\d.,]*\s*(?:jt|juta|rb|ribu|k)?\b/i, "")
      .replace(/\s+/g, " ")
      .trim();

    const type = detectType(seg);
    const category = detectCategory(seg);

    // For income, fall back to Salary if no specific category matched
    const finalCategory =
      type === "income" && category === "Other"
        ? "Salary"
        : category;

    results.push({ note: note || seg, amount, category: finalCategory, type });
  }

  return results;
}

/**
 * Get month name in English.
 */
const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function getMonthName(month: number): string {
  return MONTHS_EN[month - 1] ?? "";
}

/**
 * Export transactions as a CSV string and trigger browser download.
 */
import type { Transaction } from "../types";

export function exportCSV(transactions: Transaction[], filename = "transactions.csv"): void {
  const header = ["ID", "Date", "Type", "Category", "Amount", "Note"];
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.type,
    t.category,
    t.amount,
    `"${t.note.replace(/"/g, '""')}"`,
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print a clean PDF-ready summary via browser print dialog.
 */
export function printPDF(title: string, html: string): void {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 32px; color: #111; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
        th { background: #f0f0f0; }
        .right { text-align: right; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}
