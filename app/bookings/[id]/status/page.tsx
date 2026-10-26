import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { advanceStatus } from "@/app/actions/booking";
import { HappyCar } from "@/components/happy-car";
import { CheckIcon } from "@/components/icons";
import { BackButton, Bubbles, ScreenSkeleton } from "@/components/ui";
import { STAGES, rupees } from "@/lib/booking";
import { getBooking } from "@/lib/data";
import { requireCustomer } from "@/lib/session";
import { formatTime, istParts } from "@/lib/time";
import { AutoRefresh, NotifyToggle } from "./live";

export default function StatusPage({ params }: PageProps<"/bookings/[id]/status">) {
  return (
    <Suspense fallback={<ScreenSkeleton footer="none" />}>
      <StatusContent params={params} />
    </Suspense>
  );
}

const HEADLINES: [string, string][] = [
  ["You're checked in", "Your wash starts in a few minutes"],
  ["Washing your ride", "Foam, scrub and rinse"],
  ["Almost done", "Drying and finishing touches"],
  ["Your ride is sparkling!", "Come pick it up, yalla"],
];

async function StatusContent({ params }: { params: PageProps<"/bookings/[id]/status">["params"] }) {
  const { id } = await params;
  await connection();
  const customer = await requireCustomer(`/bookings/${id}/status`);
  const b = await getBooking(id, customer.id);
  if (!b) notFound();

  const idx = b.status === "done" ? 3 : STAGES.indexOf(b.status as (typeof STAGES)[number]);
  const ready = idx === 3;
  const [headline, sub] =
    idx >= 0 ? HEADLINES[idx] : b.status === "cancelled" ? ["Booking cancelled", "This wash won't go ahead"] : ["See you soon", "Check in when you arrive at the station"];
  const pay = b.total === 0 ? "Free wash, nothing to pay" : `Pay ${rupees(b.total)} at the counter`;
  const steps = [
    { title: "Checked in", note: b.checked_in_at ? `You arrived at ${formatTime(istParts(new Date(b.checked_in_at)).time)}` : "Scan your QR at the station" },
    { title: "Washing", note: "Foam, scrub and rinse" },
    { title: "Drying and finishing", note: "Hand dry and finishing touches" },
    { title: "Ready for pickup", note: pay },
  ];
  const demo = process.env.DEMO_MODE === "true";

  return (
    <main className="flex min-h-dvh flex-col bg-white pb-[max(34px,env(safe-area-inset-bottom))]">
      <AutoRefresh active={!ready && b.status !== "cancelled"} />
      <div className="relative flex flex-col gap-3.5 rounded-b-[32px] bg-navy-900 px-6 pt-[max(54px,env(safe-area-inset-top))] pb-7 text-white">
        <svg className="absolute top-0 left-0" width="100%" height="360" viewBox="0 0 390 360" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
          <circle cx="70" cy="200" r="9" fill="#19D3BE" opacity="0.5" />
          <circle cx="96" cy="170" r="5" fill="#FFFFFF" opacity="0.6" />
          <circle cx="310" cy="210" r="12" fill="#19D3BE" opacity="0.35" />
          <circle cx="290" cy="160" r="6" fill="#FFFFFF" opacity="0.5" />
          <circle cx="330" cy="130" r="4" fill="#19D3BE" opacity="0.7" />
        </svg>
        <div className="relative flex items-center justify-between">
          <BackButton href={`/bookings/${b.id}`} onNavy />
          <span className="text-sm font-bold text-ink-on-navy">{b.code}</span>
        </div>
        <div className="relative flex justify-center">
          <HappyCar size={150} tone="teal" mood={ready ? "grin" : "washing"} label={ready ? "Your ride, sparkling clean" : "Your ride being washed"} />
        </div>
        <div className="relative text-center" aria-live="polite">
          <h1 className="m-0 text-[30px] leading-[34px] font-extrabold">{headline}</h1>
          <span className="text-[17px] text-ink-on-navy">{sub}</span>
        </div>
        <div className="relative grid grid-cols-4 gap-1.5" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`h-1.5 rounded-full ${i <= idx ? "bg-primary" : "bg-navy-500"}`} />
          ))}
        </div>
      </div>

      <ol className="m-0 flex list-none flex-col px-6 pt-5" aria-label="Wash progress">
        {steps.map((s, i) => {
          const done = i < idx || (i === idx && ready);
          const now = i === idx && !ready;
          return (
            <li key={s.title} className="flex items-stretch gap-3.5" aria-current={now ? "step" : undefined}>
              <div className="flex w-8 flex-col items-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    done
                      ? "bg-primary"
                      : now
                        ? "bg-aqua-100 shadow-[0_0_0_5px_rgb(25_211_190/0.25)]"
                        : "shadow-[inset_0_0_0_2px_var(--color-border)]"
                  }`}
                >
                  {done && <CheckIcon />}
                  {now && <span className="h-2.5 w-2.5 rounded-full bg-navy-900" />}
                </span>
                {i < 3 && <span className={`my-1 w-[3px] grow rounded-full ${i < idx ? "bg-primary" : "bg-track"}`} />}
              </div>
              <div className="grow pt-1 pb-[18px]">
                <span className={`block text-[17px] leading-[22px] font-extrabold ${i <= idx ? "text-navy-900" : "text-border-strong"}`}>
                  {s.title}
                  {done && <span className="sr-only"> (done)</span>}
                  {now && <span className="sr-only"> (in progress)</span>}
                </span>
                <span className="block text-sm text-ink-muted">{s.note}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-auto flex flex-col gap-4 px-6">
        {b.status !== "done" && b.status !== "cancelled" && <NotifyToggle ready={ready} code={b.code} />}
        {ready && b.status !== "done" && (
          <Link href={`/bookings/${b.id}/rate`} className="bp bp-teal w-full">
            <Bubbles />
            <span>Rate your wash</span>
          </Link>
        )}
        {b.status === "done" && (
          <Link href="/rewards" className="bp bp-teal w-full">
            <Bubbles />
            <span>See your stamps</span>
          </Link>
        )}
        {demo && !ready && b.status !== "cancelled" && (
          <form action={advanceStatus.bind(null, b.id)}>
            <button type="submit" className="bp bp-white w-full">
              <span>Next step (demo)</span>
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
