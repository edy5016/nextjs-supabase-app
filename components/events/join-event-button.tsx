"use client";

import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

interface JoinEventButtonProps {
  alreadyJoined: boolean;
}

export function JoinEventButton({ alreadyJoined }: JoinEventButtonProps) {
  const router = useRouter();

  if (alreadyJoined) {
    return (
      <div className="flex h-12 w-full items-center justify-center rounded-xl bg-muted text-sm font-medium text-muted-foreground">
        이미 참여 중입니다
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push("/events")}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
    >
      <UserPlus size={18} />
      참여하기
    </button>
  );
}
