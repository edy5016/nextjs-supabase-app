import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: sessionData } = await supabase.auth.getUser();
  const user = sessionData?.user;

  if (!user) {
    return NextResponse.json({ error: "No session" });
  }

  // Admin API로 실제 DB의 app_metadata 확인
  const admin = createAdminClient();
  const { data: adminUser } = await admin.auth.admin.getUserById(user.id);

  return NextResponse.json({
    uid: user.id,
    email: user.email,
    session_app_metadata: user.app_metadata,
    db_app_metadata: adminUser.user?.app_metadata,
  });
}
