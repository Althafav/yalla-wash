"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BellIcon } from "@/components/icons";

/** Re-fetches the status every few seconds until the vehicle is ready. */
export function AutoRefresh({ active, seconds = 5 }: { active: boolean; seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(t);
  }, [active, seconds, router]);
  return null;
}

/** Asks for notification permission and pings once the vehicle is ready. */
export function NotifyToggle({ ready, code }: { ready: boolean; code: string }) {
  const [on, setOn] = useState(false);
  const notified = useRef(false);

  useEffect(() => {
    if (!on || !ready || notified.current) return;
    notified.current = true;
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Your ride is sparkling!", { body: `Booking ${code} is ready for pickup.` });
    }
  }, [on, ready, code]);

  async function toggle() {
    if (!on && "Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    setOn(!on);
  }

  return (
    <div className="flex items-center gap-3 rounded-[18px] bg-mint-50 px-3.5 py-3">
      <BellIcon className="text-teal-700" />
      <span id="notify-lbl" className="grow text-[15px] font-bold">
        Notify me when it&apos;s ready
      </span>
      <button type="button" role="switch" className="switch" aria-checked={on} aria-labelledby="notify-lbl" onClick={toggle}>
        <span />
      </button>
    </div>
  );
}
