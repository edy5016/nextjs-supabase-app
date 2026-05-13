"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";

interface JoinEventButtonProps {
  alreadyJoined: boolean;
  /** 로그인 여부: false이면 참여 버튼 클릭 시 로그인 페이지로 이동 */
  isLoggedIn?: boolean;
  /** 로그인 후 돌아올 경로 (예: /join/ABCD1234) */
  redirectTo?: string;
  /**
   * 실제 참여 처리 Server Action
   * 성공 시 redirectTo를, 실패 시 error를 반환합니다
   */
  joinAction?: () => Promise<{ error?: string; redirectTo?: string }>;
}

export function JoinEventButton({
  alreadyJoined,
  isLoggedIn = true,
  redirectTo,
  joinAction,
}: JoinEventButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // 이미 참여 중인 경우
  if (alreadyJoined) {
    return (
      <div className="flex h-12 w-full items-center justify-center rounded-xl bg-muted text-sm font-medium text-muted-foreground">
        이미 참여 중입니다
      </div>
    );
  }

  // 미로그인 사용자: 로그인 페이지로 이동 유도 (로그인 후 초대 페이지로 복귀)
  if (!isLoggedIn) {
    const loginHref = redirectTo
      ? `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : "/auth/login";
    return (
      <Link
        href={loginHref}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
      >
        <UserPlus size={18} />
        로그인 후 참여하기
      </Link>
    );
  }

  // 로그인한 사용자: joinAction 호출 후 redirectTo로 이동
  const handleClick = () => {
    startTransition(async () => {
      const result = await joinAction?.();
      if (!result) return;

      if (result.error) {
        alert(result.error);
        return;
      }

      // Server Action에서 반환한 경로로 명시적 클라이언트 네비게이션
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  };

  return (
    <button
      disabled={isPending || !joinAction}
      onClick={handleClick}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <UserPlus size={18} />
      )}
      {isPending ? "참여 중..." : "참여하기"}
    </button>
  );
}
