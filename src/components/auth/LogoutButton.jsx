"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/services/auth";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
    >
      Sign Out
    </button>
  );
}