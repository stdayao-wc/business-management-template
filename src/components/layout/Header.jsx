"use client";

import HamburgerButton from "./header/HamburgerButton";
import Logo from "./header/Logo";
import SearchBar from "./header/SearchBar";
import Notifications from "./header/Notifications";
import ProfileMenu from "./header/ProfileMenu";
import app from "@/app/config/app";
import { useLayout } from "@/context/LayoutContext";

export default function Header({
  search = {
    value: "",
    placeholder: "Search...",
    onChange: () => {},
    onSearch: () => {},
  },

  notifications = {
    count: 0,
    onClick: () => {},
  },

  profile = {
    name: "User",
    role: "",
    avatar: "",
    onClick: () => {},
  },
}) {
  const { toggleSidebar } = useLayout();
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex h-20 items-center px-8">
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

        {/* Center */}
        <div className="flex flex-[2] justify-center px-8">
          <SearchBar
            placeholder="Search..."
            onSearch={(text) => console.log(text)}
          />
        </div>

        {/* Right */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <Notifications
            count={notifications.count}
            onClick={notifications.onClick}
          />

          <ProfileMenu
            name={profile.name}
            role={profile.role}
            avatar={profile.avatar}
            onClick={profile.onClick}
          />
        </div>
      </div>
    </header>
  );
}
