"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons/github";
import { LoaderCircle } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  async function signIn() {
    setLoading(true);
    setError(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: `${siteUrl}/auth/callback` },
      });
      if (error) throw error;
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <Button
        onClick={signIn}
        disabled={!configured || loading}
        size="lg"
        className="w-full"
      >
        {loading ? <LoaderCircle className="animate-spin" /> : <GithubIcon />}
        Continue with GitHub
      </Button>

      {!configured && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Sign-in isn&apos;t configured yet. Add your Supabase keys to enable GitHub
          login. You can still analyze public repos without signing in.
        </p>
      )}
      {error && <p className="mt-3 text-center text-xs text-foreground/80">{error}</p>}
    </div>
  );
}
