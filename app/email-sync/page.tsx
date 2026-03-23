import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { EmailSyncManager } from "@/components/EmailSyncManager";

export const dynamic = "force-dynamic";

export default async function EmailSyncPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <DashboardLayout>
      <div className="pt-4">
        <EmailSyncManager />
      </div>
    </DashboardLayout>
  );
}


