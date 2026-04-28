import Link from "next/link";
import { Plus, Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DUMMY_EVENTS } from "@/lib/dummy-data";
import type { EventStatus } from "@/types";

const statusConfig: Record<EventStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  upcoming: { label: "예정", variant: "default" },
  ongoing: { label: "진행 중", variant: "secondary" },
  ended: { label: "종료", variant: "outline" },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
}

export default function EventsPage() {
  return (
    <div className="relative px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">내 이벤트</h1>

      <div className="flex flex-col gap-4">
        {DUMMY_EVENTS.map((event) => {
          const status = statusConfig[event.status];
          return (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="block overflow-hidden rounded-2xl border bg-card shadow-md transition-shadow hover:shadow-lg"
            >
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
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">{event.title}</h2>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{formatDate(event.event_date)}</span>
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
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/events/create"
        className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="새 이벤트 만들기"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
