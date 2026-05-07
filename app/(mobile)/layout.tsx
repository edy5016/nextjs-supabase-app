import { Suspense } from "react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileNav } from "@/components/layout/mobile-nav";

export const dynamic = "force-dynamic";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <main className="mx-auto max-w-md px-4 pb-16 pt-14">{children}</main>
      <Suspense fallback={<div className="h-16" />}>
        <MobileNav />
      </Suspense>
    </div>
  );
}
