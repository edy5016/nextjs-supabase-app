import type { EventStatus } from "@/types";

/**
 * 이벤트 상태별 레이블과 Badge variant 설정
 */
export const statusConfig: Record<
  EventStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  upcoming: { label: "예정", variant: "default" },
  ongoing: { label: "진행 중", variant: "secondary" },
  ended: { label: "종료", variant: "outline" },
} as const;
