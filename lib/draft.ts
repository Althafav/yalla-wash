"use client";

import { useSyncExternalStore } from "react";
import type { Mode } from "./booking";

/** The booking being put together across the flow, kept in sessionStorage. */
export type Draft = {
  mode: Mode;
  carType: string;
  stateCode: string;
  plate: string;
  saveCar: boolean;
  packageId: string;
  addonIds: string[];
  /** IST date and time of the chosen slot, when mode is "slot". */
  date: string | null;
  time: string | null;
};

export const DEFAULT_DRAFT: Draft = {
  mode: "slot",
  carType: "suv",
  stateCode: "KL",
  plate: "",
  saveCar: true,
  packageId: "full",
  addonIds: ["tyre"],
  date: null,
  time: null,
};

const KEY = "yw_draft";
const listeners = new Set<() => void>();
let current: Draft | null = null;

function read(): Draft {
  if (current) return current;
  try {
    const raw = sessionStorage.getItem(KEY);
    current = raw ? { ...DEFAULT_DRAFT, ...(JSON.parse(raw) as Partial<Draft>) } : DEFAULT_DRAFT;
  } catch {
    current = DEFAULT_DRAFT;
  }
  return current;
}

export function updateDraft(patch: Partial<Draft>) {
  current = { ...read(), ...patch };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // Storage can be unavailable (private mode); the draft still lives in memory.
  }
  listeners.forEach((l) => l());
}

export function clearDraft() {
  current = DEFAULT_DRAFT;
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useDraft(): Draft {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_DRAFT);
}
