import { CalendarDays, Users } from "lucide-react";

const metrics = [
  { label: "오늘 생성된 이벤트", value: 3, icon: CalendarDays, color: "text-emerald-500" },
  { label: "이번 주 생성된 이벤트", value: 18, icon: CalendarDays, color: "text-emerald-500" },
  { label: "이번 달 생성된 이벤트", value: 74, icon: CalendarDays, color: "text-emerald-500" },
  { label: "전체 이벤트 수", value: 312, icon: CalendarDays, color: "text-emerald-500" },
  { label: "오늘 가입한 사용자", value: 5, icon: Users, color: "text-amber-500" },
  { label: "이번 주 가입한 사용자", value: 27, icon: Users, color: "text-amber-500" },
  { label: "전체 사용자 수", value: 1048, icon: Users, color: "text-amber-500" },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground">대시보드</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="flex items-center gap-4 rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              <div className={`rounded-lg bg-muted p-3 ${metric.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {metric.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
