import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CreateEventPage() {
  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">이벤트 만들기</h1>

      <form className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cover">커버 이미지</Label>
          <div className="flex aspect-video w-full items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted text-sm text-muted-foreground">
            이미지를 업로드하세요
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="title">이벤트 제목 *</Label>
          <Input id="title" placeholder="어떤 이벤트인가요?" maxLength={50} disabled />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="date">날짜 및 시간 *</Label>
          <Input id="date" type="datetime-local" disabled />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="location">장소 *</Label>
          <Input id="location" placeholder="어디서 만나나요?" maxLength={100} disabled />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">설명</Label>
          <textarea
            id="description"
            placeholder="이벤트에 대해 알려주세요 (선택)"
            maxLength={500}
            disabled
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          폼 로직은 Phase 2에서 구현됩니다
        </p>

        <Button type="submit" className="h-12 w-full rounded-xl bg-emerald-500 hover:bg-emerald-600" disabled>
          이벤트 생성
        </Button>
      </form>
    </div>
  );
}
