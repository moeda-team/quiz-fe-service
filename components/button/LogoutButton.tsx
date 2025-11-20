// components/LogoutButton.tsx
"use client";

import { signOut } from "next-auth/react";
import { Power } from "@phosphor-icons/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-100"
    >
      <Power className="w-3 h-3" />
      <span>Logout</span>
    </button>
  );
}
