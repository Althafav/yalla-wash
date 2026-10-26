import Link from "next/link";
import type { ReactNode } from "react";
import { BackIcon } from "./icons";
import { StampCar } from "./happy-car";

/** Foam bubbles on Bubble Pop buttons. Positions are from the design canvas. */
const BUBBLE_SETS = {
  right: [
    { width: 28, height: 28, top: -9, right: 20 },
    { width: 12, height: 12, top: 15, right: 7 },
    { width: 7, height: 7, bottom: 8, right: 34 },
  ],
  price: [
    { width: 28, height: 28, top: -9, right: 120 },
    { width: 10, height: 10, bottom: 8, right: 140 },
  ],
  small: [
    { width: 24, height: 24, top: -8, right: 12 },
    { width: 10, height: 10, top: 12, right: 4 },
  ],
} as const;

export function Bubbles({ set = "right" }: { set?: keyof typeof BUBBLE_SETS }) {
  return (
    <>
      {BUBBLE_SETS[set].map((style, i) => (
        <span key={i} className="bub" style={style} aria-hidden="true" />
      ))}
    </>
  );
}

/** Navy chip on the right of a primary button that shows the running total. */
export function PriceTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-[42px] items-center rounded-[13px] bg-navy-900 px-3.5 text-base text-white">
      {children}
    </span>
  );
}

export function BackButton({ href, onNavy = false }: { href: string; onNavy?: boolean }) {
  return (
    <Link href={href} className={`bp bp-white bp-icon ${onNavy ? "on-navy" : ""}`} aria-label="Back">
      <BackIcon />
    </Link>
  );
}

/** Back button, centred title and the 3-step booking progress bar. */
export function StepHeader({ title, step, backHref }: { title: string; step?: 1 | 2 | 3; backHref: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackButton href={backHref} />
        <h1 className="m-0 grow text-center text-lg font-extrabold">{title}</h1>
        <span className="w-11 text-right text-sm font-bold text-ink-muted">{step ? `${step} of 3` : ""}</span>
      </div>
      {step && (
        <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <span key={n} className={`h-1.5 rounded-full ${n <= step ? "bg-primary" : "bg-track"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Screen body: phone padding, leaves room for a fixed footer or nav. */
export function Screen({
  children,
  className = "",
  footer = "bar",
}: {
  children: ReactNode;
  className?: string;
  footer?: "bar" | "nav" | "none";
}) {
  const bottom = footer === "bar" ? "pb-36" : footer === "nav" ? "pb-28" : "pb-10";
  return (
    <main className={`flex min-h-dvh flex-col gap-4 px-6 pt-[max(54px,env(safe-area-inset-top))] ${bottom} ${className}`}>
      {children}
    </main>
  );
}

/** Fixed footer holding the screen's main action. */
export function BottomBar({ children, tone = "white" }: { children: ReactNode; tone?: "white" | "none" }) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[430px] px-6 pt-4 pb-[max(34px,env(safe-area-inset-bottom))] ${
        tone === "white" ? "border-t-2 border-hairline bg-white" : ""
      }`}
    >
      {children}
    </div>
  );
}

/** Five stamp circles and the free one. `filled` is 0–5. */
export function StampRow({
  filled,
  size = 44,
  tone = "navy",
}: {
  filled: number;
  size?: number;
  tone?: "navy" | "aqua";
}) {
  const empty = tone === "navy" ? "border-navy-400" : "border-teal-700";
  return (
    <div className="flex justify-between gap-2" role="img" aria-label={`${filled} of 5 stamps collected`}>
      {[0, 1, 2, 3, 4].map((i) =>
        i < filled ? (
          <span
            key={i}
            className="flex items-center justify-center rounded-full bg-primary shadow-[0_3px_0_var(--color-primary-edge)]"
            style={{ width: size, height: size }}
          >
            <StampCar size={size * 0.77} />
          </span>
        ) : (
          <span
            key={i}
            className={`box-border rounded-full border-2 border-dashed ${empty}`}
            style={{ width: size, height: size }}
          />
        ),
      )}
      <span
        className={`flex items-center justify-center rounded-full text-[11px] font-extrabold ${
          tone === "navy" ? "bg-white text-navy-900" : "bg-navy-900 text-teal-400"
        }`}
        style={{ width: size, height: size }}
      >
        FREE
      </span>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Generic loading state for a screen while its data streams in. */
export function ScreenSkeleton({ footer = "bar" }: { footer?: "bar" | "nav" | "none" }) {
  return (
    <Screen footer={footer}>
      <span className="sr-only" role="status">
        Loading
      </span>
      <Skeleton className="h-11 w-11 rounded-full" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-20" />
    </Screen>
  );
}
