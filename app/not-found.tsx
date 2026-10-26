import Link from "next/link";
import { HappyCar } from "@/components/happy-car";
import { Bubbles } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-mint-50 px-6 text-center">
      <HappyCar size={120} />
      <h1 className="m-0 text-[28px] font-extrabold">We couldn&apos;t find that</h1>
      <p className="m-0 text-base text-ink-muted">The page or booking may have moved.</p>
      <Link href="/home" className="bp bp-teal mt-4 w-full">
        <Bubbles />
        <span>Back to home</span>
      </Link>
    </main>
  );
}
