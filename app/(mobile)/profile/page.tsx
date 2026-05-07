import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { User, Calendar, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DUMMY_EVENTS, DUMMY_PARTICIPANTS, getDummyEventById } from "@/lib/dummy-data";
import { formatDate } from "@/lib/format";

// 현재 더미 사용자 ID (실제 구현 시 인증 사용자 ID로 교체)
const CURRENT_USER_ID = "user-001";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 주최한 이벤트 통계 계산
  const hostedEvents = DUMMY_EVENTS.filter(
    (e) => e.created_by === CURRENT_USER_ID
  );
  const hostedCount = hostedEvents.length;

  // 상태별 통계
  const upcomingCount = hostedEvents.filter((e) => e.status === "upcoming").length;
  const ongoingCount = hostedEvents.filter((e) => e.status === "ongoing").length;
  const endedCount = hostedEvents.filter((e) => e.status === "ended").length;

  // 참여한 이벤트 (participant 역할, 최대 3개)
  const participatedItems = DUMMY_PARTICIPANTS.filter(
    (p) => p.user_id === CURRENT_USER_ID && p.role === "participant"
  );
  const participatedCount = participatedItems.length;
  const participatedEvents = participatedItems
    .map((p) => getDummyEventById(p.event_id))
    .filter((e): e is NonNullable<typeof e> => e !== undefined)
    .slice(0, 3);

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">프로필</h1>

      {/* 프로필 카드 */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6">
        {/* Avatar 컴포넌트로 프로필 사진 표시 */}
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={user?.user_metadata?.avatar_url}
            alt="프로필 사진"
          />
          <AvatarFallback>
            <User size={36} className="text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        <div className="w-full text-center">
          <p className="text-xl font-semibold text-foreground">
            {user?.user_metadata?.full_name ?? user?.email ?? "사용자"}
          </p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        <Separator />

        {/* 기본 정보 */}
        <div className="w-full text-sm text-muted-foreground">
          <div className="flex justify-between py-2">
            <span>가입일</span>
            <span>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("ko-KR")
                : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* 이벤트 통계 섹션 */}
      <div className="mt-4 rounded-2xl border bg-card p-4">
        <h2 className="mb-3 font-semibold text-foreground">이벤트 통계</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* 주최한 이벤트 전체 */}
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-500">{hostedCount}</p>
            <p className="text-xs text-muted-foreground">주최한 이벤트</p>
          </div>
          {/* 참여한 이벤트 */}
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold text-blue-500">{participatedCount}</p>
            <p className="text-xs text-muted-foreground">참여한 이벤트</p>
          </div>
        </div>

        <Separator className="my-3" />

        {/* 상태별 통계 */}
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">주최 이벤트 상태</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-blue-50 p-2 text-center dark:bg-blue-950">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{upcomingCount}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">예정</p>
          </div>
          <div className="rounded-lg bg-green-50 p-2 text-center dark:bg-green-950">
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{ongoingCount}</p>
            <p className="text-xs text-green-600 dark:text-green-400">진행 중</p>
          </div>
          <div className="rounded-lg bg-muted p-2 text-center">
            <p className="text-lg font-bold text-muted-foreground">{endedCount}</p>
            <p className="text-xs text-muted-foreground">종료</p>
          </div>
        </div>
      </div>

      {/* 참여한 이벤트 섹션 */}
      <div className="mt-4 rounded-2xl border bg-card p-4">
        <h2 className="mb-3 font-semibold text-foreground">참여한 이벤트</h2>
        {participatedEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">아직 참여한 이벤트가 없습니다</p>
        ) : (
          <div className="flex flex-col gap-2">
            {participatedEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block rounded-xl border bg-muted/30 p-3 hover:bg-muted/60 transition-colors"
              >
                <p className="text-sm font-medium text-foreground">{event.title}</p>
                <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar size={11} />
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={11} />
                    <span>{event.location}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
