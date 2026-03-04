/**
 * Parse Telegram message lines like:
 * -25000 kopi
 * +500000 gaji
 * -150000 bensin
 */

import { detectCategory } from "./category-rules";
import type { TransactionInsert } from "./types";

const LINE_REGEX = /^\s*([+-])\s*(\d[\d.,]*)\s*(.*)$/;

export interface ParsedLine {
  type: "income" | "expense";
  amount: number;
  note: string;
  category: string;
}

export function parseAmount(raw: string): number {
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

export function toTransactionInsert(parsed: ParsedLine, userId: string): TransactionInsert {
  return {
    user_id: userId,
    type: parsed.type,
    amount: parsed.amount,
    category: parsed.category,
    note: parsed.note || parsed.category,
  };
}
