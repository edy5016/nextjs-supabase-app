import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/events";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // NextResponse.redirect()를 사용해야 Set-Cookie 헤더가 302 응답에 포함됨
      // redirect()를 사용하면 쿠키가 누락되어 로그인 후 세션이 없는 상태로 이동됨
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}/auth/error?error=No+authorization+code`);
}
