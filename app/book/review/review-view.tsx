"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { createBooking } from "@/app/actions/booking";
import { BoltIcon, CalendarIcon, CarSilhouette, CardIcon, PinIcon, SparkleIcon } from "@/components/icons";
import { BottomBar, Bubbles, PriceTag } from "@/components/ui";
import { STAMPS_FOR_FREE, addonsFor, plateLabel, rupees, type Addon, type CarType, type Package } from "@/lib/booking";
import { useDraft } from "@/lib/draft";
import { formatSlot, istInstant } from "@/lib/time";

type Props = {
  catalog: { station: { name: string; area: string }; carTypes: CarType[]; packages: Package[]; addons: Addon[] };
  stamps: number;
  freeWash: boolean;
  now: string;
};

function Row({
  icon,
  label,
  value,
  edit,
  last,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  edit?: string;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 py-2.5 ${last ? "" : "border-b-2 border-hairline"}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-50 text-teal-700">{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs font-bold tracking-[1px] text-ink-muted uppercase">{label}</span>
        <span className="block text-base leading-[1.2] font-bold">{value}</span>
      </span>
      {edit && (
        <Link href={edit} className="ml-auto text-sm font-bold" aria-label={`Edit ${label.toLowerCase()}`}>
          Edit
        </Link>
      )}
    </div>
  );
}

export function ReviewView({ catalog, stamps, freeWash, now }: Props) {
  const draft = useDraft();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const car = catalog.carTypes.find((c) => c.id === draft.carType);
  const pkg = catalog.packages.find((p) => p.id === draft.packageId);
  const addons = addonsFor(catalog.addons, car).filter((a) => draft.addonIds.includes(a.id));
  const packagePrice = car && pkg ? pkg.prices[car.id] : undefined;
  const missingTime = draft.mode === "slot" && (!draft.date || !draft.time);

  if (!car || !pkg || packagePrice === undefined || missingTime) {
    return (
      <div className="card-pop flex flex-col gap-3 p-5">
        <p className="m-0 text-base font-bold">Your booking isn&apos;t complete yet.</p>
        <Link href={missingTime ? "/book/time" : "/book/car"} className="bp bp-teal">
          <span>{missingTime ? "Pick a time" : "Start booking"}</span>
        </Link>
      </div>
    );
  }

  const addonsTotal = addons.reduce((s, a) => s + a.price, 0);
  const total = (freeWash ? 0 : packagePrice) + addonsTotal;
  const when =
    draft.mode === "queue"
      ? "Join the queue now"
      : formatSlot(istInstant(draft.date!, draft.time!), new Date(now));
  const plate = plateLabel(draft.stateCode, draft.plate.toUpperCase());
  const afterThis = Math.min(stamps + 1, STAMPS_FOR_FREE);

  function confirm() {
    setError(null);
    startTransition(async () => {
      const res = await createBooking(draft);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <>
      <div className="card-pop px-4 py-1.5">
        <Row
          icon={draft.mode === "queue" ? <BoltIcon size={20} /> : <CalendarIcon size={20} />}
          label="When"
          value={when}
          edit="/book/time"
        />
        <Row
          icon={<CarSilhouette type={car.id} width={22} color="#0A7C70" ring="#EEF8F6" hub={null} />}
          label="Vehicle"
          value={plate ? `${car.name} · ${plate}` : car.name}
          edit="/book/car"
        />
        <Row
          icon={<SparkleIcon />}
          label="Package"
          value={[pkg.name, ...addons.map((a) => a.name)].join(" + ")}
          edit="/book/package"
        />
        <Row
          icon={<PinIcon size={20} />}
          label="Station"
          value={`${catalog.station.name}, ${catalog.station.area}`}
          last
        />
      </div>

      <div className="card-pop flex flex-col gap-1.5 px-4 py-3.5">
        <div className="flex justify-between text-[15px]">
          <span>
            {pkg.name} ({car.name})
          </span>
          <span>{freeWash ? <><s className="text-ink-muted">{rupees(packagePrice)}</s> Free</> : rupees(packagePrice)}</span>
        </div>
        {addons.map((a) => (
          <div key={a.id} className="flex justify-between text-[15px]">
            <span>{a.name}</span>
            <span>{rupees(a.price)}</span>
          </div>
        ))}
        <div className="my-1 h-0.5 bg-hairline" />
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-extrabold">Total</span>
          <span className="text-2xl font-extrabold">{rupees(total)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-[20px] bg-navy-900 px-4 py-3.5 text-white">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-700 text-teal-400">
          <CardIcon />
        </span>
        <span>
          <span className="block text-base font-extrabold">Pay at the station</span>
          <span className="text-sm text-ink-on-navy">Cash, UPI or card after your wash. Nothing to pay now.</span>
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-[20px] bg-aqua-100 px-4 py-3">
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-navy-900 text-teal-400">
          <SparkleIcon />
        </span>
        <span className="text-[15px] leading-5 text-navy-900">
          {freeWash ? (
            <>
              <strong>This wash is on us!</strong> You collected {STAMPS_FOR_FREE} stamps.
            </>
          ) : afterThis === STAMPS_FOR_FREE ? (
            <>
              <strong>+1 stamp</strong> with this wash. That makes {STAMPS_FOR_FREE}, so your next wash is free.
            </>
          ) : (
            <>
              <strong>+1 stamp</strong> with this wash. {STAMPS_FOR_FREE - afterThis} more and your next wash is free.
            </>
          )}
        </span>
      </div>

      {error && (
        <p role="alert" className="m-0 rounded-2xl bg-white p-3 text-sm font-bold text-danger">
          {error}
        </p>
      )}

      <BottomBar>
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          className="bp bp-teal w-full !justify-between !pr-2 !pl-6"
        >
          <Bubbles set="price" />
          <span>{pending ? "Booking…" : draft.mode === "queue" ? "Join the queue" : "Confirm booking"}</span>
          <PriceTag>{rupees(total)}</PriceTag>
        </button>
      </BottomBar>
    </>
  );
}
