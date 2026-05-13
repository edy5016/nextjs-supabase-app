"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { eventSchema, type EventFormValues } from "@/lib/validations/event";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { ImageIcon, Loader2 } from "lucide-react";

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  /** 기존 커버 이미지 URL (수정 시 사용) */
  defaultCoverImageUrl?: string;
  /** Server Action: 폼 데이터 + 커버 이미지 URL을 받아 처리 */
  action: (
    data: EventFormValues & { cover_image_url?: string }
  ) => Promise<{ error?: string; redirectTo?: string }>;
}

export function EventForm({
  defaultValues,
  defaultCoverImageUrl,
  action,
}: EventFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const router = useRouter();
  // 커버 이미지 URL 상태 (업로드 후 저장)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    defaultCoverImageUrl ?? null
  );
  const [imageUploading, setImageUploading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<EventFormValues, any, EventFormValues>({
    // Zod v4 + @hookform/resolvers v5 호환성: 타입 단언으로 해결
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      location: "",
      start_at: "",
      end_at: "",
      max_participants: 10,
      status: "upcoming",
      ...defaultValues,
    },
  });

  /**
   * 이미지 파일 선택 시 Supabase Storage에 직접 업로드
   * 업로드 실패해도 폼 제출은 가능 (선택 사항)
   */
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setImageError(null);
    const supabase = createClient();
    // 파일명 충돌 방지를 위해 타임스탬프 접두사 사용
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const { data, error } = await supabase.storage
      .from("event-covers")
      .upload(fileName, file);

    if (error) {
      setImageError(`이미지 업로드 실패: ${error.message}`);
    } else if (data) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("event-covers").getPublicUrl(data.path);
      setCoverImageUrl(publicUrl);
    }
    setImageUploading(false);
  };

  const onSubmit = form.handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      const result = await action({
        ...data,
        cover_image_url: coverImageUrl ?? undefined,
      });
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      if (result?.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  });

  const isSubmitting = isPending || imageUploading;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {/* 커버 이미지 업로드 (선택 사항) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            커버 이미지 <span className="text-muted-foreground">(선택)</span>
          </label>
          {/* 이미지 미리보기 */}
          {coverImageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImageUrl}
                alt="커버 이미지 미리보기"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <label
            htmlFor="cover-image-upload"
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-emerald-500 hover:text-emerald-500 ${imageUploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            {imageUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                업로드 중...
              </>
            ) : (
              <>
                <ImageIcon size={16} />
                {coverImageUrl ? "이미지 변경" : "이미지 선택"}
              </>
            )}
          </label>
          <input
            id="cover-image-upload"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            disabled={imageUploading}
            onChange={handleImageChange}
          />
          {imageError && (
            <p className="text-sm text-destructive">{imageError}</p>
          )}
        </div>

        {/* 이벤트 이름 */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이벤트 이름 *</FormLabel>
              <FormControl>
                <Input placeholder="어떤 이벤트인가요?" maxLength={100} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 이벤트 설명 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명 *</FormLabel>
              <FormControl>
                <textarea
                  placeholder="이벤트에 대해 알려주세요"
                  maxLength={1000}
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 장소 */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>장소 *</FormLabel>
              <FormControl>
                <Input placeholder="어디서 만나나요?" maxLength={200} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 시작 시간 */}
        <FormField
          control={form.control}
          name="start_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>시작 시간 *</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 종료 시간 */}
        <FormField
          control={form.control}
          name="end_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>종료 시간 *</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 최대 참여 인원 — valueAsNumber로 number 타입 보장 */}
        <FormField
          control={form.control}
          name="max_participants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>최대 참여 인원 *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 이벤트 상태 */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상태 *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="상태를 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="upcoming">예정</SelectItem>
                  <SelectItem value="ongoing">진행 중</SelectItem>
                  <SelectItem value="ended">종료</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 서버 에러 표시 */}
        {serverError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-emerald-500 hover:bg-emerald-600"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            "저장"
          )}
        </Button>
      </form>
    </Form>
  );
}
