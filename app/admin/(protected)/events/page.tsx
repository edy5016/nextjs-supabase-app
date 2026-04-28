import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DUMMY_EVENTS } from "@/lib/dummy-data";
import type { EventStatus } from "@/types";

const statusConfig: Record<EventStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  upcoming: { label: "예정", variant: "default" },
  ongoing: { label: "진행 중", variant: "secondary" },
  ended: { label: "종료", variant: "outline" },
};

export default function AdminEventsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">이벤트 관리</h1>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="이벤트 검색..." className="pl-9" disabled />
        </div>
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
            {DUMMY_EVENTS.map((event) => {
              const status = statusConfig[event.status];
              return (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-4 font-medium text-foreground">{event.title}</td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {new Date(event.event_date).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">{event.participant_count}명</td>
                  <td className="px-4 py-4">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Button variant="destructive" size="sm" disabled>삭제</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
