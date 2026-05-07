import Link from "next/link";
import { Calendar, MapPin, Users, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDummyEventsByUserId } from "@/lib/dummy-data";
import { formatDate } from "@/lib/format";
import { statusConfig } from "@/lib/constants/event-status";
import { StatusFilterTabs } from "@/components/events/status-filter-tabs";
import { Suspense } from "react";
import type { EventStatus } from "@/types";

const CURRENT_USER_ID = "user-001";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  // Next.js 15: searchParams는 Promise — await 필수
  const { status } = await searchParams;

  // status 파라미터가 유효한 EventStatus인지 검증, 아니면 'all'
  const validStatuses: EventStatus[] = ["upcoming", "ongoing", "ended"];
  const activeStatus = validStatuses.includes(status as EventStatus)
    ? (status as EventStatus)
    : "all";

  // 현재 사용자가 주최하거나 참여한 이벤트 통합 조회
  const myEvents = getDummyEventsByUserId(CURRENT_USER_ID);

  // 상태 필터 적용
  const filteredEvents =
    activeStatus === "all"
      ? myEvents
      : myEvents.filter((e) => e.status === activeStatus);

  return (
    <div className="px-4 py-6">
      {/* 헤더: 타이틀 + 이벤트 만들기 버튼 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">내 이벤트</h1>
        <Link
          href="/events/create"
          className="flex h-9 items-center gap-1.5 rounded-full bg-emerald-500 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus size={16} />
          만들기
        </Link>
      </div>

      {/* 상태 필터 탭 (클라이언트 컴포넌트: useSearchParams 사용) */}
      <Suspense fallback={<div className="mb-6 h-8" />}>
        <StatusFilterTabs />
      </Suspense>

      {/* 이벤트 목록 */}
      {filteredEvents.length === 0 ? (
        // 빈 상태 UI
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Calendar size={48} className="text-muted-foreground/40" />
          <div>
            <p className="font-medium text-foreground">아직 이벤트가 없습니다</p>
            <p className="mt-1 text-sm text-muted-foreground">
              초대 링크를 받아 이벤트에 참여하거나 새 이벤트를 만들어보세요
            </p>
          </div>
          <Link
            href="/events/create"
            className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            이벤트 만들기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredEvents.map((event) => {
            const config = statusConfig[event.status];
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
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={event.created_by === CURRENT_USER_ID ? "default" : "secondary"}
                        className={
                          event.created_by === CURRENT_USER_ID
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                        }
                      >
                        {event.created_by === CURRENT_USER_ID ? "주최" : "참여"}
                      </Badge>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{formatDate(event.start_at)}</span>
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
      )}
    </div>
  );
}
