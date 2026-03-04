import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { parseMessage, parseAmountNote, toTransactionInsert } from "@/lib/telegram-parser";
import { CATEGORIES } from "@/lib/types";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID; // opsional: fallback satu user kalau belum pakai link

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
    [{ text: "📖 Cara pakai" }],
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

Agar transaksi dari bot masuk ke akun kamu:
1. Buka <b>web app</b> (dashboard), masuk login
2. Di menu / halaman <b>Link Telegram</b>, klik "Buat kode"
3. Kirim ke bot ini: <code>/link KODE</code> (ganti KODE dengan kode yang muncul)

Kode berlaku 10 menit. Setelah terhubung, transaksi dari bot akan masuk ke dashboard kamu.`;

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
      await sendMessageWithKeyboard(chatId, "✅ Akun terhubung! Transaksi dari bot akan masuk ke dashboard kamu.", MAIN_KEYBOARD);
    } else {
      await sendTelegramReply(chatId, "❌ Kode tidak valid atau sudah kadaluarsa. Buat kode baru di web app → Link Telegram.");
    }
    return NextResponse.json({ ok: true });
  }

  // Resolve user: telegram_links dulu, fallback TELEGRAM_USER_ID
  const { data: link } = await supabase.from("telegram_links").select("user_id").eq("chat_id", chatId).single();
  const userId = link?.user_id ?? TELEGRAM_USER_ID ?? null;

  // /start, /help, Cara pakai
  if (text === "/start" || text.toLowerCase() === "/help" || text.includes("Cara pakai")) {
    if (!userId) {
      await sendMessageWithKeyboard(chatId, `👋 <b>Finance Tracker Bot</b>\n\n${LINK_INSTRUCTIONS}`, MAIN_KEYBOARD);
    } else {
      await sendWelcomeWithMainMenu(chatId);
    }
    return NextResponse.json({ ok: true });
  }

  if (text === BACK) {
    await supabase.from("telegram_category_session").delete().eq("chat_id", chatId);
    await sendMessageWithKeyboard(chatId, "Pilih Pemasukan atau Pengeluaran 👇", MAIN_KEYBOARD);
    return NextResponse.json({ ok: true });
  }

  if (text === "📈 Pemasukan") {
    await sendMessageWithKeyboard(chatId, "Pilih kategori pemasukan 👇", INCOME_CATEGORY_KEYBOARD);
    return NextResponse.json({ ok: true });
  }

  if (text === "📉 Pengeluaran") {
    await sendMessageWithKeyboard(chatId, "Pilih kategori pengeluaran 👇", EXPENSE_CATEGORY_KEYBOARD);
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
      `Kategori: <b>${selected.category}</b> (tipe sudah otomatis).\nKirim nominal + catatan saja, tanpa + atau -.\nContoh: <code>25000 sarapan</code> atau <code>500rb</code>\n\nTap "${BACK}" untuk batal.`,
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
        await sendTelegramReply(chatId, "Gagal menyimpan: " + error.message);
        return NextResponse.json({ ok: true });
      }
      await sendMessageWithKeyboard(chatId, `Tersimpan 💰 <b>${session.category}</b>: ${parsed.note || parsed.amount}\n\nTambah lagi? Pilih di bawah 👇`, MAIN_KEYBOARD);
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
      "Format tidak dikenali. Ketik <code>+50000 gaji</code> atau <code>-25rb kopi</code>\nAtau pilih Pemasukan/Pengeluaran di bawah 👇",
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
    await sendTelegramReply(chatId, "Gagal menyimpan: " + error.message);
    return NextResponse.json({ ok: true });
  }

  await sendMessageWithKeyboard(chatId, `Transaksi tersimpan 💰 (${parsed.length} item)\n\nTambah lagi? Pilih di bawah 👇`, MAIN_KEYBOARD);
  return NextResponse.json({ ok: true });
}

async function sendWelcomeWithMainMenu(chatId: number): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return;
  const welcome = `👋 <b>Finance Tracker</b>

Pilih <b>Pemasukan</b> atau <b>Pengeluaran</b>, lalu pilih kategori dan kirim nominal saja (tanpa + atau -, tipe otomatis).

Atau ketik langsung: <code>+500000 gaji</code> / <code>-25000 kopi</code>`;
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
