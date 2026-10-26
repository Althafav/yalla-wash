import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, must } from "./supabase";

// TODO: replace this mock session with Supabase phone auth once real OTP is set up.

const COOKIE = "yw_session";
const MAX_AGE = 60 * 60 * 24 * 90;

export type Customer = { id: string; phone: string; name: string | null };

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  return s;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export async function startSession(customerId: string) {
  (await cookies()).set(COOKIE, `${customerId}.${sign(customerId)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

async function sessionCustomerId(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [id, sig] = raw.split(".");
  if (!id || !sig) return null;
  const expected = Buffer.from(sign(id));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return id;
}

/** The signed-in customer, or null. */
export async function getCustomer(): Promise<Customer | null> {
  const id = await sessionCustomerId();
  if (!id) return null;
  const rows = must(await db().from("customers").select("id, phone, name").eq("id", id).limit(1));
  return (rows[0] as Customer | undefined) ?? null;
}

/** The signed-in customer; sends signed-out visitors to sign in and back to `next`. */
export async function requireCustomer(next: string): Promise<Customer> {
  const customer = await getCustomer();
  if (!customer) redirect(`/signin?next=${encodeURIComponent(next)}`);
  return customer;
}
