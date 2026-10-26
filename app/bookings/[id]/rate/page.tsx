import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/ui";
import { STAMPS_FOR_FREE, rewardState } from "@/lib/booking";
import { getBooking, getRewards } from "@/lib/data";
import { requireCustomer } from "@/lib/session";
import { RateForm } from "./rate-form";

export default function RatePage({ params }: PageProps<"/bookings/[id]/rate">) {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <RateContent params={params} />
    </Suspense>
  );
}

async function RateContent({ params }: { params: PageProps<"/bookings/[id]/rate">["params"] }) {
  const { id } = await params;
  await connection();
  const customer = await requireCustomer(`/bookings/${id}/rate`);
  const [b, rewards] = await Promise.all([getBooking(id, customer.id), getRewards(customer.id)]);
  if (!b) notFound();
  if (b.status !== "ready" && b.status !== "done") redirect(`/bookings/${id}/status`);

  // Show the stamp card as it will be once this wash is closed.
  const countsNow = b.status === "ready" && !b.is_free;
  const after = countsNow
    ? rewardState(rewards.paidDone + 1, rewards.freeTaken)
    : rewards;

  return (
    <RateForm
      bookingId={b.id}
      initial={b.rating?.stars ?? 5}
      freeWash={b.is_free}
      stamps={after.stamps}
      toGo={STAMPS_FOR_FREE - after.stamps}
      freeReady={after.freeAvailable}
    />
  );
}
