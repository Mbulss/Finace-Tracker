import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { LinkTelegram } from "@/components/LinkTelegram";

export const dynamic = "force-dynamic";

export default async function LinkTelegramPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <LinkTelegram />
      </div>
    </DashboardLayout>
  );
}
