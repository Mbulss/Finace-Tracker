/**
 * Parsing teks struk/transfer dengan regex (fallback saja).
 * Satu urutan pola jelas, ambil angka pertama yang cocok.
 */
export type ParsedReceipt = {
  amount: number;
  type: "income" | "expense";
  category: string;
  note: string;
};

const EXPENSE_KEYWORDS = [
  "belanja", "pembayaran", "transfer keluar", "debit", "total", "bayar",
  "pembelian", "struk", "market", "shop", "payment", "successful", "transfer",
];
const INCOME_KEYWORDS = ["transfer masuk", "kredit", "terima", "gaji", "salary", "deposit"];

function parseAmountRaw(s: string): number | null {
  const cleaned = s.replace(/[Rp\s]/gi, "").trim();
  if (!cleaned) return null;
  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");
  let num: number;
  if (hasDot && !hasComma) {
    num = parseInt(cleaned.replace(/\./g, ""), 10);
    if (Number.isNaN(num)) num = parseFloat(cleaned);
  } else if (hasComma && !hasDot) {
    const parts = cleaned.split(",");
    if (parts.length === 2 && parts[1].length <= 2) num = parseFloat(cleaned.replace(",", "."));
    else num = parseInt(cleaned.replace(/,/g, ""), 10);
  } else {
    num = parseInt(cleaned.replace(/\./g, "").replace(/,/g, ""), 10) || parseFloat(cleaned.replace(/,/g, "."));
  }
  if (Number.isNaN(num) || num <= 0 || num >= 1e15) return null;
  return num;
}

/**
 * Cari nominal: cek pola satu per satu (urutan prioritas), kembalikan angka pertama yang valid.
 * Tidak pakai "angka terbesar" atau filter rumit — cukup pola yang jelas.
 */
function extractAmount(text: string): number | null {
  const n = " " + text.replace(/\s+/g, " ").trim() + " ";
  const patterns: RegExp[] = [
    /Total\s+Amount\s*:?\s*([\d.,]+)/i,
    /Grand\s+Total\s*:?\s*([\d.,]+)/i,
    /(?:^|\s)TOTAL\s*:?\s*[\sRp]*([\d.,]+)/i,
    /(?:^|\s)(?:\d+\s+)?Total\s*:?\s*[\sRp]*([\d.,]+)/i, // "Total 92.400" atau "4 Total 92.400", bukan Subtotal
    /HARGA\s+JUAL\s*:?\s*([\d.,]+)/i,
    /TUNAI\s*:?\s*([\d.,]+)/i,
    /IDR\s*([\d.,]+)/i,
    /(?:^|\s)(?:Total|Nominal|Jumlah)\s*:?\s*[\sRp]*([\d.,]+)/i,
    /Transfer\s+Successful[^\d]*([\d.,]+)/i,
    /Rp\s*([\d.,]+)/,
  ];
  for (const re of patterns) {
    const m = n.match(re);
    if (m) {
      const num = parseAmountRaw(m[1] ?? "");
      if (num !== null && num >= 100) return num;
    }
  }
  const ribuan = n.match(/(\d{1,3}(?:\.\d{3})+(?:,\d+)?)/g);
  if (ribuan?.length) {
    const nums = ribuan.map((s) => parseAmountRaw(s)).filter((x): x is number => x !== null && x >= 100);
    if (nums.length) return Math.max(...nums);
  }
  return null;
}

function guessType(text: string): "income" | "expense" {
  const lower = text.toLowerCase();
  for (const k of INCOME_KEYWORDS) if (lower.includes(k)) return "income";
  for (const k of EXPENSE_KEYWORDS) if (lower.includes(k)) return "expense";
  return "expense";
}

function buildNote(text: string): string {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  // Transfer bank → "Transfer BCA"
  if (/bca|mandiri|bni|bri|transfer/i.test(text)) {
    const bank = (text.match(/(BCA|Mandiri|BNI|BRI|Bank\s+\w+)/i) ?? [])[0] ?? "";
    if (bank) return `Transfer ${bank}`.trim().slice(0, 60);
  }

  // Cari nama toko/merchant dari baris awal (skip noise)
  const isNoise = (l: string) =>
    /^\*|^=|^-{3}|^\d{2}[.\/\-]|^\d{1,2}:\d{2}|^(jl|jalan|npwp|telp|tel|phone|fax|email|www|sms|call|table|guest|meja|monday|tuesday|wednesday|thursday|friday|saturday|sunday|senin|selasa|rabu|kamis|jumat|sabtu|minggu)\b/i.test(l)
    || /^\d+$/.test(l) || l.length < 3 || /^[A-Z0-9]{8,}$/.test(l);

  for (let i = 0; i < Math.min(6, lines.length); i++) {
    if (isNoise(lines[i])) continue;
    if (lines[i].length > 60) continue;
    return lines[i].replace(/@/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  }

  return lines[0]?.slice(0, 60) || "Dari foto";
}

const CATEGORIES = {
  expense: ["Food", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Other"],
  income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
} as const;

export function parseReceiptText(text: string): ParsedReceipt | null {
  const trimmed = text.trim();
  if (trimmed.length < 3) return null;
  const amount = extractAmount(trimmed);
  if (!amount || amount < 100) return null;
  const type = guessType(trimmed);
  const categories = type === "income" ? CATEGORIES.income : CATEGORIES.expense;
  const note = buildNote(trimmed);
  return { amount, type, category: categories[0], note };
}
