import { notFound } from "next/navigation";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { getDummyEventById, DUMMY_PARTICIPANTS } from "@/lib/dummy-data";
import { formatDateFull } from "@/lib/format";
import { statusConfig } from "@/lib/constants/event-status";
import { EventDetailActions } from "@/components/events/event-detail-actions";

const CURRENT_USER_ID = "user-001";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15: params는 Promise — await 필수
  const { id } = await params;
  const event = getDummyEventById(id);

  if (!event) {
    notFound();
  }

  const isOwner = event.created_by === CURRENT_USER_ID;
  const participants = DUMMY_PARTICIPANTS.filter((p) => p.event_id === id);
  const config = statusConfig[event.status];

  return (
    <div className="px-4 py-6">
      {/* 뒤로가기, 초대링크 복사, 수정, 삭제 액션 (client component) */}
      <EventDetailActions event={event} isOwner={isOwner} />

      {/* 커버 이미지 */}
      {event.cover_image_url && (
        <div className="mb-4 aspect-video w-full overflow-hidden rounded-2xl">
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
          <span>{formatDateFull(event.event_date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} />
          <span>{event.location}</span>
        </div>
        {event.description && (
          <p className="mt-2 text-foreground">{event.description}</p>
        )}
      </div>

      {/* 참여자 목록 */}
      <div className="rounded-2xl border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Users size={18} />
          <h2 className="font-semibold">참여자 {event.participant_count}명</h2>
        </div>
        <div className="flex flex-col gap-2">
          {participants.length > 0 ? (
            participants.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                {/* shadcn Avatar 컴포넌트: 이미지 없으면 이름 첫 글자로 대체 */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={p.user.avatar_url ?? undefined} alt={p.user.name} />
                  <AvatarFallback>{p.user.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{p.user.name}</span>
                {p.role === "host" && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    주최자
                  </Badge>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">아직 참여자가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
