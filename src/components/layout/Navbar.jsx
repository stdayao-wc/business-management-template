import Link from "next/link";
import Image from "next/image";

export default function Navbar({ links = [] }) {
  return (
    <aside className="w-64 min-h-screen bg-slate-800 text-white">
      <nav className="py-4">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center gap-4 px-5 py-3 hover:bg-slate-700 transition-colors"
              >
                {link.icon && (
                  <Image
                    src={link.icon}
                    alt={`${link.label} icon`}
                    width={24}
                    height={24}
                  />
                )}

                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}