import Link from "next/link";
import Image from "next/image";

export default function SideNavbar({
  links = [],
  theme,
  layout = {
    sidebar: {
      width: "16rem",
      navigation: {
        width: "14rem",
        topPadding: "4rem",
        iconSize: 28,
        iconContainerWidth: "2.5rem",
        fontSize: "text-xl",
        fontWeight: "font-semibold",
      },
    },
  },
}) {
  return (
    <aside
      className="min-h-screen"
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
        className="mx-auto"
        style={{
          width: layout.sidebar.navigation.width,
          paddingTop: layout.sidebar.navigation.topPadding,
        }}
      >
        <ul className="space-y-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="
                  flex
                  items-center
                  rounded-lg
                  px-4
                  py-3
                  text-[color:var(--sidebar-text)]
                  hover:bg-[var(--sidebar-hover)]
                  transition-colors
                  duration-200
                "
              >
                <div
                  className="flex justify-center shrink-0"
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
                  className={`${layout.sidebar.navigation.fontSize} ${layout.sidebar.navigation.fontWeight} ml-4`}
                >
                  {link.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}