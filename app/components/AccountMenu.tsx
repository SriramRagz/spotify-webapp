"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Account = {
  displayName: string;
  email: string;
};

export default function AccountMenu() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Session unavailable");
        return response.json();
      })
      .then((data) => {
        if (active) setAccount(data.user);
      })
      .catch(() => {
        if (active) setAccount(null);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-full bg-[#202723] px-4 py-2 text-sm text-gray-300">
      <div className="hidden text-right sm:block">
        <p className="font-semibold text-white">
          {account?.displayName ?? "Your account"}
        </p>
        <p className="text-xs text-gray-400">
          {account?.email ?? ""}
        </p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="rounded-full bg-[#303b34] px-4 py-2 font-semibold text-white transition hover:bg-red-900 disabled:opacity-60"
      >
        {loggingOut ? "Logging out..." : "Log Out"}
      </button>
    </div>
  );
}
