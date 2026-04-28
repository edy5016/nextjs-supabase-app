import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function MobileHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
      <Link href="/events" className="text-lg font-bold text-emerald-500">
        Gather
      </Link>
      <ThemeSwitcher />
    </header>
  );
}
