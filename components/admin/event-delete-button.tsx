"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface EventDeleteButtonProps {
  eventId: string;
  eventTitle: string;
}

export function EventDeleteButton({ eventId, eventTitle }: EventDeleteButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    // 삭제 전 사용자 확인 다이얼로그
    const confirmed = confirm(`"${eventTitle}" 이벤트를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 관련 참여자 데이터도 함께 삭제됩니다.`);
    if (!confirmed) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        // API 오류 시 alert로 에러 메시지 표시
        alert(`삭제 실패: ${data.error ?? "알 수 없는 오류가 발생했습니다."}`);
        return;
      }

      // 성공 시 페이지 새로고침하여 목록 갱신
      router.refresh();
    } catch (error) {
      alert(`삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "네트워크 오류"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isLoading}
    >
      {isLoading ? "삭제 중..." : "삭제"}
    </Button>
  );
}
