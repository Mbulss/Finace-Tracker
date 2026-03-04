import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { parseMessage, toTransactionInsert } from "@/lib/telegram-parser";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID; // Supabase user ID to attribute Telegram transactions to

export async function POST(request: NextRequest) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_USER_ID) {
    return NextResponse.json(
      { error: "Telegram or user config missing" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update = body as { message?: { text?: string; chat?: { id?: number }; from?: { id?: number } } };
  const text = update?.message?.text?.trim();
  const chatId = update?.message?.chat?.id;

  if (!text || chatId == null) {
    return NextResponse.json({ ok: true });
  }

  const parsed = parseMessage(text);
  if (parsed.length === 0) {
    await sendTelegramReply(chatId, "Could not parse any transaction. Use format: +50000 gaji or -25000 kopi");
    return NextResponse.json({ ok: true });
  }

  const supabase = createSupabaseAdmin();
  const inserts = parsed.map((p) => toTransactionInsert(p, TELEGRAM_USER_ID));

  const { error } = await supabase.from("transactions").insert(inserts);
  if (error) {
    await sendTelegramReply(chatId, "Failed to save: " + error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await sendTelegramReply(chatId, `Transaction saved successfully 💰 (${parsed.length} item(s))`);
  return NextResponse.json({ ok: true });
}

async function sendTelegramReply(chatId: number, text: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}
