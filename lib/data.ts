import "server-only";
import { db, must } from "./supabase";
import { IN_QUEUE, rewardState, type Addon, type BookingStatus, type CarType, type Mode, type Package } from "./booking";
import { addDays, dayLabels, istInstant, istParts, slotTimes } from "./time";

export type Station = {
  id: string;
  name: string;
  area: string;
  city: string;
  open_until: string;
  lat: number | null;
  lng: number | null;
  slot_start: string;
  slot_end: string;
  slot_minutes: number;
  slot_capacity: number;
};

export type Catalog = {
  station: Station;
  carTypes: CarType[];
  packages: Package[];
  addons: Addon[];
};

/** The station (there is one for now: the first active station) and everything you can book. */
export async function getCatalog(): Promise<Catalog> {
  const [stations, carTypes, packages, prices, addons] = await Promise.all([
    db().from("stations").select("*").eq("active", true).order("created_at").limit(1),
    db().from("car_types").select("id, name, note, category, wash_minutes").order("sort"),
    db().from("packages").select("id, name, includes, popular").order("sort"),
    db().from("package_prices").select("package_id, car_type_id, price, includes"),
    db().from("addons").select("id, name, price, categories").order("sort"),
  ]);
  const station = must(stations)[0] as Station | undefined;
  if (!station) throw new Error("No active station. Run supabase/seed.sql or add a row to stations.");
  station.slot_start = station.slot_start.slice(0, 5);
  station.slot_end = station.slot_end.slice(0, 5);

  const priceRows = must(prices) as { package_id: string; car_type_id: string; price: number; includes: string | null }[];
  return {
    station,
    carTypes: must(carTypes) as CarType[],
    packages: (must(packages) as Omit<Package, "prices" | "notes">[]).map((p) => {
      const rows = priceRows.filter((r) => r.package_id === p.id);
      return {
        ...p,
        prices: Object.fromEntries(rows.map((r) => [r.car_type_id, r.price])),
        notes: Object.fromEntries(rows.filter((r) => r.includes).map((r) => [r.car_type_id, r.includes!])),
      };
    }),
    addons: must(addons) as Addon[],
  };
}

function dayStart(now: Date): string {
  return istInstant(istParts(now).date, "00:00").toISOString();
}

/** Vehicles in today's live queue at the station, and the wait from each one's wash time. */
export async function getQueue(station: Station, now: Date) {
  const since = dayStart(now);
  const rows = must(
    await db()
      .from("bookings")
      .select("vehicle:car_types(wash_minutes)")
      .eq("station_id", station.id)
      .in("status", IN_QUEUE)
      .or(`checked_in_at.gte.${since},created_at.gte.${since}`),
  ) as unknown as { vehicle: { wash_minutes: number } }[];
  return { cars: rows.length, waitMinutes: rows.reduce((s, r) => s + r.vehicle.wash_minutes, 0) };
}

export type Day = {
  date: string;
  dow: string;
  num: number;
  long: string;
  slots: { time: string; full: boolean }[];
};

/** The next five days of slots; a slot is unavailable once it is full or has started. */
export async function getAvailability(station: Station, now: Date): Promise<Day[]> {
  const today = istParts(now).date;
  const dates = [0, 1, 2, 3, 4].map((n) => addDays(today, n));
  const rows = must(
    await db()
      .from("bookings")
      .select("slot_at")
      .eq("station_id", station.id)
      .eq("mode", "slot")
      .neq("status", "cancelled")
      .gte("slot_at", istInstant(dates[0], "00:00").toISOString())
      .lt("slot_at", istInstant(addDays(today, 5), "00:00").toISOString()),
  ) as { slot_at: string }[];

  const taken = new Map<number, number>();
  for (const r of rows) {
    const t = new Date(r.slot_at).getTime();
    taken.set(t, (taken.get(t) ?? 0) + 1);
  }
  const times = slotTimes(station.slot_start, station.slot_end, station.slot_minutes);

  return dates.map((date) => ({
    date,
    ...dayLabels(date, today),
    slots: times.map((time) => {
      const at = istInstant(date, time).getTime();
      return { time, full: at <= now.getTime() || (taken.get(at) ?? 0) >= station.slot_capacity };
    }),
  }));
}

export type Booking = {
  id: string;
  code: string;
  mode: Mode;
  slot_at: string | null;
  status: BookingStatus;
  car_type_id: string;
  state_code: string;
  plate: string;
  package_price: number;
  addons_total: number;
  total: number;
  is_free: boolean;
  checked_in_at: string | null;
  created_at: string;
  car: { name: string };
  package: { id: string; name: string };
  addons: { price: number; addon: { name: string } }[];
  rating: { stars: number } | null;
};

const BOOKING_SELECT = `id, code, mode, slot_at, status, car_type_id, state_code, plate, package_price, addons_total,
  total, is_free, checked_in_at, created_at,
  car:car_types(name), package:packages(id, name),
  addons:booking_addons(price, addon:addons(name)), rating:ratings(stars)`;

/** One of the customer's bookings, or null if it isn't theirs. */
export async function getBooking(id: string, customerId: string): Promise<Booking | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const rows = must(
    await db().from("bookings").select(BOOKING_SELECT).eq("id", id).eq("customer_id", customerId).limit(1),
  );
  return (rows[0] as unknown as Booking | undefined) ?? null;
}

export async function listBookings(customerId: string): Promise<Booking[]> {
  return must(
    await db()
      .from("bookings")
      .select(BOOKING_SELECT)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(50),
  ) as unknown as Booking[];
}

/** Stamp card state and finished washes for a customer. */
export async function getRewards(customerId: string) {
  const rows = must(
    await db()
      .from("bookings")
      .select(BOOKING_SELECT)
      .eq("customer_id", customerId)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false }),
  ) as unknown as Booking[];
  const paidDone = rows.filter((b) => b.status === "done" && !b.is_free).length;
  const freeTaken = rows.filter((b) => b.is_free).length;
  return { ...rewardState(paidDone, freeTaken), paidDone, freeTaken, washes: rows.filter((b) => b.status === "done") };
}

/** "Full wash + Tyre shine" */
export function bookingTitle(b: Booking): string {
  return [b.package.name, ...b.addons.map((a) => a.addon.name)].join(" + ");
}
