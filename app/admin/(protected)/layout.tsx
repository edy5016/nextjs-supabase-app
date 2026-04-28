import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (user.app_metadata?.role !== "admin") {
    redirect("/admin/login?error=unauthorized");
  }

  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<div className="w-60 bg-gray-900" />}>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">{children}</main>
    </div>
  );
}
