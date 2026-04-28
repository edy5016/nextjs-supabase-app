import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { User } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">프로필</h1>

      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6">
        {user?.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="프로필 사진"
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <User size={36} className="text-muted-foreground" />
          </div>
        )}

        <div className="w-full text-center">
          <p className="text-xl font-semibold text-foreground">
            {user?.user_metadata?.full_name ?? user?.email ?? "사용자"}
          </p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        <div className="w-full border-t pt-4 text-sm text-muted-foreground">
          <div className="flex justify-between py-2">
            <span>가입일</span>
            <span>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("ko-KR")
                : "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
