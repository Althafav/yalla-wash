"use client";

import { useEffect } from "react";
import { clearDraft } from "@/lib/draft";

/** Forgets the finished booking draft so the next booking starts fresh. */
export function ClearDraft() {
  useEffect(() => clearDraft(), []);
  return null;
}
