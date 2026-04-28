import { notFound } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getDummyEventById } from "@/lib/dummy-data";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getDummyEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">이벤트 수정</h1>

      <form className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cover">커버 이미지</Label>
          <div className="aspect-video w-full overflow-hidden rounded-2xl border">
            {event.cover_image_url && (
              <img
                src={event.cover_image_url}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="title">이벤트 제목 *</Label>
          <Input id="title" defaultValue={event.title} maxLength={50} disabled />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="date">날짜 및 시간 *</Label>
          <Input
            id="date"
            type="datetime-local"
            defaultValue={event.event_date.slice(0, 16)}
            disabled
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="location">장소 *</Label>
          <Input id="location" defaultValue={event.location} maxLength={100} disabled />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">설명</Label>
          <textarea
            id="description"
            defaultValue={event.description ?? ""}
            maxLength={500}
            disabled
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          폼 로직은 Phase 2에서 구현됩니다
        </p>

        <Button type="submit" className="h-12 w-full rounded-xl bg-emerald-500 hover:bg-emerald-600" disabled>
          수정 완료
        </Button>
      </form>
    </div>
  );
}
