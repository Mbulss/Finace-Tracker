import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Supabase redirects here after email confirmation or password reset.
 * Exchange the code for a session and redirect to dashboard.
 * Agar tidak ke localhost, set di Supabase Dashboard → Auth → URL Configuration:
 * - Site URL: https://finance-tracker-gamma-livid.vercel.app
 * - Redirect URLs: https://finance-tracker-gamma-livid.vercel.app/**
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL("/auth?error=missing_code", request.url));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback]", error.message);
    return NextResponse.redirect(new URL("/auth?error=invalid_code", request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
