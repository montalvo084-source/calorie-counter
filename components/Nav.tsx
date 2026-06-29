"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home", emoji: "🏠" },
  { href: "/history", label: "History", emoji: "📋" },
  { href: "/settings", label: "Settings", emoji: "⚙️" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border h-[60px]">
      <div className="max-w-[480px] mx-auto h-full flex items-center justify-around px-2">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 flex-1 py-1"
            >
              <span className="text-xl">{tab.emoji}</span>
              <span
                className={`text-[10px] font-semibold ${active ? "text-accent" : "text-muted"}`}
              >
                {tab.label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
