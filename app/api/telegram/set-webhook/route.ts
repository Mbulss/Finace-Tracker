import { NextRequest, NextResponse } from "next/server";

/**
 * Set Telegram webhook ke URL production.
 * Panggil sekali setelah deploy ke Vercel (atau saat ganti domain).
 *
 * GET atau POST: /api/telegram/set-webhook?secret=RAHASIA_ANDA
 * Env: TELEGRAM_BOT_TOKEN, TELEGRAM_SET_WEBHOOK_SECRET (opsional), NEXT_PUBLIC_APP_URL (wajib untuk production)
 *
 * Penting: Set NEXT_PUBLIC_APP_URL di Vercel ke domain production (mis. https://finance-tracker-gamma-livid.vercel.app)
 * supaya webhook selalu mengarah ke URL yang stabil, bukan URL preview deployment.
 */
export async function GET(request: NextRequest) {
  return setWebhook(request);
}

export async function POST(request: NextRequest) {
  return setWebhook(request);
}

async function setWebhook(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_SET_WEBHOOK_SECRET;

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "TELEGRAM_BOT_TOKEN tidak di-set di environment" },
      { status: 500 }
    );
  }

  if (secret) {
    const urlSecret = request.nextUrl.searchParams.get("secret");
    if (urlSecret !== secret) {
      return NextResponse.json(
        { ok: false, error: "Secret tidak cocok atau tidak dikirim" },
        { status: 401 }
      );
    }
  }

  // Utamakan domain production agar webhook tidak mengarah ke URL preview deployment
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  const baseUrl = appUrl
    ? appUrl.startsWith("http") ? appUrl : `https://${appUrl}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : request.headers.get("host")
        ? `https://${request.headers.get("host")}`
        : null;

  if (!baseUrl) {
    return NextResponse.json(
      { ok: false, error: "Set NEXT_PUBLIC_APP_URL di Vercel ke domain production (mis. https://finance-tracker-gamma-livid.vercel.app)" },
      { status: 500 }
    );
  }

  const webhookUrl = `${baseUrl}/api/telegram/webhook`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
    );
    const data = (await res.json()) as { ok?: boolean; description?: string; result?: boolean };

    if (!data.ok) {
      return NextResponse.json(
        { ok: false, error: data.description ?? "Telegram API error" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Webhook berhasil di-set",
      webhookUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
