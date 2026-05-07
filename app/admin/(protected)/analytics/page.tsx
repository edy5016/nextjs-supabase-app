"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// 이벤트 생성 추이 더미 데이터 (최근 7일)
const eventCreationData = [
  { date: "4/22", count: 2 },
  { date: "4/23", count: 5 },
  { date: "4/24", count: 3 },
  { date: "4/25", count: 7 },
  { date: "4/26", count: 4 },
  { date: "4/27", count: 6 },
  { date: "4/28", count: 8 },
];

// 사용자 증가 추이 더미 데이터 (최근 7일)
const userGrowthData = [
  { date: "4/22", total: 980 },
  { date: "4/23", total: 997 },
  { date: "4/24", total: 1005 },
  { date: "4/25", total: 1018 },
  { date: "4/26", total: 1027 },
  { date: "4/27", total: 1039 },
  { date: "4/28", total: 1048 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">통계 분석</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 이벤트 생성 추이 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>이벤트 생성 추이</CardTitle>
            <CardDescription>최근 7일간 생성된 이벤트 수</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventCreationData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} name="이벤트 수" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 사용자 증가 추이 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>사용자 증가 추이</CardTitle>
            <CardDescription>최근 7일간 누적 사용자 수</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  name="누적 사용자"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
