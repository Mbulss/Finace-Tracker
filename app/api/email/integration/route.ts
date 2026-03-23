import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ integrated: false });
  }

  const adminClient = createSupabaseAdmin();
  const { data, error } = await adminClient
    .from("user_integrations")
    .select("refresh_token")
    .eq("user_id", user.id)
    .eq("provider", "google")
    .single();

  if (error || !data?.refresh_token) {
    return NextResponse.json({ integrated: false });
  }

  return NextResponse.json({ integrated: true });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const refreshToken = body.refresh_token;
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token provided" }, { status: 400 });
  }

  const adminClient = createSupabaseAdmin();

  // Upsert the integration to our database
  const { error } = await adminClient.from("user_integrations").upsert(
    {
      user_id: user.id,
      provider: "google",
      refresh_token: refreshToken,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" }
  );

  if (error) {
    console.error("Failed to save integration", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createSupabaseAdmin();

  // Delete the integration
  const { error } = await adminClient
    .from("user_integrations")
    .delete()
    .eq("user_id", user.id)
    .eq("provider", "google");

  if (error) {
    console.error("Failed to delete integration", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Disconnected successfully" });
}
