import { GoogleAuthButton } from "@/components/google-auth-button";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-8 shadow-lg dark:bg-gray-900">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-emerald-500">Gather Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">관리자 계정으로 로그인하세요</p>
        </div>
        {error === "unauthorized" && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            관리자 권한이 없는 계정입니다.
          </p>
        )}
        <GoogleAuthButton label="Google로 관리자 로그인" next="/admin/dashboard" />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          관리자 권한이 있는 계정만 접근 가능합니다
        </p>
      </div>
    </div>
  );
}
