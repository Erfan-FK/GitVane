"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import type { CurrentUser } from "@/lib/supabase/auth";
import { History, LogOut, ChevronDown } from "lucide-react";

export function UserMenu({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = (user.username || user.email || "?").charAt(0).toUpperCase();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-border p-0.5 pr-2 transition-colors hover:bg-accent"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="size-7 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="grid size-7 place-items-center rounded-full bg-foreground text-xs font-medium text-background">
            {initial}
          </span>
        )}
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-popover shadow-md">
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user.username ?? "Signed in"}</p>
            {user.email && (
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
          <Link
            href="/history"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <History className="size-4" /> History
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
