/**
 * POST /api/parse-expenses
 *
 * Server-side proxy ke IBM Bob Inference API (OpenAI-compatible).
 * API key TIDAK pernah dikirim ke browser — hanya dipakai di server ini.
 *
 * Request body : { text: string }
 * Response body: { entries: ParsedEntry[] }
 *
 * ParsedEntry: { note, amount, category, type }
 */

import { NextRequest, NextResponse } from "next/server";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ParsedEntry {
  note: string;
  amount: number;
  category: string;
  type: "income" | "expense";
}

// ── Known app categories ──────────────────────────────────────────────────────

const VALID_CATEGORIES = [
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
] as const;

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a smart financial assistant for an expense tracker application.

Your task: extract ALL financial transactions from the free-form text provided by the user.

For each transaction, determine:
- "note": short description of the transaction (clean text, no numbers)
- "amount": amount in Rupiah as a whole integer (no symbols, no separators)
  Conversion: "rb"/"ribu"/"k" = ×1,000 | "jt"/"juta" = ×1,000,000
- "category": MUST be one of: Food, Transport, Shopping, Entertainment, Health, Education, Bills, Salary, Investment, Other
- "type": "expense" for spending, "income" for earnings

Return ONLY a valid JSON array, no other text, no markdown code fence.
Format: [{"note":"...","amount":25000,"category":"Food","type":"expense"},...]

If no transactions can be extracted, return: []`;

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Ambil env vars ────────────────────────────────────────────────────
  const apiKey = process.env.IBM_BOB_API_KEY;
  const baseUrl = process.env.IBM_BOB_BASE_URL;
  const model = process.env.IBM_BOB_MODEL ?? "ibm/granite-3-3-8b-instruct";

  // Jika IBM_BOB_BASE_URL tidak diset, gunakan URL publik standar IBM Bob
  const resolvedBaseUrl = baseUrl ?? "https://api.bob.ibm.com";

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "IBM_BOB_API_KEY belum diset di .env.local. Paste nilai 'apikey' dari JSON yang diberikan IBM Bob.",
      },
      { status: 500 }
    );
  }

  // ── 2. Parse request body ────────────────────────────────────────────────
  let text: string;
  try {
    const body = await req.json();
    text = (body.text ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Request body tidak valid." }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: "Field 'text' tidak boleh kosong." }, { status: 400 });
  }

  // ── 3. Panggil IBM Bob inference API ─────────────────────────────────────
  const endpoint = `${resolvedBaseUrl.replace(/\/$/, "")}/v1/chat/completions`;

  let raw: string;
  try {
    const ibmRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        temperature: 0.1,   // rendah = output deterministik & konsisten
        max_tokens: 1024,
      }),
    });

    if (!ibmRes.ok) {
      const errText = await ibmRes.text();
      console.error("[parse-expenses] IBM Bob error:", ibmRes.status, errText);
      return NextResponse.json(
        { error: `IBM Bob API error ${ibmRes.status}: ${errText.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const ibmJson = await ibmRes.json();
    raw = ibmJson.choices?.[0]?.message?.content ?? "[]";
  } catch (err) {
    console.error("[parse-expenses] Fetch failed:", err);
    return NextResponse.json(
      { error: "Tidak dapat terhubung ke IBM Bob API. Periksa koneksi dan base URL." },
      { status: 502 }
    );
  }

  // ── 4. Parse & validasi JSON dari model ──────────────────────────────────
  let entries: ParsedEntry[] = [];
  try {
    // Model terkadang membungkus dalam ```json ... ``` — strip itu
    const cleaned = raw
      .replace(/```(?:json)?/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error("Bukan array");

    entries = parsed
      .filter(
        (item): item is Record<string, unknown> =>
          item !== null && typeof item === "object"
      )
      .map((item) => ({
        note: String(item.note ?? "").trim() || "Transaction",
        amount: Math.max(0, Math.round(Number(item.amount) || 0)),
        category: VALID_CATEGORIES.includes(item.category as never)
          ? String(item.category)
          : "Other",
        type: (
          item.type === "income" || item.type === "expense"
            ? item.type
            : "expense"
        ) as "income" | "expense",
      }))
      // Buang entry dengan amount 0
      .filter((e) => e.amount > 0);
  } catch (err) {
    console.error("[parse-expenses] JSON parse failed. Raw:", raw, err);
    return NextResponse.json(
      {
        error:
          "AI menghasilkan format yang tidak bisa diparsing. Coba tulis ulang teks dengan lebih jelas.",
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ entries });
}
