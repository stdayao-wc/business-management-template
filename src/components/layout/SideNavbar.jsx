import Link from "next/link";
import Image from "next/image";

export default function SideNavbar({ links = [], theme }) {
  return (
    <aside
      className="w-64 min-h-screen"
      style={{
        "--sidebar-bg": theme.background,
        "--sidebar-text": theme.text,
        "--sidebar-hover": theme.hover,
        backgroundColor: "var(--sidebar-bg)",
        color: "var(--sidebar-text)",
      }}
    >
      <nav className="flex justify-center pt-16">
        <ul className="w-52 space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="
                  flex
                  items-center
                  w-full
                  rounded-lg
                  px-4
                  py-3
                  text-[color:var(--sidebar-text)]
                  hover:bg-[var(--sidebar-hover)]
                  transition-colors
                  duration-200
                "
              >
                <div className="flex w-8 justify-center shrink-0">
                  {link.icon && (
                    <Image
                      src={link.icon}
                      alt={link.label}
                      width={24}
                      height={24}
                    />
                  )}
                </div>

                <span className="ml-4 text-base font-medium md:text-lg">
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