"use client";

import Link from "next/link";
import { CheckIcon } from "@/components/icons";
import { BottomBar, Bubbles, PriceTag } from "@/components/ui";
import { addonsFor, rupees, type Addon, type CarType, type Package } from "@/lib/booking";
import { updateDraft, useDraft } from "@/lib/draft";

export function PackageForm({
  carTypes,
  packages,
  addons,
}: {
  carTypes: CarType[];
  packages: Package[];
  addons: Addon[];
}) {
  const draft = useDraft();
  const vehicle = carTypes.find((c) => c.id === draft.carType) ?? carTypes[0];

  // Only packages and add-ons offered for this vehicle. If the earlier pick isn't one of them
  // (say the vehicle changed from a car to a bike), fall back to the popular or first package.
  const offered = packages.filter((p) => p.prices[vehicle.id] !== undefined);
  const pkg =
    offered.find((p) => p.id === draft.packageId) ?? offered.find((p) => p.popular) ?? offered[0];
  const extras = addonsFor(addons, vehicle);
  const chosen = extras.filter((a) => draft.addonIds.includes(a.id));
  const total = (pkg?.prices[vehicle.id] ?? 0) + chosen.reduce((s, a) => s + a.price, 0);

  function toggleAddon(id: string) {
    updateDraft({
      addonIds: draft.addonIds.includes(id) ? draft.addonIds.filter((x) => x !== id) : [...draft.addonIds, id],
    });
  }

  return (
    <>
      <div>
        <h2 className="m-0 text-[28px] leading-8 font-extrabold">Pick your shine</h2>
        <p className="mt-1 mb-0 text-base text-ink-muted">
          Prices for {/^[aeiou]/i.test(vehicle.name) ? "an" : "a"}{" "}
          <strong className="text-navy-900">{vehicle.name}</strong> ·{" "}
          <Link href="/book/car" className="font-bold">
            Change
          </Link>
        </p>
      </div>

      {offered.length === 0 ? (
        <p className="card-pop m-0 p-4 text-base font-bold">
          We don&apos;t have packages for this vehicle yet. Pick another one.
        </p>
      ) : (
        <div className="flex flex-col gap-3.5 pb-[5px]" role="radiogroup" aria-label="Wash package">
          {offered.map((p) => {
            const sel = p.id === pkg?.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={sel}
                onClick={() => updateDraft({ packageId: p.id })}
                className="opt flex w-full items-center gap-3 px-4 py-3.5"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    sel ? "bg-primary" : "shadow-[inset_0_0_0_2px_var(--color-border-strong)]"
                  }`}
                >
                  {sel && <span className="h-2.5 w-2.5 rounded-full bg-navy-900" />}
                </span>
                <span className="flex grow flex-col gap-px">
                  <span className="flex items-center gap-2">
                    <span className="text-lg font-extrabold">{p.name}</span>
                    {p.popular && (
                      <span className="rounded-full bg-navy-900 px-2 py-px text-[11px] font-bold tracking-[1.2px] text-teal-400">
                        POPULAR
                      </span>
                    )}
                  </span>
                  <span className="text-[13px] leading-[17px] text-ink-muted">{p.notes[vehicle.id] ?? p.includes}</span>
                </span>
                <span className="text-[17px] font-extrabold whitespace-nowrap">{rupees(p.prices[vehicle.id])}</span>
              </button>
            );
          })}
        </div>
      )}

      {extras.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h2 className="m-0 text-lg font-extrabold">Add-ons</h2>
          <div className="flex flex-wrap gap-2.5 pb-1">
            {extras.map((a) => {
              const on = draft.addonIds.includes(a.id);
              return (
                <button key={a.id} type="button" className="chip" aria-pressed={on} onClick={() => toggleAddon(a.id)}>
                  {on && <CheckIcon />}
                  <span>{a.name}</span>
                  <span className="font-semibold opacity-80">+{rupees(a.price)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <BottomBar>
        {pkg ? (
          <Link
            href="/book/time"
            onClick={() => updateDraft({ packageId: pkg.id, addonIds: chosen.map((a) => a.id) })}
            className="bp bp-teal w-full !justify-between !pr-2 !pl-6"
          >
            <Bubbles set="price" />
            <span>Next: pick a time</span>
            <PriceTag>{rupees(total)}</PriceTag>
          </Link>
        ) : (
          <button type="button" className="bp bp-teal w-full" disabled>
            <span>Next: pick a time</span>
          </button>
        )}
      </BottomBar>
    </>
  );
}
