import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { parseMessage, parseAmountNote, toTransactionInsert } from "@/lib/telegram-parser";
import { CATEGORIES } from "@/lib/types";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID; // opsional: fallback satu user kalau belum pakai link

const DASHBOARD_URL = "https://finace-tracker-seven.vercel.app/";
const BACK = "⬅️ Kembali";

const expenseIcons: Record<string, string> = { Food: "🍜", Transport: "🚗", Shopping: "🛒", Bills: "💡", Health: "🏥", Entertainment: "🎬", Other: "📂" };
const incomeIcons: Record<string, string> = { Salary: "💰", Freelance: "💼", Investment: "📈", Gift: "🎁", Other: "💵" };

const CATEGORY_BUTTONS: Record<string, { type: "income" | "expense"; category: string }> = {};
CATEGORIES.expense.forEach((c) => {
  CATEGORY_BUTTONS[`${expenseIcons[c] ?? "📂"} ${c}`] = { type: "expense", category: c };
});
CATEGORIES.income.forEach((c) => {
  CATEGORY_BUTTONS[`${incomeIcons[c] ?? "💵"} ${c}`] = { type: "income", category: c };
});

const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: "📈 Pemasukan" }, { text: "📉 Pengeluaran" }],
    [{ text: "📖 Cara pakai" }, { text: "🖥 Dashboard" }],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};

