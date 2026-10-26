import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { CarSilhouette, ChevronRightIcon } from "@/components/icons";
import { ModeLink } from "@/components/mode-link";
import { Bubbles, Screen, Skeleton } from "@/components/ui";
import { STATUS_LABEL, rupees, type BookingStatus } from "@/lib/booking";
import { bookingTitle, listBookings } from "@/lib/data";
import { requireCustomer } from "@/lib/session";
import { formatSlot } from "@/lib/time";

export default function BookingsPage() {
  return (
    <>
      <Screen footer="nav" className="bg-mint-50">
        <h1 className="m-0 text-[30px] leading-[34px] font-extrabold">Bookings</h1>
        <Suspense
          fallback={
            <>
              <Skeleton className="h-[76px] rounded-[22px]" />
              <Skeleton className="h-[76px] rounded-[22px]" />
            </>
          }
        >
          <BookingsContent />
        </Suspense>
      </Screen>
      <BottomNav />
    </>
  );
}

const PILL: Partial<Record<BookingStatus, string>> = {
  ready: "bg-primary text-navy-900",
  done: "bg-hairline text-ink-muted",
  cancelled: "bg-hairline text-danger",
};

async function BookingsContent() {
  await connection();
  const customer = await requireCustomer("/bookings");
  const bookings = await listBookings(customer.id);
  const now = new Date();
  const active = bookings.filter((b) => !["done", "cancelled"].includes(b.status));
  const past = bookings.filter((b) => ["done", "cancelled"].includes(b.status));

  if (bookings.length === 0) {
    return (
      <div className="card-pop flex flex-col gap-3 p-5">
        <p className="m-0 text-base font-bold">No bookings yet.</p>
        <ModeLink mode="slot" className="bp bp-teal bp-md">
          <Bubbles set="small" />
          <span>Book a wash</span>
        </ModeLink>
      </div>
    );
  }

  return (
    <>
      {[
        ["Upcoming", active],
        ["Past", past],
      ].map(([label, list]) =>
        (list as typeof bookings).length ? (
          <section key={label as string} className="flex flex-col gap-3" aria-label={label as string}>
            <h2 className="m-0 text-lg font-extrabold">{label as string}</h2>
            {(list as typeof bookings).map((b) => (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="card-pop flex items-center gap-3 p-3.5 text-navy-900 no-underline hover:text-navy-900"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-mint-50">
                  <CarSilhouette type={b.car_type_id} width={34} color="#0A7C70" ring="#EEF8F6" hub={null} />
                </span>
                <span className="min-w-0 grow">
                  <span className="block truncate text-base font-extrabold">{bookingTitle(b)}</span>
                  <span className="block text-[13px] text-ink-muted">
                    {b.mode === "queue"
                      ? `Live queue · ${new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}`
                      : formatSlot(b.slot_at!, now)}{" "}
                    · {b.is_free ? "Free" : rupees(b.total)}
                  </span>
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold whitespace-nowrap ${PILL[b.status] ?? "bg-aqua-100 text-teal-700"}`}>
                  {STATUS_LABEL[b.status]}
                </span>
                <ChevronRightIcon size={18} className="shrink-0 text-ink-muted" />
              </Link>
            ))}
          </section>
        ) : null,
      )}
    </>
  );
}
