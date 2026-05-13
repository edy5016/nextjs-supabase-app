import { notFound } from "next/navigation";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getEventByInviteCode } from "@/lib/queries/events";
import { formatDateFull } from "@/lib/format";
import { statusConfig } from "@/lib/constants/event-status";
import { JoinEventButton } from "@/components/events/join-event-button";
import { joinEventAction } from "@/app/actions/participants";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Supabase 클라이언트 생성 및 현재 사용자 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 초대 코드로 이벤트 조회 (events RLS: authenticated 사용자만 조회 가능)
  // 미인증 사용자는 events SELECT 정책에 의해 조회 불가 → redirect 처리
  const event = await getEventByInviteCode(supabase, code);

  if (!event) {
    notFound();
  }

  // 이미 참여 중인지 확인 (로그인한 경우만)
  let alreadyJoined = false;
  if (user) {
    const { data } = await supabase
      .from("event_participants")
      .select("id")
      .eq("event_id", event.id)
      .eq("user_id", user.id)
      .maybeSingle();
    alreadyJoined = !!data;
  }

  const config = statusConfig[event.status];

  return (
    <div className="px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">이벤트 참여</h1>

      {/* 이벤트 카드 */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-md">
        {event.cover_image_url && (
          <div className="aspect-video w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="p-4">
          {/* 제목 + 상태 배지 */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {event.title}
            </h2>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>

          {/* 기본 정보 */}
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{formatDateFull(event.start_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} />
              <span>참여자 {event.participant_count}명</span>
            </div>
          </div>

          {event.description && (
            <p className="mt-3 text-sm text-foreground">{event.description}</p>
          )}
        </div>
      </div>

      {/* 참여하기 버튼 (클라이언트 컴포넌트) */}
      <div className="mt-6">
        {/* Server Component에서 bind 패턴으로 event.id를 미리 바인딩 */}
        <JoinEventButton
          alreadyJoined={alreadyJoined}
          isLoggedIn={!!user}
          redirectTo={`/join/${code}`}
          joinAction={joinEventAction.bind(null, event.id)}
        />
      </div>
    </div>
  );
}
