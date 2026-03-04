/**
 * Simple keyword-based category detection for Telegram messages.
 * Used by both web (optional) and Telegram webhook.
 */

const EXPENSE_KEYWORDS: Record<string, string[]> = {
  Food: ["kopi", "makan", "food", "restaurant", "warung", "coffee", "lunch", "dinner", "snack"],
  Transport: ["bensin", "transport", "grab", "gojek", "taxi", "parkir", "tol", "gas"],
  Shopping: ["belanja", "shopping", "market", "mall"],
  Bills: ["listrik", "internet", "pulsa", "bills", "tagihan"],
  Health: ["obat", "dokter", "health", "apotek"],
  Entertainment: ["nonton", "game", "entertainment", "hobi"],
  Other: [],
};

const INCOME_KEYWORDS: Record<string, string[]> = {
  Salary: ["gaji", "salary", "gajian"],
  Freelance: ["freelance", "project", "client"],
  Investment: ["dividen", "investment", "saham"],
  Gift: ["gift", "hadiah", "bonus"],
  Other: [],
};

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function matchCategory(note: string, keywordsMap: Record<string, string[]>): string {
  const n = normalize(note);
  if (!n) return "Other";

  for (const [category, keywords] of Object.entries(keywordsMap)) {
    if (category === "Other") continue;
    if (keywords.some((kw) => n.includes(kw.toLowerCase()))) return category;
  }
  return "Other";
}

export function detectCategory(type: "income" | "expense", note: string): string {
  return type === "income"
    ? matchCategory(note, INCOME_KEYWORDS)
    : matchCategory(note, EXPENSE_KEYWORDS);
}
