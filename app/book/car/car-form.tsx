"use client";

import Link from "next/link";
import { CarSilhouette, CheckIcon } from "@/components/icons";
import { BottomBar, Bubbles } from "@/components/ui";
import { CATEGORIES, type CarType } from "@/lib/booking";
import { updateDraft, useDraft } from "@/lib/draft";

const STATE_CODES = ["KL", "KA", "TN", "MH", "DL", "Other"];

export function CarForm({ carTypes }: { carTypes: CarType[] }) {
  const draft = useDraft();
  const current = carTypes.find((c) => c.id === draft.carType) ?? carTypes[0];
  const groups = CATEGORIES.filter((g) => carTypes.some((c) => c.category === g.id));
  const shown = carTypes.filter((c) => c.category === current.category);

  return (
    <>
      {groups.length > 1 && (
        <div className="flex gap-1.5 rounded-[18px] bg-hairline px-1.5 pt-1.5 pb-[9px]" role="tablist" aria-label="Vehicle type">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              className="seg"
              aria-selected={current.category === g.id}
              aria-controls="vehicle-list"
              onClick={() => {
                if (current.category !== g.id) updateDraft({ carType: carTypes.find((c) => c.category === g.id)!.id });
              }}
            >
              <CarSilhouette type={carTypes.find((c) => c.category === g.id)!.id} width={30} hub={null} />
              {g.label}
            </button>
          ))}
        </div>
      )}

      <div
        id="vehicle-list"
        className="grid grid-cols-2 gap-3.5 pb-[5px]"
        role="radiogroup"
        aria-label={`${CATEGORIES.find((g) => g.id === current.category)?.label} type`}
      >
        {shown.map((c) => {
          const sel = draft.carType === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={sel}
              onClick={() => updateDraft({ carType: c.id })}
              className="opt flex flex-col gap-1 p-3.5"
            >
              {sel && (
                <span className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <CheckIcon size={14} />
                </span>
              )}
              <CarSilhouette type={c.id} />
              <span className="text-lg leading-[1.1] font-extrabold">{c.name}</span>
              <span className="text-[13px] text-ink-muted">{c.note}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="plate" className="text-base font-bold">
          Plate number <span className="font-medium text-ink-muted">(optional)</span>
        </label>
        <div className="flex gap-2.5">
          <select
            aria-label="State code"
            className="field px-2.5 font-bold"
            value={draft.stateCode}
            onChange={(e) => updateDraft({ stateCode: e.target.value })}
          >
            {STATE_CODES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input
            id="plate"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            maxLength={16}
            placeholder="07 AB 1234"
            className="field min-w-0 grow"
            value={draft.plate}
            onChange={(e) => updateDraft({ plate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-[18px] bg-mint-50 px-3.5 py-3">
        <div className="grow">
          <span id="save-lbl" className="block text-base font-bold">
            Save this vehicle
          </span>
          <span className="text-[13px] text-ink-muted">Skip this step next time</span>
        </div>
        <button
          type="button"
          role="switch"
          className="switch"
          aria-checked={draft.saveCar}
          aria-labelledby="save-lbl"
          onClick={() => updateDraft({ saveCar: !draft.saveCar })}
        >
          <span />
        </button>
      </div>

      <BottomBar>
        <Link href="/book/package" className="bp bp-teal w-full">
          <Bubbles />
          <span>Next: choose package</span>
        </Link>
      </BottomBar>
    </>
  );
}
