import { BarChart3 } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">통계 분석</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900">
          <h2 className="mb-4 font-semibold text-foreground">이벤트 생성 추이 (최근 7일)</h2>
          <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <BarChart3 size={48} />
              <p className="text-sm">Phase 2에서 Recharts 차트가 표시됩니다</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900">
          <h2 className="mb-4 font-semibold text-foreground">사용자 증가 추이 (최근 7일)</h2>
          <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <BarChart3 size={48} />
              <p className="text-sm">Phase 2에서 Recharts 차트가 표시됩니다</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
