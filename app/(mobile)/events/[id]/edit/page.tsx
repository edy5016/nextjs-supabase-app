import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/queries/events";
import { updateEventAction } from "@/app/actions/events";
import { EventForm } from "@/components/events/event-form";
import type { EventFormValues } from "@/lib/validations/event";

/**
 * 이벤트 수정 페이지 (Server Component)
 * - 인증 확인 및 권한 체크 (주최자만 수정 가능)
 * - updateEventAction을 id 바인딩하여 EventForm의 action prop으로 전달
 */
export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15: params는 Promise — await 필수
  const { id } = await params;

  // 인증 확인: 미인증 사용자는 로그인 페이지로 리다이렉트
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 이벤트 조회
  const event = await getEventById(supabase, id);

  if (!event) {
    notFound();
  }

  // 권한 체크: 주최자가 아니면 상세 페이지로 리다이렉트
  if (event.created_by !== user.id) {
    redirect(`/events/${id}`);
  }

  // 기존 이벤트 데이터를 폼 기본값으로 변환
  // start_at/end_at(ISO) → datetime-local 포맷('YYYY-MM-DDTHH:mm')으로 변환
  const defaultValues: Partial<EventFormValues> = {
    title: event.title,
    description: event.description ?? "",
    location: event.location,
    start_at: event.start_at.slice(0, 16),
    end_at: event.end_at.slice(0, 16),
    max_participants: event.max_participants,
    status: event.status,
  };

  // updateEventAction에 id를 미리 바인딩하여 EventForm의 action 시그니처와 맞춤
  const boundUpdateAction = updateEventAction.bind(null, id);

  return (
    <div className="px-4 py-6">
      {/* 뒤로가기 버튼 (Server Component에서 useRouter 사용 불가 → Link 사용) */}
      <Link
        href={`/events/${id}`}
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        뒤로가기
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-foreground">이벤트 수정</h1>

      <EventForm
        defaultValues={defaultValues}
        defaultCoverImageUrl={event.cover_image_url ?? undefined}
        action={boundUpdateAction}
      />
    </div>
  );
}
