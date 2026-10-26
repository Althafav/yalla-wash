"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCustomer } from "@/lib/session";
import { db, must } from "@/lib/supabase";

const nameSchema = z
  .string()
  .trim()
  .min(2, "Enter your full name.")
  .max(80, "That name is too long.");

export type ProfileState = { error?: string; saved?: boolean; name?: string };

export async function updateProfile(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const customer = await getCustomer();
  if (!customer) return { error: "Your session ended. Sign in again." };

  const parsed = nameSchema.safeParse(form.get("name") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  must(await db().from("customers").update({ name: parsed.data }).eq("id", customer.id));
  revalidatePath("/profile");
  revalidatePath("/home");
  return { saved: true, name: parsed.data };
}
