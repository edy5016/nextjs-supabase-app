"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/events", label: "내 이벤트", icon: Calendar },
  { href: "/events/create", label: "새 이벤트", icon: PlusCircle },
  { href: "/profile", label: "프로필", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center border-t bg-background">
      {tabs.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors",
              isActive ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon size={24} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
