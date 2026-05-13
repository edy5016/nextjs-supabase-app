import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { EventStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * 이벤트 시작/종료 시각을 기준으로 현재 상태를 동적으로 계산합니다
 * - now < start_at → "upcoming" (예정)
 * - now > end_at   → "ended"    (종료)
 * - 그 외           → "ongoing"  (진행 중)
 */
export function computeEventStatus(start_at: string, end_at: string): EventStatus {
  const now = new Date();
  if (now < new Date(start_at)) return "upcoming";
  if (now > new Date(end_at)) return "ended";
  return "ongoing";
}
