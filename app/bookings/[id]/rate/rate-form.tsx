"use client";

import { useState, useTransition } from "react";
import { rateBooking } from "@/app/actions/booking";
import { HappyCar } from "@/components/happy-car";
import { StarIcon } from "@/components/icons";
import { BottomBar, Bubbles, Screen, StampRow } from "@/components/ui";

const WORDS = ["", "Not great", "Could be better", "Good", "Great", "Loved it!"];
const TAGS = ["Spotless", "Quick", "Friendly staff", "Good value", "Easy check-in"];

export function RateForm({
  bookingId,
  initial,
  freeWash,
  stamps,
  toGo,
  freeReady,
}: {
  bookingId: string;
  initial: number;
  freeWash: boolean;
  stamps: number;
  toGo: number;
  freeReady: boolean;
}) {
  const [stars, setStars] = useState(initial);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await rateBooking(bookingId, { stars, tags, comment });
      if (res?.error) setError(res.error);
    });
  }

  return (
    <Screen>
      <div className="flex items-center gap-3.5">
        <svg viewBox="0 0 140 120" width="96" height="82" aria-hidden="true">
          <g transform="translate(10 0)">
            <HappyCar size={120} mood="grin" />
          </g>
          <path d="M14 30 Q15.5 38 23 40 Q15.5 42 14 50 Q12.5 42 5 40 Q12.5 38 14 30 Z" fill="#19D3BE" />
          <path d="M120 22 Q121.5 30 129 32 Q121.5 34 120 42 Q118.5 34 111 32 Q118.5 30 120 22 Z" fill="#19D3BE" />
          <path d="M70 6 Q71 12 77 13 Q71 14 70 20 Q69 14 63 13 Q69 12 70 6 Z" fill="#0FB5A3" />
        </svg>
        <div>
          <h1 className="m-0 text-[26px] leading-[30px] font-extrabold">All shiny!</h1>
          <span className="text-base text-ink-muted">How was your wash today?</span>
        </div>
      </div>

      <div className="flex justify-between" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={stars === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setStars(n)}
            className="flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-[14px] border-0 bg-transparent p-0.5 transition-transform active:scale-90"
          >
            <StarIcon filled={n <= stars} />
          </button>
        ))}
      </div>
      <span className="-mt-2 text-center text-base font-extrabold text-teal-700" aria-live="polite">
        {WORDS[stars]}
      </span>

      <div className="flex flex-wrap gap-2.5 pb-1">
        {TAGS.map((t) => {
          const on = tags.includes(t);
          return (
            <button
              key={t}
              type="button"
              className="chip !min-h-[42px] !px-3.5"
              aria-pressed={on}
              onClick={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])}
            >
              {t}
            </button>
          );
        })}
      </div>

      <label htmlFor="cmt" className="sr-only">
        Comment
      </label>
      <textarea
        id="cmt"
        placeholder="Anything else? (optional)"
        maxLength={1000}
        className="field !h-[76px] resize-none !py-3"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="flex flex-col gap-3 rounded-[22px] bg-navy-900 p-4 text-white">
        <div className="flex items-center justify-between">
          <span className="text-lg font-extrabold">
            {freeWash ? "Free wash redeemed!" : freeReady ? "Free wash unlocked!" : "Stamp collected!"}
          </span>
          <span className="text-sm font-bold text-teal-400">{stamps} of 5</span>
        </div>
        <StampRow filled={stamps} />
        <span className="text-sm text-ink-on-navy">
          {freeReady
            ? "Your next wash is on us."
            : `${toGo} more ${toGo === 1 ? "wash" : "washes"} and your 6th is on us.`}
        </span>
      </div>

      {error && (
        <p role="alert" className="m-0 text-sm font-bold text-danger">
          {error}
        </p>
      )}

      <BottomBar>
        <button type="button" className="bp bp-teal w-full" onClick={submit} disabled={pending}>
          <Bubbles />
          <span>{pending ? "Sending…" : "Send feedback"}</span>
        </button>
      </BottomBar>
    </Screen>
  );
}
