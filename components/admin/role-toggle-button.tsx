"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface RoleToggleButtonProps {
  userId: string;
  currentRole: string;
  isSelf: boolean;
}

export function RoleToggleButton({ userId, currentRole, isSelf }: RoleToggleButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isAdmin = currentRole === "admin";
  const nextRole = isAdmin ? "user" : "admin";

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: nextRole }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        alert(error ?? "역할 변경에 실패했습니다.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isAdmin ? "outline" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={loading || isSelf}
      title={isSelf ? "자신의 관리자 권한은 변경할 수 없습니다" : undefined}
    >
      {loading ? "처리 중..." : isAdmin ? "관리자 해제" : "관리자 지정"}
    </Button>
  );
}
