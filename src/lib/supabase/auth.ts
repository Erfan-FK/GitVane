import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface CurrentUser {
  id: string;
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
}

/** Returns the current signed-in user, or null. Safe when Supabase is off. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? null,
    username: (meta.user_name as string) ?? (meta.preferred_username as string) ?? null,
    avatarUrl: (meta.avatar_url as string) ?? null,
  };
}
