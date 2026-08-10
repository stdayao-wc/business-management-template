"use client";

import HamburgerButton from "./header/HamburgerButton";
import Logo from "./header/Logo";
import ProfileMenu from "./header/ProfileMenu";

import app from "@/app/config/app";
import { useLayout } from "@/context/LayoutContext";

export default function Header({
  profile = {
    name: "User",
    role: "",
    avatar: "",
  },
}) {
  const { toggleSidebar } = useLayout();

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="flex h-20 items-center px-6">
        {/* Left */}

        <div className="flex flex-1 items-center gap-4">
          <HamburgerButton onClick={toggleSidebar} />

          <Logo
            href={app.home}
            src={app.logo.src}
            alt={app.logo.alt}
            title={app.name}
            imageWidth={app.logo.width}
            imageHeight={app.logo.height}
          />
        </div>

        {/* Right */}

        <div className="flex items-center justify-end">
          <ProfileMenu
            name={profile.name}
            role={profile.role}
            avatar={profile.avatar}
          />
        </div>
      </div>
    </header>
  );
}
