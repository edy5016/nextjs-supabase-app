"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { EventFormValues } from "@/lib/validations/event";

/**
 * 이벤트 생성 Server Action
 * invite_code는 DB 기본값(gen_random_uuid 앞 8자리) 사용
 * 충돌(unique violation) 발생 시 1회 재시도
 */
export async function createEventAction(
  data: EventFormValues & { cover_image_url?: string }
): Promise<{ error?: string; redirectTo?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const { cover_image_url, ...formData } = data;
  const payload = {
    ...formData,
    // datetime-local 문자열을 ISO 형식으로 변환
    start_at: new Date(formData.start_at).toISOString(),
    end_at: new Date(formData.end_at).toISOString(),
    created_by: user.id,
    ...(cover_image_url ? { cover_image_url } : {}),
  };

  const { data: event, error } = await supabase
    .from("events")
    .insert(payload)
    .select("id")
    .single();

  // invite_code unique violation(23505) 발생 시 1회 재시도
  if (error?.code === "23505") {
    const { data: retryEvent, error: retryError } = await supabase
      .from("events")
      .insert(payload)
      .select("id")
      .single();

    if (retryError) {
      return { error: retryError.message };
    }

    revalidatePath("/events");
    return { redirectTo: `/events/${retryEvent.id}` };
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/events");
  return { redirectTo: `/events/${event.id}` };
}

/**
 * 이벤트 수정 Server Action
 * RLS 정책에 의해 created_by가 현재 사용자인 이벤트만 수정 가능
 */
export async function updateEventAction(
  id: string,
  data: EventFormValues & { cover_image_url?: string }
): Promise<{ error?: string; redirectTo?: string }> {
  const supabase = await createClient();

  const { cover_image_url, ...formData } = data;
  const payload = {
    ...formData,
    // datetime-local 문자열을 ISO 형식으로 변환
    start_at: new Date(formData.start_at).toISOString(),
    end_at: new Date(formData.end_at).toISOString(),
    ...(cover_image_url !== undefined ? { cover_image_url } : {}),
  };

  const { error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/events/${id}`);
  return { redirectTo: `/events/${id}` };
}

/**
 * 이벤트 삭제 Server Action
 * RLS 정책에 의해 created_by가 현재 사용자인 이벤트만 삭제 가능
 */
export async function deleteEventAction(
  id: string
): Promise<{ error?: string; redirectTo?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/events");
  return { redirectTo: "/events" };
}
