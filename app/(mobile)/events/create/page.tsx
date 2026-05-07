"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/events/event-form";
import type { EventFormValues } from "@/lib/validations/event";

export default function CreateEventPage() {
  const router = useRouter();

  const handleSubmit = (data: EventFormValues) => {
    console.log("이벤트 생성:", data);
    router.push("/events");
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

      <h1 className="mb-6 text-2xl font-bold text-foreground">이벤트 만들기</h1>

      <EventForm onSubmit={handleSubmit} />
    </div>
  );
}
