import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, role } = body as { userId: string; role: string };

  if (!userId || !["admin", "user"].includes(role)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  // 자신의 관리자 권한은 해제 불가
  if (userId === user.id && role !== "admin") {
    return NextResponse.json({ error: "Cannot remove your own admin role" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    app_metadata: { role },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
