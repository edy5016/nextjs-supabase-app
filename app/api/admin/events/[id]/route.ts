import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 세션 확인: 로그인 여부 검증
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // admin role 검증
  if (user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // event_participants는 DB 외래키 CASCADE로 처리되지 않는 경우를 대비해 명시적 삭제
  const { error: participantsError } = await adminClient
    .from("event_participants")
    .delete()
    .eq("event_id", id);

  if (participantsError) {
    return NextResponse.json(
      { error: `참여자 삭제 실패: ${participantsError.message}` },
      { status: 500 }
    );
  }

  // 이벤트 삭제
  const { error: eventError } = await adminClient
    .from("events")
    .delete()
    .eq("id", id);

  if (eventError) {
    return NextResponse.json(
      { error: `이벤트 삭제 실패: ${eventError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
