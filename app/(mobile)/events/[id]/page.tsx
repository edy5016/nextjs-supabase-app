import { notFound, redirect } from "next/navigation";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/queries/events";
import { deleteEventAction } from "@/app/actions/events";
import { formatDateFull } from "@/lib/format";
import { statusConfig } from "@/lib/constants/event-status";
import { EventDetailActions } from "@/components/events/event-detail-actions";
import { RealtimeParticipants } from "@/components/events/realtime-participants";

export default async function EventDetailPage({
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

  // 이벤트 상세 조회 (host 프로필 + 참여자 목록 포함)
  const event = await getEventById(supabase, id);

  if (!event) {
    notFound();
  }

  // 현재 로그인 사용자가 주최자인지 확인
  const isOwner = event.created_by === user.id;
  const participants = event.participants ?? [];
  const config = statusConfig[event.status];

  return (
    <div className="px-4 py-6">
      {/* 뒤로가기, 초대링크 복사, 수정, 삭제 액션 (client component) */}
      <EventDetailActions
        event={event}
        isOwner={isOwner}
        deleteAction={deleteEventAction}
      />

      {/* 커버 이미지 */}
      {event.cover_image_url && (
        <div className="mb-4 aspect-video w-full overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* 제목 + 상태 배지 */}
      <div className="mb-4 flex items-start justify-between gap-2">
        <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      {/* 기본 정보 */}
      <div className="mb-6 flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{formatDateFull(event.start_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} />
          <span>{event.location}</span>
        </div>
        {event.description && (
          <p className="mt-2 text-foreground">{event.description}</p>
        )}
      </div>

      {/* 참여자 목록 (Realtime 구독으로 실시간 갱신) */}
      <div className="rounded-2xl border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Users size={18} />
          <h2 className="font-semibold">참여자 {event.participant_count}명</h2>
        </div>
        <RealtimeParticipants
          eventId={event.id}
          initialParticipants={participants}
        />
      </div>
    </div>
  );
}
