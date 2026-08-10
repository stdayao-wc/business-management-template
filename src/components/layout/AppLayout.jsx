"use client";

import Header from "./Header";
import SideNavbar from "./SideNavbar";

import { useAuth } from "@/context/AuthContext";

export default function AppLayout({ children, navigation, theme, layout }) {
  const { profile, roles } = useAuth();

  const firstName = profile?.first_name || "User";

  const roleName = roles?.map((role) => role.name).join(", ") || "";

  return (
    <>
      <Header
        profile={{
          name: firstName,
          role: roleName,
        }}
      />

      <div className="flex">
        <SideNavbar links={navigation} theme={theme.sidebar} layout={layout} />

        <main className="flex-1 p-8">{children}</main>
      </div>
    </>
  );
}
