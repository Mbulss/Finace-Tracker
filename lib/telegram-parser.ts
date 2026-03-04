/**
 * Parse Telegram message lines like:
 * -25000 kopi
 * +500000 gaji
 * -150000 bensin
 */

import { detectCategory } from "./category-rules";
import type { TransactionInsert } from "./types";

// Angka boleh pakai rb (ribu), jt (juta). Contoh: 25rb, 1jt, 500rb
const LINE_REGEX = /^\s*([+-])\s*(\d[\d.,\s]*(?:rb|jt)?)\s*(.*)$/i;

export interface ParsedLine {
  type: "income" | "expense";
  amount: number;
  note: string;
  category: string;
}

export function parseAmount(raw: string): number {
  const s = raw.trim().toLowerCase().replace(/\s/g, "");
  if (s.endsWith("jt")) {
    const num = parseFloat(s.replace(/jt$/, "").replace(/,/g, "")) || 0;
    return Math.abs(num) * 1_000_000;
  }
  if (s.endsWith("rb")) {
    const num = parseFloat(s.replace(/rb$/, "").replace(/,/g, "")) || 0;
    return Math.abs(num) * 1000;
  }
  const cleaned = raw.replace(/[.,\s]/g, "");
  return Math.abs(parseFloat(cleaned) || 0);
}

export function parseLine(line: string): ParsedLine | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const match = trimmed.match(LINE_REGEX);
  if (!match) return null;

  const [, sign, amountStr, notePart] = match;
  const type = sign === "+" ? "income" : "expense";
  const amount = parseAmount(amountStr);
  const note = (notePart || "").trim();
  const category = detectCategory(type, note);

  if (amount <= 0) return null;

  return { type, amount, note, category };
}

export function parseMessage(text: string): ParsedLine[] {
  const lines = text.split(/\n/);
  const results: ParsedLine[] = [];
  for (const line of lines) {
    const parsed = parseLine(line);
    if (parsed) results.push(parsed);
  }
  return results;
}

/** Parse "25rb sarapan" atau "50000" — dipakai saat user sudah pilih kategori. Tanda + atau - di depan diabaikan (tipe dari pilihan). */
export function parseAmountNote(line: string): { amount: number; note: string } | null {
  const trimmed = line.trim().replace(/^[+-]\s*/, ""); // buang + atau - di depan
  if (!trimmed) return null;
  const match = trimmed.match(/^\s*(\d[\d.,\s]*(?:rb|jt)?)\s*(.*)$/i);
  if (!match) return null;
  const amount = parseAmount(match[1]);
  const note = (match[2] || "").trim();
  if (amount <= 0) return null;
  return { amount, note };
}

export function toTransactionInsert(parsed: ParsedLine, userId: string): TransactionInsert {
  return {
    user_id: userId,
    type: parsed.type,
    amount: parsed.amount,
    category: parsed.category,
    note: parsed.note || parsed.category,
  };
}
