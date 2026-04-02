"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function TopBar() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="h-14 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-baseline gap-0.5">
        <span className="font-display text-xl font-light text-accent-gold">PROP</span>
        <span className="font-display text-xl font-light text-text-primary">DASH</span>
      </div>

      {/* Sync status */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-text-muted">
        <span className="h-2 w-2 rounded-full bg-status-green" />
        Connected
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-accent-gold-dim flex items-center justify-center text-accent-gold text-sm font-medium">
            {session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="hidden sm:inline">{session?.user?.name || session?.user?.email}</span>
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-bg-elevated border border-border-default rounded-lg shadow-xl py-1 z-50">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
