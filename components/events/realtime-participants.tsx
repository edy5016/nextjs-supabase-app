"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { EventWithParticipants } from "@/types";

type Participant = EventWithParticipants["participants"][number];

interface RealtimeParticipantsProps {
  eventId: string;
  /** SSR에서 전달된 초기 참여자 목록 */
  initialParticipants: Participant[];
}

/**
 * 실시간 참여자 목록 컴포넌트
 * Supabase Realtime으로 event_participants 변경을 구독하여
 * INSERT/DELETE 발생 시 router.refresh()로 서버 데이터를 재조회합니다
 */
export function RealtimeParticipants({
  eventId,
  initialParticipants,
}: RealtimeParticipantsProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // event_participants 테이블에서 해당 이벤트의 변경사항 구독
    const channel = supabase
      .channel(`event-participants-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_participants",
          // 특정 이벤트의 변경만 필터링하여 불필요한 갱신 방지
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          // 참여자 추가/삭제 시 서버 데이터 재조회
          router.refresh();
        }
      )
      .subscribe();

    // 컴포넌트 언마운트 시 채널 해제 (메모리 누수 방지)
    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, router]);

  if (initialParticipants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">아직 참여자가 없습니다.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {initialParticipants.map((p) => (
        <div key={p.id} className="flex items-center gap-3">
          {/* shadcn Avatar: 이미지 없으면 이름 첫 글자로 대체 */}
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={p.user.avatar_url ?? undefined}
              alt={p.user.name}
            />
            <AvatarFallback>{p.user.name?.slice(0, 1) ?? "?"}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{p.user.name}</span>
          {p.role === "host" && (
            <Badge variant="outline" className="ml-auto text-xs">
              주최자
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}
