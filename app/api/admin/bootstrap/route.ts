import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// 첫 관리자 설정용 일회용 엔드포인트
// 사용 후 반드시 이 파일을 삭제하세요

const BOOTSTRAP_SECRET = process.env.BOOTSTRAP_SECRET;

export async function POST(request: NextRequest) {
  const { secret, userId } = await request.json();

  if (!BOOTSTRAP_SECRET || secret !== BOOTSTRAP_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role: "admin" },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    uid: data.user.id,
    app_metadata: data.user.app_metadata,
  });
}
