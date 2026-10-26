import Link from "next/link";
import { HappyCar } from "@/components/happy-car";
import { Bubbles } from "@/components/ui";

export default function Splash() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-navy-900 px-6 pb-12 text-white">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <circle cx="40" cy="760" r="56" fill="#13294A" />
        <circle cx="330" cy="700" r="80" fill="#13294A" />
        <circle cx="200" cy="820" r="40" fill="#13294A" />
        <circle cx="80" cy="640" r="14" fill="#19D3BE" opacity="0.35" />
        <circle cx="300" cy="590" r="9" fill="#19D3BE" opacity="0.45" />
        <circle cx="340" cy="140" r="6" fill="#19D3BE" opacity="0.5" />
        <circle cx="56" cy="190" r="10" fill="#19D3BE" opacity="0.3" />
        <circle cx="250" cy="110" r="4" fill="#FFFFFF" opacity="0.5" />
      </svg>

      <div className="relative mt-10 flex grow flex-col items-center justify-center gap-1">
        <HappyCar size={176} tone="teal" label="Yalla Wash Happy Car" />
        <h1 className="m-0 text-[52px] leading-none font-extrabold tracking-[-1px]">
          <span className="text-white">Yalla</span> <span className="text-teal-400">Wash</span>
        </h1>
        <span dir="rtl" lang="ar" className="text-[30px] leading-[1.35] font-extrabold">
          <span className="text-white">يلا</span> <span className="text-teal-400">واش</span>
        </span>
        <p className="mt-4 mb-0 text-lg text-ink-on-navy">Yalla, let&apos;s shine.</p>
      </div>

      <div className="relative flex w-full flex-col gap-[18px]">
        <Link href="/home" className="bp bp-teal w-full">
          <Bubbles />
          <span>Get started</span>
        </Link>
        <span className="text-center text-sm text-ink-on-navy">Browse freely. Sign in only when you book.</span>
      </div>
    </main>
  );
}
