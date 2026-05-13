import type { SupabaseClient } from "@supabase/supabase-js";
import { computeEventStatus } from "@/lib/utils";
import type { EventWithCount, EventWithParticipants } from "@/types";

/**
 * 현재 사용자가 주최하거나 참여한 이벤트를 모두 조회합니다
 * 주최 이벤트와 참여 이벤트를 병렬로 조회한 후 중복을 제거합니다
 */
export async function getMyEvents(
  supabase: SupabaseClient,
  userId: string
): Promise<EventWithCount[]> {
  // 주최 이벤트와 참여 이벤트를 병렬 조회
  const [hostedResult, participatedResult] = await Promise.all([
    supabase
      .from("events")
      .select("*, participant_count:event_participants(count)")
      .eq("created_by", userId)
      .order("start_at", { ascending: false }),
    supabase
      .from("events")
      .select("*, participant_count:event_participants(count)")
      .in(
        "id",
        // 서브쿼리: 현재 사용자가 참여한 이벤트 ID 목록
        (await supabase
          .from("event_participants")
          .select("event_id")
          .eq("user_id", userId)).data?.map((p: { event_id: string }) => p.event_id) ?? []
      )
      .order("start_at", { ascending: false }),
  ]);

  const allEvents = [
    ...(hostedResult.data ?? []),
    ...(participatedResult.data ?? []),
  ];

  // id 기준 중복 제거
  const seen = new Set<string>();
  const deduped = allEvents.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  // participant_count aggregate 결과 변환 및 상태 동적 계산
  return deduped.map((e) => ({
    ...e,
    // Supabase count aggregate: [{ count: number }] 형태로 반환
    participant_count: Array.isArray(e.participant_count)
      ? (e.participant_count[0]?.count ?? 0)
      : (e.participant_count ?? 0),
    // 현재 시각 기준으로 이벤트 상태를 동적 계산
    status: computeEventStatus(e.start_at, e.end_at),
  }));
}

/**
 * 이벤트 상세 정보를 조회합니다 (주최자 프로필 + 참여자 목록 포함)
 * 존재하지 않으면 null 반환
 */
export async function getEventById(
  supabase: SupabaseClient,
  id: string
): Promise<(EventWithParticipants & { participant_count: number }) | null> {
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      host:profiles!created_by(id, name, avatar_url),
      participants:event_participants(
        id,
        event_id,
        user_id,
        role,
        joined_at,
        user:profiles(id, name, avatar_url, email, role, created_at, updated_at)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    // 예상치 못한 DB 에러 로깅 (PGRST116=no rows found은 정상적인 404 케이스)
    if (error && error.code !== "PGRST116") {
      console.error("[getEventById] Supabase 에러:", {
        code: error.code,
        message: error.message,
        eventId: id,
      });
    }
    return null;
  }

  return {
    ...data,
    // 현재 시각 기준으로 이벤트 상태를 동적 계산
    status: computeEventStatus(data.start_at, data.end_at),
    participant_count: data.participants?.length ?? 0,
    // host가 단일 객체로 반환되도록 처리 (join 결과가 배열일 경우 대비)
    host: Array.isArray(data.host) ? data.host[0] : data.host,
  };
}

/**
 * 초대 코드로 이벤트를 조회합니다
 * 존재하지 않으면 null 반환
 */
export async function getEventByInviteCode(
  supabase: SupabaseClient,
  code: string
): Promise<EventWithCount | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*, participant_count:event_participants(count)")
    .eq("invite_code", code)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    ...data,
    // Supabase count aggregate: [{ count: number }] 형태로 반환
    participant_count: Array.isArray(data.participant_count)
      ? (data.participant_count[0]?.count ?? 0)
      : (data.participant_count ?? 0),
    // 현재 시각 기준으로 이벤트 상태를 동적 계산
    status: computeEventStatus(data.start_at, data.end_at),
  };
}
