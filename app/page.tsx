import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Link2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: Calendar,
    title: "간편한 이벤트 생성",
    description: "제목, 날짜, 장소만 입력하면 즉시 이벤트가 완성됩니다.",
  },
  {
    icon: Link2,
    title: "원클릭 초대 링크",
    description: "자동 생성된 초대 링크를 카카오톡으로 바로 공유하세요.",
  },
  {
    icon: Users,
    title: "실시간 참여자 관리",
    description: "참여자가 추가될 때마다 목록이 실시간으로 업데이트됩니다.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    if (user.app_metadata?.role === "admin") {
      redirect("/admin/dashboard");
    } else {
      redirect("/events");
    }
  }
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b px-4 sm:px-6">
        <span className="text-xl font-bold text-emerald-500">Gather</span>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600">
            <Link href="/auth/login">로그인</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center">
        <section className="flex w-full flex-col items-center px-4 py-20 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            초대 링크 하나로
            <br />
            <span className="text-emerald-500">이벤트를 완성하세요</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            생일 파티, 소풍, 네트워킹 모임까지. 5~30명 규모의 소규모 이벤트를 가장 쉽게
            관리하는 방법.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-14 rounded-xl bg-emerald-500 px-8 text-base hover:bg-emerald-600"
          >
            <Link href="/auth/login">Google로 시작하기</Link>
          </Button>
        </section>

        <section className="grid w-full max-w-3xl grid-cols-1 gap-4 px-4 pb-20 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center rounded-2xl border bg-card p-6 text-center shadow-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950">
                <Icon size={24} />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
