import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const CODE_LENGTH = 6;
const EXPIRES_MINUTES = 10;

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = randomCode();
  const expiresAt = new Date(Date.now() + EXPIRES_MINUTES * 60 * 1000).toISOString();

  const admin = createSupabaseAdmin();
  await admin.from("telegram_link_codes").delete().eq("user_id", user.id);
  const { error } = await admin.from("telegram_link_codes").insert({
    code,
    user_id: user.id,
    expires_at: expiresAt,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ code, expiresIn: EXPIRES_MINUTES });
}
