import { detectCategory } from "./category-rules";
import { type ParsedCSVRow } from "./csv-parser";

/**
 * Parses Mandiri e-Statement PDF extracted text.
 *
 * Expected line patterns from pdfjs-dist extraction:
 *
 * Description lines (can be multi-line):
 *   Top-up e-money
 *   6032982834031377
 *
 * Data line (contains signed amount, balance, time):
 *   1 -50.000,00 2.412.516,00 07:16:48 WIB
 *
 * Date line:
 *   01 Apr 2026
 *
 * Amount sign: "-" = expense, "+" or no sign = income.
 * Balance column is IGNORED (app tracks its own balance).
 */

const MONTH_MAP: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04",
  may: "05", jun: "06", jul: "07", aug: "08",
  sep: "09", oct: "10", nov: "11", dec: "12",
  // Indonesian month abbreviations
  mei: "05", agu: "08", okt: "10", des: "12",
};

const DATA_LINE_RE = /^([\d.,]+,\d{2})(\d+)\s+([-+]\d[\d.,]*)$/;
const TIME_LINE_RE = /^(\d{2}:\d{2}:\d{2})\s+WIB$/;
const DATE_LINE_RE = /^(\d{2})\s+([A-Za-z]{3,})\s+(\d{4})$/;
const SKIP_RE = /^(No|Date|Tanggal|Saldo|Balance|Nominal|Amount|Keterangan|Remarks|Tabungan|Nama|Name|Cabang|Branch|Periode|Period|Nomor|Account|Mata|Currency|Dana|Incoming|Outgoing|Initial|Closing|Dicetak|Issued|IDR|Page|Halaman|HANIIF|KCP|Tabungan NOW|\d+\s+(of|dari)\s+\d+|e-Statement|:|PT Bank Mandiri|serta merupakan|Mandiri Call|Menara Mandiri|Transfer Fee|\d{2} [A-Za-z]{3} \d{4} - \d{2} [A-Za-z]{3} \d{4}|\d{2} [A-Za-z]{3} \d{4}|[+-]\s*\d[\d.,]*|\d[\d.,]*\b)/i;

export function parseMandiriPDFText(text: string): ParsedCSVRow[] {
  const rows: ParsedCSVRow[] = [];
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);

  let descLines: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const dataMatch = line.match(DATA_LINE_RE);

    if (dataMatch && i + 2 < lines.length) {
      const [, balanceStr, seqStr, amountStr] = dataMatch;
      const timeMatch = lines[i+1].match(TIME_LINE_RE);
      const dateMatch = lines[i+2].match(DATE_LINE_RE);

      if (timeMatch && dateMatch) {
         const timeStr = timeMatch[1];
         const [, day, monthName, year] = dateMatch;
         const month = MONTH_MAP[monthName.toLowerCase()];
         
         const isExpense = amountStr.startsWith("-");
         const cleanAmount = amountStr.replace(/^[-+]/, "").replace(/\./g, "").replace(",", ".");
         const amount = Math.floor(parseFloat(cleanAmount));
         
         // Clean up note by removing any leftover numbers or headers that snuck in
         let note = descLines.join(" ").trim();
         // Basic cleaning for typical headers at the start of a page
         note = note.replace(/^(?:\d+:\s*)?(?:\d{2} [A-Za-z]{3} \d{4}\s*-\s*\d{2} [A-Za-z]{3} \d{4})?\s*(?:\d+:\s*)?(?:[\d.,]+\s*[-+]\s*[\d.,]+\s*[-+]\s*[\d.,]+\s*[\d.,]+)?\s*(?:\d+\s+dari\s+)?/i, "").trim();

         const type = isExpense ? "expense" : "income";
         const category = detectCategory(type, note);
         
         if (month) {
            const dateStr = `${year}-${month}-${day}T${timeStr}+07:00`;
            const dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
                rows.push({
                  created_at: dateObj.toISOString(),
                  type,
                  amount,
                  category,
                  note: note || "Transaksi",
                });
            }
         }
         descLines = [];
         i += 3;
         continue;
      }
    }

    if (!line.match(DATE_LINE_RE) && !SKIP_RE.test(line)) {
        descLines.push(line);
    }
    i++;
  }

  return rows;
}
