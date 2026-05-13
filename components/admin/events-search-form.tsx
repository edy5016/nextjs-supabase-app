"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { EventStatus } from "@/types";

// 상태 필터 옵션
const STATUS_OPTIONS: { value: EventStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "upcoming", label: "예정" },
  { value: "ongoing", label: "진행 중" },
  { value: "ended", label: "종료" },
];

interface EventsSearchFormProps {
  defaultQuery?: string;
  defaultStatus?: string;
  totalCount: number;
}

export function EventsSearchForm({
  defaultQuery = "",
  defaultStatus = "all",
  totalCount,
}: EventsSearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // URL searchParams 업데이트 헬퍼
  const updateSearchParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams();
      if (defaultQuery) params.set("q", defaultQuery);
      if (defaultStatus && defaultStatus !== "all") params.set("status", defaultStatus);
      // 검색어 변경 시 페이지 초기화
      params.set("page", "1");

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, defaultQuery, defaultStatus]
  );

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {/* 이벤트 검색 입력창 */}
      <div className="relative max-w-sm flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="이벤트 검색..."
          className="pl-9"
          defaultValue={defaultQuery}
          disabled={isPending}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateSearchParams({ q: e.currentTarget.value, page: "1" });
            }
          }}
          onBlur={(e) => {
            if (e.currentTarget.value !== defaultQuery) {
              updateSearchParams({ q: e.currentTarget.value, page: "1" });
            }
          }}
        />
      </div>

      {/* 상태 필터 버튼 */}
      <div className="flex gap-1">
        {STATUS_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={defaultStatus === option.value || (option.value === "all" && !defaultStatus) ? "default" : "outline"}
            size="sm"
            disabled={isPending}
            onClick={() => updateSearchParams({ status: option.value, page: "1" })}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* 결과 카운트 */}
      <span className="text-sm text-muted-foreground">
        {isPending ? "검색 중..." : `전체 ${totalCount.toLocaleString()}개`}
      </span>
    </div>
  );
}
