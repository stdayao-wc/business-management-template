"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLayout } from "@/context/LayoutContext";

export default function SideNavbar({
  links = [],
  theme,
  layout = {
    sidebar: {
      expandedWidth: "16rem",
      collapsedWidth: "5rem",
      navigation: {
        width: collapsed
          ? layout.sidebar.collapsedWidth
          : layout.sidebar.expandedWidth,
        topPadding: "4rem",
        iconSize: 32,
        iconContainerWidth: "2.5rem",
        fontSize: "text-2xl",
        fontWeight: "font-semibold",
      },
    },
  },
}) {
  const pathname = usePathname();
  const { sidebarMode } = useLayout();

  const collapsed = sidebarMode === "collapsed";

  return (
    <aside
      className={`
      sticky
      top-20
      h-[calc(100vh-5rem)]
      flex
      flex-col
      transition-all
      duration-300
      ${
        collapsed ? layout.sidebar.collapsedWidth : layout.sidebar.expandedWidth
      }
    `}
      style={{
        "--sidebar-bg": theme.background,
        "--sidebar-text": theme.text,
        "--sidebar-hover": theme.hover,

        backgroundColor: "var(--sidebar-bg)",
        color: "var(--sidebar-text)",
      }}
    >
      <nav
        className="flex-1 overflow-y-auto"
        style={{
          paddingTop: layout.sidebar.navigation.topPadding,
        }}
      >
        <ul
          className={`
            mx-auto
            space-y-3
            ${collapsed ? "w-full px-2" : layout.sidebar.navigation.width}
          `}
        >
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  title={collapsed ? link.label : undefined}
                  className={`
                    flex
                    w-full
                    items-center
                    rounded-lg
                    py-3
                    transition-all
                    duration-300
                    text-[color:var(--sidebar-text)]
                    ${collapsed ? "justify-center px-2" : "px-4"}
                    ${isActive ? "bg-[var(--sidebar-hover)]" : "hover:bg-[var(--sidebar-hover)]"}
                    select-none
                    cursor-pointer
                  `}
                >
                  <div
                    className={`
                      flex
                      shrink-0
                      justify-center
                      transition-all
                      duration-300
                      ${collapsed ? "w-full" : layout.sidebar.navigation.iconContainerWidth}
                    `}
                    style={{
                      width: layout.sidebar.navigation.iconContainerWidth,
                    }}
                  >
                    {link.icon && (
                      <Image
                        src={link.icon}
                        alt={link.label}
                        width={layout.sidebar.navigation.iconSize}
                        height={layout.sidebar.navigation.iconSize}
                      />
                    )}
                  </div>

                  <span
                    className={`
                      overflow-hidden
                      whitespace-nowrap
                      transition-all
                      duration-300
                      ${layout.sidebar.navigation.fontSize}
                      ${layout.sidebar.navigation.fontWeight}
                      ${collapsed ? "ml-0 w-0 opacity-0" : "ml-5 w-auto opacity-100"}
                    `}
                  >
                    {link.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
