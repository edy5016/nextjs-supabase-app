/**
 * 날짜 문자열을 한국어 형식으로 포맷합니다
 * @param dateStr ISO 날짜 문자열
 * @param options Intl.DateTimeFormatOptions (기본값: 월/일/요일)
 */
export function formatDate(
  dateStr: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(dateStr);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    weekday: "short",
  };
  return date.toLocaleDateString("ko-KR", options ?? defaultOptions);
}

/**
 * 날짜 문자열을 연/월/일/시/분까지 포함한 상세 형식으로 포맷합니다
 */
export function formatDateFull(dateStr: string): string {
  return formatDate(dateStr, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
