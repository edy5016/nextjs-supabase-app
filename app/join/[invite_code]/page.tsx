import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DUMMY_EVENTS } from "@/lib/dummy-data";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function JoinPage({
  params,
}: {
  params: Promise<{ invite_code: string }>;
}) {
  const { invite_code } = await params;
  const event = DUMMY_EVENTS.find((e) => e.invite_code === invite_code) ?? DUMMY_EVENTS[0];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
          {event.cover_image_url && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={event.cover_image_url}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <h1 className="mb-4 text-xl font-bold text-foreground">{event.title}</h1>
            <div className="mb-6 flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(event.event_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>현재 {event.participant_count}명 참여 중</span>
              </div>
            </div>

            <Button
              asChild
              className="h-12 w-full rounded-xl bg-emerald-500 hover:bg-emerald-600"
            >
              <Link href="/auth/login">Google로 참여하기</Link>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              로그인 후 자동으로 이벤트에 참여됩니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
