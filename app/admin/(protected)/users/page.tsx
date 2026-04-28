import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { RoleToggleButton } from "@/components/admin/role-toggle-button";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();
  const {
    data: { users },
    error,
  } = await adminClient.auth.admin.listUsers({ perPage: 100 });

  if (error) {
    return (
      <div className="p-8">
        <p className="text-destructive">사용자 목록을 불러오지 못했습니다: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">사용자 관리</h1>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="사용자 검색..." className="pl-9" disabled />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">사용자</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">이메일</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">역할</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">가입일</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => {
              const role = (user.app_metadata?.role as string) ?? "user";
              const name =
                (user.user_metadata?.full_name as string) ??
                (user.user_metadata?.name as string) ??
                user.email ??
                "-";
              const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
              const isSelf = user.id === currentUser?.id;

              return (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-foreground">
                        {name}
                        {isSelf && (
                          <span className="ml-1 text-xs text-muted-foreground">(나)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-4">
                    <Badge variant={role === "admin" ? "default" : "outline"}>
                      {role === "admin" ? "관리자" : "일반"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-4">
                    <RoleToggleButton userId={user.id} currentRole={role} isSelf={isSelf} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          총 {users.length}명
        </div>
      </div>
    </div>
  );
}
