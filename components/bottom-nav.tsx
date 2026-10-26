"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, GiftIcon, HomeIcon, UserIcon } from "./icons";

const ITEMS = [
  { href: "/home", label: "Home", Icon: HomeIcon },
  { href: "/bookings", label: "Bookings", Icon: CalendarIcon },
  { href: "/rewards", label: "Rewards", Icon: GiftIcon },
  { href: "/profile", label: "Profile", Icon: UserIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-[430px] items-center justify-between border-t-2 border-track bg-white px-4 pt-2 pb-[max(22px,env(safe-area-inset-bottom))]"
    >
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-w-16 flex-col items-center gap-0.5 rounded-[14px] px-2.5 py-1.5 text-xs font-bold no-underline ${
              active ? "text-navy-900" : "text-ink-muted"
            }`}
          >
            <span className={`flex h-[30px] w-[52px] items-center justify-center rounded-full ${active ? "bg-primary" : ""}`}>
              <Icon />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
