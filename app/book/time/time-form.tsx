"use client";

import Link from "next/link";
import { BellIcon, BoltIcon, CalendarIcon } from "@/components/icons";
import { BottomBar, Bubbles } from "@/components/ui";
import type { Day } from "@/lib/data";
import { updateDraft, useDraft } from "@/lib/draft";
import { formatTime } from "@/lib/time";

export function TimeForm({ days, queue }: { days: Day[]; queue: { cars: number; waitMinutes: number } }) {
  const draft = useDraft();
  const isQueue = draft.mode === "queue";

  // Fall back to the first day that still has a free slot.
  const day =
    days.find((d) => d.date === draft.date) ?? days.find((d) => d.slots.some((s) => !s.full)) ?? days[0];
  const slotOk = draft.date === day.date && day.slots.some((s) => s.time === draft.time && !s.full);
  const ready = isQueue || slotOk;

  return (
    <>
      <div className="flex gap-1.5 rounded-[18px] bg-hairline px-1.5 pt-1.5 pb-[9px]" role="tablist" aria-label="Timing">
        <button
          type="button"
          role="tab"
          className="seg"
          aria-selected={isQueue}
          aria-controls="timing-panel"
          onClick={() => updateDraft({ mode: "queue" })}
        >
          <BoltIcon size={18} />
          Join queue now
        </button>
        <button
          type="button"
          role="tab"
          className="seg"
          aria-selected={!isQueue}
          aria-controls="timing-panel"
          onClick={() => updateDraft({ mode: "slot" })}
        >
          <CalendarIcon size={18} strokeWidth={2.4} />
          Book a time
        </button>
      </div>

      <div id="timing-panel" role="tabpanel">
        {isQueue ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3.5 rounded-[24px] bg-navy-900 p-5 text-white">
              <span className="eyebrow text-teal-400">Live queue</span>
              <div className="flex items-end gap-2.5">
                <span className="text-[64px] leading-[0.9] font-extrabold text-teal-400">{queue.cars}</span>
                <span className="pb-1 text-lg leading-[1.2] font-bold">
                  {queue.cars === 1 ? "vehicle" : "vehicles"} ahead
                  <br />
                  <span className="font-medium text-ink-on-navy">
                    {queue.cars ? `about ${queue.waitMinutes} min wait` : "you're next"}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-navy-700 p-3" aria-hidden="true">
                {Array.from({ length: Math.min(queue.cars, 5) }, (_, i) => (
                  <span key={i} className="h-[22px] w-[34px] rounded-lg bg-navy-400" />
                ))}
                {queue.cars > 5 && <span className="text-sm font-bold text-ink-on-navy">+{queue.cars - 5}</span>}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9FB3C8" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M5 12h14" />
                </svg>
                <span className="flex h-[26px] items-center rounded-[9px] bg-primary px-2.5 text-[13px] font-extrabold text-navy-900">
                  You
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[18px] bg-mint-50 p-3.5">
              <BellIcon className="mt-0.5 shrink-0 text-teal-700" />
              <span className="text-[15px] leading-[21px] text-ink-soft">
                Check in when you arrive. Please arrive within <strong className="text-navy-900">10 minutes</strong> of
                joining.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-5 gap-2 pb-1" role="radiogroup" aria-label="Day">
              {days.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  role="radio"
                  aria-checked={d.date === day.date}
                  aria-label={d.long}
                  className="chip !h-[68px] !flex-col !justify-center !gap-0 !rounded-2xl !px-0"
                  onClick={() => updateDraft({ date: d.date, time: null })}
                >
                  <span className="text-xs font-bold">{d.dow}</span>
                  <span className="text-[22px] leading-[1.1] font-extrabold">{d.num}</span>
                </button>
              ))}
            </div>
            <div className="flex items-baseline justify-between">
              <h2 className="m-0 text-lg font-extrabold">{day.long}</h2>
              <span className="text-[13px] text-ink-muted">Times in IST</span>
            </div>
            <div className="grid grid-cols-3 gap-x-2.5 gap-y-3 pb-1" role="radiogroup" aria-label="Time slot">
              {day.slots.map((s) => (
                <button
                  key={s.time}
                  type="button"
                  role="radio"
                  aria-checked={slotOk && draft.time === s.time}
                  disabled={s.full}
                  className="chip justify-center !rounded-[14px]"
                  onClick={() => updateDraft({ date: day.date, time: s.time })}
                >
                  {formatTime(s.time)}
                </button>
              ))}
            </div>
            <span className="text-[13px] text-ink-muted">Greyed-out times are fully booked or already past.</span>
          </div>
        )}
      </div>

      <BottomBar>
        {ready ? (
          <Link href="/book/review" className="bp bp-teal w-full">
            <Bubbles />
            <span>{isQueue ? "Join the queue" : `Continue · ${formatTime(draft.time!)}`}</span>
          </Link>
        ) : (
          <button type="button" className="bp bp-teal w-full" disabled>
            <span>Pick a time</span>
          </button>
        )}
      </BottomBar>
    </>
  );
}
