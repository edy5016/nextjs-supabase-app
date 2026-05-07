"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/events/event-form";
import { getDummyEventById } from "@/lib/dummy-data";
import type { EventFormValues } from "@/lib/validations/event";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15 Client Component: use()로 params 언래핑
  const { id } = use(params);
  const router = useRouter();
  const event = getDummyEventById(id);

  if (!event) {
    notFound();
  }

  // 기존 이벤트 데이터를 폼 기본값으로 변환
  // event_date(ISO) → start_at, end_at(datetime-local 포맷: 'YYYY-MM-DDTHH:mm')
  const defaultValues: Partial<EventFormValues> = {
    title: event.title,
    description: event.description ?? "",
    location: event.location,
    // event_date를 start_at과 end_at 모두에 초기값으로 사용
    start_at: event.event_date.slice(0, 16),
    end_at: event.event_date.slice(0, 16),
    max_participants: event.participant_count,
    status: event.status,
  };

  const handleSubmit = (data: EventFormValues) => {
    console.log("이벤트 수정:", id, data);
    router.push(`/events/${id}`);
  };

  return (
    <div className="px-4 py-6">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        뒤로가기
      </button>

      <h1 className="mb-6 text-2xl font-bold text-foreground">이벤트 수정</h1>

      <EventForm defaultValues={defaultValues} onSubmit={handleSubmit} />
    </div>
  );
}
