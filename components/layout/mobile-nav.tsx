"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

// 2탭 구성: 내 이벤트, 프로필
// 이벤트 생성은 이벤트 목록 페이지의 버튼으로 접근
const tabs = [
  { href: "/events", label: "내 이벤트", icon: Calendar },
  { href: "/profile", label: "프로필", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="mx-auto flex h-16 max-w-md items-center">
        {tabs.map(({ href, label, icon: Icon }) => {
          // /events/* 경로는 모두 내 이벤트 탭으로 활성화
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors",
                isActive
                  ? "text-emerald-500"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={24} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
