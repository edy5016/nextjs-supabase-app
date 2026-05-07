import { notFound } from "next/navigation";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getDummyEventByInviteCode,
  DUMMY_PARTICIPANTS,
} from "@/lib/dummy-data";
import { formatDateFull } from "@/lib/format";
import { statusConfig } from "@/lib/constants/event-status";
import { JoinEventButton } from "@/components/events/join-event-button";

const CURRENT_USER_ID = "user-001";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const event = getDummyEventByInviteCode(code);

  if (!event) {
    notFound();
  }

  const alreadyJoined = DUMMY_PARTICIPANTS.some(
    (p) => p.event_id === event.id && p.user_id === CURRENT_USER_ID
  );

  const config = statusConfig[event.status];

  return (
    <div className="px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">이벤트 참여</h1>

      {/* 이벤트 카드 */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-md">
        {event.cover_image_url && (
          <div className="aspect-video w-full overflow-hidden">
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
              <span>{formatDateFull(event.event_date)}</span>
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
        <JoinEventButton alreadyJoined={alreadyJoined} />
      </div>
    </div>
  );
}
