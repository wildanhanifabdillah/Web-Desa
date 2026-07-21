"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        cache: "no-store",
      });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="inline-flex h-10 items-center justify-center rounded-md border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 disabled:cursor-wait disabled:opacity-70"
    >
      {isLoggingOut ? "Keluar..." : "Keluar"}
    </button>
  );
}
