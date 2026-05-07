"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DUMMY_EVENTS } from "@/lib/dummy-data";
import type { EventStatus } from "@/types";

// 이벤트 상태별 뱃지 설정
const statusConfig: Record<EventStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  upcoming: { label: "예정", variant: "default" },
  ongoing: { label: "진행 중", variant: "secondary" },
  ended: { label: "종료", variant: "outline" },
};

export default function AdminEventsPage() {
  // 이벤트 목록 상태 (로컬 삭제 반영)
  const [events, setEvents] = useState(DUMMY_EVENTS);
  // 검색어 상태
  const [searchQuery, setSearchQuery] = useState("");

  // 검색어로 이벤트 필터링
  const filteredEvents = events.filter((e) =>
    e.title.includes(searchQuery)
  );

  // 이벤트 삭제 핸들러 - confirm 다이얼로그 후 로컬 상태에서 제거
  const handleDelete = (id: string) => {
    if (!confirm("이벤트를 삭제하시겠습니까?")) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">이벤트 관리</h1>

      <div className="mb-4 flex items-center gap-3">
        {/* 이벤트 검색 입력창 */}
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="이벤트 검색..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* 필터링된 결과 카운트 */}
        <span className="text-sm text-muted-foreground">
          전체 {filteredEvents.length}개
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">제목</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">날짜</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">참여자</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">상태</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const status = statusConfig[event.status];
                return (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4 font-medium text-foreground">{event.title}</td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {new Date(event.start_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{event.participant_count}명</td>
                    <td className="px-4 py-4">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                      >
                        삭제
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              // 검색 결과가 없을 때 빈 상태 메시지
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
