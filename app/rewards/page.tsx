import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { CarSilhouette } from "@/components/icons";
import { Bubbles, Screen, Skeleton, StampRow } from "@/components/ui";
import { STAMPS_FOR_FREE, rupees } from "@/lib/booking";
import { bookingTitle, getRewards } from "@/lib/data";
import { getCustomer } from "@/lib/session";

export default function RewardsPage() {
  return (
    <>
      <Screen footer="nav" className="bg-mint-50">
        <h1 className="m-0 text-[30px] leading-[34px] font-extrabold">Rewards</h1>
        <Suspense fallback={<Skeleton className="h-[220px] rounded-[26px]" />}>
          <RewardsContent />
        </Suspense>
        <section className="card-pop flex flex-col gap-3 p-4" aria-labelledby="how-title">
          <h2 id="how-title" className="m-0 text-lg font-extrabold">
            How it works
          </h2>
          {[
            ["1", "Wash your car, bike or auto at the station", false],
            ["2", "Get a stamp after each paid wash", false],
            ["6", "Your 6th wash is free", true],
          ].map(([n, text, hi]) => (
            <div key={n as string} className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold ${
                  hi ? "bg-primary" : "bg-aqua-100"
                }`}
              >
                {n}
              </span>
              <span className="text-[15px]">{text}</span>
            </div>
          ))}
        </section>
      </Screen>
      <BottomNav />
    </>
  );
}

async function RewardsContent() {
  await connection();
  const customer = await getCustomer();
  const rewards = customer ? await getRewards(customer.id) : null;
  const stamps = rewards?.stamps ?? 0;
  const toGo = STAMPS_FOR_FREE - stamps;

  return (
    <>
      <section
        className="relative flex flex-col gap-4 overflow-hidden rounded-[26px] bg-navy-900 p-5 text-white shadow-[0_6px_0_var(--color-navy-edge)]"
        aria-label="Stamp card"
      >
        <svg className="absolute -top-10 -right-10" width="200" height="160" viewBox="0 0 200 160" aria-hidden="true">
          <circle cx="120" cy="60" r="60" fill="#13294A" />
          <circle cx="60" cy="40" r="14" fill="#13294A" />
        </svg>
        <div className="relative">
          <span className="eyebrow text-teal-400">Yalla stamps</span>
          <h2 className="mt-0.5 mb-0 text-2xl leading-7 font-extrabold">
            {rewards?.freeAvailable
              ? "Your next wash is free!"
              : `${toGo} more to a free wash`}
          </h2>
        </div>
        <div className="relative">
          <StampRow filled={stamps} size={46} />
        </div>
        <div className="relative flex items-center gap-2.5">
          <div className="h-2 grow rounded-full bg-navy-500">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${(stamps / STAMPS_FOR_FREE) * 100}%` }} />
          </div>
          <span className="text-sm font-bold text-ink-on-navy">
            {stamps} / {STAMPS_FOR_FREE}
          </span>
        </div>
        {!customer && (
          <Link href="/signin?next=/rewards" className="bp bp-teal bp-md relative">
            <Bubbles set="small" />
            <span>Sign in to see your stamps</span>
          </Link>
        )}
      </section>

      {rewards && (
        <section className="order-last flex flex-col gap-2.5" aria-labelledby="washes-title">
          <h2 id="washes-title" className="m-0 text-lg font-extrabold">
            Your washes
          </h2>
          {rewards.washes.length === 0 && (
            <p className="m-0 text-[15px] text-ink-muted">Your finished washes will show up here.</p>
          )}
          {rewards.washes.map((w) => (
            <Link
              key={w.id}
              href={`/bookings/${w.id}`}
              className="flex items-center gap-3 rounded-[18px] bg-white px-3.5 py-3 text-navy-900 no-underline hover:text-navy-900"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900">
                <CarSilhouette type={w.car_type_id} width={30} color="#19D3BE" ring="#0B1F3A" hub={null} />
              </span>
              <span className="min-w-0 grow">
                <span className="block text-[15px] font-extrabold">{bookingTitle(w)}</span>
                <span className="text-[13px] text-ink-muted">
                  {new Date(w.slot_at ?? w.created_at).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    timeZone: "Asia/Kolkata",
                  })}{" "}
                  · {w.car.name} · {w.is_free ? "Free" : rupees(w.total)}
                </span>
              </span>
              <span className="rounded-full bg-aqua-100 px-2.5 py-0.5 text-[13px] font-extrabold text-teal-700">
                {w.is_free ? "Free" : "+1"}
              </span>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
