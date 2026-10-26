"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { NEXT_STATUS, addonsFor, type BookingStatus } from "@/lib/booking";
import { getAvailability, getCatalog, getRewards } from "@/lib/data";
import { getCustomer } from "@/lib/session";
import { db, must } from "@/lib/supabase";
import { istInstant, istParts } from "@/lib/time";

const draftSchema = z.object({
  mode: z.enum(["queue", "slot"]),
  carType: z.string().min(1),
  stateCode: z.string().max(8),
  plate: z.string().trim().max(16),
  saveCar: z.boolean(),
  packageId: z.string().min(1),
  addonIds: z.array(z.string()).max(10),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  time: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
});

export type CreateBookingResult = { error: string } | undefined;

function bookingCode(slotDate: string): string {
  const [, mm, dd] = slotDate.split("-");
  return `YW-${dd}${mm}-${String(Math.floor(Math.random() * 90) + 10)}`;
}

/** Prices are recomputed here from the database; the client's numbers are never trusted. */
export async function createBooking(input: unknown): Promise<CreateBookingResult> {
  const customer = await getCustomer();
  if (!customer) redirect("/signin?next=/book/review");

  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) return { error: "Something in your booking is missing. Go back and check each step." };
  const d = parsed.data;

  const { station, carTypes, packages, addons } = await getCatalog();
  const vehicle = carTypes.find((c) => c.id === d.carType);
  const pkg = packages.find((p) => p.id === d.packageId);
  const packagePrice = pkg?.prices[d.carType];
  if (!vehicle || !pkg || packagePrice === undefined) {
    return { error: "That package isn't available for this vehicle. Pick another one." };
  }
  const chosenAddons = addonsFor(addons, vehicle).filter((a) => d.addonIds.includes(a.id));

  const now = new Date();
  let slotAt: string | null = null;
  if (d.mode === "slot") {
    if (!d.date || !d.time) return { error: "Pick a day and time first." };
    const day = (await getAvailability(station, now)).find((x) => x.date === d.date);
    const slot = day?.slots.find((s) => s.time === d.time);
    if (!slot || slot.full) return { error: "Sorry, that time was just taken. Pick another one." };
    slotAt = istInstant(d.date, d.time).toISOString();
  }

  const { freeAvailable } = await getRewards(customer.id);
  const addonsTotal = chosenAddons.reduce((s, a) => s + a.price, 0);
  const total = (freeAvailable ? 0 : packagePrice) + addonsTotal;

  const row = {
    customer_id: customer.id,
    station_id: station.id,
    car_type_id: d.carType,
    state_code: d.plate ? d.stateCode : "",
    plate: d.plate.toUpperCase(),
    package_id: pkg.id,
    mode: d.mode,
    slot_at: slotAt,
    status: (d.mode === "queue" ? "queued" : "booked") as BookingStatus,
    package_price: packagePrice,
    addons_total: addonsTotal,
    total,
    is_free: freeAvailable,
  };

  // Codes are short, so retry on the rare clash with an existing one.
  let bookingId: string | null = null;
  for (let attempt = 0; attempt < 6 && !bookingId; attempt++) {
    const res = await db()
      .from("bookings")
      .insert({ ...row, code: bookingCode(d.date ?? istParts(now).date) })
      .select("id")
      .single();
    if (!res.error) bookingId = (res.data as { id: string }).id;
    else if (res.error.code !== "23505") throw new Error(res.error.message);
  }
  if (!bookingId) return { error: "We couldn't save your booking. Please try again." };

  if (chosenAddons.length) {
    must(
      await db()
        .from("booking_addons")
        .insert(chosenAddons.map((a) => ({ booking_id: bookingId, addon_id: a.id, price: a.price }))),
    );
  }
  if (d.saveCar) {
    await db()
      .from("cars")
      .upsert(
        { customer_id: customer.id, car_type_id: d.carType, state_code: d.stateCode, plate: d.plate.toUpperCase() },
        { onConflict: "customer_id,car_type_id,state_code,plate", ignoreDuplicates: true },
      );
  }

  revalidatePath("/bookings");
  redirect(`/bookings/${bookingId}`);
}

async function ownBooking(id: string) {
  const customer = await getCustomer();
  if (!customer) redirect(`/signin?next=/bookings/${id}`);
  const rows = must(
    await db().from("bookings").select("id, status").eq("id", id).eq("customer_id", customer.id).limit(1),
  ) as { id: string; status: BookingStatus }[];
  if (!rows[0]) throw new Error("Booking not found.");
  return rows[0];
}

export async function checkIn(id: string) {
  const b = await ownBooking(id);
  if (b.status === "queued" || b.status === "booked") {
    const now = new Date().toISOString();
    must(
      await db()
        .from("bookings")
        .update({ status: "checked_in", checked_in_at: now, status_at: now })
        .eq("id", id),
    );
  }
  redirect(`/bookings/${id}/status`);
}

/**
 * Demo only: moves a booking to its next stage, standing in for the station staff.
 * Disabled unless DEMO_MODE is on.
 */
export async function advanceStatus(id: string) {
  if (process.env.DEMO_MODE !== "true") throw new Error("Demo controls are turned off.");
  const b = await ownBooking(id);
  const next = NEXT_STATUS[b.status];
  if (next) {
    const now = new Date().toISOString();
    must(
      await db()
        .from("bookings")
        .update({ status: next, status_at: now, ...(next === "checked_in" ? { checked_in_at: now } : {}) })
        .eq("id", id),
    );
  }
  revalidatePath(`/bookings/${id}/status`);
}

const ratingSchema = z.object({
  stars: z.number().int().min(1).max(5),
  tags: z.array(z.string().max(40)).max(10),
  comment: z.string().trim().max(1000),
});

/** Saves the rating and closes the wash, which collects its stamp. */
export async function rateBooking(id: string, input: unknown): Promise<{ error: string } | undefined> {
  const b = await ownBooking(id);
  if (b.status !== "ready" && b.status !== "done") return { error: "You can rate once your car is ready." };
  const parsed = ratingSchema.safeParse(input);
  if (!parsed.success) return { error: "Pick a star rating first." };

  must(await db().from("ratings").upsert({ booking_id: id, ...parsed.data }));
  if (b.status === "ready") {
    must(await db().from("bookings").update({ status: "done", status_at: new Date().toISOString() }).eq("id", id));
  }
  revalidatePath("/rewards");
  redirect("/rewards");
}

export async function cancelBooking(id: string) {
  const b = await ownBooking(id);
  if (b.status === "queued" || b.status === "booked") {
    must(
      await db().from("bookings").update({ status: "cancelled", status_at: new Date().toISOString() }).eq("id", id),
    );
  }
  revalidatePath("/bookings");
  redirect("/bookings");
}
