/**
 * Parse Telegram message lines like:
 * -25000 kopi / -25rb kopi / -25k ngopi
 * +500000 gaji / +500rb gaji / +0.5jt gajian
 */

import { detectCategory } from "./category-rules";
import type { TransactionInsert } from "./types";

// Angka: rb, rbu, jt, juta, k (ribu). Contoh: 25rb, 1jt, 50k, 0.5 juta
const LINE_REGEX = /^\s*([+-])\s*(\d[\d.,\s]*(?:rb[u]?|jt|juta|k)?)\s*(.*)$/i;
// Suffix untuk parseAmount: rb, rbu, jt, juta, k
const RB_PATTERN = /^([\d.,]+)\s*(?:rb[u]?|k)$/;
const JT_PATTERN = /^([\d.,]+)\s*(?:jt|juta)$/;

export interface ParsedLine {
  type: "income" | "expense";
  amount: number;
  note: string;
  category: string;
}

export function parseAmount(raw: string): number {
  const s = raw.trim().toLowerCase().replace(/\s/g, "");
  const jutaMatch = s.match(JT_PATTERN);
  if (jutaMatch) {
    const num = parseFloat(jutaMatch[1].replace(/,/g, "")) || 0;
    return Math.abs(num) * 1_000_000;
  }
  const rbMatch = s.match(RB_PATTERN);
  if (rbMatch) {
    const num = parseFloat(rbMatch[1].replace(/,/g, "")) || 0;
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

/** Parse "25rb sarapan", "50k", "1jt jajan" — dipakai saat user sudah pilih kategori. Tanda + atau - di depan diabaikan. */
export function parseAmountNote(line: string): { amount: number; note: string } | null {
  const trimmed = line.trim().replace(/^[+-]\s*/, "");
  if (!trimmed) return null;
  const match = trimmed.match(/^\s*(\d[\d.,\s]*(?:rb[u]?|jt|juta|k)?)\s*(.*)$/i);
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
