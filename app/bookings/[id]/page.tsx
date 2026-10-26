import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import QRCode from "qrcode";
import { Suspense } from "react";
import { cancelBooking, checkIn } from "@/app/actions/booking";
import { ClearDraft } from "@/components/clear-draft";
import { HappyCar } from "@/components/happy-car";
import { CalendarPlusIcon, PinIcon } from "@/components/icons";
import { BackButton, Bubbles, ScreenSkeleton } from "@/components/ui";
import { STATUS_LABEL, plateLabel, rupees } from "@/lib/booking";
import { bookingTitle, getBooking, getCatalog, type Booking, type Station } from "@/lib/data";
import { requireCustomer } from "@/lib/session";
import { formatSlot } from "@/lib/time";

export default function BookedPage({ params }: PageProps<"/bookings/[id]">) {
  return (
    <Suspense fallback={<ScreenSkeleton footer="none" />}>
      <BookedContent params={params} />
    </Suspense>
  );
}

function calendarLink(b: Booking, station: Station, title: string): string {
  const start = new Date(b.slot_at!);
  const end = new Date(start.getTime() + 45 * 60_000);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Yalla Wash//EN",
    "BEGIN:VEVENT",
    `UID:${b.id}@yallawash`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:Yalla Wash: ${title}`,
    `LOCATION:${station.name}\\, ${station.area}\\, ${station.city}`,
    `DESCRIPTION:Booking ${b.code}. Show your QR code at the station.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

async function BookedContent({ params }: { params: PageProps<"/bookings/[id]">["params"] }) {
  const { id } = await params;
  await connection();
  const customer = await requireCustomer(`/bookings/${id}`);
  const [booking, { station }] = await Promise.all([getBooking(id, customer.id), getCatalog()]);
  if (!booking) notFound();

  const now = new Date();
  const title = bookingTitle(booking);
  const qr = await QRCode.toString(booking.code, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0B1F3A", light: "#00000000" },
  });
  const directions =
    station.lat != null && station.lng != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${station.name} ${station.area}`)}`;
  const waiting = booking.status === "queued" || booking.status === "booked";
  const inProgress = ["checked_in", "washing", "drying", "ready"].includes(booking.status);
  const plate = plateLabel(booking.state_code, booking.plate);

  return (
    <main className="relative flex min-h-dvh flex-col bg-mint-50 pb-[max(34px,env(safe-area-inset-bottom))]">
      <ClearDraft />
      <div className="absolute inset-x-0 top-0 h-[330px] bg-navy-900" aria-hidden="true" />
      <svg className="absolute top-0 left-0" width="100%" height="330" viewBox="0 0 390 330" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
        <path d="M60 80 Q62 92 74 94 Q62 96 60 108 Q58 96 46 94 Q58 92 60 80 Z" fill="#19D3BE" />
        <path d="M326 120 Q327.5 129 337 131 Q327.5 133 326 142 Q324.5 133 315 131 Q324.5 129 326 120 Z" fill="#FFFFFF" />
        <path d="M300 64 Q301 70 307 71 Q301 72 300 78 Q299 72 293 71 Q299 70 300 64 Z" fill="#BFF0E8" />
        <circle cx="96" cy="150" r="5" fill="#19D3BE" opacity="0.6" />
        <circle cx="350" cy="200" r="8" fill="#13294A" />
        <circle cx="30" cy="220" r="14" fill="#13294A" />
      </svg>

      <div className="relative px-6 pt-[max(20px,env(safe-area-inset-top))]">
        <BackButton href="/bookings" onNavy />
      </div>
      <div className="relative flex flex-col items-center gap-0.5 px-6 text-white">
        <HappyCar size={112} tone="teal" mood="wink" />
        <h1 className="m-0 text-[34px] leading-[38px] font-extrabold">
          {booking.mode === "queue" ? (
            <>
              You&apos;re in! <span className="text-teal-400">Yalla</span>
            </>
          ) : (
            <>
              Booked! <span className="text-teal-400">Yalla</span>
            </>
          )}
        </h1>
        <span className="text-[17px] text-ink-on-navy">
          {booking.mode === "queue" ? "Live queue · today" : formatSlot(booking.slot_at!, now)}
          {!waiting && ` · ${STATUS_LABEL[booking.status]}`}
        </span>
      </div>

      <div className="card-pop relative mx-6 mt-6 flex flex-col items-center gap-3 !rounded-[26px] p-5">
        <span className="eyebrow text-ink-muted">Scan at the station to check in</span>
        <div
          role="img"
          aria-label={`Check-in QR code for booking ${booking.code}`}
          className="h-[188px] w-[188px] rounded-2xl p-2.5 shadow-[inset_0_0_0_2px_var(--color-hairline)] [&_svg]:h-full [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: qr }}
        />
        <span className="text-[22px] font-extrabold tracking-[2px]">{booking.code}</span>
        <span className="text-center text-sm text-ink-muted">
          {title} · {booking.car.name}
          {plate && ` · ${plate}`} ·{" "}
          {booking.total === 0 ? "Free wash" : `Pay ${rupees(booking.total)} at the station`}
        </span>
      </div>

      <div className="relative mt-auto flex flex-col gap-4 px-6 pt-6">
        <div className={`grid gap-3 ${booking.slot_at && waiting ? "grid-cols-2" : "grid-cols-1"}`}>
          {booking.slot_at && waiting && (
            <a href={calendarLink(booking, station, title)} download={`yalla-wash-${booking.code}.ics`} className="bp bp-white bp-sm">
              <CalendarPlusIcon size={18} />
              <span>Add to calendar</span>
            </a>
          )}
          <a href={directions} target="_blank" rel="noreferrer" className="bp bp-white bp-sm">
            <PinIcon size={18} strokeWidth={2.4} />
            <span>Directions</span>
          </a>
        </div>
        {waiting && (
          <form action={checkIn.bind(null, booking.id)}>
            <button type="submit" className="bp bp-teal w-full">
              <Bubbles />
              <span>I&apos;m here: check in</span>
            </button>
          </form>
        )}
        {inProgress && (
          <Link href={`/bookings/${booking.id}/status`} className="bp bp-teal w-full">
            <Bubbles />
            <span>See live status</span>
          </Link>
        )}
        {booking.status === "done" && !booking.rating && (
          <Link href={`/bookings/${booking.id}/rate`} className="bp bp-teal w-full">
            <Bubbles />
            <span>Rate your wash</span>
          </Link>
        )}
        {waiting && (
          <form action={cancelBooking.bind(null, booking.id)} className="text-center">
            <button type="submit" className="cursor-pointer border-0 bg-transparent p-2 text-[15px] font-bold text-danger underline">
              Cancel booking
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
