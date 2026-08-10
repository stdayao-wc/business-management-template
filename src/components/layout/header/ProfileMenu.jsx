"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { logout } from "@/services/auth";

export default function ProfileMenu({ name = "User", role = "", avatar }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      await logout();

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-gray-100"
      >
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-700">
            {name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="hidden text-left md:block">
          <div className="font-semibold">{name}</div>

          {role && <div className="text-sm text-gray-500">{role}</div>}
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border bg-white py-2 shadow-lg">
          <div className="border-b px-4 py-3">
            <p className="font-semibold">{name}</p>

            {role && <p className="text-sm text-gray-500">{role}</p>}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      )}
    </div>
  );
}
