import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/events/event-form";
import { createEventAction } from "@/app/actions/events";

/**
 * 이벤트 생성 페이지 (Server Component)
 * createEventAction을 EventForm의 action prop으로 전달합니다
 */
export default function CreateEventPage() {
  return (
    <div className="px-4 py-6">
      {/* 뒤로가기 버튼 (Server Component에서 useRouter 사용 불가 → Link 사용) */}
      <Link
        href="/events"
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        뒤로가기
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-foreground">이벤트 만들기</h1>

      <EventForm action={createEventAction} />
    </div>
  );
}
