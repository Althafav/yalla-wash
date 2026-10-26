import { connection } from "next/server";
import { Suspense } from "react";
import { Screen, Skeleton, StepHeader } from "@/components/ui";
import { getCatalog } from "@/lib/data";
import { CarForm } from "./car-form";

export default function CarPage() {
  return (
    <Screen>
      <StepHeader title="Your vehicle" step={1} backHref="/home" />
      <div>
        <h2 className="m-0 text-[28px] leading-8 font-extrabold">What are we washing?</h2>
        <p className="mt-1 mb-0 text-base text-ink-muted">The price depends on your vehicle.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-[260px]" />}>
        <CarContent />
      </Suspense>
    </Screen>
  );
}

async function CarContent() {
  await connection();
  const { carTypes } = await getCatalog();
  return <CarForm carTypes={carTypes} />;
}
