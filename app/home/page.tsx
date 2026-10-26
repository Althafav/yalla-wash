import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { HappyCar, Wordmark } from "@/components/happy-car";
import { ChevronRightIcon, CrownIcon, DropIcon, PinIcon, SparkleIcon, UserIcon } from "@/components/icons";
import { ModeLink } from "@/components/mode-link";
import { Bubbles, Screen, Skeleton, StampRow } from "@/components/ui";
import { STAMPS_FOR_FREE, rupees } from "@/lib/booking";
import { getCatalog, getQueue, getRewards } from "@/lib/data";
import { getCustomer } from "@/lib/session";
import { greeting } from "@/lib/time";

export default function HomePage() {
  return (
    <>
      <Screen footer="nav" className="bg-mint-50">
        <div className="flex items-center gap-2.5">
          <HappyCar size={40} />
          <Wordmark />
          <Link href="/profile" className="bp bp-white bp-icon ml-auto" aria-label="Profile">
            <UserIcon />
          </Link>
        </div>
        <Suspense fallback={<HomeSkeleton />}>
          <HomeContent />
        </Suspense>
      </Screen>
      <BottomNav />
    </>
  );
}

function HomeSkeleton() {
  return (
    <>
      <span className="sr-only" role="status">
        Loading
      </span>
      <Skeleton className="h-[62px] w-2/3" />
      <Skeleton className="h-[230px] rounded-[24px]" />
      <Skeleton className="h-[130px]" />
      <Skeleton className="h-[120px] rounded-[22px]" />
    </>
  );
}

const PACKAGE_BADGES: Record<string, { bg: string; icon: ReactNode }> = {
  express: { bg: "bg-aqua-100 text-navy-900", icon: <DropIcon size={18} /> },
  full: { bg: "bg-primary text-navy-900", icon: <SparkleIcon size={18} /> },
  premium: { bg: "bg-navy-900 text-teal-400", icon: <CrownIcon size={18} /> },
};

async function HomeContent() {
  await connection();
  const now = new Date();
  const [{ station, packages }, customer] = await Promise.all([getCatalog(), getCustomer()]);
  const [queue, rewards] = await Promise.all([
    getQueue(station, now),
    customer ? getRewards(customer.id) : Promise.resolve(null),
  ]);
  const directions =
    station.lat != null && station.lng != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${station.name} ${station.area} ${station.city}`)}`;

  return (
    <>
      <div>
        <h2 className="m-0 text-[30px] leading-[34px] font-extrabold">{greeting(now)}{customer?.name ? `, ${customer.name.split(" ")[0]}` : ""}</h2>
        <p className="mt-0.5 mb-0 text-base text-ink-muted">Ready for a sparkling ride?</p>
      </div>

      <section className="flex flex-col gap-3 rounded-[24px] bg-navy-900 p-[18px] text-white" aria-label="Your station">
        <div className="flex items-start justify-between">
          <div>
            <span className="eyebrow text-teal-400">Your station</span>
            <h3 className="mt-0.5 mb-0 text-[22px] leading-[26px] font-extrabold">{station.name}</h3>
            <span className="text-sm text-ink-on-navy">
              {station.area}, {station.city} · Open until {station.open_until}
            </span>
          </div>
          <a
            href={directions}
            target="_blank"
            rel="noreferrer"
            aria-label="Directions"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-700 text-teal-400 hover:text-white"
          >
            <PinIcon size={20} />
          </a>
        </div>
        <div className="flex items-center gap-2 rounded-[14px] bg-navy-700 px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-400 shadow-[0_0_0_4px_rgb(25_211_190/0.25)]" />
          <span className="text-[15px] font-bold">
            Live: {queue.cars} in queue
          </span>
          <span className="ml-auto text-sm text-ink-on-navy">
            {queue.cars ? `~${queue.waitMinutes} min wait` : "No wait"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 pb-[5px]">
          <ModeLink mode="queue" className="bp bp-teal bp-md">
            <Bubbles set="small" />
            <span>Join queue</span>
          </ModeLink>
          <ModeLink mode="slot" className="bp bp-white bp-md on-navy">
            <span>Book a time</span>
          </ModeLink>
        </div>
      </section>

      <section className="flex flex-col gap-2.5" aria-labelledby="packages-title">
        <div className="flex items-baseline justify-between">
          <h2 id="packages-title" className="m-0 text-xl font-extrabold">
            Packages
          </h2>
          <ModeLink mode="slot" className="text-sm font-bold">
            Book now
          </ModeLink>
        </div>
        <div className="grid grid-cols-3 gap-2.5 pb-1">
          {packages.map((p) => {
            const from = Math.min(...Object.values(p.prices));
            const badge = PACKAGE_BADGES[p.id] ?? PACKAGE_BADGES.full;
            return (
              <ModeLink
                key={p.id}
                mode="slot"
                className="opt flex flex-col gap-1.5 px-3 py-3.5 text-navy-900 no-underline hover:text-navy-900"
              >
                <span className={`flex h-[34px] w-[34px] items-center justify-center rounded-full ${badge.bg}`}>
                  {badge.icon}
                </span>
                <span className="text-base leading-[1.1] font-extrabold">{p.name}</span>
                <span className="text-[13px] text-ink-muted">from {rupees(from)}</span>
              </ModeLink>
            );
          })}
        </div>
      </section>

      <Link
        href="/rewards"
        className="flex flex-col gap-2.5 rounded-[22px] bg-aqua-100 p-4 text-navy-900 no-underline hover:text-navy-900"
      >
        <span className="flex items-center justify-between">
          <span className="text-[17px] font-extrabold">
            {rewards?.freeAvailable ? "Your next wash is free!" : "Every 6th wash is free"}
          </span>
          <ChevronRightIcon size={20} />
        </span>
        <StampRow filled={rewards?.stamps ?? 0} size={36} tone="aqua" />
        <span className="text-sm text-ink-soft">
          {!rewards
            ? "Sign in when you book to start collecting stamps."
            : rewards.freeAvailable
              ? "It's applied automatically to your next booking."
              : `${STAMPS_FOR_FREE - rewards.stamps} more ${STAMPS_FOR_FREE - rewards.stamps === 1 ? "wash" : "washes"} to a free one.`}
        </span>
      </Link>
    </>
  );
}
