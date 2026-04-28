import { notFound } from "next/navigation";
import { Calendar, MapPin, Share2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDummyEventById, DUMMY_PARTICIPANTS } from "@/lib/dummy-data";
import type { EventStatus } from "@/types";

const statusConfig: Record<EventStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  upcoming: { label: "예정", variant: "default" },
  ongoing: { label: "진행 중", variant: "secondary" },
  ended: { label: "종료", variant: "outline" },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getDummyEventById(id);

  if (!event) {
    notFound();
  }

  const participants = DUMMY_PARTICIPANTS.filter((p) => p.event_id === id);
  const status = statusConfig[event.status];

  return (
    <div className="px-4 py-6">
      {event.cover_image_url && (
        <div className="mb-4 aspect-video w-full overflow-hidden rounded-2xl">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mb-4 flex items-start justify-between gap-2">
        <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="mb-6 flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{formatDate(event.event_date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} />
          <span>{event.location}</span>
        </div>
        {event.description && (
          <p className="mt-2 text-foreground">{event.description}</p>
        )}
      </div>

      <Button className="mb-6 flex h-12 w-full items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600" disabled>
        <Share2 size={18} />
        초대 링크 공유
      </Button>

      <div className="rounded-2xl border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Users size={18} />
          <h2 className="font-semibold">참여자 {event.participant_count}명</h2>
        </div>
        <div className="flex flex-col gap-2">
          {participants.length > 0 ? (
            participants.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                {p.user.avatar_url && (
                  <img
                    src={p.user.avatar_url}
                    alt={p.user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-medium">{p.user.name}</span>
                {p.role === "host" && (
                  <Badge variant="outline" className="ml-auto text-xs">주최자</Badge>
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
