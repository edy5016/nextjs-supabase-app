import { createAdminClient } from "@/lib/supabase/admin";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import type { EventCreationDataPoint, UserGrowthDataPoint } from "@/components/admin/analytics-charts";

export const dynamic = "force-dynamic";

// 최근 7일 날짜 배열 생성 (YYYY-MM-DD 형식)
function getLast7Days(): { dateKey: string; label: string }[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    days.push({
      dateKey: d.toISOString().split("T")[0], // YYYY-MM-DD
      label: `${month}/${day}`,
    });
  }
  return days;
}

export default async function AdminAnalyticsPage() {
  const adminClient = createAdminClient();
  const last7Days = getLast7Days();

  // 7일 전 시작 시간
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // 이벤트 생성 데이터 조회 (최근 7일)
  const { data: eventRows, error: eventError } = await adminClient
    .from("events")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString());

  // 사용자 가입 데이터 조회 (최근 7일)
  const { data: usersData, error: userError } = await adminClient.auth.admin.listUsers({
    perPage: 10000,
  });

  // 날짜별 이벤트 생성 수 집계
  const eventCountMap: Record<string, number> = {};
  last7Days.forEach(({ dateKey }) => {
    eventCountMap[dateKey] = 0;
  });

  if (eventRows) {
    eventRows.forEach((row) => {
      const dateKey = row.created_at.split("T")[0];
      if (dateKey in eventCountMap) {
        eventCountMap[dateKey]++;
      }
    });
  }

  // 날짜별 신규 사용자 수 집계
  const userCountMap: Record<string, number> = {};
  last7Days.forEach(({ dateKey }) => {
    userCountMap[dateKey] = 0;
  });

  if (usersData) {
    usersData.users.forEach((user) => {
      const dateKey = user.created_at.split("T")[0];
      if (dateKey in userCountMap) {
        userCountMap[dateKey]++;
      }
    });
  }

  // 차트 데이터 변환
  const eventCreationData: EventCreationDataPoint[] = last7Days.map(({ dateKey, label }) => ({
    date: label,
    count: eventCountMap[dateKey] ?? 0,
  }));

  const userGrowthData: UserGrowthDataPoint[] = last7Days.map(({ dateKey, label }) => ({
    date: label,
    count: userCountMap[dateKey] ?? 0,
  }));

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">통계 분석</h1>

      {/* 데이터 조회 오류 시 경고 표시 */}
      {(eventError || userError) && (
        <div className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            일부 데이터를 불러오지 못했습니다.
            {eventError && ` 이벤트: ${eventError.message}`}
            {userError && ` 사용자: ${userError.message}`}
          </p>
        </div>
      )}

      <AnalyticsCharts
        eventCreationData={eventCreationData}
        userGrowthData={userGrowthData}
      />
    </div>
  );
}
