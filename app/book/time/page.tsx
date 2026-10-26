import { connection } from "next/server";
import { Suspense } from "react";
import { Screen, Skeleton, StepHeader } from "@/components/ui";
import { getAvailability, getCatalog, getQueue } from "@/lib/data";
import { TimeForm } from "./time-form";

export default function TimePage() {
  return (
    <Screen>
      <StepHeader title="When?" step={3} backHref="/book/package" />
      <Suspense fallback={<Skeleton className="h-[420px]" />}>
        <TimeContent />
      </Suspense>
    </Screen>
  );
}

async function TimeContent() {
  await connection();
  const now = new Date();
  const { station } = await getCatalog();
  const [days, queue] = await Promise.all([getAvailability(station, now), getQueue(station, now)]);
  return <TimeForm days={days} queue={queue} />;
}
