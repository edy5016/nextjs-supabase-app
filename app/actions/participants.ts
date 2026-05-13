"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 이벤트 참여 Server Action
 * event_participants 테이블에 현재 사용자를 participant 역할로 추가합니다
 * 중복 참여(23505 UNIQUE violation) 시에도 이벤트 상세 페이지로 이동
 *
 * redirect()가 아닌 redirectTo를 반환하는 이유:
 * - Client Component의 startTransition 내에서 Server Action redirect()가
 *   간헐적으로 클라이언트 네비게이션을 트리거하지 못하는 경우 방어
 * - 명시적인 router.push()로 이동을 보장
 */
export async function joinEventAction(
  eventId: string
): Promise<{ error?: string; redirectTo?: string }> {
  // eventId 유효성 검사
  if (!eventId) {
    return { error: "이벤트 ID가 없습니다" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인 사용자는 참여 불가
  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const { error } = await supabase.from("event_participants").insert({
    event_id: eventId,
    user_id: user.id,
    role: "participant",
  });

  if (error) {
    // UNIQUE violation: 이미 참여 중인 이벤트 → 이벤트 상세 페이지로 이동
    if (error.code === "23505") {
      return { redirectTo: `/events/${eventId}` };
    }
    console.error("[joinEventAction] INSERT 에러:", {
      code: error.code,
      message: error.message,
      eventId,
      userId: user.id,
    });
    return { error: error.message };
  }

  // 참여자 목록과 이벤트 목록 캐시 무효화
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);

  // redirect URL을 클라이언트에 반환 (클라이언트에서 router.push로 이동)
  return { redirectTo: `/events/${eventId}` };
}
