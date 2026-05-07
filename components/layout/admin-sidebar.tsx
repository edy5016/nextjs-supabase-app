"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";

const menuItems = [
  { href: "/admin/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/events", label: "이벤트 관리", icon: CalendarDays },
  { href: "/admin/users", label: "사용자 관리", icon: Users },
  { href: "/admin/analytics", label: "통계 분석", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center px-6">
        <span className="text-xl font-bold text-emerald-400">Gather Admin</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-12 items-center gap-3 rounded-lg px-4 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-500 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
