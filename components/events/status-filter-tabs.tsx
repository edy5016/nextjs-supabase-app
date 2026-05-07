"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type StatusValue = "all" | "upcoming" | "ongoing" | "ended";

const filterTabs: { label: string; value: StatusValue }[] = [
  { label: "전체", value: "all" },
  { label: "예정", value: "upcoming" },
  { label: "진행 중", value: "ongoing" },
  { label: "종료", value: "ended" },
];

/**
 * 이벤트 상태 필터 탭 컴포넌트
 * URL ?status 파라미터를 변경하여 Server Component에서 필터링합니다
 */
export function StatusFilterTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentStatus = (searchParams.get("status") as StatusValue) ?? "all";

  const handleTabClick = (value: StatusValue) => {
    if (value === "all") {
      router.push("/events");
    } else {
      router.push(`/events?status=${value}`);
    }
  };

  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
      {filterTabs.map((tab) => {
        const isActive = currentStatus === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={cn(
              "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-emerald-500 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
