import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCustomer } from "@/lib/session";
import { SignInSheet } from "./sign-in-sheet";

export default function SignInPage({ searchParams }: PageProps<"/signin">) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-white">
      {/* Faded stand-in for the screen underneath the sheet. */}
      <div aria-hidden="true" className="flex flex-col gap-4 px-6 pt-[54px]">
        <div className="h-11 w-11 rounded-full bg-hairline" />
        <div className="h-[58px] rounded-[18px] bg-hairline" />
        <div className="grid grid-cols-3 gap-2.5">
          <div className="h-11 rounded-[14px] bg-hairline" />
          <div className="h-11 rounded-[14px] bg-hairline" />
          <div className="h-11 rounded-[14px] bg-primary" />
        </div>
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-navy-900/60" />
      <Suspense>
        <SignInContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function SignInContent({ searchParams }: { searchParams: PageProps<"/signin">["searchParams"] }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/home";
  if (await getCustomer()) redirect(next);
  return <SignInSheet next={next} forBooking={next.startsWith("/book")} />;
}
