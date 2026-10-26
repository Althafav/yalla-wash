import { connection } from "next/server";
import { Suspense } from "react";
import { Screen, Skeleton, StepHeader } from "@/components/ui";
import { getCatalog } from "@/lib/data";
import { PackageForm } from "./package-form";

export default function PackagePage() {
  return (
    <Screen>
      <StepHeader title="Package" step={2} backHref="/book/car" />
      <Suspense fallback={<Skeleton className="h-[420px]" />}>
        <PackageContent />
      </Suspense>
    </Screen>
  );
}

async function PackageContent() {
  await connection();
  const { carTypes, packages, addons } = await getCatalog();
  return <PackageForm carTypes={carTypes} packages={packages} addons={addons} />;
}
