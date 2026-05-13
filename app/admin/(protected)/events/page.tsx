import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { EventDeleteButton } from "@/components/admin/event-delete-button";
import { EventsSearchForm } from "@/components/admin/events-search-form";
import Link from "next/link";
import type { EventStatus } from "@/types";

export const dynamic = "force-dynamic";

// 이벤트 상태별 뱃지 설정
const statusConfig: Record<EventStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  upcoming: { label: "예정", variant: "default" },
  ongoing: { label: "진행 중", variant: "secondary" },
  ended: { label: "종료", variant: "outline" },
};

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminEventsPage({ searchParams }: PageProps) {
  const { q = "", status = "all", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const adminClient = createAdminClient();

  // 이벤트 쿼리 빌더 (검색 + 상태 필터)
  let query = adminClient
    .from("events")
    .select(
      `
      id,
      title,
      start_at,
      status,
      created_at,
      event_participants(count)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  // 검색어 필터 (제목 포함 검색)
  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  // 상태 필터
  if (status && status !== "all") {
    query = query.eq("status", status as EventStatus);
  }

  const { data: events, count: totalCount, error } = await query;

  if (error) {
    return (
      <div className="p-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">이벤트 관리</h1>
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">이벤트 목록을 불러오지 못했습니다: {error.message}</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((totalCount ?? 0) / PAGE_SIZE);

  // 페이지네이션 URL 생성 헬퍼
  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status && status !== "all") params.set("status", status);
    params.set("page", String(targetPage));
    return `/admin/events?${params.toString()}`;
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">이벤트 관리</h1>

      {/* 검색 및 필터 폼 (Client Component) */}
      <EventsSearchForm
        defaultQuery={q}
        defaultStatus={status || "all"}
        totalCount={totalCount ?? 0}
      />

      <div className="overflow-hidden rounded-xl border bg-white dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">제목</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">날짜</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">참여자</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">상태</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {events && events.length > 0 ? (
              events.map((event) => {
                // event_participants(count) 집계 값 추출
                const participantCount =
                  Array.isArray(event.event_participants) && event.event_participants.length > 0
                    ? (event.event_participants[0] as { count: number }).count
                    : 0;

                const eventStatus = (event.status ?? "upcoming") as EventStatus;
                const statusInfo = statusConfig[eventStatus] ?? statusConfig.upcoming;

                return (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4 font-medium text-foreground">{event.title}</td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {new Date(event.start_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{participantCount}명</td>
                    <td className="px-4 py-4">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <EventDeleteButton eventId={event.id} eventTitle={event.title} />
                    </td>
                  </tr>
                );
              })
            ) : (
              // 검색 결과가 없을 때 빈 상태 메시지
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {q || (status && status !== "all")
                    ? "검색 결과가 없습니다."
                    : "등록된 이벤트가 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 하단 정보 및 페이지네이션 */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <span className="text-xs text-muted-foreground">
            총 {(totalCount ?? 0).toLocaleString()}개
            {totalPages > 1 && ` (${currentPage} / ${totalPages} 페이지)`}
          </span>

          {/* 페이지네이션 버튼 */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={currentPage <= 1}
              >
                {currentPage > 1 ? (
                  <Link href={buildPageUrl(currentPage - 1)}>이전</Link>
                ) : (
                  <span>이전</span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={currentPage >= totalPages}
              >
                {currentPage < totalPages ? (
                  <Link href={buildPageUrl(currentPage + 1)}>다음</Link>
                ) : (
                  <span>다음</span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