const EXPENSE_CATEGORY_KEYBOARD = {
  keyboard: [
    [{ text: "🍜 Food" }, { text: "🚗 Transport" }, { text: "🛒 Shopping" }],
    [{ text: "💡 Bills" }, { text: "🏥 Health" }, { text: "🎬 Entertainment" }, { text: "📂 Other" }],
    [{ text: BACK }],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};

const INCOME_CATEGORY_KEYBOARD = {
  keyboard: [
    [{ text: "💰 Salary" }, { text: "💼 Freelance" }, { text: "📈 Investment" }],
    [{ text: "🎁 Gift" }, { text: "💵 Other" }],
    [{ text: BACK }],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};

const AMOUNT_KEYBOARD = {
  keyboard: [[{ text: BACK }]],
  resize_keyboard: true,
  one_time_keyboard: false,
};

const LINK_INSTRUCTIONS = `🔗 <b>Belum terhubung ke akun</b>

Biar transaksi dari sini masuk ke dashboard kamu:
1. Buka dashboard → <a href="${DASHBOARD_URL}">${DASHBOARD_URL}</a>
2. Login, lalu ke halaman <b>Link Telegram</b> → klik "Buat kode"
3. Kirim ke aku: <code>/link KODE</code> (ganti KODE pake kode yang keluar)

Kode cuma berlaku 10 menit. Abis itu transaksi dari bot otomatis masuk ke dashboard.`;

export async function POST(request: NextRequest) {
  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN missing" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update = body as { message?: { text?: string; chat?: { id?: number } } };
  const text = update?.message?.text?.trim();
  const chatId = update?.message?.chat?.id;

  if (!text || chatId == null) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createSupabaseAdmin();

  // /link KODE → hubungkan chat ke user
  const linkMatch = text.match(/^\/link\s+(\S+)$/i);
  if (linkMatch) {
    const code = linkMatch[1].trim().toUpperCase();
    const { data: row } = await supabase
      .from("telegram_link_codes")
      .select("user_id")
      .eq("code", code)
      .gt("expires_at", new Date().toISOString())
      .single();
    if (row) {
      await supabase.from("telegram_links").upsert(
        { chat_id: chatId, user_id: row.user_id, created_at: new Date().toISOString() },
        { onConflict: "chat_id" }
      );
      await supabase.from("telegram_link_codes").delete().eq("code", code);
      await sendMessageWithKeyboard(chatId, "Oke akun kamu udah ke-link! 👍 Transaksi dari sini otomatis masuk ke dashboard.", MAIN_KEYBOARD);
    } else {
      await sendTelegramReply(chatId, "Kode gak valid atau udah kedaluwarsa 😅 Buat kode baru di web app → Link Telegram ya.");
    }
    return NextResponse.json({ ok: true });
  }

  // Resolve user: telegram_links dulu, fallback TELEGRAM_USER_ID
  const { data: link } = await supabase.from("telegram_links").select("user_id").eq("chat_id", chatId).single();
  const userId = link?.user_id ?? TELEGRAM_USER_ID ?? null;

  // Trigger bantuan: /start, /help, halo, hi, bantu, gimana, cara pakai, ?
  const lower = text.toLowerCase();
  const isHelp =
    text === "/start" ||
    lower === "/help" ||
    lower === "help" ||
    lower === "bantu" ||
    lower === "gimana" ||
    lower === "gmna" ||
    lower === "gmn" ||
    lower === "apa" ||
    text === "?" ||
    /^(halo|hi|hey|hei|oy|oi)\s*!?$/i.test(text) ||
    text.includes("Cara pakai") ||
    text.includes("cara pakai");
  if (isHelp) {
    if (!userId) {
      await sendMessageWithKeyboard(chatId, `👋 <b>Finance Tracker</b>\n\n${LINK_INSTRUCTIONS}`, MAIN_KEYBOARD);
    } else {
      await sendWelcomeWithMainMenu(chatId);
    }
    return NextResponse.json({ ok: true });
  }

  // Selesai / dashboard / makasih → kasih link dashboard
  const lowerTrim = lower.replace(/\s+/g, " ");
  const isDone =
    lowerTrim === "selesai" ||
    lowerTrim === "done" ||
    lowerTrim === "udah" ||
    lowerTrim === "makasih" ||
    lowerTrim === "thanks" ||
    lowerTrim === "terima kasih" ||
    text === "🖥 Dashboard" ||
    lowerTrim === "dashboard" ||
    lowerTrim === "link dashboard" ||
    lowerTrim === "web";
  if (isDone) {
    await sendMessageWithKeyboard(
      chatId,
      `Oke, siap 👍\n\nKalau mau liat ringkasan, grafik, atau edit data → buka dashboard:\n<a href="${DASHBOARD_URL}">${DASHBOARD_URL}</a>\n\nKapan-kapan butuh catat lagi, tinggal balas di sini aja.`,
      MAIN_KEYBOARD
    );
    return NextResponse.json({ ok: true });
  }

  if (text === BACK) {
    await supabase.from("telegram_category_session").delete().eq("chat_id", chatId);
    await sendMessageWithKeyboard(chatId, "Oke, mau catat pemasukan atau pengeluaran? 👇", MAIN_KEYBOARD);
    return NextResponse.json({ ok: true });
  }

  if (text === "📈 Pemasukan") {
    await sendMessageWithKeyboard(chatId, "Pilih kategori pemasukan ya 👇", INCOME_CATEGORY_KEYBOARD);
    return NextResponse.json({ ok: true });
  }

  if (text === "📉 Pengeluaran") {
    await sendMessageWithKeyboard(chatId, "Pilih kategori pengeluaran ya 👇", EXPENSE_CATEGORY_KEYBOARD);
    return NextResponse.json({ ok: true });
  }

  const selected = CATEGORY_BUTTONS[text];
  if (selected) {
    if (!userId) {
      await sendTelegramReply(chatId, LINK_INSTRUCTIONS);
      return NextResponse.json({ ok: true });
    }
    await supabase.from("telegram_category_session").upsert(
      { chat_id: chatId, type: selected.type, category: selected.category, updated_at: new Date().toISOString() },
      { onConflict: "chat_id" }
    );
    await sendMessageWithKeyboard(
      chatId,
      `Oke, <b>${selected.category}</b> 👍\nSekarang kirim nominal + catatan aja (gak usah + atau -).\nContoh: <code>25k sarapan</code> / <code>500rb</code> / <code>1jt belanja</code>\n\nTap "${BACK}" kalo mau batal.`,
      AMOUNT_KEYBOARD
    );
    return NextResponse.json({ ok: true });
  }

  const { data: session } = await supabase
    .from("telegram_category_session")
    .select("type, category")
    .eq("chat_id", chatId)
    .single();

  if (session) {
    if (!userId) {
      await sendTelegramReply(chatId, LINK_INSTRUCTIONS);
      return NextResponse.json({ ok: true });
    }
    const parsed = parseAmountNote(text);
    if (parsed) {
      const insert = {
        user_id: userId,
        type: session.type,
        amount: parsed.amount,
        category: session.category,
        note: parsed.note || session.category,
      };
      const { error } = await supabase.from("transactions").insert(insert);
      await supabase.from("telegram_category_session").delete().eq("chat_id", chatId);
      if (error) {
        await sendTelegramReply(chatId, "Waduh gagal nyimpen nih 😅 " + error.message);
        return NextResponse.json({ ok: true });
      }
      const noteDisplay = parsed.note || session.category;
      await sendMessageWithKeyboard(chatId, `Oke udah ke-catat 💰 <b>${session.category}</b>: ${noteDisplay}\nMau tambah lagi? Pilih di bawah 👇`, MAIN_KEYBOARD);
      return NextResponse.json({ ok: true });
    }
  }

  // Ketik langsung: +50000 gaji / -25rb kopi
  const parsed = parseMessage(text);
  if (parsed.length === 0) {
    if (!userId) {
      await sendTelegramReply(chatId, LINK_INSTRUCTIONS);
      return NextResponse.json({ ok: true });
    }
    await sendMessageWithKeyboard(
      chatId,
      "Wah formatnya gak ke-detect nih 😅 Coba kayak gini:\n• <code>+50000 gaji</code> / <code>-25rb kopi</code>\n• Atau pilih tombol Pemasukan/Pengeluaran di bawah 👇",
      MAIN_KEYBOARD
    );
    return NextResponse.json({ ok: true });
  }

  if (!userId) {
    await sendTelegramReply(chatId, LINK_INSTRUCTIONS);
    return NextResponse.json({ ok: true });
  }

  const inserts = parsed.map((p) => toTransactionInsert(p, userId));
  const { error } = await supabase.from("transactions").insert(inserts);
  if (error) {
    await sendTelegramReply(chatId, "Waduh gagal nyimpen 😅 " + error.message);
    return NextResponse.json({ ok: true });
  }

  const itemWord = parsed.length === 1 ? "1 transaksi" : `${parsed.length} transaksi`;
  await sendMessageWithKeyboard(chatId, `Mantap, ${itemWord} udah ke-catat 💰\nMau tambah lagi? 👇`, MAIN_KEYBOARD);
  return NextResponse.json({ ok: true });
}

async function sendWelcomeWithMainMenu(chatId: number): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return;
  const welcome = `👋 <b>Finance Tracker</b>

Ini bot buat catat pemasukan & pengeluaran kamu. Semua data masuk ke dashboard yang sama.

<b>Cara pakai (singkat):</b>
• Pilih <b>Pemasukan</b> atau <b>Pengeluaran</b> → kategori → kirim nominal (boleh <code>25k</code>, <code>500rb</code>, <code>1jt</code>).
• Atau ketik langsung: <code>+500rb gaji</code> / <code>-25k kopi</code>

Kalau mau liat grafik & riwayat lengkap → dashboard:\n<a href="${DASHBOARD_URL}">${DASHBOARD_URL}</a>

Siap catat? Pilih tombol di bawah 👇`;
  await sendMessageWithKeyboard(chatId, welcome, MAIN_KEYBOARD);
}

async function sendMessageWithKeyboard(chatId: number, text: string, replyMarkup: object): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", reply_markup: replyMarkup }),
  });
}

async function sendTelegramReply(chatId: number, text: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}
