import { connection } from "next/server";
import { Suspense } from "react";
import { BackButton, Screen, Skeleton } from "@/components/ui";
import { getCatalog, getRewards } from "@/lib/data";
import { requireCustomer } from "@/lib/session";
import { ReviewView } from "./review-view";

export default function ReviewPage() {
  return (
    <Screen className="bg-mint-50 !gap-3.5">
      <div className="flex items-center gap-3">
        <BackButton href="/book/time" />
        <h1 className="m-0 grow text-center text-lg font-extrabold">Review booking</h1>
        <span className="w-11" />
      </div>
      <Suspense fallback={<Skeleton className="h-[420px] rounded-[22px]" />}>
        <ReviewContent />
      </Suspense>
    </Screen>
  );
}

async function ReviewContent() {
  await connection();
  const customer = await requireCustomer("/book/review");
  const [catalog, rewards] = await Promise.all([getCatalog(), getRewards(customer.id)]);
  return (
    <ReviewView
      catalog={{
        station: { name: catalog.station.name, area: catalog.station.area },
        carTypes: catalog.carTypes,
        packages: catalog.packages,
        addons: catalog.addons,
      }}
      stamps={rewards.stamps}
      freeWash={rewards.freeAvailable}
      now={new Date().toISOString()}
    />
  );
}
