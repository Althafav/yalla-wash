"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db, must } from "@/lib/supabase";
import { endSession, startSession } from "@/lib/session";

// TODO: replace with Supabase phone auth. Until then no SMS is sent and the code is always 1234.
const MOCK_CODE = "1234";

const phoneSchema = z
  .string()
  .transform((s) => s.replace(/\D/g, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number."));

export type OtpState = { error?: string; ok?: boolean };

export async function sendOtp(phone: string): Promise<OtpState> {
  const parsed = phoneSchema.safeParse(phone);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return { ok: true };
}

/** Only redirect to paths inside the app. */
function safeNext(next: string): string {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/home";
}

export async function verifyOtp(phone: string, code: string, next: string): Promise<OtpState> {
  const parsed = phoneSchema.safeParse(phone);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (code !== MOCK_CODE) return { error: "That code isn't right. Check it and try again." };

  const rows = must(
    await db().from("customers").upsert({ phone: parsed.data }, { onConflict: "phone" }).select("id"),
  ) as { id: string }[];
  await startSession(rows[0].id);
  redirect(safeNext(next));
}

export async function signOut() {
  await endSession();
  redirect("/home");
}
