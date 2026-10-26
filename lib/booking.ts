// Shared booking types and rules, safe for client and server.

export type BookingStatus =
  | "queued"
  | "booked"
  | "checked_in"
  | "washing"
  | "drying"
  | "ready"
  | "done"
  | "cancelled";

export type Mode = "queue" | "slot";

/** Vehicle groups on the "Your vehicle" screen. */
export type Category = "bike" | "auto" | "car";
export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "bike", label: "Bike" },
  { id: "auto", label: "Auto" },
  { id: "car", label: "Car" },
];

/** A kind of vehicle we wash (stored in the car_types table). */
export type CarType = { id: string; name: string; note: string; category: Category; wash_minutes: number };
export type Addon = { id: string; name: string; price: number; categories: Category[] };
export type Package = {
  id: string;
  name: string;
  includes: string;
  popular: boolean;
  /** Price per vehicle id. A missing vehicle means the package isn't offered for it. */
  prices: Record<string, number>;
  /** Per-vehicle description, where it differs from `includes`. */
  notes: Record<string, string>;
};

/** Add-ons offered for a vehicle. */
export function addonsFor(addons: Addon[], vehicle: CarType | undefined): Addon[] {
  return vehicle ? addons.filter((a) => a.categories.includes(vehicle.category)) : [];
}

/** Statuses that hold a place in today's live queue. */
export const IN_QUEUE: BookingStatus[] = ["queued", "checked_in", "washing", "drying"];

/** The four stages the live status screen walks through. */
export const STAGES = ["checked_in", "washing", "drying", "ready"] as const;

export const NEXT_STATUS: Partial<Record<BookingStatus, BookingStatus>> = {
  queued: "checked_in",
  booked: "checked_in",
  checked_in: "washing",
  washing: "drying",
  drying: "ready",
};

export const STATUS_LABEL: Record<BookingStatus, string> = {
  queued: "In queue",
  booked: "Booked",
  checked_in: "Checked in",
  washing: "Washing",
  drying: "Drying",
  ready: "Ready",
  done: "Done",
  cancelled: "Cancelled",
};

export const STAMPS_FOR_FREE = 5;

/**
 * Every paid wash earns a stamp; five stamps make the next wash free.
 * Returns how many stamps show on the card (0–5) and whether a free wash is waiting.
 */
export function rewardState(paidDone: number, freeTaken: number) {
  const earned = Math.floor(paidDone / STAMPS_FOR_FREE);
  const freeAvailable = earned - freeTaken > 0;
  return { stamps: freeAvailable ? STAMPS_FOR_FREE : paidDone % STAMPS_FOR_FREE, freeAvailable };
}

export function rupees(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function plateLabel(stateCode: string, plate: string): string {
  return plate ? `${stateCode} ${plate}`.trim() : "";
}
