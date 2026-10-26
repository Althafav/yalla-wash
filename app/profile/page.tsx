import { connection } from "next/server";
import { Suspense } from "react";
import { signOut } from "@/app/actions/auth";
import { BottomNav } from "@/components/bottom-nav";
import { CarSilhouette } from "@/components/icons";
import { Screen, Skeleton } from "@/components/ui";
import { plateLabel } from "@/lib/booking";
import { requireCustomer } from "@/lib/session";
import { db, must } from "@/lib/supabase";
import { ProfileForm } from "./profile-form";

export default function ProfilePage() {
  return (
    <>
      <Screen footer="nav" className="bg-mint-50">
        <h1 className="m-0 text-[30px] leading-[34px] font-extrabold">Profile</h1>
        <Suspense fallback={<Skeleton className="h-[200px] rounded-[22px]" />}>
          <ProfileContent />
        </Suspense>
      </Screen>
      <BottomNav />
    </>
  );
}

async function ProfileContent() {
  await connection();
  const customer = await requireCustomer("/profile");
  const cars = must(
    await db()
      .from("cars")
      .select("id, state_code, plate, car_type:car_types(id, name)")
      .eq("customer_id", customer.id)
      .order("created_at"),
  ) as unknown as { id: string; state_code: string; plate: string; car_type: { id: string; name: string } }[];

  return (
    <>
      <ProfileForm name={customer.name ?? ""} phone={customer.phone} />

      <section className="flex flex-col gap-2.5" aria-labelledby="cars-title">
        <h2 id="cars-title" className="m-0 text-lg font-extrabold">
          Saved vehicles
        </h2>
        {cars.length === 0 && <p className="m-0 text-[15px] text-ink-muted">Vehicles you save while booking show up here.</p>}
        {cars.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-[18px] bg-white px-3.5 py-3">
            <CarSilhouette type={c.car_type.id} width={48} />
            <span className="grow">
              <span className="block text-base font-extrabold">{c.car_type.name}</span>
              <span className="text-[13px] text-ink-muted">{plateLabel(c.state_code, c.plate) || "No plate saved"}</span>
            </span>
          </div>
        ))}
      </section>

      <form action={signOut}>
        <button type="submit" className="bp bp-white w-full">
          <span>Sign out</span>
        </button>
      </form>
    </>
  );
}
