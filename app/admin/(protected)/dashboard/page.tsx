import { CalendarDays, Users, BarChart3, ArrowRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { EventStatus } from "@/types";

export const dynamic = "force-dynamic";

// 날짜 범위 계산 헬퍼
function getDateRanges() {
  const now = new Date();

  // 오늘 시작 (KST 기준 UTC 변환)
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // 이번 주 시작 (월요일)
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  // 이번 달 시작
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    todayStart: todayStart.toISOString(),
    weekStart: weekStart.toISOString(),
    monthStart: monthStart.toISOString(),
  };
}

function formatDate(isoString: string) {
  const d = new Date(isoString);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateTime(isoString: string) {
  const d = new Date(isoString);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const statusConfig: Record<EventStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  upcoming: { label: "예정", variant: "default" },
  ongoing: { label: "진행 중", variant: "secondary" },
  ended: { label: "종료", variant: "outline" },
};

export default async function AdminDashboardPage() {
  const adminClient = createAdminClient();
  const { todayStart, weekStart, monthStart } = getDateRanges();

  const errors: string[] = [];

  // 이벤트 수 집계 + 최근 이벤트 5개 병렬 조회
  const [
    { count: totalEvents, error: e1 },
    { count: todayEvents, error: e2 },
    { count: weekEvents, error: e3 },
    { count: monthEvents, error: e4 },
    { data: recentEventsRaw, error: e7 },
  ] = await Promise.all([
    adminClient.from("events").select("*", { count: "exact", head: true }),
    adminClient
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart),
    adminClient
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekStart),
    adminClient
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthStart),
    adminClient
      .from("events")
      .select("id, title, start_at, status, created_at, event_participants(count)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (e1) errors.push(`전체 이벤트 수: ${e1.message}`);
  if (e2) errors.push(`오늘 이벤트 수: ${e2.message}`);
  if (e3) errors.push(`이번 주 이벤트 수: ${e3.message}`);
  if (e4) errors.push(`이번 달 이벤트 수: ${e4.message}`);
  if (e7) errors.push(`최근 이벤트 목록: ${e7.message}`);

  // 전체 참여 기록 수
  const { count: totalParticipants, error: e5 } = await adminClient
    .from("event_participants")
    .select("*", { count: "exact", head: true });

  if (e5) errors.push(`전체 참여 기록 수: ${e5.message}`);

  // 사용자 수 집계
  let totalUsers = 0;
  let todayUsers = 0;
  let weekUsers = 0;
  let recentUsers: { id: string; email: string; name: string; avatarUrl: string | null; role: string; createdAt: string }[] = [];

  const { data: usersData, error: e6 } = await adminClient.auth.admin.listUsers({ perPage: 10000 });

  if (e6) {
    errors.push(`사용자 목록: ${e6.message}`);
  } else {
    const allUsers = usersData.users;
    totalUsers = allUsers.length;
    todayUsers = allUsers.filter((u) => u.created_at >= todayStart).length;
    weekUsers = allUsers.filter((u) => u.created_at >= weekStart).length;

    recentUsers = [...allUsers]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        email: u.email ?? "",
        name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email ?? "알 수 없음",
        avatarUrl: u.user_metadata?.avatar_url ?? null,
        role: u.app_metadata?.role ?? "user",
        createdAt: u.created_at,
      }));
  }

  // 최근 이벤트 가공
  const recentEvents = (recentEventsRaw ?? []).map((event) => {
    const participantCount =
      Array.isArray(event.event_participants) && event.event_participants.length > 0
        ? (event.event_participants[0] as { count: number }).count
        : 0;
    return {
      id: event.id as string,
      title: event.title as string,
      start_at: event.start_at as string,
      status: event.status as EventStatus,
      created_at: event.created_at as string,
      participantCount,
    };
  });

  if (errors.length > 0) {
    return (
      <div className="p-8">
        <h1 className="mb-8 text-2xl font-bold text-foreground">대시보드</h1>
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
          <p className="mb-2 font-medium text-destructive">데이터를 불러오는 중 오류가 발생했습니다:</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-destructive">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "오늘 생성된 이벤트",
      value: todayEvents ?? 0,
      icon: CalendarDays,
      color: "text-emerald-500",
    },
    {
      label: "이번 주 생성된 이벤트",
      value: weekEvents ?? 0,
      icon: CalendarDays,
      color: "text-emerald-500",
    },
    {
      label: "이번 달 생성된 이벤트",
      value: monthEvents ?? 0,
      icon: CalendarDays,
      color: "text-emerald-500",
    },
    {
      label: "전체 이벤트 수",
      value: totalEvents ?? 0,
      icon: CalendarDays,
      color: "text-emerald-500",
    },
    {
      label: "오늘 가입한 사용자",
      value: todayUsers,
      icon: Users,
      color: "text-amber-500",
    },
    {
      label: "이번 주 가입한 사용자",
      value: weekUsers,
      icon: Users,
      color: "text-amber-500",
    },
    {
      label: "전체 사용자 수",
      value: totalUsers,
      icon: Users,
      color: "text-amber-500",
    },
    {
      label: "전체 참여 기록",
      value: totalParticipants ?? 0,
      icon: BarChart3,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground">대시보드</h1>

      {/* 메트릭 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="flex items-center gap-4 rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              <div className={`rounded-lg bg-muted p-3 ${metric.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {metric.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 최근 활동 섹션 */}
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* 최근 이벤트 */}
        <div className="rounded-xl border bg-white shadow-sm dark:bg-gray-900">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-semibold text-foreground">최근 등록 이벤트</h2>
            <Link
              href="/admin/events"
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              모두 보기
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentEvents.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              등록된 이벤트가 없습니다.
            </div>
          ) : (
            <ul className="divide-y">
              {recentEvents.map((event) => {
                const cfg = statusConfig[event.status];
                return (
                  <li key={event.id} className="flex items-center gap-3 px-6 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{event.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        시작: {formatDateTime(event.start_at)} · 참여자 {event.participantCount}명
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(event.created_at)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 최근 가입 사용자 */}
        <div className="rounded-xl border bg-white shadow-sm dark:bg-gray-900">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-semibold text-foreground">최근 가입 사용자</h2>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              모두 보기
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              가입한 사용자가 없습니다.
            </div>
          ) : (
            <ul className="divide-y">
              {recentUsers.map((user) => {
                const initials = user.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <li key={user.id} className="flex items-center gap-3 px-6 py-4">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="size-9 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant={user.role === "admin" ? "default" : "outline"} className="text-xs">
                        {user.role === "admin" ? "관리자" : "사용자"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
