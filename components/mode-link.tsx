"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Mode } from "@/lib/booking";
import { updateDraft } from "@/lib/draft";

/** Starts the booking flow in queue or slot mode. */
export function ModeLink({ mode, className, children }: { mode: Mode; className: string; children: ReactNode }) {
  return (
    <Link href="/book/car" className={className} onClick={() => updateDraft({ mode })}>
      {children}
    </Link>
  );
}
