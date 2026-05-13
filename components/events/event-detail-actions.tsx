"use client";

import Link from "next/link";
import { ArrowLeft, Pencil, Share2, Trash2, Loader2 } from "lucide-react";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { EventWithCount } from "@/types";

interface EventDetailActionsProps {
  event: EventWithCount;
  isOwner?: boolean;
  /** 이벤트 삭제 Server Action */
  deleteAction: (id: string) => Promise<{ error?: string; redirectTo?: string }>;
}

/**
 * 이벤트 상세 페이지의 클라이언트 전용 액션 영역
 * 뒤로가기, 초대링크 복사, 수정, 삭제 기능을 담당합니다
 */
export function EventDetailActions({
  event,
  isOwner = true,
  deleteAction,
}: EventDetailActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 초대 링크 클립보드 복사
  const handleCopyInvite = async () => {
    const inviteUrl = `${window.location.origin}/join/${event.invite_code}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    // 1.5초 후 버튼 텍스트 원복
    setTimeout(() => setCopied(false), 1500);
  };

  // 이벤트 삭제 확인 처리
  const handleDelete = () => {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteAction(event.id);
      if (result?.error) {
        setDeleteError(result.error);
        return;
      }
      setDeleteOpen(false);
      if (result?.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  };

  return (
    <>
      {/* 뒤로가기 + 수정 버튼 행 */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/events"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          내 이벤트
        </Link>
        {isOwner && (
          <Link
            href={`/events/${event.id}/edit`}
            className="flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm hover:bg-muted"
          >
            <Pencil size={14} />
            수정
          </Link>
        )}
      </div>

      {/* 초대 링크 복사 버튼 (주최자만) */}
      {isOwner && (
        <button
          onClick={handleCopyInvite}
          className="mb-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Share2 size={18} />
          {copied ? "복사됨!" : "초대 링크 공유"}
        </button>
      )}

      {/* 삭제 다이얼로그 (주최자만) */}
      {isOwner && (
        <Dialog
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) setDeleteError(null);
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="mt-4 h-10 w-full border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={16} className="mr-2" />
              이벤트 삭제
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>이벤트 삭제</DialogTitle>
              <DialogDescription>
                &quot;{event.title}&quot;을(를) 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            {/* 삭제 실패 에러 메시지 */}
            {deleteError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {deleteError}
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                disabled={isPending}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  "삭제"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
