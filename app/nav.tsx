"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";

// Le tableau de bord est à part ; semis puis plante forment les étapes du cycle de vie.
const DASHBOARD: { href: string; label: string; icon: IconName } = {
  href: "/",
  label: "Tableau de bord",
  icon: "calendar",
};
const STEPS: { href: string; label: string; icon: IconName }[] = [
  { href: "/semis", label: "Semis", icon: "sprout" },
  { href: "/plantes", label: "Plantes", icon: "leaf" },
];

export default function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const dashboardActive = isActive(DASHBOARD.href);

  return (
    <nav
      aria-label="Menu principal"
      className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-1.5 py-2 sm:gap-3 sm:px-4"
    >
      <Link
        href={DASHBOARD.href}
        aria-current={dashboardActive ? "page" : undefined}
        className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-2 py-2 text-sm font-semibold transition-colors sm:px-3 ${
          dashboardActive ? "bg-green-700 text-white" : "text-green-800 hover:bg-green-100"
        }`}
      >
        <Icon name={DASHBOARD.icon} className="hidden h-4 w-4 sm:block" />
        {DASHBOARD.label}
      </Link>

      <span aria-hidden className="mx-0.5 h-6 w-px shrink-0 bg-line sm:mx-0" />

      <ol
        aria-label="Étapes : d'abord les semis, puis les plantes"
        className="flex items-center gap-0.5 rounded-xl bg-green-100/70 p-1"
      >
        {STEPS.map(({ href, label, icon }, i) => {
          const active = isActive(href);
          return (
            <li key={href} className="flex items-center gap-0.5">
              {i > 0 && <Icon name="arrow" className="h-3.5 w-3.5 text-green-500 sm:mx-0.5" />}
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors sm:px-2.5 ${
                  active ? "bg-green-700 text-white" : "text-green-800 hover:bg-green-200/70"
                }`}
              >
                <span
                  aria-hidden
                  className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold ${
                    active ? "bg-white text-green-800" : "bg-green-300/70 text-green-900"
                  }`}
                >
                  {i + 1}
                </span>
                <Icon name={icon} className="hidden h-4 w-4 sm:block" />
                {label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
