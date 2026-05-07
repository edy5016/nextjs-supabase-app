import { z } from "zod";

/**
 * 이벤트 생성/수정 폼 유효성 검사 스키마
 * create와 edit 페이지 양쪽에서 재사용됩니다
 *
 * 주의: max_participants는 number 타입이지만 폼에서는 input[type=number]를 사용합니다.
 * react-hook-form은 valueAsNumber 옵션으로 자동 변환합니다.
 */
export const eventSchema = z.object({
  title: z
    .string()
    .min(1, "이벤트 이름을 입력해주세요")
    .max(100, "100자 이내로 입력해주세요"),
  description: z
    .string()
    .min(1, "이벤트 설명을 입력해주세요")
    .max(1000, "1000자 이내로 입력해주세요"),
  location: z
    .string()
    .min(1, "장소를 입력해주세요")
    .max(200, "200자 이내로 입력해주세요"),
  start_at: z.string().min(1, "시작 시간을 입력해주세요"),
  end_at: z.string().min(1, "종료 시간을 입력해주세요"),
  max_participants: z
    .number()
    .min(1, "최소 1명 이상이어야 합니다")
    .max(1000, "최대 1000명까지 가능합니다"),
  status: z.enum(["upcoming", "ongoing", "ended"]),
});

export type EventFormValues = z.infer<typeof eventSchema>;
