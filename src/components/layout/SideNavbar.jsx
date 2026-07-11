"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function SideNavbar({
  links = [],
  theme,
  layout = {
    sidebar: {
      width: "16rem",
      navigation: {
        width: "14rem",
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

  return (
    <aside
      className="
    sticky
    top-20
    h-[calc(100vh-5rem)]
    flex
    flex-col
  "
      style={{
        width: layout.sidebar.width,

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
          className="mx-auto space-y-3"
          style={{
            width: layout.sidebar.navigation.width,
          }}
        >
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`
                    flex
                    w-full
                    items-center
                    rounded-lg
                    px-4
                    py-3
                    text-[color:var(--sidebar-text)]
                    transition-colors
                    duration-200
                    ${
                      isActive
                        ? "bg-[var(--sidebar-hover)]"
                        : "hover:bg-[var(--sidebar-hover)]"
                    }
                  `}
                >
                  <div
                    className="flex shrink-0 justify-center"
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
                    className={`${layout.sidebar.navigation.fontSize} ${layout.sidebar.navigation.fontWeight} ml-5`}
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
