"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  onSubmit: (data: EventFormValues) => void;
  isLoading?: boolean;
}

export function EventForm({ defaultValues, onSubmit, isLoading }: EventFormProps) {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
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

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-xl bg-emerald-500 hover:bg-emerald-600"
        >
          {isLoading ? "저장 중..." : "저장"}
        </Button>
      </form>
    </Form>
  );
}
